import dotenv from "dotenv"
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/user.route.js"
import messageRoutes from "./routes/message.route.js"
import fileRoutes from "./routes/file.route.js"
import {connectDB} from "./config/db.js"
import cookieParser from "cookie-parser"
import cors from "cors";

dotenv.config()

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://chillchatt.netlify.app",
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser());

// CORS middleware
app.use(cors({
  origin: 'https://chillchatt.netlify.app',  // frontend URL
  credentials: true                // allow cookies to be sent
}));

// Store online users
const onlineUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Broadcast updated online users list
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined. Online users:`, Array.from(onlineUsers.keys()));
  });

  // Handle sending messages
  socket.on('sendMessage', (messageData) => {
    const { receiverId, senderId, message, timestamp } = messageData;
    
    // Get receiver's socket ID
    const receiverSocketId = onlineUsers.get(receiverId);
    
    if (receiverSocketId) {
      // Send message to specific user
      io.to(receiverSocketId).emit('receiveMessage', {
        id: Date.now().toString(),
        content: message.text || message.content,
        image: message.image,
        sender: {
          id: senderId,
          name: message.senderName,
          avatar: message.senderAvatar
        },
        timestamp: timestamp,
        isOwn: false
      });
    }
    
    console.log(`Message sent from ${senderId} to ${receiverId}`);
  });

  // WebRTC Call Signaling
  socket.on('call-offer', ({ to, from, signal, type }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('call-offer', {
        from,
        signal,
        type,
        callerInfo: {
          name: 'User', // You can enhance this with actual user data
          avatar: null
        }
      });
    }
  });

  socket.on('call-answer', ({ to, from, signal }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-answer', { signal });
    }
  });

  socket.on('call-reject', ({ to, from }) => {
    const callerSocketId = onlineUsers.get(to);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-reject');
    }
  });

  socket.on('call-end', ({ to, from }) => {
    const otherUserSocketId = onlineUsers.get(to);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit('call-end');
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`User ${socket.userId} disconnected. Online users:`, Array.from(onlineUsers.keys()));
    }
  });
});

app.get("/",(req,res)=>{
    res.send("API is running successfully");
})
app.use("/api/auth",userRoutes)
app.use("/api/message",messageRoutes)
app.use("/api/file",fileRoutes)

server.listen(process.env.PORT,()=>{
    console.log(`the server is running on ${process.env.PORT}`);
    connectDB();
})