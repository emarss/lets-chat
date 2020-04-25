const express = require("express");
const http = require("http");
const Handlebars = require("handlebars");
const socketio = require("socket.io");
const path = require("path");
const users = require("./models/user");
const {saveMessage} = require("./models/message");
const fs = require('fs');
const {getOnlineUsersHtml, getChatsPage} = require("./util/user_utils");
const moment = require("moment");
const uuid = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const typing = []

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", socket => {
    console.log("New WBS connection");

    //loggin in a user
    socket.on("login_request", username => {
        const recipient = {
            name: username,
            id: socket.id
        };
        users.push(recipient);

        socket.join("ChatPage");
        const chat_html    = getChatsPage(username);
        socket.emit("logged_in", chat_html);

        onl_html    = getOnlineUsersHtml();
        
        socket.broadcast.to("ChatPage").emit("online_users", {page: onl_html, msg: `${username} is now online.`});

        socket.on("typing", ()=>{
            const typ_user = users.find(u => u.id == socket.id);
            socket.broadcast.to("ChatPage").emit("user_typing", typ_user);
        });
        socket.on("not_typing", ()=>{
            const typ_user = users.find(u => u.id == socket.id);
            socket.broadcast.to("ChatPage").emit("user_stop_typing", typ_user);
        });

        socket.on("chat_message", message=>{
            const typ_user = users.find(u => u.id == socket.id);
            const msg = {
                id: uuid.v4(),
                text: message,
                senter: typ_user.name,
                time: moment().format("ddd, DD MMM, hh:mma")
            }

            saveMessage(msg);
            socket.broadcast.to("ChatPage").emit("new_message", msg);
        });

        socket.on("disconnect", ()=>{
            const index = users.findIndex(u => u.id == socket.id);
            leaveUser = users.splice(index, 1)[0];

            onl_html    = getOnlineUsersHtml();

            io.to("ChatPage").emit("user_stop_typing", leaveUser);
            io.to("ChatPage").emit("user_left", {page: onl_html, msg: `${leaveUser.name} has left.`});
        });

    })
});

function getTypingHtml(){
    const typ_page = fs.readFileSync("./templates/typing.html", 'UTF-8');
    const typ_template = Handlebars.compile(typ_page);
    return typ_template({typing});
}

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/login.html"));
});
app.get("/chat", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/chat.html"));
});

const PORT = process.env.PORT | 3000;
server.listen(PORT, () => 
    console.log(`App listenning at port ${PORT}`
));