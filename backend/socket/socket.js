const {Room, validateRoom} = require('../models/room');
const ChatUser = require('../models/chatuser');
const ChatMsg = require('../models/chatmsg');
const RoomMsg = require('../models/roommsg');
const Message = require('../models/message');
const verifyToken = require('../middleware/simpleauth');

const io = global.io;

io.on("connection", (socket)=> {
    socket.on("msg", async(Msg)=> {
        // console.log(Msg.token);
        const verifyUser = await verifyToken(Msg.token);
        // console.log(verifyUser);
        if (verifyUser) {
            let newChatMsg;
            let newMsg;
            if (Msg.formattype == 0) { // media
                newMsg = new Message({formattype: 0, media: Msg.media, text: null});
                await newMsg.save();
                if (Msg.currentChat.roomid) {
                    await Room.findOneAndUpdate({_id: Msg.currentChat.roomid._id}, {lastmsgtime: Date.now()});
                    newChatMsg = new RoomMsg({messageid: newMsg._id, roomid: Msg.currentChat.roomid._id, senderid: verifyUser._id});
                }
                else {
                    await ChatUser.findOneAndUpdate({_id: Msg.currentChat._id}, {lastmsgtime: Date.now()});
                    newChatMsg = new ChatMsg({messageid: newMsg._id, chatid: Msg.currentChat._id, senderid: verifyUser._id});
                }
            }
            else if (Msg.formattype == 1) { // text
                newMsg = new Message({formattype: 1, text: Msg.text, media: null});
                await newMsg.save();
                if (Msg.currentChat.roomid) {
                    await Room.findOneAndUpdate({_id: Msg.currentChat.roomid._id}, {lastmsgtime: Date.now()});
                    newChatMsg = new RoomMsg({messageid: newMsg._id, roomid: Msg.currentChat.roomid._id, senderid: verifyUser._id});
                }
                else {
                    await ChatUser.findOneAndUpdate({_id: Msg.currentChat._id}, {lastmsgtime: Date.now()});
                    newChatMsg = new ChatMsg({messageid: newMsg._id, chatid: Msg.currentChat._id, senderid: verifyUser._id});
                }
            }
            else {
                socket.emit('Invalid-Format', {message: 'Given text or media only'});
            }
            // console.log(Msg);
            await newChatMsg.save();
            
            if (Msg.currentChat.roomid) {
                io.to(Msg.currentChat.roomid._id).emit('Chat-Message', {senderid: verifyUser, roomid: Msg.currentChat.roomid._id, messageid: newMsg});
            }
            else {
                io.to(Msg.currentChat._id).emit('Chat-Message', {senderid: verifyUser, chatid: Msg.currentChat._id, messageid: newMsg});
            }
        }
        else {
            socket.emit("token-error", {info: "Token is not valid"});
        }
    })

    socket.on("join-room", (data)=> {
        // console.log(data);
        if (data.roomid) {
            socket.join(data.roomid);
        }
        else {
            socket.join(data.chatid);
        }
    })
})