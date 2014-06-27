$(function () {

    $.get("http://localhost:5555/device/status.json", function (response) {
        $("#song").html(response.song);
        $("#status").html(response.status);
        $("#position").html(response.position);
        $("#length").html(response.length);
    });

});
