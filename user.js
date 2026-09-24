require('dotenv').config();
const { Router } = require("express");
const userRouter = Router();
const bcrypt = require("bcrypt");
const { userModel, purchaseModel, courseModel } = require("./db");
const {z} = require("zod");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_UserSecret;
const {userMiddleware} = require("./middlewares/user.js")

userRouter.post("/signup", async (req, res)=>{
    const requireBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string()
    })
    const safeParse = requireBody.safeParse(req.body);
    if(!safeParse.success){
        res.json({
            msg:"incorrect format",
            error: safeParse.error
        })
    }
    let errorThrown = false;
    const {email, password, firstName, lastName} = safeParse.data;
    try{
         const bcryptPassword = await bcrypt.hash(password, 5);
         await userModel.create({
            email,
            password: bcryptPassword,
            firstName,
            lastName
        })
    }catch(e){
        console.log("error occurred");
        errorThrown = true;
    }
    if(!errorThrown){
        res.json({
            msg: 'you have signed up'
        })
    }
});

userRouter.post("/signin", async(req, res)=>{
    const { email, password } = req.body;
    // findOne gives you a single document instead of an array->(find)
    const user = await userModel.findOne({
        email: email,
    })
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(passwordMatch){
        const token = jwt.sign({
            id: user._id
        }, process.env.JWT_UserSecret)
        res.json({
            token: token 
        })
    } else{
        res.json({
            msg:'invalid details!'
        })
    }
    
});
userRouter.post("/purchases", userMiddleware, async (req, res)=>{
    const userId = req.userId;
    const purchases = await purchaseModel.find({
        userId
    });
    const courseData = await courseModel.find({
        _id: {$in: purchases.map(x => x.courseId)}
    }) 
    res.json({
        purchases
    })
});

module.exports = {
    userRouter: userRouter
}