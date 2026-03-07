import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
   participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
   }],
   isGroup: {
      type: Boolean,
      default: false
   },
   lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
   },
   groupName: String,
   groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   }
}, { timestamps: true })

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;