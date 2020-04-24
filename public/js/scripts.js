const socket = io();

$(document).ready(function($) {
    $(".message-box").hide();
    $(".message-box").removeClass("d-none");

    $("#login_form").submit(function(event) {
    	event.preventDefault();

    	username = $("#login_form #username").val();
    	socket.emit("login_request", username);
    });

    socket.on("logged_in", (page)=>{
        $(".container").html(page);
    });
});


socket.on("message", message=>{
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

function openChatWith(user){
    socket.emit("start_chat", user);
}