const mongoose = require('mongoose');
const _ = require("lodash");
const express = require('express');
const router = express.Router();
const Joi = require('joi');

const auth = require('../middleware/auth');
const {User, validateUser} = require('../models/user');
const ChatUser = require('../models/chatuser');
const ChatMsg = require('../models/chatmsg');


router.get('/getUser/:val', auth, async(req, res)=> {
    const name = req.params.val;
    const regExp = new RegExp(".*"+ name + ".*");
    const user = await User.find({
        $or: [{fname: {$regex: regExp, $options: 'i'}}, {lname: {$regex: regExp, $options: 'i'}}]
    }).exec((reject, resolve)=> {
        if (reject) {
            return res.status(500).json({
                message: 'Internal Server Error',
                status: 500
            })
        }
        return res.status(200).json({
            result : resolve,
            status : 200
        })
    });
});

router.post('/createChat', auth, async(req, res)=> {
    const userid1 = req.user._id;
    const {userid2} = req.body;
    try {
        const result = await User.findOne({_id: userid2});  
        if (result) {
            const isChat1 = await ChatUser.findOne({user1: userid1, user2: userid2});
            const isChat2 = await ChatUser.findOne({user1: userid2, user2: userid1});
            if (isChat1 || isChat2) {
                return res.status(403).json({
                    message: 'Chat already exists',
                    status: 403
                })
            }
            const newChatUser = new ChatUser({user1: userid1, user2: userid2});
            await newChatUser.save();
            res.status(200).json({
                message: 'Create Chat window successfully',
                status: 200
            });
        }
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
});

router.post('/delChat', auth, async(req, res)=> {
    const userid = req.user._id;
    const {chatid} = req.body;
    try {
        const result = await ChatUser.findOne({_id: chatid});
        if (result) {
            await ChatMsg.deleteMany({chatid});
            await ChatUser.deleteOne({_id: chatid});
            res.status(200).json({
                message: 'Chat Deleted Succesfully',
                status: 200
            })
        }
        else {
            res.status(403).json({
                message: 'No Chat exists',
                status: 403
            })
        }
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
    
});


router.get('/getChat', auth, async(req, res) => {
    const userid = req.user._id;
    try {
        let result1 = await ChatUser.find({user1:userid}).populate({path: 'user1', select : 'userid fname lname'})
                                                         .populate({path: 'user2', select : 'userid fname lname'});
        const result2 = await ChatUser.find({user2:userid}).populate({path: 'user1', select : 'userid fname lname'})
                                                           .populate({path: 'user2', select : 'userid fname lname'});
        result1 = [...result1, ...result2];
        res.status(200).json({
            chat : result1,
            status: 200
        })
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
});

router.get('/getChatMsg/:chatid', auth, async(req, res)=> {
    const userid = req.user._id;
    const {chatid} = req.params;
    try {
        const chatMsg = await ChatMsg.find({chatid})
                                     .populate({path: 'messageid', select:'formattype text media'})
                                     .populate({path: 'senderid', select: 'userid fname lname'});
        if (chatMsg && chatMsg.length > 0) {
            res.status(200).json({
                chatMsg,
                status: 200
            })
        }
        else {
            res.status(200).json({
                message: 'No Chat found',
                status: 200
            })
        }
    }
    catch(err) {
        res.status(500).json({
            message: 'Internal Server Error',
            status: 500
        })
    }
})

router.get('/getChat', auth, async(req, res)=> {
    const curUserId = req.user._id;
    await ChatUser.find({userid: curUserId})
                  .exec((reject, resolve)=> {
                      if (reject) {
                          return res.status(500).json({
                              message: 'Internal Server Error',
                              status: 500
                          })
                      }
                      return res.status(200).json({
                          result: resolve,
                          status: 200
                      })
                  });
});

module.exports = router;