import Avatar from "./Avatar";

const MenuCard = ({ menu, name, logout, onNewConversation }) => (
   <div className={`absolute top-40 h-45 rounded-xl text-white bg-[#181818]/70 backdrop-blur-md transform transition-all duration-200 ease-out z-50 ${menu ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
      <div className="flex gap-2 items-center m-2 hover:bg-[#2c2c2c] rounded-tl-xl rounded-tr-xl p-2 border-b border-zinc-500 hover:cursor-pointer">
         <Avatar name={name} size={32} />
         <h1 className="text-md">{name}</h1>
      </div>
      <div onClick={onNewConversation} className="m-2 hover:bg-[#2c2c2c] flex gap-2 p-2 rounded-xl hover:cursor-pointer">
         <img src="/assets/add.svg" className="w-7" alt="" />
         New Conversation
      </div>
      <div className="fixed bottom-0 w-[91%] flex gap-2 hover:bg-[#2c2c2c] h-10 m-2 p-2 rounded-xl hover:cursor-pointer">
         <img src="/assets/logout.svg" className="w-7" alt="" />
         <button onClick={logout}>Logout</button>
      </div>
   </div>
);

export default MenuCard;