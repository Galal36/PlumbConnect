<p align="center">
  <a href="https://react.dev" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  </a>
  <a href="https://www.djangoproject.com/" target="_blank" rel="noreferrer">
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=44B78B" alt="Django"/>
  </a>
</p>

<h1 align="center">Plumby: Full-Stack Service & Community Platform</h1>

<p align="center">
  A robust, full-stack application connecting clients with professional plumbers in Kuwait, featuring real-time chat, a community forum, an AI-powered content moderation system, and integrated payments with Stripe.
</p>
<h4>First Check the ERD</h4>
   <img src="ERD.png" alt="Django Logo" width="1200"/>

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
  <img src="https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe">
  <img src="https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Channels-4.0-D3432E?style=for-the-badge&logo=django&logoColor=white" alt="Django Channels">
</p>

---

**Plumby** is a modern, full-stack web application designed to serve the Kuwaiti market by connecting clients with professional plumbers. Built with a powerful **Django** backend and a dynamic **React** frontend, the platform provides a seamless experience for finding, communicating with, and hiring plumbing experts. Beyond a simple service marketplace, it fosters a community through a social feed and an AI-moderated knowledge base.

## ✨ Key Features

-   **👥 Role-Based Access Control**: Differentiated experiences for **Clients**, **Plumbers**, and **Admins**.
-   **🛠️ Service Marketplace & Payment Flow**: Clients can find plumbers, request services, and pay an initial visit fee securely via **Stripe**. The final service cost is settled directly with the plumber.
-   **💬 Real-Time Chat**: A WebSocket-powered chat system using Django Channels allows for instant, direct communication.
-   **✍️ Community Forum**: A social feed where users can create posts, comment, and reply.
-   **🤖 AI-Powered Content Moderation**: Plumbers can publish articles which are automatically reviewed by the **Google Gemini API** for quality and safety before admin approval.
-   **🔐 Secure Authentication**: Robust JWT-based authentication with email verification and a secure password reset flow.
-   **📄 Comprehensive Profiles**: Detailed profiles for plumbers, showcasing their experience, reviews, and past work.
-   **🛡️ Reporting System**: Users can report inappropriate content for admin moderation.

## 🏗️ Architecture Overview

The application follows a decoupled, client-server architecture.

### Backend (Django )

-   **Core Framework**: Django & Django REST Framework (DRF).
-   **Authentication**: `djangorestframework-simplejwt`.
-   **Real-time**: `django-channels` for WebSockets.
-   **Database**: PostgreSQL.
-   <!-- NEW -->
    **Payments**: Integrates with the **Stripe API** to handle the initial visit fee payment processing.
    <!-- /NEW -->
-   **AI Integration**: The `articles` app integrates with the Google Gemini API.
-   **Key Apps**: `users`, `posts`, `articles`, `services`, `chats`, `reports`, and a new `payments` app to handle Stripe webhooks and logic.

### Frontend (React)

-   **Core Framework**: React 18 & Vite.
-   **Language**: TypeScript.
-   **State Management**: React Context API (`AuthContext`, `NotificationContext`).
-   <!-- NEW -->
    **Payments UI**: Uses **Stripe.js** and **React Stripe.js** for a secure, PCI-compliant payment form (`Elements`, `CardElement`).
    <!-- /NEW -->
-   **UI**: `shadcn/ui` and `Tailwind CSS`.
-   **Routing**: `react-router-dom`.
-   **API Communication**: `fetch` API wrapped in dedicated service classes.

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+), Python (v3.10+), PostgreSQL, `pip`, `virtualenv`.

### Backend Setup (Django)

1.  **Clone & Navigate**: `git clone ...` & `cd plumbconnect/backend`
2.  **Virtual Environment**: `python -m venv venv` & `source venv/bin/activate`
3.  **Install Dependencies**: `pip install -r requirements.txt`
4.  **Configure Environment Variables**: Create a `.env` file and add the following, including your Stripe keys:
    ```env
    SECRET_KEY='your-django-secret-key'
    DEBUG=True
    DATABASE_URL='postgres://user:password@localhost/plumbconnect'
    GEMINI_API_KEY='your-google-gemini-api-key'
    EMAIL_HOST_USER='your-email@example.com'
    EMAIL_HOST_PASSWORD='your-email-password'
    
    # <!-- NEW -->
    STRIPE_SECRET_KEY='sk_test_...'
    STRIPE_WEBHOOK_SECRET='whsec_...'
    VISIT_FEE_AMOUNT=500 # Amount in the smallest currency unit (e.g., 500 = 5.00 KWD)
    # <!-- /NEW -->
    ```
5.  **Database Migrations**: `python manage.py migrate`
6.  **Run Server**: `python manage.py runserver`

### Frontend Setup (React)

1.  **Navigate**: `cd ../frontend`
2.  **Install Dependencies**: `npm install`
3.  <!-- NEW -->
    **Configure Environment Variables**: Create a `.env.local` file and add your Stripe publishable key:
    ```env
    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
    ```
    <!-- /NEW -->
4.  **Run Server**: `npm run dev`

## 🔧 API Documentation

This guide details the available endpoints, organized by application and HTTP method.

**Base URL**: `/api/`

---

### 👤 `users` App: Authentication & User Management
*(No changes in this section. Endpoints for login, registration, profiles, etc., remain the same.)*

---

### ✍️ `articles` App: AI-Reviewed Knowledge Base
*(No changes in this section. Endpoints for creating, reviewing, and approving articles remain the same.)*

---

### 💬 `posts` App: Community Forum
*(No changes in this section. Endpoints for posts, comments, and likes remain the same.)*

---

### 🛠️ `services` App: Service Requests & Reviews

<!-- UPDATED -->
Manages the lifecycle of a service request, now including the initial payment step.

#### `POST` Requests

-   **Endpoint**: `/services/create/`
    -   **Description**: A client initiates a service request. The response will now include a `client_secret` from Stripe to process the visit fee payment on the frontend.
    -   **Permissions**: Client Only.
    -   **Request Body**:
        ```json
        {
          "receiver": 1 // The plumber's user ID
        }
        ```
    -   **Success Response (201 Created)**:
        ```json
        {
          "service_id": 123,
          "status": "pending_payment",
          "visit_fee": 500, // Amount in smallest currency unit
          "client_secret": "pi_3Lq..._secret_...aBc" // Stripe PaymentIntent client secret
        }
        ```

-   **Endpoint**: `/services/{id}/accept/`
    -   **Description**: A plumber accepts a service request **after** the client has successfully paid the visit fee.
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
    -   **Description**: List all services associated with the current user.
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
<!-- /UPDATED -->

---

### <!-- NEW --> 💳 `payments` App: Stripe Integration

Handles payment processing and webhooks.

#### `POST` Requests

-   **Endpoint**: `/stripe-webhook/`
    -   **Description**: **[For Stripe Use Only]** Listens for events from Stripe, such as `payment_intent.succeeded`. When a successful payment for a visit fee is detected, this endpoint updates the corresponding service request's status from `pending_payment` to `pending_acceptance`.
    -   **Permissions**: Public (Secured by Stripe webhook signature).
    -   **Request Body**: Sent by Stripe.
<!-- /NEW -->

---

### `chats` & `chat_messages` Apps
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

