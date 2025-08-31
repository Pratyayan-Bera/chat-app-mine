import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const authJWT =async (req,res,next)=>{
   try{
    
    // Check for token in cookies first, then in Authorization header
    let token = req.cookies.jwt;
    if(!token && req.headers.authorization){
        token = req.headers.authorization.replace('Bearer ', '');
    }
    
    if(!token){
        return res.status(401).json({
            massage:"Unauthorized user"
        })
    }

    const decoded = jwt.verify(token,process.env.JWT_PASSWORD);
    if(!decoded){
        return res.status(401).json({
            massage:"Unauthorized user"
        })
    }
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if(!user){
        return res.status(404).json({message:"unauthorized user"});
    }
    req.user=user;
    next();
   }
   catch(err){
    console.log("failed to authenticate")
    return res.status(500).json({
        massage:"internal server error"
    })
   }
}