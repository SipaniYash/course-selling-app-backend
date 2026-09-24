const {Router} = require("express");
const courseRouter = Router();
const {userMiddleware} = require("./middlewares/user.js")
const {purchaseModel} = require("./db.js")

courseRouter.post("/purchase", userMiddleware, async (req, res)=>{
    // userId comes from the middleware
    const userId = req.userId;
    // courseId comes from the request body from the frontend
    const courseId = req.body.courseId;

    // adds the course of that courseid to the designated userid
    await purchaseModel.create({
        userId,
        courseId
    })

    res.json({
        msg:'you have purchased the course'
    })
})

courseRouter.get("/preview", async (req, res) =>{
    // return me all the (array) courses
    const courses = await courseModel.find({});
    res.json({
        courses
    })
})

module.exports = {
    courseRouter: courseRouter
}