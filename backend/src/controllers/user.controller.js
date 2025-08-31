import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import {generateJWT} from "../util/JWT.js"
import cloudinary from "../config/cloudinary.js"

export const signup = async (req, res) => {
  const { fullName, email, password ,profilePicture} = req.body;
  try {
    //checking the fields are not null
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        message: "all fields are required" 
      });
    }
    //checking if the a user with a same email is already present 
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ 
        msg: "email is already resistered try to login" 
      });
    }
    //hashing the user given password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword= await bcrypt.hash(password,salt);
    
    //creating a new user in the database
    const newUser = await User.create({
        fullName,
        email,
        password:hashedPassword,
        profilePicture

    })

    if(newUser){
        const token = generateJWT(newUser._id,res)
        res.status(201).json({
            id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email,
            profilePicture: newUser.profilePicture,
            token:token
        });
    }
    else{
        return res.status(400).json({
            message:"problem occured during User creation"
        })
    }

  } catch(err) {
    console.log("error occured",err);
  }
};

export const login = async (req, res) => {
  const { email , password }=req.body;
  try{
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
            message:"invalid credentials"
        })
    }

    const passwordCorrect = await bcrypt.compare(password,user.password);
    
    if(!passwordCorrect){
        return res.status(400).json({
            message:"invalid credentials"
        })
    }

    const token = generateJWT(user._id,res);
    res.status(200).json({
        id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePicture:user.profilePicture,
        token:token
    })
  }
  catch(err){
    console.log("error occured during login process",err);
    res.status(500).json({
        message:"internal server error"
    })
  }
};

export const logout = (req, res) => {
  try{
    res.cookie("jwt","",{ maxAge:0 });
    return res.status(200).json({ message:"logged out successfully"})
  } catch(error){
    console.log("Error in logout controller",error);
    res.status(500).json({ message:"Internal server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const updateUserProfilePicture = async(req , res)=>{
  const {newProfilePicture}=req.body;
  const userId = req.user._id
  try{
      if(!newProfilePicture){
        return res.status(400).json({
            message:"new profile pic is required"
        })
      }
      
      const uploadResponse = await cloudinary.uploader.upload(newProfilePicture);
      const updatedUser = await User.findByIdAndUpdate(userId,{profilePicture:uploadResponse.secure_url},{new:true}).select('-password');

      res.status(200).json(updatedUser);

  }
  catch(err){
    console.log("error occured while updating profile picture",err);
    res.status(500).json({
        message:"internal server error"
    })
  }
};

export const updateUserFullName = async(req,res)=>{
    const { newFullName } = req.body;
    const userId=req.user._id;
    try{
        if(!newFullName){
            return res.status(400).json({
                message:"new name is required"
            })
        }
    const updatedUser = await User.findByIdAndUpdate(userId,{fullName:newFullName},{new:true}).select('-password');

    res.status(200).json(updatedUser);
    }
    catch(err){
        console.log("problem occured while updating name",err);
        return res.status(500).json({
            message:"internal server error"
        })
    }
};

export const updateUserPassword = async(req,res)=>{
   const {oldPassword,newPassword} = req.body;
   const userId = req.user._id;
   const password = req.user.password;
   
  try{
    if(!oldPassword || !newPassword){
        return res.status(500).json({
            message:'ivalid credentials'
        })
    }

    const passwordCorrect= await bcrypt.compare(oldPassword,password);

    if(!passwordCorrect){
        return res.status(400).json({
            message:"incorrect password"
        })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword,salt);
    
    const updatedUser = await User.findByIdAndUpdate(userId,{password:hashedPassword},{new:true}).select("-password");

    res.status(200).json(updatedUser);
  }
  catch(err){
    console.log("problem occured while updating the password",err);
    return res.status(500).json({
        message : "internal server error"
  })
  }

};

export const getAllUsers = async(req,res)=>{
  const userId = req.user._id;

  try{
      const allUsers = await User.find({ _id:{$ne:userId} }).select('-password');

      // Format users with proper lastSeen display
      const formattedUsers = allUsers.map(user => ({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      res.status(200).json(formattedUsers);
  }
  catch(err){
     console.log("unable to fetch all users",err);
     res.status(500).json({
     message:"interal server error" 
    })
  }
};