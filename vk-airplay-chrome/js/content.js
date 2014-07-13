var $audios_list = null;

// HELPER FUNCTIONS

function normalizeUrl(url) {
    var match = /(^.*)\?.*$/.exec(url);
    return match && match[1];
}


// DOM OPERATIONS

// item to hook is passed as "this", b/o jQuery's 'each' notation
function hookItem() {
    var $audio = $(this);
    $audio.addClass("airplay-hooked");
    $audio.find(".area").prepend("<span class='airplay-button'/>");
    $audio.append("<div class='airplay-progress' />")
    setHandlers($audio);
}

// called periodically to find new (yet unhooked) audios in the DOM
function rescanAndHookDom() {
//    $audios_list = $("#audios_list");
    $audios_list = $("body");
    $audios_list.find(".audio:not(.airplay-hooked)").each(hookItem);
}

// extracts song title and URL from the DOM
function scrap($audio) {
    var url = normalizeUrl($audio.find("div.play_btn_wrap ~ input[type=hidden]:first").val());

    // TODO: why this happens?
    if (!url) { return { song: "NONE", url: ""}};

    var song = $audio.find(".title_wrap").text();
    return {song: song, url: url};
}

function currentlyPlayedUiItem() {
    var $audio = $(".audio.being-played");
    if ($audio.length) {
        return scrap($audio);
    } else {
        return null;
    }
}

function startPlayingAudio($audio) {
    var item = scrap($audio);
    play(item);
    clearPlayIcons();
    markAsStarting($audio);
    console.log("Started AirPlay: " + item.song);
}

function setHandlers($audio) {
    $audio.find('.airplay-button').click(function (event) {
        event.stopPropagation();
        if ($audio.hasClass('being-played')) {
            clearPlayIcons();
            pause();
        } else {
            startPlayingAudio($audio);
        }
    });
}

function scrollToAudio($audio) {
    $('html,body').animate({
        scrollTop: $audio.offset().top
    });
}

function markAsStarting($audio) {
    $audio.addClass('starting');
}

function markAsBeingPlayed($audio) {
    $audio.removeClass('starting').addClass("being-played");
}

function clearPlayIcons() {
    $(".being-played").removeClass("being-played");
}


// MODEL FUNCTIONS, in terms of MVC

function justFinished(item, serverStatus) {
    return (serverStatus.length > 5) &&
        (serverStatus.position > serverStatus.length - 5) &&
        (serverStatus.status == "pause") &&
        (serverStatus.url == item.url);
}

function syncStateWithServer() {
    // after the server finished playing, the item is still displayed as 'playing' in the UI
    var currentItem = currentlyPlayedUiItem();
    var serverStatus = status();
    if (currentItem && justFinished(currentItem, serverStatus)) {
        playNextAfter(currentItem);
    }
    highlightAudioCurrentlyPlayedOnServer(serverStatus);
}

// TODO: refactor
function playNextAfter(currentItem) {
    var playNext = false;
    $audios_list.find(".audio.airplay-hooked").each(function () {
        if (playNext) {
            startPlayingAudio($(this));
            scrollToAudio($(this)); // just to initiate VK's infinite scroll
        }
        var item = scrap($(this));
        if (item.url == currentItem.url) {
            playNext = true;
        } else {
            playNext = false;
        }
    });
}

function audioChosenOnServer(serverStatus) {
    var result = null;
    $audios_list.find(".audio.airplay-hooked").each(function () {
        var $audio = $(this);
        if (serverStatus.url == scrap($audio).url) {
            result = $audio;
        }
    });
    return result;
}

function updateProgress($audio, serverStatus) {
    var text;
    if (serverStatus.length > 0) {
        text = serverStatus.position.toFixed(0) + " / " + serverStatus.length.toFixed(0);
    } else {
        text = "loading...";
    }
    $audio.find('.airplay-progress').html(text);
}

function highlightAudioCurrentlyPlayedOnServer(serverStatus) {
    if (serverStatus.status == "play") {
        var $audio = audioChosenOnServer(serverStatus);
        if ($audio) {
            markAsBeingPlayed($audio);
            updateProgress($audio, serverStatus);
        }
    }
}

// IN MVC, THIS WOULD BE CONTROLLER FUNCTIONS

function every(milliseconds, callback) {
    try {
        callback();
    }
    catch(err) {
        console.error(err);
    }
    var againFn = function () {
        every(milliseconds, callback);
    };
    setTimeout(againFn, milliseconds);
}


$(function () {
    // fires the callbacks immediately for the first time
    every(3000, rescanAndHookDom);
    every(3000, syncStateWithServer);
});


console.log("VK Airplay loaded");
