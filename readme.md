
# 📱 BLEEP - Real-Time Messaging Microservices Platform

A modern, scalable real-time messaging application built with **Spring Boot microservices architecture**, featuring WebSocket support, service discovery, and message queuing.

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [System Design](#system-design)
- [Services Overview](#services-overview)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Data Flow Diagram (DFD)](#data-flow-diagram)
- [Setup & Installation](#setup--installation)
- [Running the Services](#running-the-services)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Project Overview

**Chats** is an enterprise-grade real-time messaging platform designed to facilitate seamless communication between users. The system supports:

- ✅ User authentication & authorization (JWT-based)
- ✅ One-to-one and group chat functionality
- ✅ Real-time message delivery via WebSocket
- ✅ Message persistence and retrieval
- ✅ Service discovery and load balancing
- ✅ Centralized configuration management
- ✅ Asynchronous message processing via RabbitMQ
- ✅ Reactive programming with Project Reactor

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Redux)                       │
│                         (BLEEP - UI Application)                        │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Spring Cloud Gateway)                   │
│                    ├─ JWT Validation & Authentication                   │
│                    ├─ Request Routing & Load Balancing                  │
│                    └─ Rate Limiting (Optional)                          │
└──────┬──────────────────────────────────────────────────┬───────────────┘
       │                                                   │
       ▼                                                   ▼
┌──────────────────────┐                         ┌──────────────────────┐
│  AUTH SERVICE        │                         │  WEBSOCKET SERVICE   │
│  (PostgreSQL)        │                         │  (WebSocket Handler) │
│  ├─ User Registration│                         │  ├─ Connection Mgmt  │
│  ├─ Login/JWT Token  │                         │  ├─ Message Routing  │
│  └─ Token Validation │                         │  └─ Broadcasting     │
└──────────────────────┘                         └──────────────────────┘
                                                           │
                                   ┌───────────────────────┼───────────────────────┐
                                   ▼                       ▼                       ▼
                        ┌──────────────────────┐  ┌──────────────────────┐
                        │  MESSAGE SERVICE     │  │  CHAT-ROOM SERVICE   │
                        │  (MongoDB)           │  │  (MongoDB)           │
                        │  ├─ Save Messages    │  │  ├─ Create Rooms     │
                        │  ├─ Fetch Messages   │  │  ├─ Manage Rooms     │
                        │  └─ Message History  │  │  └─ Participant List │
                        └──────────────────────┘  └──────────────────────┘
                                   │                       │
                                   └───────┬───────────────┘
                                           ▼
                        ┌──────────────────────────────────┐
                        │     RABBITMQ (Message Queue)     │
                        │  ├─ new-messages-exchange        │
                        │  ├─ saved-messages-exchange      │
                        │  └─ Async Message Processing     │
                        └──────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE SERVICES                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐ │
│  │  EUREKA SERVER       │  │  CONFIG SERVER                           │ │
│  │  (Service Discovery) │  │  (Centralized Configuration Management)  │ │
│  │  ├─ Service Registry │  │  ├─ Application Properties               │ │
│  │  ├─ Health Checks    │  │  ├─ DB Credentials                       │ │
│  │  └─ Load Balancing   │  │  └─ RabbitMQ Configuration               │ │
│  └──────────────────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Architecture Pattern: Microservices

- **Service-Oriented Architecture (SOA)**: Each service is independently deployable
- **Event-Driven Architecture**: RabbitMQ for asynchronous communication
- **API Gateway Pattern**: Central entry point for all client requests
- **Service Discovery Pattern**: Eureka for dynamic service registration
- **Configuration Server Pattern**: Centralized config management

---

## System Design

### 1. **Authentication & Authorization Flow**

```
User Login Request
        │
        ▼
┌─────────────────────────┐
│   API Gateway           │
│   (Route to Auth Service)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  AUTH SERVICE                           │
│  1. Validate credentials                │
│  2. Check user exists in User Service   │
│  3. Generate JWT Token                  │
│  4. Return Token + User Info            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────┐
│  Return JWT Token       │
│  (Valid for subsequent  │
│   authenticated requests)
└─────────────────────────┘
```

### 2. **Real-Time Messaging Flow**

```
User A (Client)
        │
        ▼ (WebSocket Connection + userId)
┌──────────────────────┐
│ WEBSOCKET SERVICE    │
│ • Validate User      │
│ • Establish Session  │
│ • Store in Memory    │
└──────────┬───────────┘
           │
           ▼ (Send Message via WebSocket)
    ┌──────────────────────┐
    │  Incoming Message    │
    │  Validation & Format │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  RabbitMQ Publish            │
    │  Exchange: new-messages      │
    │  Routing Key: new            │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  MESSAGE SERVICE Listener    │
    │  • Save to MongoDB           │
    │  • Process Message           │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  RabbitMQ Publish            │
    │  Exchange: saved-messages    │
    │  Routing Key: #              │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │  WEBSOCKET SERVICE Listener  │
    │  • Retrieve from Queue       │
    │  • Send to All Participants  │
    └──────────────────────────────┘
               │
               ├──────────────┬──────────────┐
               │              │              │
               ▼              ▼              ▼
            User A         User B         User C
         (Active)        (Active)       (Not Active)
```

### 3. **Chat Room Creation Flow**

```
Create Chat Room Request (User A)
        │
        ▼
┌──────────────────────────────┐
│  CHAT-ROOM SERVICE           │
│  • Create ChatRoom Document  │
│  • Save to MongoDB           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│  For each Participant in the room:           │
│  • Call USER-SERVICE API                     │
│  • Add ChatRoom ID to User's chat list       │
└──────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Return ChatRoomResponse     │
│  (ChatRoom created           │
│   with all details)          │
└──────────────────────────────┘
```

---

## Services Overview

### 1. **API Gateway** (`api-gateway`)
**Port:** `8080` (default)

**Purpose:** Single entry point for all client requests, JWT validation, and routing.

**Key Responsibilities:**
- Route requests to appropriate microservices
- JWT token validation
- Load balancing across services
- Cross-origin resource sharing (CORS)

**Dependencies:**
- Spring Cloud Gateway (WebFlux)
- Spring Cloud Config
- Spring Cloud Eureka Client
- JJWT (JWT libraries)

---

### 2. **Auth Service** (`auth-service`)
**Port:** `8081` (default)

**Purpose:** Handles user authentication, registration, and JWT token generation.

**Database:** PostgreSQL

**Key Features:**
- User registration with credential validation
- User login with password encryption
- JWT token generation and validation
- Username availability check
- Email and username uniqueness enforcement

**Key Classes:**
- `AuthController`: REST endpoints for auth operations
- `AuthService`: Business logic for authentication
- `JwtService`: JWT token generation and validation
- `AuthDetailsService`: User details loading for Spring Security
- `Auth` (Entity): Stores user credentials (email, username, password)

**DTOs:**
- `AuthRequest`: Login credentials (username, password)
- `AuthResponse`: Authentication response (id, username, email)
- `UserRequest`: User registration details
- `UserResponse`: User information response

---

### 3. **Chat-Room Service** (`chat-room-service`)
**Port:** `8082` (default)

**Purpose:** Manages chat room creation, retrieval, and participant management.

**Database:** MongoDB (Reactive)

**Key Features:**
- Create one-to-one and group chats
- Retrieve chat room details
- Manage participants
- Store last message preview
- Chat room metadata (created at, updated at)

**Key Classes:**
- `ChatRoomController`: REST endpoints for chat room operations
- `ChatRoomService`: Business logic for chat room management
- `ChatRoom` (Document): MongoDB document structure
- `ChatRoomType`: Enum (ONE_TO_ONE, GROUP)

**DTOs:**
- `ChatRoomRequest`: Create chat room payload
- `ChatRoomResponse`: Chat room details response

**Database Collection:** `ChatRooms`

```json
{
  "chatRoomId": "uuid",
  "chatRoomName": "Friends Group",
  "chatRoomProfileURL": "https://...",
  "chatRoomType": "GROUP",
  "isGroupChatting": true,
  "participants": ["user1", "user2", "user3"],
  "createdBy": "user1",
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00",
  "lastMessage": { ... }
}
```

---

### 4. **Message Service** (`message-service`)
**Port:** `8083` (default)

**Purpose:** Stores messages, handles message processing, and provides message retrieval.

**Database:** MongoDB (Reactive)

**Key Features:**
- Asynchronously save incoming messages
- Message retrieval by ID or chat room
- Publish saved messages for real-time delivery
- Message metadata (timestamp, sender, content type)
- Read status tracking

**Key Classes:**
- `MessageController`: REST endpoints for message operations
- `MessageService`: Business logic and RabbitMQ listener
- `Message` (Document): MongoDB document structure
- `MessageRepository`: Reactive MongoDB repository

**DTOs:**
- `MessageRequest`: Incoming message payload
- `MessageResponse`: Message details response

**Database Collection:** `Message`

```json
{
  "messageId": "uuid",
  "tempId": "temp-uuid",
  "chatRoomId": "room-uuid",
  "sendersId": "user-uuid",
  "contentType": "text/plain",
  "content": "Hello everyone!",
  "readBy": ["user1", "user2"],
  "participants": ["user1", "user2", "user3"],
  "isTemporary": false,
  "timeStamp": "2026-01-15T10:30:45",
  "updatedAt": "2026-01-15T10:30:45"
}
```

**RabbitMQ Integration:**
- Listens on queue: `new-messages-queue`
- Publishes to exchange: `saved-messages-exchange`

---

### 5. **WebSocket Service** (`websocket-service`)
**Port:** `8084` (default) + WebSocket endpoint

**Purpose:** Manages real-time WebSocket connections and message broadcasting.

**Key Features:**
- WebSocket connection establishment with user validation
- Real-time message broadcasting to participants
- User session management (in-memory ConcurrentHashMap)
- Connection lifecycle management (open, message, close)
- Automatic message publishing to RabbitMQ

**Key Classes:**
- `ChatWebSocketController`: Extends TextWebSocketHandler
- `WebSocketConfig`: WebSocket configuration
- `UserValidationService`: Validates user before connection
- `RabbitMQConfig`: RabbitMQ configuration for messaging
- `IncomingMessageDTO`: Incoming WebSocket message structure
- `OutgoingMessageDTO`: Outgoing WebSocket message structure

**WebSocket Connection:**
```
URL: ws://localhost:8084/chat?userId={userId}
Protocol: WebSocket
Authentication: User ID passed as query parameter
```

**Message Format:**

*Incoming:*
```json
{
  "chatRoomId": "room-123",
  "contentType": "text/plain",
  "content": "Hello!",
  "readBy": ["user1"],
  "participants": ["user1", "user2"]
}
```

*Outgoing:*
```json
{
  "messageId": "msg-456",
  "chatRoomId": "room-123",
  "sendersId": "user1",
  "contentType": "text/plain",
  "content": "Hello!",
  "participants": ["user1", "user2"],
  "timeStamp": "2026-01-15T10:30:45"
}
```

**RabbitMQ Integration:**
- Publishes to: `new-messages-exchange` (routing key: `new`)
- Subscribes to: `saved-messages-exchange` (routing key: `#`)

---

### 6. **Eureka Server** (`eureka-server`)
**Port:** `8761` (default)

**Purpose:** Service discovery and registration server.

**Key Features:**
- Service registry for all microservices
- Health check monitoring
- Dynamic load balancing
- Service-to-service discovery

**All services register with Eureka using:**
```java
@EnableDiscoveryClient
```

**Dashboard:** `http://localhost:8761`

---

### 7. **Config Server** (`config-server`)
**Port:** `8888` (default)

**Purpose:** Centralized configuration management for all microservices.

**Key Features:**
- Externalize application configuration
- Environment-specific configurations
- Dynamic configuration updates
- Centralized credential management

**Configuration Files Location:** (Should point to a Git repository or local config folder)

**Sample Properties:**
```properties
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

spring.data.mongodb.uri=mongodb://localhost:27017/chats
spring.datasource.url=jdbc:postgresql://localhost:5432/chats
spring.datasource.username=postgres
spring.datasource.password=password

jwt.secretKey=your-secret-key-here
```

---

### 8. **Frontend** (`Frontend/BLEEP`)
**Port:** `5173` (development - Vite)

**Purpose:** React-based user interface for the messaging application.

**Tech Stack:**
- React 19.1.0
- Redux Toolkit (State management)
- Tailwind CSS (Styling)
- Material-UI (Component library)
- STOMP/SockJS (WebSocket communication)
- Vite (Build tool)

**Key Features:**
- User authentication UI
- Real-time chat interface
- Message display
- User list
- Redux store for state management

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | Spring Boot | 3.5.3 / 3.5.4 |
| **Cloud Framework** | Spring Cloud | 2025.0.0 |
| **Java Version** | Java | 21 |
| **Service Discovery** | Eureka | Netflix |
| **API Gateway** | Spring Cloud Gateway | WebFlux |
| **Authentication** | Spring Security + JWT | JJWT 0.12.6 |
| **Message Queue** | RabbitMQ | AMQP |
| **Database - SQL** | PostgreSQL | Latest |
| **Database - NoSQL** | MongoDB | Reactive Driver |
| **Reactive Stack** | Project Reactor | Latest |
| **Frontend** | React | 19.1.0 |
| **State Management** | Redux Toolkit | 2.8.2 |
| **WebSocket** | SockJS + STOMP | 1.6.1 / 7.1.1 |
| **UI Framework** | Material-UI | 7.2.0 |
| **Styling** | Tailwind CSS | 3.4.17 |
| **Build Tool - Backend** | Maven | 3.x |
| **Build Tool - Frontend** | Vite | 7.0.4 |

---

## API Documentation

### 1. **Authentication Endpoints** (Auth Service)

**Base URL:** `http://localhost:8080/auth` (via API Gateway)

#### Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "userName": "john_doe",
  "emailId": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "auth": {
    "id": "uuid-123",
    "userName": "john_doe",
    "emailId": "john@example.com"
  },
  "user": {
    "id": "uuid-456",
    "userName": "john_doe",
    "emailId": "john@example.com"
  }
}

Error (409 Conflict):
{
  "message": "User with Same Detail already exists"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "userName": "john_doe",
  "password": "securePassword123"
  // OR
  "emailId": "john@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-456",
    "userName": "john_doe",
    "emailId": "john@example.com"
  }
}

Error (400 Bad Request):
{
  "message": "Invalid username or password"
}
```

#### Validate Username
```
GET /auth/validate/{userName}

Example: GET /auth/validate/john_doe

Response (200 OK):
true (or false)
```

---

### 2. **Chat Room Endpoints** (Chat-Room Service)

**Base URL:** `http://localhost:8080/chat-room` (via API Gateway)

#### Create Chat Room
```
POST /chat-room/create
Content-Type: application/json
Authorization: Bearer {jwt-token}

Request Body:
{
  "chatRoomName": "Friends Group",
  "chatRoomProfileURL": "https://example.com/profile.jpg",
  "chatRoomType": "GROUP",
  "isGroupChatting": true,
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "createdBy": "user1-uuid"
}

Response (200 OK):
{
  "chatRoomId": "room-uuid-123",
  "chatRoomName": "Friends Group",
  "chatRoomProfileURL": "https://example.com/profile.jpg",
  "chatRoomType": "GROUP",
  "isGroupChatting": true,
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "createdBy": "user1-uuid",
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00",
  "lastMessage": null
}
```

#### Get Chat Room Details
```
GET /chat-room/{chatRoomId}
Authorization: Bearer {jwt-token}

Example: GET /chat-room/room-uuid-123

Response (200 OK):
{
  "chatRoomId": "room-uuid-123",
  "chatRoomName": "Friends Group",
  "chatRoomProfileURL": "https://example.com/profile.jpg",
  "chatRoomType": "GROUP",
  "isGroupChatting": true,
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "createdBy": "user1-uuid",
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00",
  "lastMessage": {
    "content": "Last message preview...",
    "timestamp": "2026-01-15T10:30:45"
  }
}

Error (404 Not Found):
{
  "status": 404,
  "message": "Chat room not found: room-uuid-123"
}
```

#### Get All Chat Rooms for User
```
GET /chat-room/allChats?ids=room1,room2,room3
Authorization: Bearer {jwt-token}

Response (200 OK):
[
  { ... ChatRoomResponse 1 ... },
  { ... ChatRoomResponse 2 ... },
  { ... ChatRoomResponse 3 ... }
]
```

---

### 3. **Message Endpoints** (Message Service)

**Base URL:** `http://localhost:8080/message` (via API Gateway)

#### Create Message (REST)
```
POST /message/create
Content-Type: application/json
Authorization: Bearer {jwt-token}

Request Body:
{
  "chatRoomId": "room-uuid-123",
  "sendersId": "user1-uuid",
  "contentType": "text/plain",
  "content": "Hello everyone!",
  "readBy": ["user1-uuid"],
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"]
}

Response (200 OK):
{
  "messageId": "msg-uuid-456",
  "chatRoomId": "room-uuid-123",
  "sendersId": "user1-uuid",
  "contentType": "text/plain",
  "content": "Hello everyone!",
  "readBy": ["user1-uuid"],
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "timeStamp": "2026-01-15T10:30:45",
  "updatedAt": "2026-01-15T10:30:45"
}
```

#### Get Message by ID
```
GET /message/{messageId}
Authorization: Bearer {jwt-token}

Example: GET /message/msg-uuid-456

Response (200 OK):
{
  "messageId": "msg-uuid-456",
  "chatRoomId": "room-uuid-123",
  "sendersId": "user1-uuid",
  "contentType": "text/plain",
  "content": "Hello everyone!",
  "readBy": ["user1-uuid"],
  "participants": ["user1-uuid", "user2-uuid", "user3-uuid"],
  "timeStamp": "2026-01-15T10:30:45",
  "updatedAt": "2026-01-15T10:30:45"
}
```

#### Get All Messages for Chat Room
```
GET /message/chat-room-id/{chatRoomId}
Authorization: Bearer {jwt-token}

Example: GET /message/chat-room-id/room-uuid-123

Response (200 OK) - Server-Sent Events (SSE) / Flux:
[
  { ... MessageResponse 1 ... },
  { ... MessageResponse 2 ... },
  { ... MessageResponse 3 ... }
]
```

---

### 4. **WebSocket Endpoint** (WebSocket Service)

**URL:** `ws://localhost:8080/chat?userId={userId}` (via API Gateway)

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8080/chat?userId=user1-uuid');

ws.onopen = (event) => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.send(JSON.stringify({
  chatRoomId: "room-uuid-123",
  content: "Hello!",
  contentType: "text/plain",
  readBy: ["user1-uuid"],
  participants: ["user1-uuid", "user2-uuid"]
}));

ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

**Message Flow:**
1. Client connects with userId
2. Client sends message JSON
3. WebSocket service validates user and publishes to RabbitMQ
4. Message service receives, saves to MongoDB
5. Message service publishes saved message to RabbitMQ
6. WebSocket service receives and broadcasts to all participants
7. Clients receive message via WebSocket

---

## Data Flow Diagram (DFD)

### Level 0 - Context Diagram
```
                    ┌─────────────────┐
                    │     Client      │
                    │   (React App)   │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │                        │
                ▼                        ▼
            (REST)                  (WebSocket)
                │                        │
                ▼                        ▼
        ┌──────────────────────────────────────┐
        │   CHATS SYSTEM                       │
        │   (Microservices Platform)           │
        └──────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   (Auth)      (Messages)     (Chat Rooms)
```

### Level 1 - Detailed DFD

```
                    ┌──────────────┐
                    │  Client App  │
                    └──────┬───────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌──────────┐          ┌──────────────┐
│Register │          │  Login   │          │  Send        │
│User     │          │  User    │          │  Message     │
└────┬────┘          └────┬─────┘          └───────┬──────┘
     │                    │                        │
     ▼                    ▼                        ▼
┌─────────────────────────────────┐         ┌──────────────┐
│   API GATEWAY                   │         │  WebSocket   │
│   (JWT Validation)              │         │  Handler     │
└────────────┬────────────────────┘         └───────┬──────┘
             │                                      │
    ┌────────┼────────┐                          │
    │        │        │                          │
    ▼        ▼        ▼                          ▼
┌───────┐ ┌─────────────┐                  ┌──────────────┐
│ Auth  │ │Chat-Room    │ RabbitMQ Queue   │ Publish      │
│Serv.  │ │Service      │◄──────┬──────────┤ to Queue     │
└──┬────┘ └──────┬──────┘       │          └──────────────┘
   │             │             │
   ▼             ▼             ▼
[PostgreSQL]  [MongoDB]  [Message Service]
(Auth DB)    (Chat Rooms)    ├─ Save Message
                             ├─ Publish to
                             │ saved queue
                             ▼
                          [MongoDB]
                          (Messages)
                             │
                             ▼
                         RabbitMQ Queue
                         (saved-messages)
                             │
                             ▼
                         WebSocket Service
                             │
                             ▼
                          Connected Clients
```

---

## Setup & Installation

### Prerequisites
- **Java 21** or higher
- **Maven 3.x**
- **Node.js 18+** (for frontend)
- **PostgreSQL** (for Auth Service)
- **MongoDB** (for Message & Chat-Room Services)
- **RabbitMQ** (for message queue)
- **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/chats.git
cd chats
```

### Step 2: Set Up Databases

**PostgreSQL (Auth Service):**
```sql
CREATE DATABASE chats;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE chats TO postgres;
```

**MongoDB (Message & Chat-Room Services):**
```bash
# Start MongoDB
mongod

# Create database (auto-created on first use)
use chats
```

### Step 3: Set Up RabbitMQ

```bash
# Pull RabbitMQ Docker image
docker pull rabbitmq:latest

# Run RabbitMQ
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:latest

# Access Management UI: http://localhost:15672
# Default credentials: guest / guest
```

### Step 4: Configure Application Properties

**For each service**, update `src/main/resources/application.properties`:

**Auth Service** (`auth-service/src/main/resources/application.properties`):
```properties
spring.application.name=auth-service
spring.config.import=optional:configserver:http://localhost:8888

# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/chats
spring.datasource.username=postgres
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# JWT Secret
jwt.secretKey=your-base64-encoded-secret-key-here

# Eureka
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
```

**Message Service** (`message-service/src/main/resources/application.properties`):
```properties
spring.application.name=message-service
spring.config.import=optional:configserver:http://localhost:8888

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/chats
spring.data.mongodb.auto-index-creation=true

# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

rabbitmq.exchange.new-messages=new-messages-exchange
rabbitmq.queue.new-messages=new-messages-queue
rabbitmq.routing-key.new=new

rabbitmq.exchange.saved-messages=saved-messages-exchange
rabbitmq.queue.saved-messages-websocket=saved-messages-websocket-queue
rabbitmq.routing-key.saved=saved
rabbitmq.routing-key.subscribe-all=#

# Eureka
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
```

**Chat-Room Service** (`chat-room-service/src/main/resources/application.properties`):
```properties
spring.application.name=chat-room-service
spring.config.import=optional:configserver:http://localhost:8888

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/chats
spring.data.mongodb.auto-index-creation=true

# Eureka
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
```

**WebSocket Service** (`websocket-service/src/main/resources/application.properties`):
```properties
spring.application.name=websocket-service
spring.config.import=optional:configserver:http://localhost:8888

# RabbitMQ
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

rabbitmq.exchange.new-messages=new-messages-exchange
rabbitmq.queue.new-messages=new-messages-queue
rabbitmq.routing-key.new=new

rabbitmq.exchange.saved-messages=saved-messages-exchange
rabbitmq.queue.saved-messages-websocket=saved-messages-websocket-queue
rabbitmq.routing-key.saved=saved
rabbitmq.routing-key.subscribe-all=#

# Eureka
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
```

---

## Running the Services

### Start Services in Order

#### 1. Eureka Server
```bash
cd eureka-server
mvn clean install
mvn spring-boot:run
# Runs on port 8761
```

#### 2. Config Server
```bash
cd config-server
mvn clean install
mvn spring-boot:run
# Runs on port 8888
```

#### 3. Auth Service
```bash
cd auth-service
mvn clean install
mvn spring-boot:run
# Runs on port 8081
```

#### 4. Chat-Room Service
```bash
cd chat-room-service
mvn clean install
mvn spring-boot:run
# Runs on port 8082
```

#### 5. Message Service
```bash
cd message-service
mvn clean install
mvn spring-boot:run
# Runs on port 8083
```

#### 6. WebSocket Service
```bash
cd websocket-service
mvn clean install
mvn spring-boot:run
# Runs on port 8084
```

#### 7. API Gateway
```bash
cd api-gateway
mvn clean install
mvn spring-boot:run
# Runs on port 8080
```

#### 8. Frontend
```bash
cd Frontend/BLEEP
npm install
npm run dev
# Runs on http://localhost:5173
```

### Verify Services

- **Eureka Dashboard:** http://localhost:8761
- **API Gateway:** http://localhost:8080
- **Frontend:** http://localhost:5173
- **RabbitMQ Management:** http://localhost:15672

---

## Database Schema

### PostgreSQL (Auth Service)

**auth Table:**
```sql
CREATE TABLE auth (
  id VARCHAR(36) PRIMARY KEY,
  email_id VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE INDEX idx_auth_email ON auth(email_id);
CREATE INDEX idx_auth_username ON auth(user_name);
```

### MongoDB (Message & Chat-Room Services)

**ChatRooms Collection:**
```javascript
db.createCollection("ChatRooms", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["chatRoomName", "participants", "createdBy"],
      properties: {
        _id: { bsonType: "objectId" },
        chatRoomId: { bsonType: "string" },
        chatRoomName: { bsonType: "string" },
        chatRoomProfileURL: { bsonType: "string" },
        chatRoomType: { bsonType: "string", enum: ["ONE_TO_ONE", "GROUP"] },
        isGroupChatting: { bsonType: "bool" },
        participants: { bsonType: "array", items: { bsonType: "string" } },
        createdBy: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastMessage: { bsonType: "object" }
      }
    }
  }
});

// Create indexes
db.ChatRooms.createIndex({ "createdBy": 1 });
db.ChatRooms.createIndex({ "participants": 1 });
```

**Message Collection:**
```javascript
db.createCollection("Message", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["chatRoomId", "sendersId", "content"],
      properties: {
        _id: { bsonType: "objectId" },
        messageId: { bsonType: "string" },
        tempId: { bsonType: "string" },
        chatRoomId: { bsonType: "string" },
        sendersId: { bsonType: "string" },
        contentType: { bsonType: "string" },
        content: { bsonType: "string" },
        readBy: { bsonType: "array", items: { bsonType: "string" } },
        participants: { bsonType: "array", items: { bsonType: "string" } },
        isTemporary: { bsonType: "bool" },
        timeStamp: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Create indexes
db.Message.createIndex({ "chatRoomId": 1 });
db.Message.createIndex({ "sendersId": 1 });
db.Message.createIndex({ "timeStamp": -1 });
```

---

## Deployment

### Docker Deployment

**1. Create Docker Compose File** (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  # Infrastructure
  eureka-server:
    image: openjdk:21-slim
    container_name: eureka-server
    ports:
      - "8761:8761"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
    volumes:
      - ./eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar:/app/eureka.jar
    command: java -jar /app/eureka.jar

  config-server:
    image: openjdk:21-slim
    container_name: config-server
    ports:
      - "8888:8888"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
    volumes:
      - ./config-server/target/config-server-0.0.1-SNAPSHOT.jar:/app/config.jar
    command: java -jar /app/config.jar
    depends_on:
      - eureka-server

  # Databases
  postgres:
    image: postgres:16
    container_name: postgres-auth
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: chats
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:7.0
    container_name: mongodb-chats
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: chats
    volumes:
      - mongo_data:/data/db

  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

  # Microservices
  auth-service:
    image: openjdk:21-slim
    container_name: auth-service
    ports:
      - "8081:8081"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka
      - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
    volumes:
      - ./auth-service/target/auth-service-0.0.1-SNAPSHOT.jar:/app/auth.jar
    command: java -jar /app/auth.jar
    depends_on:
      - eureka-server
      - config-server
      - postgres

  chat-room-service:
    image: openjdk:21-slim
    container_name: chat-room-service
    ports:
      - "8082:8082"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka
      - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
    volumes:
      - ./chat-room-service/target/chat-room-service-0.0.1-SNAPSHOT.jar:/app/chat-room.jar
    command: java -jar /app/chat-room.jar
    depends_on:
      - eureka-server
      - mongodb

  message-service:
    image: openjdk:21-slim
    container_name: message-service
    ports:
      - "8083:8083"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka
      - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
    volumes:
      - ./message-service/target/message-service-0.0.1-SNAPSHOT.jar:/app/message.jar
    command: java -jar /app/message.jar
    depends_on:
      - eureka-server
      - mongodb
      - rabbitmq

  websocket-service:
    image: openjdk:21-slim
    container_name: websocket-service
    ports:
      - "8084:8084"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka
      - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
    volumes:
      - ./websocket-service/target/websocket-service-0.0.1-SNAPSHOT.jar:/app/websocket.jar
    command: java -jar /app/websocket.jar
    depends_on:
      - eureka-server
      - rabbitmq

  api-gateway:
    image: openjdk:21-slim
    container_name: api-gateway
    ports:
      - "8080:8080"
    environment:
      - JAVA_OPTS=-Xmx256m -Xms128m
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka
      - SPRING_CONFIG_IMPORT=optional:configserver:http://config-server:8888
    volumes:
      - ./api-gateway/target/api-gateway-0.0.1-SNAPSHOT.jar:/app/gateway.jar
    command: java -jar /app/gateway.jar
    depends_on:
      - eureka-server
      - auth-service
      - chat-room-service
      - message-service
      - websocket-service

volumes:
  postgres_data:
  mongo_data:
  rabbitmq_data:
```

**2. Build and Deploy:**

```bash
# Build all services
mvn clean install -DskipTests

# Build Docker images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Security Considerations

1. **JWT Token Management**
    - Store tokens securely on the client side
    - Use HTTPS in production
    - Implement token expiration

2. **Password Security**
    - Passwords are BCrypt encrypted
    - Use strong password policies

3. **CORS Configuration**
    - Configure CORS in API Gateway for frontend domain

4. **Database Security**
    - Use environment variables for credentials
    - Implement role-based access control

5. **Message Queue Security**
    - Use authentication for RabbitMQ
    - Encrypt sensitive data in messages

---

## Performance Optimization

1. **Caching**
    - Implement Redis for caching user sessions
    - Cache frequently accessed chat rooms

2. **Database Indexing**
    - Index on `chatRoomId`, `sendersId`, `timeStamp` in MongoDB
    - Index on `email_id`, `user_name` in PostgreSQL

3. **Connection Pooling**
    - Configure connection pools for databases

4. **Horizontal Scaling**
    - Use load balancer (Nginx/HAProxy)
    - Scale WebSocket service instances
    - Scale Message Service consumers

5. **Monitoring**
    - Implement Prometheus + Grafana
    - Add application metrics
    - Monitor RabbitMQ queue depth

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Services not registering with Eureka | Check Eureka server is running, verify `eureka.client.serviceUrl.defaultZone` |
| WebSocket connection fails | Verify WebSocket service is running, check userId parameter, check firewall |
| Messages not saved | Check MongoDB connection, verify RabbitMQ listeners, check logs |
| JWT validation fails | Verify JWT secret key matches, check token expiration |
| Config not loading | Ensure Config Server is running, verify Git repository path |

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---


## Support

For issues and questions:
- Open an issue on GitHub
- Contact: ashwinichaturvedi8924@gmail.com
- Documentation: See `/docs` folder

---

## Roadmap

- [ ] End-to-end encryption
- [ ] Message search functionality
- [ ] Video/Audio calling
- [ ] File sharing
- [ ] Message reactions/emojis
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message pinning
- [ ] Admin controls
- [ ] Analytics dashboard

---

**Last Updated:** January 2026  
**Project Status:** Active Development

---