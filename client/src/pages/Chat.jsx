import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { createConversation, getMessages, sendMessage, getConversations, getUsers, getOnlineUsers } from "../services/auth";
import { socket } from "../services/socket";
import Avatar from "../components/Avatar";
import ChatPill from "../components/ChatPill";
import MessagePill from "../components/MessagePill";
import TypingPill from "../components/TypingPill";
import MenuCard from "../components/MenuCard";

// Helpers 
function formatMessageTime(date) {
   if (!date) return { day: "", date: "", time: "" };

   const d = new Date(date);
   const now = new Date();

   const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

   const day = isToday
      ? "Today"
      : d.toLocaleDateString("en-US", { weekday: "short" });

   const formattedDate = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });

   const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
   });

   return {
      day,
      date: formattedDate,
      time,
   };
}

const CreateConversationModal = ({ showCreateModal, onClose, onCreated }) => {
   const [mode, setMode] = useState("dm"); // "dm" | "group"
   const [allUsers, setAllUsers] = useState([]);
   const [userSearch, setUserSearch] = useState("");
   const [selectedUsers, setSelectedUsers] = useState([]);
   const [groupName, setGroupName] = useState("");
   const [loadingUsers, setLoadingUsers] = useState(true);
   const [creating, setCreating] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchUsers = async () => {
         try {
            const res = await getUsers();
            setAllUsers(res.data);
         } catch (e) {
            setError("Failed to load users.");
         } finally {
            setLoadingUsers(false);
         }
      };
      fetchUsers();
   }, []);

   const filteredUsers = allUsers.filter(u =>
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase())
   );

   const toggleUser = (user) => {
      if (mode === "dm") {
         setSelectedUsers([user]);
         return;
      }
      setSelectedUsers(
         selectedUsers.find(u => u._id === user._id)
            ? selectedUsers.filter(u => u._id !== user._id)
            : [...selectedUsers, user]
      );
   };

   const isSelected = (userId) => selectedUsers.some(u => u._id === userId);

   const handleCreate = async () => {
      setError("");
      if (selectedUsers.length === 0) return setError("Select atleast one user.");
      if (mode === "group" && !groupName.trim()) return setError("Enter a group name.");

      setCreating(true);
      try {
         const payload = (mode === "dm")
            ? { isGroup: false, userId: selectedUsers[0]._id }
            : { isGroup: true, groupName: groupName.trim(), participantIds: selectedUsers.map(u => u._id) };

         const res = await createConversation(payload);
         onCreated(res.data);
         onClose();
      } catch (e) {
         setError(e.response?.data?.message || "Failed to create conversation.");
      } finally {
         setCreating(false);
      }
   };

   return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${!showCreateModal && "pointer-events-none"}`}>
         {/* Backdrop */}
         {showCreateModal && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />}

         {/* Modal */}
         <div className={`relative z-10 w-full max-w-md mx-4 bg-[#1a1a1a] border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden
         transform transition-all duration-100 ease-out
         ${showCreateModal ? "scale-100 opacity-100" : "scale-75 opacity-0"}
         `}
            style={{ maxHeight: "80vh" }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
               <h2 className="text-white text-lg font-semibold">New Conversation</h2>
               <button onClick={onClose} className="text-zinc-400 hover:text-white bg-black transition-colors border border-zinc-700 rounded-sm hover:cursor-pointer">
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
               </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 px-5 pt-4">
               <button
                  onClick={() => { setMode("dm"); setSelectedUsers([]); }}
                  className={`flex-1 py-2 rounded-xl hover:cursor-pointer text-sm font-medium transition-all ${mode === "dm" ? "bg-[#6c93ff] text-white" : "bg-[#2c2c2c] text-zinc-400 hover:text-white"}`}
               >
                  Direct Message
               </button>
               <button
                  onClick={() => { setMode("group"); setSelectedUsers([]); }}
                  className={`flex-1 py-2 rounded-xl hover:cursor-pointer text-sm font-medium transition-all ${mode === "group" ? "bg-[#6c93ff] text-white" : "bg-[#2c2c2c] text-zinc-400 hover:text-white"}`}
               >
                  Group Chat
               </button>
            </div>

            {/* Group Name Input */}
            {mode === "group" && (
               <div className="px-5 pt-3">
                  <input
                     type="text"
                     placeholder="Group name..."
                     value={groupName}
                     onChange={e => setGroupName(e.target.value)}
                     className="w-full bg-[#2c2c2c] text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6c93ff]"
                  />
               </div>
            )}

            {/* Selected chips (group only) */}
            {mode === "group" && selectedUsers.length > 0 && (
               <div className="flex flex-wrap gap-2 px-5 pt-3">
                  {selectedUsers.map(u => (
                     <div key={u._id} className="flex items-center gap-1.5 bg-[#6c93ff]/20 border border-[#6c93ff]/40 text-[#6c93ff] text-xs rounded-full px-3 py-1">
                        {u.name}
                        <button onClick={() => toggleUser(u)} className="hover:text-white transition-colors">×</button>
                     </div>
                  ))}
               </div>
            )}

            {/* Search */}
            <div className="px-5 pt-3">
               <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                     type="text"
                     placeholder="Search by name or username..."
                     value={userSearch}
                     onChange={e => setUserSearch(e.target.value)}
                     className="w-full bg-[#2c2c2c] text-white placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6c93ff]"
                  />
               </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1 scrollbar">
               {loadingUsers ? (
                  <div className="text-zinc-500 text-sm text-center py-6">Loading users...</div>
               ) : filteredUsers.length === 0 ? (
                  <div className="text-zinc-500 text-sm text-center py-6">No users found</div>
               ) : (
                  filteredUsers.map(user => (
                     <div
                        key={user._id}
                        onClick={() => toggleUser(user)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isSelected(user._id) ? "bg-[#6c93ff]/15 border border-[#6c93ff]/30" : "hover:bg-[#2c2c2c]"}`}
                     >
                        <Avatar name={user.name} size={38} />
                        <div className="flex-1 min-w-0">
                           <p className="text-white text-sm font-medium truncate">{user.name}</p>
                           <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
                        </div>
                        {isSelected(user._id) && (
                           <div className="w-5 h-5 rounded-full bg-[#6c93ff] flex items-center justify-center flex-shrink-0">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                 <polyline points="20 6 9 17 4 12" />
                              </svg>
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-800">
               {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
               <button
                  onClick={handleCreate}
                  disabled={creating || selectedUsers.length === 0}
                  className="w-full py-2.5 rounded-xl text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
                  style={{ background: "#6c93ff" }}
               >
                  {creating ? "Creating..." : mode === "dm" ? "Start Conversation" : `Create Group (${selectedUsers.length})`}
               </button>
            </div>
         </div>
      </div>
   );
};



const Chat = () => {
   const { user, logout } = useAuth();

   const [conversations, setConversations] = useState([]);
   const [loadingConvs, setLoadingConvs] = useState(true);
   const [activConv, setActiveConv] = useState(null);
   const [activConvParty, setActivConvParty] = useState(null);
   const [activRecipient, setActivRecipient] = useState("");
   const [activRecipientId, setActivRecipientId] = useState("");
   const [messages, setMessages] = useState([]);
   const [loadingMsgs, setLoadingMsgs] = useState();
   const [currMessage, setcurrMessage] = useState("");
   const [search, setSearch] = useState("");
   const [menu, toggleMenu] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const menuRef = useRef(null);
   const [activeSend, setActiveSend] = useState(false);
   const [onlineUsers, setOnlineUsers] = useState(new Set());
   const [loadingOnlineUsers, setLoadingOnlineUsers] = useState(false);
   const [error, setError] = useState(null);
   const scrollRef = useRef(null);
   const inputRef = useRef(null);
   const typingRef = useRef(false);             // Monitors if user is typing
   const typingTimeoutRef = useRef(null);       // Clear Timout Key-Down
   const [typingUsers, setTypingUsers] = useState(new Set());
<<<<<<< HEAD
   const chatContainerRef = useRef(null);

   // Track visual viewport height + offset to handle mobile keyboard open/close
   const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight);
   const [viewportOffset, setViewportOffset] = useState(0);

   useEffect(() => {
      const vv = window.visualViewport;
      if (!vv) return;

      const handleResize = () => {
         setViewportHeight(vv.height);
         setViewportOffset(vv.offsetTop);
      };

      vv.addEventListener("resize", handleResize);
      vv.addEventListener("scroll", handleResize);

      return () => {
         vv.removeEventListener("resize", handleResize);
         vv.removeEventListener("scroll", handleResize);
      };
   }, []);
=======
   const fileInputRef = useRef(null);
   const [files, setFiles] = useState([]);
>>>>>>> e863b1d (Added file sharing)

   // Get name from userId
   const getUserNameById = (userId) => {
      for (const conv of conversations) {
         const found = conv.participants?.find(p => p._id === userId);
         if (found) return found.name;
      }
      return null;
   };

   const fetchConversations = async () => {
      const convs = await getConversations();
      setConversations(convs.data);
      setLoadingConvs(false);
   };

   const fetchMessages = async (convID) => {
      setLoadingMsgs(true);
      const mess = await getMessages(convID);
      setMessages(mess.data);
      setLoadingMsgs(false);
   };

<<<<<<< HEAD
   const handleSend = useCallback(async () => {
      if (!currMessage.trim()) return;
=======
   const handleSend = async () => {
      if (!currMessage.trim() && files.length === 0) return;
      console.log(files[0]);     // Here are the files
>>>>>>> e863b1d (Added file sharing)

      const messageContent = currMessage;
      const messageFiles = [...files]
      setcurrMessage(""); // Clear immediately
      setFiles([]);

      // Re-focus input to keep mobile keyboard open
      requestAnimationFrame(() => {
         inputRef.current?.focus();
      });

      const optimisticMsg = {
         _id: `temp-${Date.now()}`,
         content: messageContent,
         attachments: messageFiles.map(file => ({
            fileName: file.name,
            url: URL.createObjectURL(file)
         })),
         sender: { _id: user._id, name: user.name },
         conversation: activConv,
         createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimisticMsg]); // Show immediately

      try {
         setActiveSend(true);
         setTimeout(() => setActiveSend(false), 150);

         const res = await sendMessage({ convID: activConv, content: messageContent, files });

         // Replace optimistic with real message
         // setMessages(prev => prev.map(m => m._id === optimisticMsg._id ? res.data : m));

         setConversations(prev =>
            prev.map(conv =>
               conv._id === activConv
                  ? { ...conv, lastMessage: res.data, updatedAt: res.data.createdAt }
                  : conv
            )
         );
      } catch (error) {
         setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
         setcurrMessage(messageContent); // Restore on failure
         console.error(error.response?.data || error.message);
      }
   }, [currMessage, activConv, user]);

   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         setActiveSend(true);
         handleSend();
         setTimeout(() => {
            setActiveSend(false);
         }, 150);

         // Stop Typing
         if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
         }

         if (typingRef.current) {
            socket.emit("stop-typing", activConv);
            typingRef.current = false;
         }
         return;
      }

      // If not typing
      if (!typingRef.current) {
         typingRef.current = true;
         // Emit "Typing"
         socket.emit("start-typing", activConv);
      }
      // Clear previous timeout
      if (typingTimeoutRef.current) {
         clearTimeout(typingTimeoutRef.current);
      }

      // Start new timeout
      typingTimeoutRef.current = setTimeout(() => {
         socket.emit("stop-typing", activConv);
         typingRef.current = false;
      }, 2000);


   };

   // Listen typing
   const [leavingUsers, setLeavingUsers] = useState(new Set());

   useEffect(() => {
      const handleStartedTyping = ({ userId, convId }) => {
         if (convId !== activConv) return;
         setLeavingUsers(prev => { const c = new Set(prev); c.delete(userId); return c; });
         setTypingUsers(prev => new Set(prev).add(userId));
      };

      const handleStoppedTyping = ({ userId, convId }) => {
         if (convId !== activConv) return;
         setLeavingUsers(prev => new Set(prev).add(userId));
         setTimeout(() => {
            setTypingUsers(prev => { const c = new Set(prev); c.delete(userId); return c; });
            setLeavingUsers(prev => { const c = new Set(prev); c.delete(userId); return c; });
         }, 300);
      };

      socket.on("user-started-typing", handleStartedTyping);
      socket.on("user-stopped-typing", handleStoppedTyping);

      return () => {
         socket.off("user-started-typing", handleStartedTyping);
         socket.off("user-stopped-typing", handleStoppedTyping);
      };
   }, [activConv]);

   const handleConvClick = async (convId) => {
      setTypingUsers(new Set());
      setLeavingUsers(new Set());
      setActiveConv(convId);
      const activeConve = conversations?.find(c => c._id === convId);
      const recipient = activeConve?.isGroup
         ? activeConve?.groupName
         : activeConve?.participants?.find(p => p._id !== user?._id)?.name;
      setActivRecipient(recipient || null);

      if (!activeConve?.isGroup) {
         setActivRecipientId(activeConve?.participants?.find(p => p._id !== user?._id)?._id)
      }
      fetchMessages(convId);
   };

   // Called when a new conversation is created from the modal
   const handleConversationCreated = (newConv) => {
      // Add to list only if not already present (backend returns existing DM if already exists)
      setConversations(prev => {
         const exists = prev.find(c => c._id === newConv._id);
         if (exists) return prev;
         return [newConv, ...prev];
      });
      // Auto-open the new conversation (note: lastMessage may be undefined for brand new convs)
      if (newConv.lastMessage) {
         handleConvClick(newConv._id);
      } else {
         // Set active manually since there are no messages yet
         setActiveConv(newConv._id);
         const recipient = newConv.isGroup
            ? newConv.groupName
            : newConv.participants?.find(p => p._id !== user?._id)?.name;
         setActivRecipient(recipient || "");
         setMessages([]);
      }
   };

   // Filtered conversations based on search
   const filteredConversations = (conversations.filter(conv => {
      const name = conv.isGroup
         ? conv.groupName
         : conv.participants?.find(p => p._id !== user?._id)?.name || "";
      return name.toLowerCase().includes(search.toLowerCase());
   })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

   // filteredConversations.forEach(conv => console.log(conv.updatedAt));

   useEffect(() => {
      fetchConversations();
   }, []);

   useEffect(() => {
      const handleClickOutside = (event) => {
         if (menuRef.current && !menuRef.current.contains(event.target)) {
            toggleMenu(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   useEffect(() => {
      if (activConv) {
         scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
   }, [messages, activConv, typingUsers]);

   // useEffect(() => {
   //    if (activConv) {
   //       inputRef.current?.focus();
   //    }
   // }, [activConv]);

   // useEffect(() => {
   //    if (activConv) {
   //       setTimeout(() => {
   //          inputRef.current?.focus();
   //       }, 100);
   //    }
   // }, [activConv]);

   // Connect to the server
   useEffect(() => {
      socket.connect();

      socket.on("connect", () => {
         console.log("Socket connected: ", socket.id);
      });

      return () => socket.disconnect();
   }, []);

   // Socket listening for the messages
   useEffect(() => {
      const handleReceive = (message) => {
         // Update messages if active
         if (message.conversation === activConv) {
            setMessages(prev => {
               const optimistic = prev.findLast(m => m._id.startsWith("temp-") && m.sender._id === user._id);
               if (optimistic && message.sender._id === user._id) {
                  return prev.map(m => m._id === optimistic._id ? { ...message, _id: optimistic._id } : m);
               }
               if (prev.some(m => m._id === message._id)) return prev;
               return [...prev, message];
            });
         }

         // Update sidebar
         setConversations(prev =>
            prev.map(conv =>
               conv._id === message.conversation
                  ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
                  : conv
            )
         );
      };

      socket.on("receive-message", handleReceive);

      return () => {
         socket.off("receive-message", handleReceive);
      };
   }, [activConv]);

   // Socket sends request for joining multiple rooms (All the Conversation Ids)
   useEffect(() => {
      if (conversations.length > 0) {
         socket.emit(
            "join-conversations",
            conversations.map(c => c._id)
         );
      }
   }, [conversations]);

   const getActivConvoParty = () => {
      const convo = conversations?.find(p =>
         p._id === activConv
      )

      setActivConvParty(prev => convo?.participants.map(p => (p._id === user._id) ? "You" : p.name));
   }

   useEffect(() => getActivConvoParty(), [activConv])

   useEffect(() => {
      const fetchOnlineUsers = async () => {
         try {
            const res = await getOnlineUsers();
            setOnlineUsers(new Set(res.data));
         } catch (e) {
            setError("Failed to load online users.");
         } finally {
            setLoadingOnlineUsers(false);
         }
      };
      fetchOnlineUsers();
   }, []);

   useEffect(() => {
      const handleOnline = (userId) => {
         setOnlineUsers(prev => new Set(prev).add(userId));
      };

      const handleOffline = (userId) => {
         setOnlineUsers(prev => {
            const copy = new Set(prev);
            copy.delete(userId);
            return copy;
         });
      };

      socket.on("user-online", handleOnline);
      socket.on("user-offline", handleOffline);

      return () => {
         socket.off("user-online", handleOnline);
         socket.off("user-offline", handleOffline);
      };

   }, []);

   //test


   return (
      <div
         ref={chatContainerRef}
         className="flex overflow-hidden"
         style={{
            position: 'fixed',
            top: `${viewportOffset}px`,
            left: 0,
            width: '100%',
            height: `${viewportHeight}px`
         }}
      >
         {/* Left Sidebar */}
         <div className={`absolute md:relative top-0 left-0 h-full border border-zinc-800 text-white bg-[#262624] flex flex-col w-full md:w-[30%] transform transition-transform duration-300 ease-in-out
         ${activConv ? "-translate-x-full md:translate-x-0" : "translate-x-0"} z-20`}
         style={{ touchAction: "manipulation" }}>

            <div className="text-7xl border-b text-center border-b-zinc-700 font-pacifico bg-linear-to-r from-green-400 via-blue-500 to-purple-600 p-4 bg-clip-text text-transparent select-none">
               Linked.
            </div>

            {/* Search + Menu */}
            <div className="w-full h-15 mt-2 mb-1.4 border-zinc-500 flex items-center px-3">
<<<<<<< HEAD
               <div ref={menuRef} className="relative z-30">
=======
               <div ref={menuRef}>
>>>>>>> e863b1d (Added file sharing)
                  <img
                     src="/assets/menu.svg"
                     onClick={() => toggleMenu(!menu)}
                     className="w-7 mr-3 cursor-pointer hover:scale-110 active:scale-75 transition-all"
                     alt=""
                  />
                  <MenuCard
                     menu={menu}
                     name={user.name}
                     logout={logout}
                     onNewConversation={() => { toggleMenu(false); setShowCreateModal(true); }}
                  />
               </div>

               <div className="relative w-full">
                  <img src="/assets/search.svg" className="w-8 absolute left-4 top-6.5 -translate-y-1/2 opacity-70" alt="" />
                  <input
                     type="text"
                     placeholder="Search"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="bg-[#30302e] mb-2 text-white h-13 w-full p-2 pl-15 rounded-xl focus:outline-none"
                  />
               </div>
            </div>

            {/* Conversation List */}
            <div className="p-3 flex-1 min-h-0 overflow-y-auto scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
               {loadingConvs ? (
                  <p className="text-zinc-500 text-md text-center mt-6">Loading Conversations...</p>
               ) : filteredConversations.length === 0 && search ? (
                  <p className="text-zinc-500 text-sm text-center mt-6">No conversations found</p>
               ) : (
                  filteredConversations.map((conversation) => (
                     <ChatPill
                        key={conversation._id}
                        recipient={!conversation.isGroup
                           ? conversation.participants.find(p => p._id !== user?._id)?.name
                           : conversation.groupName
                        }
                        recipientId={!conversation.isGroup
                           ? conversation.participants.find(p => p._id !== user?._id)?._id
                           : "NULL"
                        }
                        sender={conversation.lastMessage?.sender?.name ?? ""}
                        lastMessage={conversation.lastMessage?.content ?? "No messages yet"}
                        onClick={() => handleConvClick(conversation._id)}
                        convId={conversation._id}
                        activConv={activConv}
                        loading={loadingConvs}
                        lastMessageTime={formatMessageTime(conversation.lastMessage?.createdAt)}
                        onlineUsers={onlineUsers}
                     />
                  ))
               )}
            </div>
         </div>

         {/* Right Side */}
         <div className={`bg-[url(/assets/doodle.jpg)] bg-cover bg-center bg-no-repeat absolute md:relative top-0 right-0 h-full border border-zinc-800 text-white flex flex-col w-full md:flex-1 md:min-w-0 overflow-hidden
   transform transition-transform duration-300 ease-in-out
   ${activConv ? "translate-x-0" : "translate-x-full md:translate-x-0"} z-10`}
   style={{ height: `${viewportHeight}px` }}>
            <div className="absolute inset-0 bg-black/80 z-0" />

            {/* Top navbar */}
            <div className={`w-full border-b border-zinc-800 z-10 h-18 text-white transform transition-all duration-300 ease-out ${activConv ? "translate-y-0 opacity-100 flex" : "-translate-y-full opacity-0 pointer-events-none"} items-center pl-5`}>
               {/* Back button (mobile) */}
               <button
                  onClick={() => setActiveConv(null)}
                  className="md:hidden mr-3 text-zinc-400 hover:text-white transition-colors hover:cursor-pointer hover:scale-110"
               >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <polyline points="15 18 9 12 15 6" />
                  </svg>
               </button>
               <Avatar name={activRecipient} border={false} />
               <div className="">
                  <h1 className="text-lg md:text-2xl pl-3">{activRecipient}</h1>
                  <p className="text-zinc-400 text-xs md:text-sm ml-3">{(activConvParty?.length > 2) ? activConvParty.join(", ") : (onlineUsers.has(activRecipientId) && "Online")}</p>
               </div>

            </div>

            {/* Message Box */}
            {loadingMsgs ? (
               <div className="text-zinc-500 w-full h-auto text-2xl text-center flex-1 z-10 pt-20">Loading users...</div>
            ) : <div className="w-full h-auto flex-1 min-h-0 z-10 p-4 overflow-y-auto scrollbar no-overscroll" style={{ WebkitOverflowScrolling: "touch" }}>
               {messages.map((message) => (
                  <MessagePill
                     key={message._id}
                     message={message.content}
                     attachments={message.attachments}
                     sender={message.sender.name}
                     time={formatMessageTime(message.createdAt).time}
                     isOwn={message.sender._id === user._id}
                  />
               ))}
               {[...typingUsers].map(userId => (
                  <TypingPill
                     key={userId}
                     name={getUserNameById(userId)}
                     isLeaving={leavingUsers.has(userId)}
                     time={formatMessageTime(new Date().toISOString()).time}
                  />
               ))}
               <div ref={scrollRef} />
            </div>}

            {<div className={`absolute bottom-17 left-21 z-50 w-64 rounded-2xl border border-blue-200 bg-[#6c93ff] p-2 shadow-xl backdrop-blur-sm ${files.length > 0 ? 'opacity-100 max-h-60' : 'opacity-0 pointer-events-none max-h-0'} transition-all duration-200 ease-in-out`}>
               <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                  Attached Files
               </div>

               <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">

                  {
                     files.map((file) => (
                        <div className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm transition hover:bg-blue-50">

                           {/* File icon */}
                           <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[#1e3a8a]">
                             <img src="/assets/file-ico.png" className="h-5" alt="" />
                           </div>

                           {/* File name */}
                           <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1e3a8a]">
                              {file.name}
                           </span>

                           {/* Remove button */}
                           <button onClick={() => setFiles(files.filter((f) => f !== file))}
                              type="button"
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-100 hover:text-red-500"
                              title="Remove file"
                           >
                              ×
                           </button>
                        </div>
                     ))
                  }


               </div>
            </div>}

            {/* Input */}
            <div className={`border-t w-full flex-shrink-0 border-zinc-800 flex justify-center items-center py-2 transform transition-all duration-300 ease-out ${activConv ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"}`}
               style={{ zIndex: 20 }}
            >
               <div className="relative w-[80%]">
                  <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => setFiles(prev => [...prev, ...e.target.files])} />
                  <img src="/assets/clip.svg" alt="Attach file" onClick={() => fileInputRef.current?.click()} className="w-6 absolute left-4 top-1/2 -translate-y-1/2 opacity-70 active:scale-75 transition-all hover:scale-120" />
                  <input
                     type="text"
                     placeholder="Message..."
                     className="bg-[#30302e] text-white w-full p-2 pl-15 rounded-xl focus:outline-none"
                     value={currMessage}
                     onChange={(e) => setcurrMessage(e.target.value)}
                     onKeyDown={handleKeyDown}
                     ref={inputRef}
                     enterKeyHint="send"
                     autoComplete="off"
                  />
               </div>
               <div
                  onMouseDown={(e) => { e.preventDefault(); handleSend(); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleSend(); }}
                  className={`h-11 w-11 ml-1 bg-[#30302e] relative rounded-full flex-shrink-0
                  hover:bg-[#2d2d2d] hover:cursor-pointer
                `}>


                  <img
                     src="/assets/send.png"
                     className={`w-7 absolute transform transition-all duration-150 ease-in-out pointer-events-none
                        
                     ${activeSend ? "rotate-45 left-[4px] top-[8px]" : "rotate-0 left-[7px] top-[11px]"}
                     `}
                     alt=""
                  />
               </div>
            </div>
         </div>

         {/* Create Conversation Modal */}
         <CreateConversationModal
            showCreateModal={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreated={handleConversationCreated}
         />

      </div>
   );
};

export default Chat;