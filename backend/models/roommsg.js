const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomMsgSchema = new Schema({
    roomid: {
        type: mongoose.Types.ObjectId,
        ref: 'room',
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


module.exports = mongoose.model('roommsg', roomMsgSchema);


