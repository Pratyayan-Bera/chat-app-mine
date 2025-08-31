import jwt from 'jsonwebtoken'

export const generateJWT = (userId,res)=>{
  
    const token = jwt.sign({userId},process.env.JWT_PASSWORD,{
        expiresIn:"7d"
    })
    
    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true, //prevent XSS attacks cross-site scripting attacks
        sameSite:"none", //Allow cross-site cookies for production
        secure: true //Required for sameSite: none
    });

    return token;
}

