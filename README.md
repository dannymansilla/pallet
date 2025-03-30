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

- **Frontend**: React, Chakra UI, React Router, Axios
- **Backend**: Django, Django REST Framework, PostgreSQL
- **Caching**: Redis
- **Containerization**: Docker, Docker Compose

## Project Structure

```
pallet/
│
├── backend/                    # Django backend
│   ├── aidenproject/                # Main Django project configuration
│   │   ├── __init__.py
│   │   ├── settings.py        # Django settings
│   │   ├── urls.py           # Main URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   │
│   ├── apps/                  # Django applications
│   │   ├── accounts/         # User authentication and profiles
│   │   │   ├── models.py     # User, Organization models
│   │   │   ├── views.py      # Authentication views
│   │   │   └── serializers.py
│   │   │
│   │   ├── auctions/         # Auction functionality
│   │   │   ├── models.py     # SaleEvent, Listing, Bid models
│   │   │   ├── views.py      # Auction views and metrics
│   │   │   └── serializers.py
│   │   │
│   │   ├── integrations/     # Integrations management
│   │   │   ├── models.py     # ERPIntegrations, IntegrationLog models
│   │   │   ├── views.py      # Integrations views
│   │   │   └── serializers.py
│   │   │
│   │   ├── inventory/        # Inventory management
│   │   │   ├── models.py     # Product, Warehouse models
│   │   │   ├── views.py      # Inventory views
│   │   │   └── serializers.py
│   │   │
│   │   ├── notifications/    # Notifications management
│   │   │   ├── models.py     # Notifications, Activity models
│   │   │   ├── views.py      # Notifications views
│   │   │   └── serializers.py
│   │   │
│   │   └── orders/          # Order processing
│   │       ├── models.py     # Order, OrderLineItem models
│   │       ├── views.py      # Order views
│   │       └── serializers.py
│   │
│   ├── manage.py             # Django's command-line utility
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React frontend
│   ├── public/              # Public files
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── Layout/     # Layout components
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── SideNav.js
│   │   │   │   └── Layout.js
│   │   │   │
│   │   │   ├── Auth/       # Authentication components
│   │   │   │   ├── LoginPage.js
│   │   │   │   └── RegisterPage.js
│   │   │   │
│   │   │   ├── AdminPortal/    # Admin components
│   │   │   │   └── AdminPage.js
│   │   │   │
│   │   │   ├── BuyerPortal/    # Buyer components
│   │   │   │   ├── BuyerDashboard.js
│   │   │   │   └── BidHistory.js
│   │   │   │
│   │   │   └── SellerPortal/   # Seller components
│   │   │       ├── SellerDashboard.js
│   │   │       └── ListingManager.js
│   │   │
│   │   ├── context/        # Context providers
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── services/       # API services
│   │   │   ├── api.js
│   │   │   └── endpoints.js
│   │   │
│   │   ├── App.js
│   │   └── index.js
│   │
│   ├── package.json
│   └── .env
│
├── .gitignore
└── docker-compose.yml       # Docker configuration
```

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

```bash
docker-compose up --build
```

This command will build and start:
- Django backend (http://localhost:8000)
- React frontend (http://localhost:3000)
- PostgreSQL database
- Redis cache

2. **Access the Application**:
* Frontend (React): http://localhost:3000
* Backend (Django): http://localhost:8000
* Admin Interface: http://localhost:8000/admin
  
### Stopping the Application

To stop all running containers:

```bash
docker-compose down
```

## Environment Variables

### Backend (.env file)
Create a .env file inside the backend folder with the following variables:

```
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=palletdev
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=db
DB_PORT=5432
```

### Frontend (.env file)
Create a .env file inside the frontend folder with the following variables:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Deployment

[Deployment instructions to be added]

