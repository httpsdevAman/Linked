import User from "../models/user.js";
import { onlineUsers } from "../server.js";

export const getUsers = async (req, res) => {
   try {
      const users = await User.find({ _id: { $ne: req.user._id } })
         .select("_id name username");
      return res.status(200).json(users);
   } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
   }
};

export const getOnlineUsers = async (req, res) => {
   try {
      const usersOnline = [...onlineUsers.keys()];

      return res.status(200).json(usersOnline);

   } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
   }
};