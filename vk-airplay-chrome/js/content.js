var $audios_list = null;

function normalizeUrl(url) {
    return /(^.*)\?.*$/.exec(url)[1];
}

// item to hook is passed as "this", b/o jQuery's 'each' notation
function hookItem() {
    var $audio = $(this);
    $audio.addClass("airplay-hooked");
    $audio.find(".area").prepend("<span class='airplay-button triangle'/>");
    setHandlers($audio);
}

function rescanAndHookDom() {
    $audios_list.find(".audio:not(.airplay-hooked)").each(hookItem);
}

function scrap($audio) {
    var url = normalizeUrl($audio.find("div.play_btn input[type=hidden]").val());
    var song = $audio.find(".title_wrap").text();
    return {song: song, url: url};
}

function every(milliseconds, callback) {
    callback();
    var again = function () {
        every(milliseconds, callback);
    };
    setTimeout(again, milliseconds);
}

function currentlyPlayedUiItem() {
    var $audio = $(".audio:has(.airplay-button.pause)");
    if ($audio.length) {
        return scrap($audio);
    } else {
        return null;
    }
}

function finished(item) {
    var serverStatus = status();
    return (serverStatus) &&
        (serverStatus.position > serverStatus.length - 5) &&
        (serverStatus.url == item.url);
}

function playNextIfCurrentSongFinished() {
    var currentItem = currentlyPlayedUiItem();
    if (currentItem && finished(currentItem)) {
        playNextAfter(currentItem);
    }
}

// TODO: refactor
function playNextAfter(currentItem) {
    var playNext = false;
    $audios_list.find(".audio.airplay-hooked").each(function () {
        var item = scrap($(this));
        if (playNext) {
            $(this).find(".airplay-button").click();
        }
        if (item.url == currentItem.url) {
            playNext = true;
        } else {
            playNext = false;
        }
    });
}

function clearPlayIcons() {
    $(".airplay-button.pause").removeClass("pause").addClass("triangle");
}

function setHandlers($audio) {
    $audio.find(".airplay-button.triangle").click(function (event) {
        event.stopPropagation();
        var $audio = $(this).parent();
        play(scrap($audio));
        clearPlayIcons();
        $(this).removeClass("triangle").addClass("pause");
    });

    $audio.find(".airplay-button.pause").click(function (event) {
        event.stopPropagation();
        clearPlayIcons();
        pause();
    });
}

$(function () {
    $audios_list = $("#audios_list");

    every(1000, function () {
        playNextIfCurrentSongFinished();
        rescanAndHookDom();
    });
});


console.log("VK Airplay loaded");
