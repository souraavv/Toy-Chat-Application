const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
require('dotenv').config();


const io = require("socket.io")(server, 
    {cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling'],
    },
    allowEIO3: true
    }
);

global.io = io;

require('./socket/socket');

const room = require('./routes/room');
const auth = require('./routes/auth');
const chat = require('./routes/chat');
const user = require('./routes/user');
const message = require('./routes/message');

app.use(express.json({limit: '50mb'}));
app.use(cors());

app.use('/accessfile', express.static(path.join(__dirname, '/userfiles')));
app.use('/api/auth', auth);
app.use('/api/room', room);
app.use('/api/chat', chat);
app.use('/api/user', user);
app.use('/api/msg', message);


const port = 3900; // process.env.PORT ;
const mongodbUri = process.env.MONGODB_URI;

mongoose.connect(mongodbUri, () => {
    server.listen(port, ()=> console.log("Connected to MongoDB..."));
});

// MONGODB_URI = mongodb+srv://toychat:ssl123@cluster0.mmiaf.mongodb.net/toychat?retryWrites=true&w=majority


