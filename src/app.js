const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

app.post("/signup",async (req,res) => {
  try {
    validateSignUpData(req);

    const {firstName, lastName, emailId, password} = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

      const user = new User({
          firstName, 
          lastName, 
          emailId, 
          password: passwordHash
      });

        await user.save();
        res.send("User Added successfully!!");
    } catch (err) {
        res.status(400).send("Error saving the user: " + err.message);
    }
    
});

app.post("/login",  async(req,res) => {

    try {
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId});

        if(!user){
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid){
            res.status(200).send("Login Successful!!");

        }else{
            throw new Error("Invalid Credentials");
        }



    } catch (err) {
        res.status(400).send("Error logging in: " + err.message);
    }
})

app.get("/user", async (req,res) => {
    const userEmail = req.body.emailId;
    try{
        const users = await User.find({emailId: userEmail});
        
        if(users.length===0){
            res.status(404).send("User not found");
        }else{
            res.send(users);
        }
        
    } catch(err){
        res.status(400).send("Something went wrong");
    }
   
});

app.get("/feed",async (req,res) =>{

    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

app.delete("/user",async (req,res) => {

    const userId = req.body.userId;

    try {
        const user = await User.findByIdAndDelete(userId);

        res.send("User deleted successfully");
    } catch (err) {
        res.status(400).send("Something went wrong");

    }
});

app.patch("/user/:userId",async(req,res) => {

    const userId = req.params?.userId;
    const data = req.body;

    try {

    const ALLOWED_UPDATES = [
      "skills", "photoUrl", "about", "gender", "age"
    ]

    const isUpdateAllowed = Object.keys(data).every(k => ALLOWED_UPDATES.includes(k));

    if(!isUpdateAllowed) {
        throw new Error("Update not allowed");
    }  

    if(data?.skills.length > 10) {
        throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate({_id: userId},data, {
       returnDocument:"after", runValidators: true,
    });

    res.send("User Updated successfully");

    } catch (err) {
        res.status(400).send("Update failed: " + err.message);
    }
});

connectDB()
    .then(() => {
        console.log("Database connection established...");
        app.listen(7777, () => {
            console.log("Server is listening on port 7777");
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected",err);
    });
    