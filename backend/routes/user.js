const express = require('express');
const router = express.Router();
const {User} = require('../models/user');
const auth = require('../middleware/auth');

router.get('/getAllUsers', auth, async(req, res)=> {
    const userid = req.user._id;
    await User.find({_id: {$ne : userid}}).select('userid fname lname email phone')
            .exec((err, resolve)=> {
                if (err) {
                return res.status(500).json({
                    message : 'Internal Server Error',
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