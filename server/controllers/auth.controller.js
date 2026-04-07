import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Helper: Generate JWT
const generateToken = (id) => {
   return jwt.sign(
      { id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
   );
};

// REGISTER
export const register = async (req, res) => {
   try {
      const { name, username, email, password } = req.body;

      if (!name || !username || !email || !password) {
         return res.status(400).json({ message: "All fields are required" });
      }

      const existingUser = await User.findOne({
         $or: [{ email: email.toLowerCase() }, { username }]
      });

      if (existingUser) {
         return res.status(400).json({
            message: "User already exists, please login"
         });
      }

      const user = await User.create({
         name,
         username,
         email: email.toLowerCase(),
         password
      });


      const token = generateToken(user._id);

      // res.cookie("token", token, {
      //    httpOnly: true,
      //    secure: false, //process.env.NODE_ENV === "production",
      //    sameSite: "lax",
      //    maxAge: 7 * 24 * 60 * 60 * 1000
      // });

      res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(201).json({
         _id: user._id,
         name: user.name,
         username: user.username,
         email: user.email
      });

   } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server error" });
   }
};

// LOGIN 
export const login = async (req, res) => {
   try {
      const { username, password } = req.body;

      if (!username || !password) {
         return res.status(400).json({ message: "All fields are required" });
      }

      const user = await User.findOne({ username });

      if (!user) {
         return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
         return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user._id);

      // res.cookie("token", token, {
      //    httpOnly: true,
      //    secure: false, //process.env.NODE_ENV === "production",
      //    sameSite: "lax",
      //    maxAge: 7 * 24 * 60 * 60 * 1000
      // });

      res.cookie("token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
         maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
         _id: user._id,
         name: user.name,
         username: user.username,
         email: user.email
      });

   } catch (error) {
      return res.status(500).json({ message: "Server error" });
   }
};

// LOGOUT
export const logout = (req, res) => {
   // Replace with a expired cookie
   res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0)
   });

   res.status(200).json({ message: "Logged out" });
};

// GET CURRENT USER
export const getMe = async (req, res) => {
   res.set("Cache-Control", "no-store");
   return res.status(200).json(req.user);
}