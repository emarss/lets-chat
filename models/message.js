const fs = require('fs');

const file = fs.readFileSync("./database/messages.data", 'UTF-8');

Message = JSON.parse(file);

function saveMessage(msg) {
    Message.push(msg);
    fs.writeFileSync("./database/messages.data", JSON.stringify(Message), 'UTF-8');   
}

function getMessages() {
    return Message;
}
module.exports = {getMessages, saveMessage};