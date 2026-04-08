# Linked — Real-Time Chat Application

## Overview

Linked is a full-stack real-time chat application supporting direct messaging and group conversations with live updates. It combines REST APIs for core operations with WebSockets for realtime communication.

---

## Tech Stack

### Frontend

* React (Vite)
* React Router
* Context API (AuthContext)
* Axios
* Socket.IO Client
* TailwindCSS

### Backend

* Node.js
* Express
* MongoDB + Mongoose
* JWT Authentication (cookie-based)
* Socket.IO

---

## Core Features

### Authentication

* User registration and login
* Password hashing using bcrypt
* JWT stored in httpOnly cookies
* Persistent sessions via `/auth/me`
* Secure logout (cookie invalidation)

---

### Chat System

* One-to-one messaging
* Group chats
* Conversation sidebar with:

  * last message preview
  * timestamps
* Message history per conversation

---

### Real-Time Features

* Instant message delivery using Socket.IO
* Conversation-based rooms
* Live sidebar updates
* Typing indicators
* Online/offline presence tracking

---

### UI/UX

* Protected routes (no unauthorized access)
* Responsive chat layout
* Message alignment (sender vs receiver)
* Smooth animations for messages
* Background assets and styled interface

---

## Database Design

### User

* name
* username
* email
* password (hashed)

### Conversation

* participants
* isGroup
* groupName
* lastMessage
* timestamps

### Message

* sender
* conversation
* content
* timestamps

---

## Architecture

```
Frontend (React - Vercel)
        │
        │ HTTP (Axios)
        ▼
Backend (Express - Render)
        │
        ▼
MongoDB Atlas

Realtime Layer:
Frontend ↔ Socket.IO ↔ Server ↔ Rooms
```

---

## Realtime Flow

1. User connects via Socket.IO
2. Joins conversation-specific rooms
3. Sends message → server emits to room
4. All participants receive updates instantly
5. Presence and typing events broadcast in real-time

---

## Key Implementation Details

* Cookie-based authentication across domains using:

  * `httpOnly`
  * `secure`
  * `sameSite: "none"`
* CORS configured for frontend-backend communication
* Environment-based configuration using `.env`

---

## Known Limitations

* No message read/delivery status yet
* No file/media sharing
* No push notifications

---

## Future Improvements

### Realtime Enhancements

* Multi-device support (`userId → Set(socketIds)`)
* Message delivery & seen status

---

### Performance & Scalability

* Redis for socket scaling
* Message pagination (infinite scroll)
* Optimized database queries

---

### UI/UX Improvements

* Dark/light theme toggle
* Better mobile responsiveness
* Profile customization (avatar, bio)

---

### Security & Production

* Rate limiting
* Input validation & sanitization
* Helmet for security headers
* Logging & monitoring
