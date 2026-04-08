import Avatar from "./Avatar";

const TypingPill = ({ name, isLeaving, time }) => (
   <>
      <style>{`
         @keyframes bounceDot {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
         }
         @keyframes slideInLeft { 
            from { opacity: 0; transform: translateX(-16px); } 
            to { opacity: 1; transform: translateX(0); } 
         }
         @keyframes slideOutLeft { 
            from { opacity: 1; transform: translateX(0); } 
            to { opacity: 0; transform: translateX(-16px); } 
         }
      `}</style>
      <div style={{ maxHeight: isLeaving ? "0px" : "100px", overflow: "hidden", transition: isLeaving ? "max-height 300ms ease 200ms" : "none" }}>
         <div
            className="flex mb-3 items-end gap-2.5 w-full flex-row"
            style={{ minHeight: "60px", animation: isLeaving ? "slideOutLeft 200ms ease-in forwards" : "slideInLeft 300ms ease-out forwards" }}
         >
            <Avatar name={name} size={35} border={false} />
            <div className="flex flex-col items-start max-w-[70%]">
               <span className="text-xs font-md mb-1 ml-1">{name}</span>
               <div className="px-4 py-2.5 rounded-3xl rounded-bl-md bg-white border border-gray-100 shadow-sm flex gap-1 items-center h-11">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: "bounceDot 1s ease-in-out infinite", animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: "bounceDot 1s ease-in-out infinite", animationDelay: "200ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: "bounceDot 1s ease-in-out infinite", animationDelay: "400ms" }} />
               </div>
               <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
            </div>
         </div>
      </div>
   </>
);

export default TypingPill;