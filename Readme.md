# Learning Management System (LMS)

## Overview

The **Learning Management System (LMS)** is a full-stack web application designed to facilitate online learning. The project consists of a **Django DRF backend** and a **React (Vite) frontend**, both containerized using Docker for easy deployment and scalability.

## Tech Stack

- **Backend:** Django, Django REST Framework (DRF), PostgreSQL
- **Frontend:** React (Vite), React Router, DaisyUI, TailwindCSS
- **Containerization:** Docker, Docker Compose
- **Task Queue:** Celery (for background tasks)
- **Storage:** AWS S3 (for media storage)
- **Real-time Features:** WebSockets (for chat and notifications)
- **Authentication:** JWT (JSON Web Tokens)
- **Video Processing:** FFmpeg for HLS conversion

## Project Structure

```
LMS-Project/
├── backend/                 # Django DRF Backend
│   ├── Dockerfile           # Backend Dockerfile
│   ├── Dockerfile.prod      # Production Backend Dockerfile
│   ├── requirements.txt     # Backend dependencies
│   ├── manage.py            # Django management script
│   └── ...                  # Other Django app files
│
├── front_app/
│   ├── eduskill-app/        # React Frontend
│   │   ├── Dockerfile       # Frontend Dockerfile
│   │   ├── Dockerfile.prod  # Production Frontend Dockerfile
│   │   ├── package.json     # Frontend dependencies
│   │   ├── vite.config.js   # Vite configuration
│   │   └── src/             # React source files
│
├── docker-compose.yml        # Development Docker Compose
├── docker-compose.prod.yml   # Production Docker Compose
└── README.md                 # Project Documentation
```

## Setup & Installation

### Prerequisites

- Docker & Docker Compose installed
- PostgreSQL installed (for local development)

### Environment Variables

Create a **.env** file in the `backend/` and `front_app/eduskill-app/` directories with the necessary environment variables.

Example for the backend:

```env
DEBUG=False

# Email Configuration
EMAIL_HOST
EMAIL_PORT
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD

# Razorpay Configuration
RAZORPAY_ID
RAZORPAY_ACCOUNT_ID

# AWS S3 Settings
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=
AWS_S3_CUSTOM_DOMAIN=

# Database NeonDb
DATABASE_URL=
```

Example for the frontend:

```env
VITE_BASE_URL=
```

### Running Locally (Development Mode)

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-repo/lms-project.git
   cd lms-project
   ```
2. **Start services using Docker Compose:**
   ```sh
   docker-compose up --build
   ```
   This starts the **backend, frontend, PostgreSQL, Redis (for Celery), and other necessary services**.
3. **Access the services:**
   - Backend API: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

### Running in Production

1. **Start production services:**
   ```sh
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
2. The production environment uses **Gunicorn for Django** and **NGINX for serving the frontend**.

### Running Without Docker (Manual Setup)

#### Backend (Django DRF)

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies using Pipenv:
   ```sh
   pipenv install
   ```
3. Activate the virtual environment:
   ```sh
   pipenv shell
   ```
4. Apply migrations and run the server:
   ```sh
   python manage.py migrate
   python manage.py runserver
   ```

#### Frontend (React Vite)

1. Navigate to the frontend folder:
   ```sh
   cd front_app/eduskill-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Features

- **User Roles:** Admin, Tutors, and Students
- **Course Management:** Create, update, and enroll in courses
- **HLS Video Streaming:** Optimized video playback using **FFmpeg**
- **Real-time Chat:** WebSocket-based community chat
- **Authentication:** Token-based authentication using **JWT**
- **Email Notifications:** Celery-based email system
- **WebSocket Consumers:** Used for real-time communication such as chat and notifications

## Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Open a Pull Request
