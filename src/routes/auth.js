const express=require("express");
const authRouter=express.Router();
const User=require("../Models/user");
const bcrypt=require("bcrypt");
const {validateuser}=require("../utils/validate");

authRouter.post("/signup", async (req, res) => {
  try {
    validateuser(req);

    const { firstName, lastName, email, password, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender
    });

    await user.save();
    console.log(user);
    res.status(201).json({ message: "User saved successfully" });
  } catch (err) {
    res.status(400).send("Something went wrong while saving data: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Enter credentials");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const passwordCheck = await user.validatePassword(password);
    if (!passwordCheck) {
      throw new Error("Wrong password credentials");
    }

    const token = user.getJWT();
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(400).send("Something went wrong while logging in: " + err.message);
  }
});

authRouter.post("/logout",(req,res)=>{
    res.clearCookie("token");
    console.log("logout successfull");
    res.send("logout successfull");
});

module.exports=authRouter;