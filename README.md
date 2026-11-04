# Eremia 🔭

Eremia is a full-stack web application for exploring astronomical objects and their physical properties.

The project combines a structured astronomical catalog with a modern web interface, user authentication, and personal collections. It is designed to evolve into a scientific archive supporting multiple object types, detailed physical parameters, and external astronomical data sources.

## Features

### Astronomical Catalog

- Browse astronomical objects stored in a PostgreSQL database.
- Search objects by name, catalog identifier, object type, and description.
- Filter objects by astronomical object type.
- Perform server-side search and filtering through the REST API.
- Navigate through catalog results using pagination.
- Open dedicated detail pages for individual astronomical objects.

### Astronomical Object Data

- Store structured information about astronomical objects.
- Associate objects with their respective astronomical classifications.
- Support optional planetary parameters, including physical measurements with explicit units.
- Validate scientific measurements at the API and database levels.
- Extend object records with additional scientific data as the project evolves.

### User Accounts

- User registration and authentication.
- Authenticated API requests.
- Session-aware access to user-specific features.
- User-specific data management.

### Favorites

- Add astronomical objects to a personal favorites collection.
- Remove objects from favorites.
- View saved objects on a dedicated page.
- Persist favorites in the database, associated with individual users.

### User Interface

- React single-page application with client-side routing.
- Light and dark themes.
- Persistent theme preferences.
- Configurable visual styling, including corner radius.
- Responsive, component-based interface.
- Skeleton loading states for asynchronous data fetching.

## Tech Stack

| Layer | Technologies |
|---|---|
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
│  Theme Management                │
└────────────────┬────────────────┘
                 │
                 │ HTTP / JSON
                 ▼
┌─────────────────────────────────┐
│           FastAPI API           │
│                                 │
│  REST Endpoints                  │
│  Authentication                  │
│  Astronomical Object Operations  │
│  Search and Filtering            │
│  Favorites                       │
│  Request Validation              │
└────────────────┬────────────────┘
                 │
                 │ SQLAlchemy
                 ▼
┌─────────────────────────────────┐
│            PostgreSQL            │
│                                  │
│  Users                           │
│  Astronomical Objects            │
│  Object Types                     │
│  Planetary Parameters             │
│  Favorites                        │
└─────────────────────────────────┘
```

The frontend communicates with the backend through an HTTP API. TanStack Query manages server state and caching, while SQLAlchemy handles database access and Alembic manages schema migrations.

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
|---|---|
| `/objects` | Browse and search the astronomical catalog |
| `/objects/:objectId` | View an individual astronomical object |
| `/favorites` | View and manage saved objects |
| `/` | Redirect to `/objects` |

The astronomical catalog is currently the main application page. A separate informational landing page is planned for a future iteration.

Favorites are associated with the authenticated user. Users must sign in to access their personal collection.

## API

The FastAPI backend exposes REST endpoints for astronomical objects, authentication, and favorites.

The API is responsible for:

- Validating requests and responses.
- Enforcing authentication and authorization.
- Retrieving and filtering astronomical objects.
- Searching object data directly in the database.
- Managing user-specific favorites.
- Interacting with PostgreSQL through SQLAlchemy.

### Astronomical Object Catalog

The catalog endpoint supports retrieving objects with optional search, filtering, and pagination.

Example requests:

```http
GET /astronomical-objects
GET /astronomical-objects?search=Kepler
GET /astronomical-objects?object_type_id=2
GET /astronomical-objects?search=Kepler&object_type_id=2
GET /astronomical-objects?search=Earth&skip=0&limit=20
```

Search supports partial, case-insensitive matching across supported object fields, including names, catalog identifiers, descriptions, and object types.

The API also provides endpoints for retrieving individual objects and managing favorites.

FastAPI provides interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

During local development, the Vite development server proxies requests under `/api` to the backend at `http://localhost:8000`.

## Getting Started

### Prerequisites

Install the following tools before starting development:

- Python version compatible with `pyproject.toml`
- [uv](https://docs.astral.sh/uv/)
- Node.js and npm
- PostgreSQL, either locally or through a hosted provider such as Neon

### 1. Clone the Repository

```bash
git clone https://github.com/EricRichter121/Eremia.git
cd Eremia
```

### 2. Set Up the Backend

Install Python dependencies from the repository root:

```bash
uv sync
```

Configure the environment variables required by the backend, including the PostgreSQL connection URL.

Apply database migrations:

```bash
uv run alembic upgrade head
```

Start the FastAPI application using the configured ASGI entry point:

```bash
uv run uvicorn backend.main:app --reload
```

The API should be available at:

`http://localhost:8000`

### 3. Set Up the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd src/frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

### 4. Configure the Database

Eremia uses PostgreSQL for application data.

A typical asynchronous SQLAlchemy connection URL has the following format:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
```

Use the actual environment variable names expected by the backend configuration.

Keep database credentials and other secrets out of version control.

## Database Design

The database stores astronomical objects and user-related information.

The data model supports relationships between:

- Users and their personal favorites.
- Astronomical objects and their object types.
- Astronomical objects and optional planetary parameters.

Planetary parameters are stored separately from the primary astronomical object record, allowing scientific measurements to be extended without unnecessarily complicating the core object model.

Database migrations allow schema changes to be introduced incrementally as the project evolves.

## Deployment

The production architecture uses separate services for the frontend, backend, and database:

| Service | Provider |
|---|---|
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Database hosting | Neon |

Production deployments require appropriate database connection settings, frontend API configuration, and authentication settings.

Environment-specific secrets should be configured through the hosting providers rather than committed to the repository.

## Development Status

Eremia is under active development.

The current application includes:

- A full-stack architecture with a React frontend and FastAPI backend.
- An astronomical object catalog with server-side search and filtering.
- Pagination for catalog results.
- Individual astronomical object detail pages.
- User registration and authentication.
- A persistent favorites collection.
- Optional planetary parameter records.
- Configurable themes and visual styling.
- Skeleton loading states for asynchronous data fetching.

The data model and interface are being expanded to accommodate more detailed astronomical information.

## Roadmap

Planned areas of development include:

- Expanding astronomical object models and physical parameters.
- Supporting additional categories of astronomical objects.
- Integrating external astronomical datasets and scientific APIs.
- Adding richer object relationships and cross-references.
- Improving the presentation of scientific and observational data.
- Developing a dedicated informational landing page.
- Expanding automated testing and validation.

## Project Goals

Eremia aims to evolve into a structured astronomical information system for discovering and exploring celestial objects, their properties, and their relationships.

The project also serves as a practical full-stack development project focused on API design, relational data modeling, asynchronous database access, authentication, frontend state management, and production deployment.