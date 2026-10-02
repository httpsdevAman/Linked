import axios from "axios";

const API = axios.create({
   baseURL: `${import.meta.env.VITE_API_URL}/api`,
   withCredentials: true
});

export const registerUser = (data) => {
   return API.post("/auth/register", data);
};

export const loginUser = (data) => {
   return API.post("/auth/login", data);
};

export const logoutUser = () => {
   return API.post("/auth/logout")
}

export const getUser = async () => {
   return API.get("/auth/me");
}

export const getUsers = async () => {
   return API.get("/users/all");
};

export const getOnlineUsers = async() => {
   return API.get("/users/online");
}

export const createConversation = async (convData) => {
   return API.post("/conversations", convData);
}

export const getConversations = async () => {
   return API.get("/conversations");
}

export const sendMessage = async ({ convID, content, files }) => {
   const formData = new FormData();
   formData.append("convID", convID);
   formData.append("content", content);
   files.forEach(file => formData.append("files", file));
   return API.post("/messages", formData);
}

export const getMessages = async (convID) => {
   return API.get(`/messages/${convID}`);
}

