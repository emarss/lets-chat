const express = require("express");
const http = require("http");
const Handlebars = require("handlebars");
const socketio = require("socket.io");
const path = require("path");
const users = require("./models/user");
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

io.on("connection", socket => {
    console.log("New WBS connection");
    setTimeout(()=> {
        socket.emit("message", "You are logged in");
    }, 2000);

    //loggin in a user
    socket.on("login_request", username => {
        const recipient = {
            name: username,
            id: socket.id
        };
        users.push(recipient);

        const online = fs.readFileSync("./templates/online.html", 'UTF-8');
        const onl_template = Handlebars.compile(online);
        const onli_html    = onl_template({users});
        socket.emit("logged_in", onli_html);

        on("start_chat", recipient_id => {
            recipient = users.find(u => u.id === recipient_id);
            const chat_source = fs.readFileSync("./templates/chat.html", 'UTF-8');
            const chat_template = Handlebars.compile(chat_source);
            const chat_html    = chat_template({users});
            socket.emit("request_chat", recipient);


        });

    })
});

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/login.html"));
});

const PORT = process.env.PORT | 3000;
server.listen(PORT, () => 
    console.log(`App listenning at port ${PORT}`
));