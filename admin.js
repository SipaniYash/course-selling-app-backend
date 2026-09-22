const {Router} = require("express");
const adminRouter = Router();
const {adminModel, courseModel} = require("./db");
const {z} = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { adminMiddleware } = require("./middlewares/admin");
const secret = process.env.JWT_AdminSecret;


adminRouter.post("/signin", async (req, res)=>{
    const{email, password, name} = req.body;
    
    const requireBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string(),
        name: z.string()
    })
    const safeparse = requireBody.safeParse(req.body);
    if(!safeparse.success){
        res.json({
            msg: "incorrect format",
            error: safeparse.error
        })
    }

    let errorThrown = false;
    try{
         const bcryptPassword = await bcrypt.hash(password, 5);
         await adminModel.create({
            email,
            password: bcryptPassword,
            name
         })
    } catch(e){
        console.log("error occured");
        errorThrown = true;
    }
    if(!errorThrown){
        res.json({
            msg:'invalid details'
        })
    }
});

adminRouter.post("/signup", async (req, res)=>{
    const {email, password} = req.body;
    const admin = await adminModel.findOne({
        email: email
    })
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if(passwordMatch){
        const token = jwt.sign({
            id: admin._id
        }, secret)
        res.json({
            token: token
        })
    } else{
        res.json({
            msg:'invalid details'
        })
    }
});

adminRouter.post("/course", adminMiddleware, async (req, res)=>{
    // just naming it:
    const adminId = req.creatorId;  
    const {title, description, courseId, creatorId, imageUrl} = req.body;
    const course = await courseModel.create({
        title, 
        description, 
        courseId, 
        creatorId: adminId, 
        imageUrl
    })

    res.json({
        msg: 'course created',
        courseId: course._id
    })
});

adminRouter.put("/course",adminMiddleware, async (req, res)=>{
    // just naming it:
    const adminId = req.creatorId;  
    const {title, description, courseId, creatorId, imageUrl} = req.body;
    const course = await adminModel.updateOne({
        // find a course where id matches courseId & creatorId matches adminId
        _id: courseId,
        creatorId: adminId
    },{ // the things that can be updated:
        title,
        description,
        imageUrl
    })
    res.json({
        msg:'course updated',
        // to inform which courseId was changed
        courseId
    })
});

adminRouter.get("/course", adminMiddleware, async (req, res)=>{
    const adminId = req.creatorId;
    const courses = await adminModel.find({
        /* when a creator makes a course it gets saved w a creatorid, now we need to find all courses    where creatorId equals the logged-in admin's id
        */
        creatorId: adminId
    })
    res.json({
        courses
    })
});

module.exports = {
    adminRouter: adminRouter
}