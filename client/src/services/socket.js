import { io } from "socket.io-client";

export const socket = io(
   "http://10.162.78.231:5000", {
   withCredentials: true,
   autoConnect: false
});