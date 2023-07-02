const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for the message
const roomUserSchema = new Schema({
    roomid: {
        type: mongoose.Types.ObjectId,
        ref: 'room',
        required: true
    },
    userid: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required : true
    },
    isadmin: {
        type: Number, 
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('roomuser', roomUserSchema);

