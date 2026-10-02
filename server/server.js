import express from "express";
import { Server } from 'socket.io'
import http from "http";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"
import convRoutes from "./routes/conversation.route.js"
import messageRoutes from "./routes/message.route.js"
import userRoutes from "./routes/user.route.js"
import fileRoutes from './routes/files.route.js'
import cors from "cors"
import jwt from "jsonwebtoken";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.static('public'));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
   origin: process.env.CLIENT_URL,
   credentials: true
}));

// To give socket access to controllers
app.use((req, res, next) => {
   req.io = io;
   next();
});

// Routes
app.use('/api/auth', authRoutes)
app.use("/api/users", userRoutes)
app.use('/api/conversations', convRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/file', fileRoutes)


// This the the HTTP Only Server
/* 
   const server = app.listen(port, () => {
      console.log("Server is listening...");
      connectDB();
   })
*/

// Create a new raw HTTP Server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
   cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
   }
})

// Socket Middleware
io.use((socket, next) => {
   try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
         return next(new Error("Not Authenticated"));
      }

      const token = cookieHeader.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1];

      if (!token) {
         return next(new Error("No Token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
   } catch (error) {
      next(new Error("Authentication Error"));
   }
});

const onlineUsers = new Map();

// When Client connects ...
io.on("connection", (socket) => {
   console.log("Socket connected:", socket.id);
   console.log("User ID:", socket.userId);

   onlineUsers.set(socket.userId, socket.id);
   // Emit "A User came" to all the sockets of io
   io.emit("user-online", socket.userId);

   // Request from Socket to join multiple rooms
   socket.on("join-conversations", (convIds) => {
      convIds.forEach((id) => {
         socket.join(id);
      })
   });

   // Client is typing
   socket.typingRooms = new Set();
   socket.on("start-typing", (conversationId) => {
      socket.to(conversationId).emit("user-started-typing", {
         userId: socket.userId,
         convId: conversationId
      });
      socket.typingRooms.add(conversationId);
   })
   // Client stopped tying
   socket.on("stop-typing", (conversationId) => {
      socket.to(conversationId).emit("user-stopped-typing", {
         userId: socket.userId,
         convId: conversationId
      });
      socket.typingRooms.delete(conversationId);
   })

   socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("user-offline", socket.userId);

      socket.typingRooms.forEach(conversationId => {
         socket.to(conversationId).emit("user-stopped-typing", {
            userId: socket.userId,
            convId: conversationId
         })
      })

      console.log("Disconnected:", socket.userId);
   });
});

server.listen(port, () => {
   console.log("Server is listening...");
   connectDB();
})

export { io, onlineUsers };