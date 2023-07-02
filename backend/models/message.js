const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// schema for the message
const messageSchema = new Schema({
    formattype: {
        type: String
    },
    text: {
        type: String,
    },
    media: {
        type: String, 
    }
}, {
    timestamps: true
});

const Message = mongoose.model("message", messageSchema);
module.exports = Message;