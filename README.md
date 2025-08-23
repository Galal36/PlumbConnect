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

The PlumbConnect API is built with Django REST Framework and provides a comprehensive set of endpoints for managing users, services, posts, and more.

**Base URL**: `/api/`

### Authentication Endpoints

| Method | Endpoint                  | Description                                                               |
| :----- | :------------------------ | :------------------------------------------------------------------------ |
| `POST` | `/token/`                 | Login and obtain access/refresh tokens.                                   |
| `POST` | `/token/refresh/`         | Refresh an expired access token.                                          |
| `POST` | `/users/`                 | Register a new user (Client or Plumber ).                                  |
| `GET`  | `/activate/{uid}/{token}/` | Activate a user account via the link sent to their email.                 |
| `POST` | `/password-reset/`        | Request a password reset link to be sent via email.                       |
| `POST` | `/password-reset/confirm/`| Confirm the password reset using the UID and token from the email link.     |

### User & Profile Endpoints

| Method      | Endpoint           | Description                                                              |
| :---------- | :----------------- | :----------------------------------------------------------------------- |
| `GET`       | `/users/`          | **[Admin]** List all users.                                              |
| `GET`       | `/users/{id}/`     | Get public profile information for a specific user.                      |
| `GET`       | `/users/me/`       | Get the complete profile of the currently authenticated user.            |
| `PATCH`     | `/users/me/`       | Update the profile of the currently authenticated user (including password). |
| `GET`       | `/users/plumbers/` | Get a public list of all active plumbers.                                |
| `GET`       | `/locations/`      | Get a list of available cities/locations.                                |

### Articles & Community Endpoints

| Method      | Endpoint                    | Description                                                                 |
| :---------- | :-------------------------- | :-------------------------------------------------------------------------- |
| `POST`      | `/articles/`                | **[Plumber]** Create a new article. Triggers AI review.                     |
| `GET`       | `/articles/`                | List all approved articles. Admins see all articles.                        |
| `GET`       | `/articles/{id}/`           | Retrieve a single article.                                                  |
| `PATCH`     | `/articles/{id}/`           | **[Owner/Admin]** Update an article's content.                              |
| `DELETE`    | `/articles/{id}/`           | **[Owner/Admin]** Delete an article.                                        |
| `PATCH`     | `/articles/{id}/approve/`   | **[Admin]** Approve or reject an article for publication.                   |
| `POST`      | `/posts/`                   | Create a new community post.                                                |
| `GET`       | `/posts/`                   | List all community posts.                                                   |
| `POST`      | `/posts/{id}/like/`         | Like or unlike a post.                                                      |
| `POST`      | `/comments/`                | Create a comment on a post. Requires `post` ID in the body.                 |
| `POST`      | `/replies/`                 | Create a reply to a comment. Requires `comment` ID in the body.             |

### Services & Reviews Endpoints

| Method      | Endpoint                        | Description                                                                 |
| :---------- | :------------------------------ | :-------------------------------------------------------------------------- |
| `POST`      | `/services/create/`             | **[Client]** Create a new service request for a plumber.                    |
| `GET`       | `/services/list/`               | List all services associated with the current user (sent or received).      |
| `PATCH`     | `/services/{id}/update/`        | **[Plumber]** Update service status (e.g., to 'completed').                 |
| `POST`      | `/services/{id}/accept/`        | **[Plumber]** Accept a service request and set the price.                   |
| `POST`      | `/services/{id}/reject/`        | **[Plumber]** Reject a service request.                                     |
| `POST`      | `/services/reviews/create/`     | **[Client]** Create a review for a completed service.                       |
| `GET`       | `/services/plumber/{id}/reviews/`| Get all reviews for a specific plumber.                                     |
| `GET`       | `/services/plumber/{id}/rating/`| Get the average rating and total review count for a plumber.                |

### Real-Time Chat Endpoints (WebSocket)

-   **Connection URL**: `ws://localhost:8001/ws/chat/{chat_id}/`
-   **Functionality**: Establishes a persistent WebSocket connection for real-time, bidirectional messaging within a specific chat room.

## Frontend Overview

The frontend is architected for scalability and maintainability, with a clear separation of concerns.

-   **`components/`**: Contains reusable UI components (`Button`, `Card`, `Dialog`, etc.), many of which are built upon `shadcn/ui`.
-   **`contexts/`**: Holds React Context providers for managing global state:
    -   `AuthContext.tsx`: Manages user authentication state, user data, and roles.
    -   `NotificationContext.tsx`: Handles a mock real-time notification system.
    -   `ApiContext.tsx`: A foundational context for managing API state (can be expanded).
-   **`hooks/`**: Custom hooks for abstracting complex logic:
    -   `useAuth.ts`: Core logic for authentication state.
    -   `useApi.ts`: Generic hooks for fetching data from the API (`useApiCall`, `usePost`, etc.).
    -   `useWebSocket.ts`: Manages the WebSocket connection for the chat.
-   **`services/`**: Contains API service classes that abstract `fetch` calls to the backend. This is where all direct communication with the Django API is defined.
    -   `realApi.ts`: Handles core API requests, including authentication and token refresh logic.
    -   `postsApi.ts`, `servicesApi.ts`, etc.: Modular services for different parts of the application.
-   **`pages/` (`pa/`)**: Top-level components that correspond to different routes in the application (e.g., `Home`, `Login`, `Profile`).
-   **`utils/`**: Utility functions for formatting, validation, and other common tasks.

---
