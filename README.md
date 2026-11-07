# Eremia 🔭

**A scientific archive for exploring astronomical objects and their properties.**

Eremia is a full-stack web application designed to organize and explore information about astronomical objects, from planets and stars to other celestial bodies.

The project combines a searchable astronomical catalog, structured scientific data, and an interactive web interface. Its architecture is designed to support the gradual expansion of object models, physical parameters, and observational data.

## Features

### Main Page
- Dedicated landing page introducing the Eremia archive.
- Astronomical imagery and project overview.
- Integrated search entry point.
- Featured astronomical objects retrieved from the catalog.
- Navigation by astronomical object type.

### Astronomical Catalog
- Browse astronomical objects stored in PostgreSQL.
- Server-side search across supported object fields.
- Filter objects by astronomical object type.
- Paginated catalog results.
- Dedicated detail pages for individual objects.

### Scientific Data
- Structured astronomical object records.
- Object classification and catalog identifiers.
- Optional planetary parameters with explicit measurement units.
- Nullable scientific measurements.
- API-level validation and database constraints.
- Separate data models for additional scientific parameters.

### User Accounts and Favorites
- User registration and authentication.
- Authenticated API requests.
- Personal favorites collection.
- Add and remove astronomical objects from favorites.
- Persistent storage of user-specific data.

### Interface and Theming
- React single-page application.
- Multiple visual themes.
- Persistent theme preferences using cookies.
- Configurable border radius.
- Responsive, component-based interface.
- Skeleton loading states for asynchronous data fetching.

## Screenshots

Screenshots of the application can be added here as the visual presentation evolves.

<!-- Add application screenshots here once they are available in the repository. -->

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router 7 |
| Server State | TanStack Query |
| HTTP Client | Axios |
| Backend | Python 3.14+, FastAPI |
| Validation | Pydantic |
| ORM | SQLAlchemy 2 (AsyncIO) |
| Database | PostgreSQL |
| Migrations | Alembic |
| Database Driver | asyncpg |
| Authentication | FastAPI Users |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Neon |

## Architecture

Eremia follows a layered full-stack architecture with separate frontend, backend, and database responsibilities.

```text
┌────────────────────────────────────┐
│           React Frontend           │
│                                    │
│  Pages and Components              │
│  React Router                      │
│  TanStack Query                    │
│  Axios API Client                  │
│  Theme Management                  │
└──────────────────┬─────────────────┘
                   │
                   │ HTTP / JSON
                   ▼
┌────────────────────────────────────┐
│             FastAPI                │
│                                    │
│  REST API                          │
│  Authentication                    │
│  Astronomical Objects              │
│  Object Types                      │
│  Observations                      │
│  Favorites                         │
│  Request Validation                │
└──────────────────┬─────────────────┘
                   │
                   │ SQLAlchemy AsyncIO
                   ▼
┌────────────────────────────────────┐
│            PostgreSQL              │
│                                    │
│  Users                             │
│  Astronomical Objects              │
│  Object Types                      │
│  Planetary Parameters              │
│  Observations                      │
│  Favorites                         │
└────────────────────────────────────┘
```

The frontend communicates with the backend through a REST API. TanStack Query manages server state and caching, while SQLAlchemy handles asynchronous database operations.

Alembic is used to manage database schema migrations.

## Project Structure

```text
Eremia/
├── alembic/
│   ├── versions/
│   └── env.py
│
├── src/
│   ├── backend/
│   │   ├── astronomical_objects/
│   │   ├── favorites/
│   │   ├── object_types/
│   │   ├── observations/
│   │   ├── users/
│   │   ├── database/
│   │   ├── api/
│   │   ├── core/
│   │   └── app.py
│   │
│   └── frontend/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── themes/
│       │   └── types/
│       ├── package.json
│       └── vite.config.ts
│
├── tests/
├── alembic.ini
├── pyproject.toml
└── README.md
```

The backend is organized into domain-oriented modules, while the frontend separates pages, reusable components, API services, hooks, and visual themes.

## Application Routes

| Route | Description |
|---|---|
| `/` | Main landing page |
| `/objects` | Astronomical catalog and search |
| `/objects/:objectId` | Individual astronomical object details |
| `/favorites` | Personal favorites collection |

The landing page provides an entry point to the archive, while the catalog is dedicated to searching, filtering, and browsing astronomical records.

## API

The backend exposes REST endpoints under the `/api` prefix.

The API provides functionality for:

- Retrieving and searching astronomical objects.
- Filtering objects by type.
- Retrieving individual object records.
- Managing object types.
- Managing astronomical observations.
- User registration and authentication.
- Managing personal favorites.

### Astronomical Object Catalog

The catalog endpoint supports server-side search, filtering, and pagination.

**Endpoint:**

`GET /api/astronomical-objects`

**Query parameters:**

| Parameter | Description | Default |
|---|---|---|
| `search` | Search across supported object fields | None |
| `object_type_id` | Filter by astronomical object type | None |
| `skip` | Number of records to skip | `0` |
| `limit` | Maximum number of records to return | `100` |

**Example requests:**

```http
GET /api/astronomical-objects
GET /api/astronomical-objects?search=Kepler
GET /api/astronomical-objects?object_type_id=2
GET /api/astronomical-objects?search=Kepler&object_type_id=2
GET /api/astronomical-objects?search=Earth&skip=0&limit=20
```

Search supports partial, case-insensitive matching across supported object fields, including names, catalog identifiers, descriptions, and object types.

### API Documentation

FastAPI provides interactive API documentation:

- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`
- OpenAPI Schema: `http://localhost:8000/api/openapi.json`

## Getting Started

### Prerequisites

Make sure the following tools are installed:

- Python 3.14 or newer.
- [uv](https://docs.astral.sh/uv/).
- Node.js and npm.
- PostgreSQL or a hosted PostgreSQL database.

### 1. Clone the Repository

```bash
git clone https://github.com/EricRichter121/Eremia.git
cd Eremia
```

### 2. Configure Environment Variables

Create a `.env` file in the repository root.

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
JWT_SECRET=your-secret-key
```

Replace the example values with your actual database credentials and a secure JWT secret.

Do not commit `.env` files or expose application secrets.

### 3. Set Up the Backend

Install dependencies from the repository root:

```bash
uv sync
```

Apply database migrations:

```bash
uv run alembic upgrade head
```

Start the FastAPI application:

```bash
uv run uvicorn backend.app:app --reload
```

The backend will be available at:

`http://localhost:8000`

### 4. Set Up the Frontend

Open a separate terminal:

```bash
cd src/frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite proxies requests under `/api` to the local backend at `http://localhost:8000`.

The frontend development URL will be displayed in the terminal.

### 5. Build the Frontend

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm run preview
```

## Database Design

The database stores astronomical objects and related application data.

The current data model includes:

- **Users** — registered application users.
- **Astronomical Objects** — core astronomical records.
- **Object Types** — classifications assigned to astronomical objects.
- **Planetary Parameters** — optional physical measurements associated with astronomical objects.
- **Observations** — observational records.
- **Favorites** — relationships between users and saved astronomical objects.

Planetary parameters are stored separately from the primary astronomical object record. This approach keeps the core model extensible and allows additional scientific measurements to be introduced without unnecessarily complicating the main object structure.

Measurements use explicit units in their field definitions, with nullable values for unavailable data.

Alembic migrations are used to evolve the database schema incrementally.

## Deployment

The application uses a separated deployment architecture:

| Component | Provider |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon |

Production environments require appropriate database connection settings, authentication secrets, and API configuration.

Environment-specific configuration should be managed through the hosting providers rather than committed to the repository.

## Development Status

Eremia is an actively developed project.

The current implementation includes:

- Full-stack architecture with React and FastAPI.
- Dedicated landing page.
- Astronomical catalog with server-side search and filtering.
- Paginated search results.
- Individual astronomical object detail pages.
- Structured object classification.
- Optional planetary parameter records.
- User registration and authentication.
- Persistent favorites collection.
- Multiple themes and configurable visual styling.
- Skeleton loading states.
- Backend tests for API functionality.

The project is currently focused on expanding the scientific data model, improving the catalog, and refining the application architecture.

## Roadmap

Planned areas of development include:

- Expanding astronomical object models and physical parameters.
- Supporting additional categories of astronomical objects.
- Improving scientific data representation.
- Expanding observational data functionality.
- Integrating external astronomical datasets and scientific APIs.
- Adding richer relationships and cross-references between astronomical objects.
- Improving automated testing and validation.
- Further refining the user interface and data exploration experience.

## Project Goals

Eremia aims to evolve into a structured astronomical information system for discovering and exploring celestial objects, their physical properties, observations, and relationships.

Beyond its scientific focus, the project is an ongoing exploration of full-stack software engineering, including API design, relational data modeling, asynchronous database access, authentication, frontend state management, and deployment.