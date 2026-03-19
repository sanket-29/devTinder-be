const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const {userAuth} = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

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
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){

            const token = await user.getJWT();

            res.cookie("token",token, {
                expires: new Date(Date.now() + 8 + 3600000),
            });

            res.status(200).send("Login Successful!!");

        }else{
            throw new Error("Invalid Credentials");
        }



    } catch (err) {
        res.status(400).send("Error logging in: " + err.message);
    }
});

app.get("/profile", userAuth, async(req,res) => {
 
    try {
        
    const user = req.user

    res.send(user);

    } catch (err) {
        
     res.status(400).send("Error fetching profile: " + err.message);

    }
    
});

app.post("/sendConnectionRequest", userAuth, async (req,res) => {

    const user = req.user;

    res.send(user.firstName + "sent the request");
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
    