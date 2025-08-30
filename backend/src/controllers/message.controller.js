import Message from "../models/massage.model.js"

export const getMessages = async(req,res)=>{
  const senderId = req.body.senderId;
  const receiverId = req.body.receiverId; 
  

  try{
    if(!senderId || !receiverId){
        return res.status(400).json({
        message:"bad request"
    })}

    const allMessages = await Message.find({
        senderId:senderId,
        receiverId:receiverId
    })

    return res.status(200).json(allMessages);

  }
  catch(err){
    console.log("some error occurred while fetching all messages",err);
    return res.status(500).json({
        message:"internal server error"
    })
  }
}

export const sendMessage = async(req,res)=>{
    const {senderId,receiverId,text,image} = req.body;

    try{
        if(!senderId || !receiverId){
            return res.status(400).json({
                message:"bad request"
            })
        }

        const response = await Message.create({
            senderId,
            receiverId,
            text,
            image
        })

        if(response){
            return res.status(200).json(response);
        }
        else{
            return res.status(500).json({
                message:"internal server error"
            })
        }
    }
    catch(err){
        console.log("error occured while sending message",err);
        return res.status(500).json({
            message:"internal server error"
        })
    }
}