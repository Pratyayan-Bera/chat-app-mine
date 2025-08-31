import jwt from 'jsonwebtoken'

export const generateJWT = (userId,res)=>{
  
    const token = jwt.sign({userId},process.env.JWT_PASSWORD,{
        expiresIn:"7d"
    })
    
    // Set cookie for browsers that support it
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"none",
        secure: true
    });

    return token;
}

