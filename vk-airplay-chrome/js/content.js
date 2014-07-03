var $audios_list = null;

// HELPER FUNCTIONS

function normalizeUrl(url) {
    return /(^.*)\?.*$/.exec(url)[1];
}


// DOM OPERATIONS

// item to hook is passed as "this", b/o jQuery's 'each' notation
function hookItem() {
    var $audio = $(this);
    $audio.addClass("airplay-hooked");
    $audio.find(".area").prepend("<span class='airplay-button not-being-played'/>");
    setHandlers($audio);
}

// called periodically to find new (yet unhooked) audios in the DOM
function rescanAndHookDom() {
    $audios_list.find(".audio:not(.airplay-hooked)").each(hookItem);
}

// extracts song title and URL from the DOM
function scrap($audio) {
    var url = normalizeUrl($audio.find("div.play_btn input[type=hidden]").val());
    var song = $audio.find(".title_wrap").text();
    return {song: song, url: url};
}


function currentlyPlayedUiItem() {
    var $audio = $(".audio:has(.airplay-button.being-played)");
    if ($audio.length) {
        return scrap($audio);
    } else {
        return null;
    }
}

function markAsBeingPlayed($audio) {
    $audio.find('.airplay-button').removeClass("not-being-played").addClass("being-played");
}

function onAudioClicked($audio) {
    play(scrap($audio));
    clearPlayIcons();
    markAsBeingPlayed($audio);
}

function setHandlers($audio) {
    $audio.find(".airplay-button.not-being-played").click(function (event) {
        event.stopPropagation();
        onAudioClicked($(this).parent());
    });

    $audio.find(".airplay-button.pause").click(function (event) {
        event.stopPropagation();
        clearPlayIcons();
        pause();
    });
}

function scrollToAudio($audio) {
    $('html,body').animate({
        scrollTop: $audio.offset().top
    });
}

function clearPlayIcons() {
    $(".airplay-button.being-played").removeClass("being-played").addClass("not-being-played");
}


// MODEL FUNCTIONS, in terms of MVC

function justFinished(item, serverStatus) {
    return (serverStatus) &&
        (serverStatus.position > serverStatus.length - 3) &&
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
            onAudioClicked($(this));
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

function highlightAudioCurrentlyPlayedOnServer(serverStatus) {
    if (serverStatus.status == "play") {
        var $audio = audioChosenOnServer(serverStatus);
        if ($audio) {
            markAsBeingPlayed($audio);
        }
    }
}

// IN MVC, THIS WOULD BE CONTROLLER FUNCTIONS

function every(milliseconds, callback) {
    callback();
    var again = function () {
        every(milliseconds, callback);
    };
    setTimeout(again, milliseconds);
}


$(function () {
    $audios_list = $("#audios_list");

    // fires the callbacks immediately for the first time
    every(3000, rescanAndHookDom);
    every(3000, syncStateWithServer);
});


console.log("VK Airplay loaded");
