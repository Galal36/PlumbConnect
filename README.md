<p align="center">
  <img src="https://raw.githubusercontent.com/mshuber1981/github-readme-development/main/png/logo-react.png" alt="React Logo" width="80"/>
  <img src="https://raw.githubusercontent.com/mshuber1981/github-readme-development/main/png/logo-django.png" alt="Django Logo" width="80"/>
</p>

<h1 align="center">PlumbConnect: Full-Stack Service & Community Platform</h1>

<p align="center">
  A robust, full-stack application connecting clients with professional plumbers in Kuwait, featuring a real-time chat, a community forum, and an AI-powered content moderation system.
</p>

<p align="center">
  <a href="#-key-features"><strong>Key Features</strong></a> ·
  <a href="#-architecture-overview"><strong>Architecture</strong></a> ·
  <a href="#-getting-started"><strong>Getting Started</strong></a> ·
  <a href="#-api-documentation"><strong>API Guide</strong></a> ·
  <a href="#-frontend-overview"><strong>Frontend</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Django-4.2-092E20?style=for-the-badge&logo=django&logoColor=44B78B" alt="Django">
  <img src="https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Channels-4.0-D3432E?style=for-the-badge&logo=django&logoColor=white" alt="Django Channels">
</p>

---

**PlumbConnect** is a modern, full-stack web application designed to serve the Kuwaiti market by connecting clients with professional plumbers. Built with a powerful **Django** backend and a dynamic **React** frontend, the platform provides a seamless experience for finding, communicating with, and hiring plumbing experts. Beyond a simple service marketplace, it fosters a community through a social feed and an AI-moderated knowledge base.

## ✨ Key Features

-   **👥 Role-Based Access Control**: Differentiated experiences for **Clients**, **Plumbers**, and **Admins**, each with a unique dashboard and permissions.
-   **🛠️ Service Marketplace**: Clients can browse verified plumbers, view detailed profiles with reviews and past work, and initiate service requests.
-   **💬 Real-Time Chat**: A WebSocket-powered chat system using Django Channels allows for instant, direct communication between clients and plumbers.
-   **✍️ Community Forum**: A social feed where users can create posts (with images ), comment, and reply, fostering community engagement and knowledge sharing.
-   **🤖 AI-Powered Content Moderation**: Plumbers can publish technical articles. Each article is automatically reviewed by the **Google Gemini API** for technical accuracy, safety, and relevance before an admin approves it for publication.
-   **🔐 Secure Authentication**: Robust JWT-based authentication (via `djangorestframework-simplejwt`) with email verification for new accounts and a secure password reset flow.
-   **📄 Comprehensive Profiles**: Detailed profiles for plumbers, showcasing their experience, reviews, services, and published articles.
-   **🛡️ Reporting System**: Users can report inappropriate content (posts, comments, replies) for admin moderation, ensuring a safe and professional environment.

## 🏗️ Architecture Overview

The application follows a decoupled, client-server architecture.

### Backend (Django)

The backend is a monolithic Django project that exposes a RESTful API.

-   **Core Framework**: Django & Django REST Framework (DRF).
-   **Authentication**: `djangorestframework-simplejwt` for token-based auth.
-   **Real-time**: `django-channels` for WebSocket-based chat and notifications.
-   **Database**: PostgreSQL for robust, relational data storage.
-   **AI Integration**: The `articles` app integrates with the Google Gemini API to automatically review content submitted by plumbers.
-   **Key Apps**:
    -   `users`: Manages user accounts, roles, profiles, and authentication.
    -   `posts`: Handles community posts, comments, replies, and likes.
    -   `articles`: Manages plumber-written articles and the AI review workflow.
    -   `services`: Manages service requests, reviews, and plumber ratings.
    -   `chats` & `chat_messages`: Powers the real-time messaging system.
    -   `reports`: Manages user-submitted reports on content.

### Frontend (React)

The frontend is a modern single-page application (SPA) built with React and TypeScript.

-   **Core Framework**: React 18 & Vite.
-   **Language**: TypeScript for type safety and improved developer experience.
-   **State Management**: React Context API is used extensively (`AuthContext`, `NotificationContext`, `ApiContext`) to manage global state in a clean, modular way.
-   **UI**: `shadcn/ui` and `Tailwind CSS` for a modern, responsive, and accessible component library.
-   **Routing**: `react-router-dom` for client-side routing.
-   **API Communication**: `fetch` API wrapped in dedicated service classes (`realApi.ts`, `servicesApi.ts`) to interact with the Django backend.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   Python (v3.10 or higher)
-   PostgreSQL
-   `pip` and `virtualenv`

### Backend Setup (Django)

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/plumbconnect.git
    cd plumbconnect/backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Create a `.env` file in the `backend` directory and add the following:
    ```env
    SECRET_KEY='your-django-secret-key'
    DEBUG=True
    DATABASE_URL='postgres://user:password@localhost/plumbconnect'
    GEMINI_API_KEY='your-google-gemini-api-key'
    EMAIL_HOST_USER='your-email@example.com'
    EMAIL_HOST_PASSWORD='your-email-password'
    ```

5.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Start the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend will be running at `http://localhost:8000`.

### Frontend Setup (React )

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

## 🔧 API Documentation

The PlumbConnect API is built with Django REST Framework. This guide details the available endpoints, organized by application and HTTP method.

**Base URL**: `/api/`

---

### 👤 `users` App: Authentication & User Management

Handles user registration, login, profiles, and locations.

#### `POST` Requests

-   **Endpoint**: `/token/`
    -   **Description**: Login a user to obtain JWT tokens.
    -   **Permissions**: Public.
    -   **Request Body**:
        ```json
        {
          "email": "client@example.com",
          "password": "clientpass123"
        }
        ```

-   **Endpoint**: `/token/refresh/`
    -   **Description**: Obtain a new access token using a refresh token.
    -   **Permissions**: Public.
    -   **Request Body**:
        ```json
        {
          "refresh": "your_refresh_token_here"
        }
        ```

-   **Endpoint**: `/users/`
    -   **Description**: Register a new user account.
    -   **Permissions**: Public.
    -   **Request Body**:
        ```json
        {
          "name": "New Client",
          "email": "newclient@example.com",
          "phone": "98765432",
          "password": "securepassword123",
          "location_id": 1,
          "role": "client" // or "plumber"
        }
        ```

-   **Endpoint**: `/password-reset/`
    -   **Description**: Request a password reset link.
    -   **Permissions**: Public.
    -   **Request Body**:
        ```json
        {
          "email": "user-who-forgot-password@example.com"
        }
        ```

-   **Endpoint**: `/password-reset/confirm/`
    -   **Description**: Confirm and set a new password using the token from the email.
    -   **Permissions**: Public.
    -   **Request Body**:
        ```json
        {
          "uidb64": "OA",
          "token": "ctz-abc123...",
          "new_password": "my-new-secure-password"
        }
        ```

#### `GET` Requests

-   **Endpoint**: `/users/`
    -   **Description**: List all users in the system.
    -   **Permissions**: Admin Only.

-   **Endpoint**: `/users/{id}/`
    -   **Description**: Retrieve the profile of a specific user by their ID.
    -   **Permissions**: Authenticated.

-   **Endpoint**: `/users/me/`
    -   **Description**: Retrieve the profile of the currently logged-in user.
    -   **Permissions**: Authenticated.

-   **Endpoint**: `/users/plumbers/`
    -   **Description**: Get a public list of all active plumbers.
    -   **Permissions**: Public.

-   **Endpoint**: `/locations/`
    -   **Description**: Get a list of all available cities/locations.
    -   **Permissions**: Public.

-   **Endpoint**: `/activate/{uidb64}/{token}/`
    -   **Description**: Activates a user account via the link sent to their email. This is accessed by the user clicking the link, not typically a manual API call.
    -   **Permissions**: Public.

#### `PATCH` / `PUT` Requests

-   **Endpoint**: `/users/{id}/`
    -   **Description**: Update a user's profile. An admin can update any user; a regular user can only update their own.
    -   **Permissions**: Owner or Admin.
    -   **Request Body**:
        ```json
        {
          "name": "Updated Name",
          "location_id": 2
        }
        ```

#### `DELETE` Requests

-   **Endpoint**: `/users/{id}/`
    -   **Description**: Delete a user account.
    -   **Permissions**: Owner or Admin.

---

### ✍️ `articles` App: AI-Reviewed Knowledge Base

Manages articles written by plumbers, including an AI-powered review and admin approval workflow.

#### `POST` Requests

-   **Endpoint**: `/articles/`
    -   **Description**: Create a new article. This automatically triggers a review by the Gemini AI.
    -   **Permissions**: Plumber Only.
    -   **Request Body** (`multipart/form-data` ):
        -   `title`: "How to Fix a Dripping Faucet"
        -   `description`: "A detailed guide on fixing common faucet drips..."
        -   `image`: (Optional file upload)

#### `GET` Requests

-   **Endpoint**: `/articles/`
    -   **Description**: Lists all approved articles. Admins will see all articles, including pending and rejected ones.
    -   **Permissions**: Public.

-   **Endpoint**: `/articles/{id}/`
    -   **Description**: Retrieve a single article, including AI review data if the requester is an admin.
    -   **Permissions**: Public.

#### `PATCH` / `PUT` Requests

-   **Endpoint**: `/articles/{id}/`
    -   **Description**: Update the title or description of an article.
    -   **Permissions**: Owner or Admin.

-   **Endpoint**: `/articles/{id}/approve/`
    -   **Description**: Approve or reject an article for publication.
    -   **Permissions**: Admin Only.
    -   **Request Body**:
        ```json
        {
          "is_approved": true
        }
        ```

#### `DELETE` Requests

-   **Endpoint**: `/articles/{id}/`
    -   **Description**: Delete an article.
    -   **Permissions**: Owner or Admin.

---

### 💬 `posts` App: Community Forum

Handles community posts, comments, replies, and likes.

#### `POST` Requests

-   **Endpoint**: `/posts/`
    -   **Description**: Create a new community post.
    -   **Permissions**: Authenticated.
    -   **Request Body** (`multipart/form-data`):
        -   `statement`: "What is the best way to fix a running toilet?"
        -   `image`: (Optional file upload)

-   **Endpoint**: `/posts/{id}/like/`
    -   **Description**: Toggles a like on a post. If liked, it becomes unliked, and vice-versa.
    -   **Permissions**: Authenticated.
    -   **Request Body**: None.

-   **Endpoint**: `/comments/`
    -   **Description**: Add a comment to a post.
    -   **Permissions**: Authenticated.
    -   **Request Body**:
        ```json
        {
          "comment": "I think you need to check the flapper valve.",
          "post": 1
        }
        ```

-   **Endpoint**: `/replies/`
    -   **Description**: Add a reply to a comment.
    -   **Permissions**: Authenticated.
    -   **Request Body**:
        ```json
        {
          "reply": "Good point! That's usually the problem.",
          "comment": 1
        }
        ```

#### `GET` Requests

-   **Endpoint**: `/posts/`
    -   **Description**: Retrieve a list of all posts.
    -   **Permissions**: Public.

-   **Endpoint**: `/posts/{id}/`
    -   **Description**: Retrieve a single post with its nested comments and replies.
    -   **Permissions**: Public.

-   **Endpoint**: `/replies/?comment={comment_id}`
    -   **Description**: Retrieve all replies for a specific comment.
    -   **Permissions**: Public.

#### `PATCH` / `PUT` Requests

-   **Endpoint**: `/posts/{id}/`, `/comments/{id}/`, `/replies/{id}/`
    -   **Description**: Update a post, comment, or reply.
    -   **Permissions**: Owner Only.

#### `DELETE` Requests

-   **Endpoint**: `/posts/{id}/`, `/comments/{id}/`, `/replies/{id}/`
    -   **Description**: Delete a post, comment, or reply.
    -   **Permissions**: Owner Only.

---

### 🛠️ `services` App: Service Requests & Reviews

Manages the lifecycle of a service request, from creation to completion and review.

#### `POST` Requests

-   **Endpoint**: `/services/create/`
    -   **Description**: A client creates a service request for a plumber.
    -   **Permissions**: Client Only.
    -   **Request Body**:
        ```json
        {
          "receiver": 1,
          "amount": 150.00
        }
        ```

-   **Endpoint**: `/services/{id}/accept/`
    -   **Description**: A plumber accepts a service request.
    -   **Permissions**: Plumber (Receiver) Only.
    -   **Request Body**: None.

-   **Endpoint**: `/services/{id}/reject/`
    -   **Description**: A plumber rejects a service request.
    -   **Permissions**: Plumber (Receiver) Only.
    -   **Request Body**: None.

-   **Endpoint**: `/services/reviews/create/`
    -   **Description**: A client creates a review for a completed service.
    -   **Permissions**: Client (Sender) Only.
    -   **Request Body**:
        ```json
        {
          "service_request": 1,
          "rating": 5,
          "comment": "Excellent and professional service!"
        }
        ```

#### `GET` Requests

-   **Endpoint**: `/services/list/`
    -   **Description**: List all services associated with the current user (both sent and received).
    -   **Permissions**: Authenticated.

-   **Endpoint**: `/services/{id}/`
    -   **Description**: Retrieve details of a specific service request.
    -   **Permissions**: Participant or Admin.

-   **Endpoint**: `/services/plumber/{id}/reviews/`
    -   **Description**: Get all reviews for a specific plumber.
    -   **Permissions**: Public.

-   **Endpoint**: `/services/plumber/{id}/rating/`
    -   **Description**: Get the average rating and total review count for a plumber.
    -   **Permissions**: Public.

#### `PATCH` / `PUT` Requests

-   **Endpoint**: `/services/{id}/update/`
    -   **Description**: Update a service. Can be used by a plumber to mark a service as 'completed'.
    -   **Permissions**: Participant or Admin.
    -   **Request Body**:
        ```json
        {
          "status": "completed"
        }
        ```

---

### リアルタイム `chats` & `chat_messages` Apps

Handles real-time chat functionality via WebSockets and a REST API for history.

#### WebSocket Endpoint

-   **URL**: `ws://localhost:8001/ws/chat/{chat_id}/`
-   **Description**: Establishes a persistent WebSocket connection for real-time, bidirectional messaging within a specific chat room. Messages are sent and received as JSON objects.

#### REST API Endpoints

##### `POST` Requests
-   **Endpoint**: `/chats/`
    -   **Description**: Create a new chat with a user or retrieve an existing one.
    -   **Permissions**: Authenticated.
    -   **Request Body**:
        ```json
        {
          "receiver_id": 2
        }
        ```

-   **Endpoint**: `/chat-messages/`
    -   **Description**: Send a message to a chat. Can be used as a fallback if WebSocket is unavailable.
    -   **Permissions**: Participant.
    -   **Request Body** (`multipart/form-data` if image/file):
        -   `chat`: 1
        -   `content`: "Here is the photo of the issue."
        -   `message_type`: "image"
        -   `image`: (File upload)

##### `GET` Requests
-   **Endpoint**: `/chats/`
    -   **Description**: List all chats for the authenticated user.
    -   **Permissions**: Authenticated.

-   **Endpoint**: `/chat-messages/?chat={chat_id}`
    -   **Description**: Retrieve the message history for a specific chat.
    -   **Permissions**: Participant.

##### `PATCH` / `PUT` Requests
-   **Endpoint**: `/chats/{id}/archive/`
    -   **Description**: Toggles the `is_archived` status of a chat.
    -   **Permissions**: Participant.

-   **Endpoint**: `/chat-messages/mark_read/`
    -   **Description**: Mark all messages in a chat as read.
    -   **Permissions**: Participant.
    -   **Request Body**:
        ```json
        {
          "chat_id": 1
        }
        ```

##### `DELETE` Requests
-   **Endpoint**: `/chat-messages/{id}/`
    -   **Description**: Soft-deletes a message (marks `is_deleted=true`).
    -   **Permissions**: Sender Only.
