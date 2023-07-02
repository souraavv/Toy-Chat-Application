const mongoose = require('mongoose');
const Joi = require('joi');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomname: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255
    },
    lastmsgtime: {
        type: Date,
        default: Date.now 
    }
});

function validateRoom(room) {
    const schema = Joi.object({
        roomname: Joi.string().min(1).max(255).required()
    });  
    return schema.validate(room);
}

module.exports.validateRoom = validateRoom;
module.exports.Room = mongoose.model("room", roomSchema);