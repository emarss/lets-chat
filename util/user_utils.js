const Handlebars = require("handlebars");
const users = require("../models/user");
const fs = require('fs');
const {getMessages} = require("../models/message");

Handlebars.registerHelper('sent_or_recieved', function(user1, user2) {
    if(user1 == user2) {
      return "sent";
    }else{
        return "received";
    }
});
  Handlebars.registerHelper('get_sentername', function(user1, user2) {
    if(user1 == user2) {
    return "You";
    }else{
        return user2;
    }
});

function getOnlineUsersHtml(){
    const online = fs.readFileSync("./templates/online.html", 'UTF-8');
    const onl_template = Handlebars.compile(online);
    return onl_template({users});
}

function getChatsPage(username) {
    const chat = fs.readFileSync("./templates/chat.html", 'UTF-8');
    const chat_template = Handlebars.compile(chat);
    context = {
        users,
        messages: getMessages(),
        username: "ashley"
    };
    return chat_template(context);
}

module.exports = {getOnlineUsersHtml, getChatsPage};