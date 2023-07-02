const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Schema = mongoose.Schema;

// schema for the user
const userSchema = new Schema({
    fname: {
        type: String, 
        required : true,
        minlength: 2, 
        maxlength: 25
    },
    lname : {
        type: String, 
        required : true,
        minlength: 2, 
        maxlength: 25
    },
    userid: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    email : {
        type : String, 
        required: true,
        minlength: 5,
        maxlength: 255,
        unique:true
    },
    password: {
        type: String, 
        required: true,
        minlength: 5, 
        maxlength: 255
    },
    phone : {
        type: String, 
        required: true, 
        minlength: 10,
        maxlength: 10
    }},
    {
        timestamps: true
    }
);
// 
// Added a method to the user schema : generateAuthToken to the userSchema 
userSchema.methods.generateAuthToken = function() {
    const jwtPrivateKey = process.env.JWTPRIVATEKEY;
    const token= jwt.sign({
        _id : this._id,
        fname: this.fname,
        lname: this.lname
    },
    jwtPrivateKey
    );
    return token;
}
// creating a model of name: User and schema is of type userSchema
const User = mongoose.model("user", userSchema);

function validateUser(user) {
    const schema = Joi.object({
        fname: Joi.string().min(2).max(25).required(),
        lname: Joi.string().min(2).max(25).required(),
        userid: Joi.string().min(5).max(255).required(),
        email: Joi.string().email().min(5).max(255).required(),
        password:Joi.string().min(5).max(255).required(),
        phone: Joi.string().min(5).max(10).required()
    });
    return schema.validate(user);
}
 
module.exports.User = User;
module.exports.validateUser = validateUser;

