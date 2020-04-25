const socket = io();
var typing = undefined;
$(document).ready(function ($) {
    $(".message-box").hide();
    $(".message-box").removeClass("d-none");

    $("#login_form").submit(function (event) {
        event.preventDefault();

        username = $("#login_form #username").val();
        socket.emit("login_request", username);
    });

    socket.on("logged_in", (page) => {
        $(".container").html(page);
        $(".chat-container-body").scrollTop($(".chat-container-body ul").innerHeight(), 1000);
    });

    socket.on("online_users", res => {
        $(".active-users").html(res.page);
        openMessage(res.msg);
    });
    socket.on("typing_users", res => {
        $(".notifications").html(res.page);
    });

    socket.on("user_left", res => {
        $(".active-users").html(res.page);
        openMessage(res.msg);
    });

    socket.on("user_stop_typing", user => {
        $(`#typing_${user.id}`).remove();
    });
    socket.on("user_typing", user => {
        var msg = `<li class="text-primary" id="typing_${user.id}">${user.name} is typing</li>`
        $(".notifications").append(msg);
    });
    socket.on("new_message", msg => {
        var msg = `<<span class="received"><strong class="username">${msg.senter}: ${msg.time}</strong><hr class="m-0"><span>${msg.text}</span></li></span></<strong><span class="received_angle"></span>`
        $(".messages-div").append(msg);
        playSound("new_message");
    });
});

$(document).keydown(function (e) {
    if ($(".message-input").is(":focus")) {
        if (typing == undefined) {
            socket.emit("typing");
        }
        clearTimeout(typing);
        typing = setTimeout(function () {
            socket.emit("not_typing");
            typing = undefined;
        }, 3000);
    }
});

socket.on("message", message => {
    openMessage(message);
});


function openMessage(message) {
    $(".message-box span").html(message)
    $(".message-box").slideDown("slow");
    setTimeout(function () {
        closeMessage()
    }, 5000);
}

function closeMessage() {
    $(".message-box").slideUp("slow");
}

function openChatWith(user) {
    socket.emit("start_chat", user);
}

function submitMessage() {
    message = $(".message-input").val();
    $(".message-input").val("");
    $(".message-input").focus();

    //sending the message
    socket.emit("chat_message", message);

    //showing the message to senter
    var msg = `<li class="sent"><div><strong class="username">You: ${moment().format("ddd, DD MMM, hh:mma")}</strong><hr class="m-0"><span>${message}</span></div></li><span class="sent_angle"></span>`
    $(".messages-div").append(msg);

    //trigger stop typing
    socket.emit("not_typing");
    typing = undefined;

    //scroll bottom
    $(".chat-container-body").scrollTop($(".chat-container-body ul").innerHeight(), 1000);
    
    return false;
};

function playSound(e) {
    var t = '<source src="/sounds/' + e + '.mp3" type="audio/mpeg">',
        n = '<source src="/sounds/' + e + '.ogg" type="audio/ogg">',
        a = '<embed hidden="true" autostart="true" loop="false" src="' + e + '.mp3">';
    document.getElementById("sound").innerHTML = '<audio autoplay="autoplay">' + t + n + a + "</audio>";
}