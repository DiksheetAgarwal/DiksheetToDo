const jwt = require("jsonwebtoken"),
      User = require("../models/user");


const auth = async(req, res, next)=>{
    try {
        // const token = req.header("Authorization").replace("Bearer ","");
        const token = req.cookies.authorization;
        const decoded = jwt.verify(token, '_laden_da');
        const user = await User.findOne({_id: decoded._id})

        if(!user || !user.token.includes(token))
        {
            const err = new Error("Unauthorized");
            err.name = "Unauthorized";
            throw err;
        }
        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        res.clearCookie("Authorization");
        res.status(401).redirect("/signIn");
    }
}


module.exports = auth;