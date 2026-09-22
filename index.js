require('dotenv').config();

const express = require("express");
const app = express();

app.use(express.json());

const { default: mongoose } = require("mongoose");

const { userRouter } = require("./user");
const { courseRouter } = require("./course");
const { adminRouter } = require("./admin");

app.use("/user", userRouter)
app.use("/course", courseRouter)
app.use("/admin", adminRouter)

async function main(){
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(3000)
    console.log("listening to port 3000");
}
main();
