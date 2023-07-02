const jwt = require("jsonwebtoken");
const {User, validateUser} = require('../models/user');

require('dotenv').config();

// req.user._id
module.exports = async function(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({
            message: 'No Token provided',
            status: 401
        });
    }
    try{
        const jwtPrivateKey = process.env.JWTPRIVATEKEY;
        const user = jwt.verify(token, jwtPrivateKey);
        const isValidUser = await User.findById(user._id);
        if (!isValidUser) {
            return res.status(403).json({
                message: 'User doesn not exists',
                status: 403
            })
        }
        req.user = user;
        next();
    }
    catch(err) {
        res.status(400).json({
            message: 'Invalid Token',
            status: 400
        });
    }
}