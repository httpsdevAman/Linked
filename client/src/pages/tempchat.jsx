import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// ─── API helpers (swap base URL / axios as needed) ───
const API = "http://localhost:5000/api"; // change to your base URL

const fetchConversations = () =>
  fetch(`${API}/conversations`, { credentials: "include" }).then((r) => r.json());

const fetchMessages = (convID) =>
  fetch(`${API}/messages/${convID}`, { credentials: "include" }).then((r) => r.json());

const postMessage = (convID, content) =>
  fetch(`${API}/messages`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ convID, content }),
  }).then((r) => r.json());

// ─── Helpers ───
const getChatName = (conv, currentUserId) => {
  if (conv.isGroup) return conv.groupName;
  const other = conv.participants.find((p) => p._id !== currentUserId);
  return other?.name || other?.username || "Unknown";
};

const getChatInitial = (name) => name?.charAt(0).toUpperCase() || "?";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatSidebarTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "2-digit", month: "short" });
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const colors = [
    "bg-amber-500", "bg-emerald-600", "bg-sky-600",
    "bg-violet-600", "bg-rose-600", "bg-teal-600",
  ];
  const color = colors[getChatInitial(name).charCodeAt(0) % colors.length];
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center font-bold text-zinc-900 flex-shrink-0`}>
      {getChatInitial(name)}
    </div>
  );
};

// ─── Sidebar conversation item ────────────────────────────────────────────────
const ConversationItem = ({ conv, currentUserId, isActive, onClick }) => {
  const name = getChatName(conv, currentUserId);
  const lastMsg = conv.lastMessage;
  const preview = lastMsg?.content || "No messages yet";
  const time = formatSidebarTime(conv.updatedAt);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors duration-150 text-left border-b border-zinc-800/50
        ${isActive ? "bg-zinc-800 border-l-2 border-l-amber-400" : ""}`}
    >
      <Avatar name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-zinc-100 truncate">{name}</span>
          <span className="text-xs text-zinc-500 flex-shrink-0">{time}</span>
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">{preview}</p>
      </div>
    </button>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isOwn }) => (
  <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
    {!isOwn && <Avatar name={msg.sender?.name || msg.sender?.username} size="sm" />}
    <div className={`max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
      {!isOwn && (
        <span className="text-xs text-zinc-500 ml-1">
          {msg.sender?.name || msg.sender?.username}
        </span>
      )}
      <div
        className={`px-4 py-2.5 text-sm leading-relaxed break-words
          ${isOwn
            ? "bg-amber-400 text-zinc-900 rounded-2xl rounded-br-sm font-medium"
            : "bg-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm"
          }`}
      >
        {msg.content}
      </div>
      <span className="text-xs text-zinc-600 mx-1">{formatTime(msg.createdAt)}</span>
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
    <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl">
      💬
    </div>
    <p className="text-zinc-400 font-semibold">Your messages</p>
    <p className="text-zinc-600 text-sm">Select a conversation to start chatting</p>
  </div>
);

// ─── Main Chat component ──────────────────────────────────────────────────────
const Chat = () => {
  const { user } = useAuth(); // { _id, name, username }

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    setLoadingConvs(true);
    fetchConversations()
      .then(setConversations)
      .catch(() => setError("Failed to load conversations"))
      .finally(() => setLoadingConvs(false));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;
    setLoadingMsgs(true);
    setMessages([]);
    fetchMessages(activeConv._id)
      .then(setMessages)
      .catch(() => setError("Failed to load messages"))
      .finally(() => setLoadingMsgs(false));
  }, [activeConv]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConv = (conv) => {
    setActiveConv(conv);
    setError("");
    setSidebarOpen(false); // auto-collapse on mobile
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeConv || sending) return;

    setSending(true);
    setInput("");

    // Optimistic update
    const optimistic = {
      _id: `temp-${Date.now()}`,
      sender: { _id: user._id, name: user.name, username: user.username },
      content: trimmed,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const saved = await postMessage(activeConv._id, trimmed);

      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? saved : m))
      );

      // Update conversation's lastMessage preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id
            ? { ...c, lastMessage: saved, updatedAt: saved.createdAt }
            : c
        )
      );
    } catch {
      setError("Failed to send message");
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInput(trimmed); // restore input
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = getChatName(c, user._id).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeChatName = activeConv ? getChatName(activeConv, user._id) : "";

  return (
    <div className="h-screen bg-zinc-950 flex overflow-hidden">

      {/* ── Sidebar ── */}
      <div
        className={`
          flex-shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800
          transition-all duration-300
          ${sidebarOpen ? "w-80" : "w-0 md:w-80"}
          overflow-hidden
        `}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-5 pb-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-black text-zinc-100">
              Chats<span className="text-amber-400">.</span>
            </h1>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Avatar name={user?.name || user?.username} size="sm" />
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs placeholder-zinc-600 pl-8 pr-3 py-2.5 outline-none focus:border-amber-400 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <p className="text-zinc-600 text-xs text-center mt-12 px-4">
              {search ? "No conversations match your search" : "No conversations yet"}
            </p>
          ) : (
            filteredConvs.map((conv) => (
              <ConversationItem
                key={conv._id}
                conv={conv}
                currentUserId={user._id}
                isActive={activeConv?._id === conv._id}
                onClick={() => handleSelectConv(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 flex-shrink-0">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden text-zinc-400 hover:text-amber-400 transition-colors mr-1"
          >
            ☰
          </button>

          {activeConv ? (
            <>
              <Avatar name={activeChatName} />
              <div>
                <p className="text-sm font-semibold text-zinc-100">{activeChatName}</p>
                <p className="text-xs text-zinc-500">
                  {activeConv.isGroup
                    ? `${activeConv.participants.length} members`
                    : "Direct message"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm font-semibold text-zinc-500">Select a conversation</p>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border-b border-red-500/20 px-4 py-2">
            <span className="text-red-400 text-xs font-bold">✕</span>
            <p className="text-red-400 text-xs font-medium">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-400 text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Messages */}
        {!activeConv ? (
          <EmptyState />
        ) : loadingMsgs ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-600 text-xs">No messages yet. Say hello 👋</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  isOwn={msg.sender?._id === user._id}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input bar */}
        {activeConv && (
          <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${activeChatName}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-amber-400 text-zinc-100 text-sm placeholder-zinc-600 px-4 py-2.5 outline-none transition-colors duration-200"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-bold text-xs tracking-wider px-5 py-2.5 transition-all duration-150 active:scale-95 flex-shrink-0"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
            <p className="text-zinc-700 text-xs mt-1.5 ml-1">Enter to send</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;