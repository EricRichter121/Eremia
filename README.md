# Eremia 🔭

**Eremia is a full-stack web application for exploring astronomical objects and their properties.**

The project combines a structured astronomical catalog with a modern web interface, user authentication, and personal collections. Its architecture is designed to support the gradual expansion of astronomical data models and the integration of additional object types and scientific datasets.

## Features

### Astronomical Catalog
- Browse astronomical objects stored in a PostgreSQL database.
- Search the catalog by object name, catalog identifier, object type, and description.
- Open dedicated detail pages for individual objects.
- Retrieve object data through a REST API.

### User Accounts
- User registration and authentication.
- Session-aware access to user-specific features.
- Authenticated API requests.

### Favorites
- Add astronomical objects to a personal favorites collection.
- Remove objects from favorites.
- View saved objects on a dedicated page.
- Persist favorites in the database, associated with individual users.

### User Interface
- React single-page application with client-side routing.
- Light and dark themes.
- Persistent theme preferences.
- Responsive, component-based interface.

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Routing | React Router |
| Data fetching and caching | TanStack Query |
| HTTP client | Axios |
| Backend | Python, FastAPI |
| Data validation | Pydantic |
| ORM | SQLAlchemy with asyncio support |
| Database | PostgreSQL |
| Database migrations | Alembic |
| Database driver | asyncpg |
| Authentication | FastAPI Users |
| Frontend deployment | Vercel |
| Backend deployment | Render |
| Database hosting | Neon |

## Architecture

Eremia separates the frontend, backend, and database into distinct layers.

```text
┌─────────────────────────────────┐
│          React Frontend         │
│                                 │
│  Pages and Components           │
│  React Router                   │
│  TanStack Query                 │
│  Axios API Client               │
│  Theme Management               │
└────────────────┬────────────────┘
                 │
                 │ HTTP / JSON
                 ▼
┌─────────────────────────────────┐
│           FastAPI API           │
│                                 │
│  REST Endpoints                 │
│  Authentication                 │
│  Astronomical Object Operations │
│  Favorites                      │
│  Request Validation             │
└────────────────┬────────────────┘
                 │
                 │ SQLAlchemy
                 ▼
┌─────────────────────────────────┐
│            PostgreSQL           │
│                                 │
│  Users                          │
│  Astronomical Objects           │
│  Favorites                      │
│  Related Reference Data         │
└─────────────────────────────────┘
```

The frontend communicates with the backend through an HTTP API. SQLAlchemy handles database access, while Alembic manages database schema migrations.

## Project Structure

```text
Eremia/
├── src/
│   ├── backend/
│   │   ├── alembic/
│   │   └── ...
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   └── auth/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── themes/
│       │   └── types/
│       ├── package.json
│       └── vite.config.ts
│
├── pyproject.toml
└── README.md
```

The backend and frontend have separate responsibilities and dependency management. The Python project configuration is maintained in the repository root, while the frontend application resides in `src/frontend/`.

## Application Routes

| Route | Description |
| --- | --- |
| `/objects` | Browse and search the astronomical catalog |
| `/objects/:objectId` | View an individual astronomical object |
| `/favorites` | View and manage saved objects |
| `/` | Redirect to `/objects` |

Favorites are associated with the authenticated user. Users must sign in to access their personal collection.

## API

The FastAPI backend exposes REST endpoints for astronomical objects, authentication, and favorites.

The API is responsible for validating requests, enforcing access control, and interacting with the database.

During local development, the Vite development server proxies requests under `/api` to the backend at `http://localhost:8000`.

FastAPI provides interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## Getting Started

### Prerequisites

Install the following tools before starting development:

- Python 3.14 or a compatible version satisfying `pyproject.toml`
- [uv](https://docs.astral.sh/uv/)
- Node.js and npm
- PostgreSQL, either locally or through a hosted provider such as Neon

### 1. Clone the Repository

```bash
git clone https://github.com/EricRichter121/Eremia.git
cd Eremia
```

### 2. Set Up the Backend

Install the Python dependencies from the repository root:

```bash
uv sync
```

Configure the environment variables required by the backend, including the PostgreSQL connection URL.

Start the FastAPI application using the ASGI entry point configured in the project:

```bash
uv run uvicorn backend.main:app --reload
```

The exact ASGI import path must match the backend entry-point module in the checked-out version.

The API should be available at `http://localhost:8000`.

### 3. Set Up the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd src/frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

### 4. Configure the Database

Eremia uses PostgreSQL for application data. Configure the database connection before starting the backend.

A typical asynchronous SQLAlchemy connection URL has the following format:

```dotenv
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
```

Use the actual environment variable names expected by the backend configuration. Keep database credentials and other secrets out of version control.

### 5. Apply Database Migrations

Run Alembic migrations using the repository's configured migration environment:

```bash
uv run alembic upgrade head
```

Ensure that the database connection is configured correctly before applying migrations.

## Database Design

The database stores astronomical objects and user-related information.

The data model is designed to support relationships between users, astronomical objects, and saved favorites. Database migrations allow schema changes to be introduced incrementally as the project evolves.

Future iterations can extend astronomical object records with additional physical, orbital, observational, and classification parameters.

## Deployment

The production architecture uses separate services for the frontend, backend, and database:

- **Vercel** — frontend hosting.
- **Render** — FastAPI backend hosting.
- **Neon** — managed PostgreSQL database.

Production deployments require the appropriate database connection settings, frontend API configuration, and authentication settings. Environment-specific secrets should be configured through the hosting providers rather than committed to the repository.

## Development Status

Eremia is under active development.

The current application includes the core full-stack architecture, an astronomical object catalog, object detail pages, authentication, a favorites collection, and theme management.

The data model and interface are being expanded to accommodate more detailed astronomical information.

## Roadmap

Planned areas of development include:

- Expanding astronomical object models and physical parameters.
- Supporting additional categories of astronomical objects.
- Improving search and filtering capabilities.
- Integrating external astronomical datasets and scientific APIs.
- Adding richer object relationships and cross-references.
- Improving the presentation of scientific and observational data.
- Expanding automated testing and validation.

## Project Goals

Eremia aims to evolve into a structured astronomical information system for discovering and exploring celestial objects, their properties, and their relationships.

The project also serves as a practical full-stack development project focused on API design, relational data modeling, asynchronous database access, authentication, frontend state management, and production deployment.