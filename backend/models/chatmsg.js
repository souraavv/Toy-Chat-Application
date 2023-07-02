const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMsgSchema = new Schema({
    chatid: {
        type: mongoose.Types.ObjectId,
        ref: 'chatuser',
        required: true
    },
    messageid: {
        type: mongoose.Types.ObjectId,
        ref: 'message',
        required: true
    },
    senderid: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('chatmsg', chatMsgSchema);
