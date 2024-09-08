# pallet

This is a full-stack auction marketplace application built with React (frontend) and Django (backend). The application allows users to participate in auctions, place bids, and manage their accounts.

## Table of Contents

- [pallet](#pallet)
  - [Table of Contents](#table-of-contents)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the Application](#running-the-application)
    - [Stopping the Application](#stopping-the-application)
  - [Environment Variables](#environment-variables)
    - [Backend (.env file)](#backend-env-file)
    - [Frontend (.env file)](#frontend-env-file)
  - [Deployment](#deployment)

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Django, Django REST Framework, PostgreSQL
- **Real-Time Communication**: Socket.io (for future development)
- **Containerization**: Docker, Docker Compose

## Project Structure

myproject/ │ ├── backend/ # Django backend │ ├── myproject/ # Main Django project folder │ ├── myapp/ # Django application folder │ ├── Dockerfile # Docker setup for backend │ ├── requirements.txt # Python dependencies │ └── .env # Environment variables for backend │ ├── frontend/ # React frontend │ ├── public/ # Public files │ ├── src/ # Main source folder for React │ ├── Dockerfile # Docker setup for frontend │ ├── package.json # Frontend dependencies │ └── .env # Environment variables for frontend │ ├── docker-compose.yml # Docker Compose file to manage services └── README.md # Project documentation

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the Repository**:

```bash
git clone https://github.com/dannymansilla/pallet.git
cd pallet
```

2. **Create Environment Files**:
Create .env files for both the backend and frontend with the necessary environment variables.


### Running the Application

1. **Build and Start the Application**:
Run the following command from the root directory of the project:

```
docker-compose up --build
```

This command will build the Docker images and start the backend, frontend, and database services.

2. **Access the Application**:
* Frontend (React): http://localhost:3000
* Backend (Django): http://localhost:8000
  
### Stopping the Application

To stop all running containers, use:

```
docker-compose down
```

## Environment Variables

### Backend (.env file)
Create a .env file inside the backend folder with the following variables:

```
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=postgres://your_user:your_password@db:5432/your_database
```

### Frontend (.env file)
Create a .env file inside the frontend folder with the following variables:

```
REACT_APP_API_URL=http://localhost:8000
```

## Deployment

