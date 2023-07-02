const mongoose = require('mongoose');
const express = require('express');
const _ = require("lodash");
const {User, validateUser} = require('../models/user');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Joi = require('joi');
 
// flag : 0 already exist user
router.post('/register', async(req, res)=> {
    const {error} = validateUser(req.body);
    if (error) {
        return res.json({
            message: error.details[0].message,
            status: 400
        });
    }
    try{
        let checkEmailId = await User.findOne({email: req.body.email});
        let checkUserId = await User.findOne({userid: req.body.userid});
        if (checkEmailId || checkUserId) {
            return res.json({
                flag: 0,
                message: "User with same Email/UserId exists already!",
                status : 400
            });
        }
        let user = new User(_.pick(req.body, ["fname", "lname", "userid", "email", "password", "phone"]));
        const salt = await bcrypt.genSalt(11);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        const token = user.generateAuthToken();
        res.header('x-auth-token', token).json({
            token,
            info: _.pick(user, ["_id", "fname", "email"]),
            message: "User Registered Successfully!"
        })
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error...',
            status: 500
        });
    }
});
// flag == 0, email already used
router.post('/login', async(req, res) => {
    const {error} = validateLogin(req.body);
    if (error) {
        return res.json({
            message : error.details[0].message,
            status: 400
        });
    }
    try {
        let user = await User.findOne({email: req.body.email});
        if (!user) {
            return res.json({
                flag : 0,
                message: 'Invalid Email or Password',
                status : 400
            });
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            return res.json({
                flag: 1,
                message: 'Invalid Email or Password',
                status: 400
            });    
        }
        const token = user.generateAuthToken();
        if (token) {
            return res.json({
                token,
                status: 200
            });
        }
        else {
            res.json({
                message: 'Something wrong happen',
                status: 400
            });
        }
    }
    catch(err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
});

function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(55).required()
    });
    return schema.validate(req);
}

module.exports = router;