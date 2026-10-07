# Eremia 🔭

**Eremia** is a full-stack web application for exploring and managing structured information about astronomical objects.

The project combines a Python/FastAPI backend, a React/TypeScript frontend, and a PostgreSQL database. It is being developed as both a practical full-stack project and a foundation for a larger astronomy-oriented information system.

## Overview

Eremia currently provides:

* Astronomical object catalog
* Data loaded from a PostgreSQL database through a REST API
* User registration and authentication
* Sign In / Sign Up / Sign Out functionality
* Client-side SPA routing
* Production frontend and backend deployments
* Separation between frontend, backend, and database layers

The application is actively under development, with the current focus on expanding the data model, user functionality, and astronomical object interface.

## Architecture

```text
┌──────────────────────────┐
│        React App         │
│      TypeScript/Vite     │
│                          │
│  Pages / Components      │
│  Routing / Auth / API    │
└────────────┬─────────────┘
             │ HTTPS
             ▼
┌──────────────────────────┐
│       FastAPI API        │
│                          │
│  Authentication          │
│  Astronomical Objects    │
│  Business Logic          │
└────────────┬─────────────┘
             │ PostgreSQL
             ▼
┌──────────────────────────┐
│     PostgreSQL / Neon    │
│                          │
│  Users                   │
│  Astronomical Objects    │
│  Related Data            │
└──────────────────────────┘
```

### Production

```text
User
 │
 ▼
Vercel
Frontend
 │
 │ HTTPS API requests
 ▼
Render
FastAPI Backend
 │
 ▼
Neon
PostgreSQL
```

## Features

### Astronomical Objects

The main part of Eremia is a catalog of astronomical objects.

Objects are stored in PostgreSQL and accessed through the FastAPI REST API. The frontend retrieves the data from the backend and renders it through the React interface.

The architecture is designed so that additional object types and astronomical parameters can be introduced without replacing the existing application structure.

### Authentication

Eremia includes user authentication functionality:

* **Sign Up** — creation of a user account
* **Sign In** — authentication of an existing user
* **Sign Out** — ending the current authenticated session

Authentication is integrated into the frontend rather than being implemented as an isolated demonstration feature.

The authentication system is intended to provide the foundation for future user-specific functionality.

### Client-Side Routing

The frontend is implemented as a Single Page Application.

Current application routes include the astronomical object catalog under:

```text
/objects
```

Navigation between application pages is handled on the client side.

The production deployment is configured to correctly serve SPA routes when a page is opened or reloaded directly.

## Tech Stack

### Frontend

* **React**
* **TypeScript**
* **Vite**
* **Axios**
* **TanStack Query**
* Client-side SPA routing

### Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **Pydantic**
* **asyncpg**
* **Alembic**
* **Uvicorn**

### Database

* **PostgreSQL**
* **Neon**

### Deployment

* **Vercel** — frontend
* **Render** — backend
* **Neon** — PostgreSQL database

## Project Structure

```text
eremia/
│
├── backend/
│   ├── src/
│   │   └── ...
│   ├── alembic/
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── ...
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   ├── stores/
    │   ├── types/
    │   └── ...
    ├── package.json
    └── ...
```

The frontend and backend are maintained as separate applications with a clear API boundary between them.

## API

The backend exposes a REST API used by the frontend.

Astronomical object endpoints provide access to the data stored in PostgreSQL.

Authentication-related endpoints provide user registration and authentication functionality.

FastAPI's interactive API documentation is available during development at:

```text
http://localhost:8000/docs
```

## Database

Eremia uses PostgreSQL as its primary relational database.

SQLAlchemy is used for database interaction, while Alembic is responsible for schema migrations.

The database contains both application data and user-related data, allowing the backend to support authenticated functionality alongside the astronomical object catalog.

## Local Development

### Backend

Install backend dependencies:

```bash
cd backend
uv sync
```

Configure the required environment variables, including the PostgreSQL connection string.

Start the development server:

```bash
uv run uvicorn eremia.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

## Environment Variables

Environment-specific configuration is kept outside the source code.

A typical backend configuration includes a PostgreSQL connection URL:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/database
```

Authentication and other application-specific configuration may require additional environment variables depending on the deployment configuration.

Sensitive credentials must not be committed to the repository.

## Development Status

**Active development**

The current version already contains the core full-stack architecture:

* React frontend
* FastAPI backend
* PostgreSQL database
* Production API communication
* Astronomical object catalog
* User authentication
* SPA routing
* Production deployment

The project is still evolving, and its architecture is intentionally being developed to accommodate more complex astronomical data and user functionality.

## Planned Development

Potential directions for future development include:

* Detailed astronomical object pages
* Advanced search and filtering
* Additional astronomical object types
* Expanded physical and observational parameters
* User-specific functionality
* More detailed relationships between astronomical entities
* Integration with external astronomical databases and APIs
* Improved visualization of astronomical data
* More advanced authentication and authorization

## Project Goals

Eremia is intended to become more than a simple CRUD application.

The long-term goal is to build a structured astronomical information system where different types of astronomical entities, their properties, and their relationships can be represented and explored through a web interface.

At the same time, the project serves as a practical full-stack development environment for working with:

* React and TypeScript
* Python and FastAPI
* asynchronous database access
* REST API design
* authentication
* relational data modeling
* cloud deployment
* production web application architecture
