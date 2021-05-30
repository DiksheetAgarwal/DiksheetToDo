const User = require('../models/user'),
        jwt = require("jsonwebtoken"),
     bcrypt = require("bcrypt");

const generateAuthToken = async function(user){
        const token = jwt.sign(
            { _id: user._id.toString() },
            '_laden_da',
        );
        user.token.push(token); 
        await user.save();
        return token;       
}

module.exports = {
    generateAuthToken
}