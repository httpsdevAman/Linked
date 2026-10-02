import Avatar from "./Avatar";

const MessagePill = ({ message, attachments, sender, time, isOwn }) => (
   <div
      className={`flex mt-3 mb-3 items-end gap-2.5 w-full ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      style={{ animation: isOwn ? "slideInRight 100ms ease-out forwards" : "slideInLeft 600ms ease-out forwards" }}
   >
      <Avatar name={sender} size={35} border={false} />
      <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
         {!isOwn && <span className="text-xs font-md mb-1 ml-1">{sender}</span>}

         <div
            className={`px-4 py-2.5 rounded-3xl text-sm leading-relaxed shadow-sm ${isOwn ? "text-white rounded-br-md" : "text-gray-700 bg-white border border-gray-100 rounded-bl-md"}`}
            style={isOwn ? { background: "#6c93ff" } : {}}
         >
            {message}
            {attachments && attachments.map((attachment, index) => {
               return <div>
                  <a key={index} href={attachment.url} download className="inline-flex m-0.5 items-center gap-2 rounded-lg bg-white px-2 py-0.5 text-sm font-semibold italic text-[#1e3a8a] shadow-md transition-all hover:bg-slate-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                     style={!isOwn ? {background: "#6c93ff", color: "#ffffff"} : {}}
                  >
                     {attachment.fileName}
                  </a>
                  <br />
               </div>
            })}
         </div>
         <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
      </div>
      <style>{`
         @keyframes slideInLeft { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
         @keyframes slideInRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
   </div>
);

export default MessagePill;