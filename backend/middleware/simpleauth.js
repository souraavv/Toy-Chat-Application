const {User, validateUser} = require('../models/user');
const jwt = require('jsonwebtoken');

const verifyToken = async (token) => {
    try{
        const jwtPrivateKey = process.env.JWTPRIVATEKEY;
        const user = await jwt.verify(token, jwtPrivateKey);
        // console.log(user);
        const isValidUser = await User.findById(user._id);
        return isValidUser;
    }
    catch(err) {
        // console.log('error: ', err)
        return false;
    }
}

module.exports = verifyToken;