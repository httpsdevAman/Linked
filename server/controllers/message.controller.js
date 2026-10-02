import Message from "../models/message.js";
import Conversation from "../models/conversation.js";
import { io } from "../server.js";
import fs from "fs/promises";
import { cloudinary } from "../config/multer.js";

// SEND MESSAGE IN A CONVERSATION (http only)
/* export const sendMessage = async (req, res) => {
   try {
      // console.log("Hellp")
      const { convID, content } = req.body;
      const senderID = req.user._id;

      if (!convID || !content) {
         return res.status(400).json({ message: "Conversation ID and Content Required" });
      }


      // Ensure Conversation exists
      const conv = await Conversation.findById(convID);
      if (!conv) {
         return res.status(404).json({ message: "Conversation does not exist" });
      }

      // Sender must be in a participant of the Conversation
      const isParticipant = conv.participants.some(
         p => p.equals(senderID)
      );

      if (!isParticipant) {
         return res.status(403).json({
            message: "You are not a participant of this conversation"
         });
      }


      // Create Message
      const message = await Message.create({
         sender: senderID,
         conversation: convID,
         content
      })

      // Populate sender for the message
      const populatedMessage = await Message.findById(message._id).populate("sender", "username name")

      // Update last message of the converstion
      conv.lastMessage = message._id;
      // console.log("Updating lastMessage:", conv.lastMessage);
      await conv.save();

      return res.status(201).json(populatedMessage)



   } catch (error) {
      return res.status(500).json({
         message: "Internal Server Error"
      });
   }
}*/

const uploadToCloudinary = (buffer, originalName) => {
   return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
         {
            folder: "linked_attachments",   // Cloudinary Folder Name
            resource_type: "auto",
            public_id: originalName.split('.')[0] + '-' + Date.now()
         },
         (err, res) => {
            if(err) reject(err);
            else resolve(res)
         }
      );

      stream.end(buffer);
   });
}

// SEND MESSAGE (Socket.IO)
export const sendMessage = async (req, res) => {
   try {
      const { convID, content } = req.body;
      const senderID = req.user._id;
      const hasFiles = req.files && req.files.length > 0;
      
      if (!convID) {
         return res.status(400).json({ message: "Conversation ID Required" });
      }
      
      if (!content?.trim() && (!hasFiles)) {
         return res.status(400).json({
            message: "Message or file required"
         });
      }

      
      // Ensure Conversation exists
      const conv = await Conversation.findById(convID);
      if (!conv) {
         return res.status(404).json({ message: "Conversation does not exist" });
      }
      
      // Sender must be in a participant of the Conversation
      const isParticipant = conv.participants.some(
         p => p.equals(senderID)
      );
      if (!isParticipant) {
         return res.status(403).json({
            message: "You are not a participant of this conversation"
         });
      }
      
      let attachments = []
      
      if(hasFiles) {
         for (const file of req.files) {
            // Upload from memory buffer directly to Cloudinary
            const result = await uploadToCloudinary(file.buffer, file.originalname);
            
            attachments.push({
               url: result.secure_url, // Cloudinary's secure HTTPS URL
               fileType: file.mimetype,
               fileName: file.originalname,
               fileSize: file.size,
               public_id: result.public_id // You need it if you ever want to let users delete messages
            });
         }
      }
      
      // Create Message
      const message = await Message.create({
         sender: senderID,
         conversation: convID,
         content,
         attachments
      })

      // Populate sender for the message
      const populatedMessage = await Message.findById(message._id).populate("sender", "username name")

      // Update last message of the converstion
      conv.lastMessage = message._id;
      conv.updatedAt = new Date();
      await conv.save();

      // Emit the message to room = convID
      req.io.to(convID).emit("receive-message", populatedMessage);
      
      return res.status(201).json(populatedMessage)

   } catch (error) {
      // CLEANUP: Also delete files if ANY server/database error occurs
      console.log(error);

      return res.status(500).json({
         message: "Internal Server Error"
      });
   }
}


// GET MESSAGES OF A CONVERSATION 
export const getMessages = async (req, res) => {
   try {
      const { convID } = req.params;
      const userID = req.user._id;

      if (!convID) {
         return res.status(400).json({
            message: "Conversation ID required"
         });
      }

      // Check if conversation exists
      const conv = await Conversation.findById(convID);
      if (!conv) {
         return res.status(404).json({ message: "Conversation does not exist" });
      }

      // User must be in a participant of the Conversation
      const isParticipant = conv.participants.some(
         p => p.equals(userID)
      );

      if (!isParticipant) {
         return res.status(403).json({
            message: "You are not a participant of this conversation"
         });
      }

      // Fetch Messages
      const messages = await Message.find({
         conversation: convID
      }).populate("sender", "username name").sort({ createdAt: 1 });

      return res.status(200).json(messages);



   } catch (error) {
      return res.status(500).json({
         message: "Internal Server Error"
      });
   }
} 