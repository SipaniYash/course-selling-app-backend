require("dotenv").config()
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_AdminSecret;

function adminMiddleware(req, res, next){
    const token = req.headers.token;
    try{
        const decoded = jwt.verify(token, process.env.JWT_AdminSecret);
        // below doecoded takes the id from the JWT and names it creatorId (copy of it)
        req.creatorId = decoded.id;
        next();
    } catch(error){
        res.json({
            msg: "you are not signed in"
        })
    } 
}

module.exports = {
    adminMiddleware: adminMiddleware
}