import { useState, useEffect } from "react";
import Avatar from "./Avatar";

const ChatPill = ({ recipient, recipientId, sender, lastMessage, onClick, convId, activConv, lastMessageTime, onlineUsers }) => {
   const [mounted, setMounted] = useState(false);

   useEffect(() => { setMounted(true); }, []);

   return (
      <div onClick={onClick} className={`w-full h-20 gap-1 mt-1 flex justify-start items-center pl-4 rounded-xl hover:cursor-pointer overflow-hidden
         ${convId === activConv ? "bg-[#766ac8] text-white" : "hover:bg-[#2c2c2c]"}
         transform transition-all duration-400 ease-out
         ${mounted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
         <Avatar name={recipient} border={convId === activConv ? true : false} />
         <div className="flex flex-col justify-center flex-1 h-full p-3 min-w-0 overflow-hidden">
            <div className="flex items-center">
               {onlineUsers.has(recipientId) && <img src="/assets/online.png" className="w-3 h-3 mr-1" alt="" />}
               <h1 className="text-xl truncate">{recipient}</h1>
            </div>
            {lastMessage !== "No messages yet" && (
               <p className={`text-sm truncate ${convId === activConv ? "text-white" : "text-zinc-400"}`}>
                  {sender + ": " + lastMessage}
               </p>
            )}
         </div>
         <div className={`h-full mr-2 mt-2 ${convId === activConv ? "text-white" : "text-zinc-400"}`}>
            {lastMessageTime.day === "Today" && <div>{lastMessageTime.time}</div>}
            {lastMessageTime.day !== "Today" && <div>{lastMessageTime.day}</div>}

         </div>

      </div>
   );
};

export default ChatPill;