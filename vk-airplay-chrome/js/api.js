var currentState = {};

function saveState(newState) {
    currentState = newState;
}

function status() {
    $.get("http://localhost:5555/device/status.json", saveState);
    return currentState;
}

function post(action, payload, callback) {
    $.post("http://localhost:5555/device/" + action + ".json", payload, callback);
}

function play(payload) {
    post("play", payload, saveState);
}

function pause() {
    post("pause", {}, saveState);
}

