var express    = require('express');
var bodyParser = require('body-parser');

var browser = require('airplay').createBrowser();
var device = null;

browser.on('deviceOnline', function(foundDevice) {
  device = foundDevice;
  console.log('Apple TV Online');
});

browser.on('deviceOffline', function(offlineDevice) {
  if (device && (offlineDevice.id == device.id)) {
    console.log('Apple TV Offline');
    device = null;
  }
});

browser.start();



var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));



var currentState = {
  song: "",
  status: "pause",
  url: "",
  length: 0,
  position: 0
}

function sendCurrentState(res) {
  //console.log("<-- ", currentState);
  res.send(currentState);
}

app.post('/device/pause.json', function(req, res){
  console.log("--> pause.json", req.body);
  if (device) {
    device.rate(0);
  }

  currentState.status = "pause";
  sendCurrentState(res);
});

app.post('/device/play.json', function(req, res){
  console.log("--> play.json", req.body);

  currentState.song = req.body.song;
  currentState.url = req.body.url;
  currentState.status = "play";
  currentState.length = 300; // TODO: hardcode
  currentState.position = 1;

  if (device) {
    console.log("--> Starting playback of " + currentState.url);
    device.play(currentState.url, 0, function(res) {
      if (res) {
        console.log("playback started");
      } else {
        console.log("playback failed");
      }
    });
  }

  sendCurrentState(res);
});

app.get('/device/status.json', function(req, res){
  if (device) {
    device.status(function(status) {
      // console.log(status);
      if (status.rate == 1) {
        currentState.status = "play";
        currentState.length = status.duration;
        currentState.position = status.position;
      } else {
        currentState.status = "pause";
      }
    });

    sendCurrentState(res);
  }
});

var server = app.listen(5555, function() {
  console.log('Listening on port %d', server.address().port);
});

