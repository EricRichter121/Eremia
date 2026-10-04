# Eremia 🔭

Eremia is a web application for storing, exploring, and managing information about astronomical objects.

The project is being developed as a full-stack application with a Python backend and a React frontend. The current MVP focuses on a structured database of astronomical objects such as stars, planets, nebulae, and other celestial bodies.

## Features

* Browse astronomical objects stored in the database
* View basic information about individual objects
* REST API for working with astronomical objects
* PostgreSQL database
* Responsive web interface
* Separate frontend and backend applications
* Production deployment

## Tech Stack

### Backend

* **Python** — primary backend language
* **FastAPI** — web framework for building the REST API
* **SQLAlchemy** — ORM and database interaction
* **Alembic** — database migrations
* **Pydantic** — data validation and serialization
* **asyncpg** — asynchronous PostgreSQL driver
* **PostgreSQL** — relational database
* **Neon** — hosted PostgreSQL database
* **Uvicorn** — ASGI server

### Frontend

* **React** — frontend library
* **TypeScript** — static typing
* **Vite** — development environment and build tool
* **Axios** — HTTP client
* **TanStack Query** — server-state management

### Deployment

* **Render** — backend deployment
* **Vercel** — frontend deployment
* **Neon** — production database

## Project Structure

```text
eremia/
├── backend/
│   ├── src/
│   │   └── eremia/
│   │       ├── ...
│   │       └── main.py
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
    │   ├── types/
    │   └── ...
    ├── package.json
    └── ...
```

The backend and frontend are maintained as separate applications and communicate through the REST API.

## API

The backend provides REST endpoints for astronomical objects.

Example:

```http
GET /api/astronomical-objects
```

The endpoint returns astronomical objects stored in the PostgreSQL database.

The API is designed to be extended as the project's data model grows.

## Database

Eremia uses PostgreSQL as its primary relational database.

The database is designed around separate entities rather than storing all astronomical object information in a single model. This allows the application to support additional object types and properties as the project evolves.

Database schema changes are managed using Alembic migrations.

## Running Locally

### Backend

Create a virtual environment and install dependencies using `uv`.

```bash
cd backend

uv sync
```

Configure the required environment variables, including the PostgreSQL connection URL.

Start the development server:

```bash
uv run uvicorn eremia.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI also provides interactive API documentation at:

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

The frontend will be available at the local address provided by Vite.

## Environment Variables

The backend requires environment-specific configuration, including the PostgreSQL database connection.

Example:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/database
JWT_SECRET=<generate-a-random-secret>
```

Generate `JWT_SECRET` with `python -c "import secrets; print(secrets.token_urlsafe(32))"`.
Sensitive credentials should not be committed to the repository.

## Development

The project is currently focused on the MVP and its core functionality.

Possible future development includes:

* More astronomical object types
* Additional physical and observational parameters
* Search and filtering
* Individual object pages
* Improved navigation
* More detailed astronomical data
* Integration with external astronomical databases and APIs
* Authentication and user-specific functionality

## Status

**MVP — in development**

The current version has a working React frontend, FastAPI backend, PostgreSQL database, and production deployment.

Eremia is primarily a learning and portfolio project focused on full-stack development with Python and React while building a domain-specific application around astronomy.

## License

This project is currently not licensed for redistribution.
