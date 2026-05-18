import Avatar from "./Avatar";

const MenuCard = ({ menu, name, logout, onNewConversation }) => (
   <div className={`absolute top-10 left-0 w-64 rounded-2xl text-white bg-[#1a1a1a]/90 backdrop-blur-xl border border-zinc-800/80 shadow-2xl transform transition-all duration-200 ease-out z-50 flex flex-col overflow-hidden
      ${menu ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
   >
      {/* User profile section */}
      <div className="flex gap-3 items-center p-3.5 border-b border-zinc-800/60 bg-zinc-900/30">
         <Avatar name={name} size={36} />
         <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold text-zinc-100 truncate">{name}</h1>
            <p className="text-[11px] text-[#6c93ff] font-medium">Active Session</p>
         </div>
      </div>

      {/* Action items */}
      <div className="p-2 space-y-1">
         <div 
            onClick={onNewConversation} 
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 cursor-pointer transition-all duration-150 group"
         >
            <div className="w-8 h-8 rounded-lg bg-[#6c93ff]/10 flex items-center justify-center group-hover:bg-[#6c93ff]/20 transition-all duration-150">
               <img src="/assets/add.svg" className="w-5 h-5 invert-0 opacity-90" alt="Add" />
            </div>
            <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
               New Conversation
            </span>
         </div>

         <div 
            onClick={logout}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-500/10 cursor-pointer transition-all duration-150 group"
         >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all duration-150">
               <img src="/assets/logout.svg" className="w-5 h-5" alt="Logout" />
            </div>
            <span className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
               Logout
            </span>
         </div>
      </div>
   </div>
);

export default MenuCard;