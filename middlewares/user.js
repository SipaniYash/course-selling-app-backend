require("dotenv").config()
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_UserSecret;

function userMiddleware(req, res, next){
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token, process.env.JWT_UserSecret);
        req.userId = decoded.id;
        next();
    } catch(error){
        res.json({
            msg: "you are not signed in"
        })
    } 
}

module.exports = {
    userMiddleware: userMiddleware
}