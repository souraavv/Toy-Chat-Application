const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatUserSchema = new Schema({
    user1: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    user2: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required : true
    },
    lastmsgtime: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('chatuser', chatUserSchema);
