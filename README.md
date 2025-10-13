# Group Trip Planner

A full-stack application for planning group trips with AI-powered recommendations and ranked-choice voting.

## Project Structure

```
├── frontend/          # React TypeScript frontend with Vite
├── backend/           # Node.js Express TypeScript backend
├── .kiro/specs/       # Project specifications and requirements
└── package.json       # Root package.json for managing both projects
```

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Vitest** for testing
- **ESLint + Prettier** for code quality

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Prisma ORM
- **Jest** for testing
- **ESLint + Prettier** for code quality

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OR Node.js (v20 or higher) and npm for local development

## 🐳 Docker Setup (Recommended)

### Quick Start

**Development Mode** (recommended):
```bash
# One command to set up everything
./scripts/quick-start.sh
```

**Production Mode**:
```bash
# Set up database and run migrations
./scripts/docker-db-setup.sh prod

# Start all services
docker-compose up -d
```

**Alternative Development Setup**:
```bash
# Manual setup with more control
./scripts/docker-db-setup.sh dev
docker-compose -f docker-compose.dev.yml up
```

### What's Included
- **PostgreSQL Database**: Persistent data storage with health checks
- **Backend API**: Node.js/Express with Prisma ORM
- **Frontend**: React with Vite (development mode only)
- **Database Migrations**: Automatic schema setup and sample data

### Access Points
- **Development**:
  - Frontend: http://localhost:5173
  - Backend API: http://localhost:3001
  - Database: localhost:5433 (postgres/password)
  
- **Production**:
  - Frontend: http://localhost:80
  - Backend API: http://localhost:3001
  - Database: localhost:5432 (postgres/password)

### Docker Commands
```bash
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build --force-recreate

# Clean up (remove containers, networks, volumes)
docker-compose down -v --remove-orphans
```

### Database Management
```bash
# Run database migrations
docker-compose -f docker-compose.dev.yml exec backend npm run db:migrate:dev

# Seed database with sample data
docker-compose -f docker-compose.dev.yml exec backend npm run db:seed

# Open Prisma Studio (database GUI)
docker-compose -f docker-compose.dev.yml exec backend npm run db:studio

# Reset database (⚠️ deletes all data)
docker-compose -f docker-compose.dev.yml exec backend npm run db:reset
```

For detailed Docker setup instructions, see [DOCKER.md](./DOCKER.md).

## 💻 Local Development (Alternative)

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend && npm install
```

3. Install backend dependencies:
```bash
cd backend && npm install
```

### Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
# Backend (runs on port 3001)
npm run dev:backend

# Frontend (runs on port 5173)
npm run dev:frontend
```

### Building

Build both projects:
```bash
npm run build
```

### Testing

Run all tests:
```bash
npm test
```

Run tests for specific project:
```bash
npm run test:backend
npm run test:frontend
```

### Code Quality

Lint all code:
```bash
npm run lint
```

Format all code:
```bash
npm run format
```

## API Endpoints

The backend provides a comprehensive REST API for trip management:

### Trip Management
- `POST /api/trips` - Create a new trip with validation
- `GET /api/trips/:id` - Get trip details with authorization
- `PUT /api/trips/:id` - Update trip name and status
- `DELETE /api/trips/:id` - Delete a trip (organizer only)

### Participant Management
- `POST /api/trips/:id/participants` - Add participants to trip
- `GET /api/trips/:id/participants` - List all trip participants
- `DELETE /api/trips/:id/participants/:participantId` - Remove participant

### System Endpoints
- `GET /health` - Health check with database connectivity status

### Authentication
All endpoints require authentication via `X-User-Id` header with a valid UUID. Only trip organizers can modify trips and manage participants.

### Quick API Test
```bash
# Health check
curl http://localhost:3001/health

# Create new trip (requires authentication)
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{"name":"Trip to Tokyo"}'

# Get trip details
curl -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  http://localhost:3001/api/trips/TRIP_ID

# Add participant
curl -X POST http://localhost:3001/api/trips/TRIP_ID/participants \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{"name":"John Doe","phoneNumber":"+1234567890"}'
```

For complete API documentation, see [backend/API.md](./backend/API.md).

## Recent Updates

### ✅ Trip Management API Implementation (Task 5)

The backend now includes a complete trip management API with the following features:

#### **Implemented Endpoints**
- **POST /api/trips** - Create trips with validation and authentication
- **GET /api/trips/:id** - Get trip details with authorization checks
- **PUT /api/trips/:id** - Update trip name and status
- **POST /api/trips/:id/participants** - Add participants with phone validation
- **GET /api/trips/:id/participants** - List trip participants
- **DELETE /api/trips/:id/participants/:id** - Remove participants

#### **Key Features**
- **Authentication**: Header-based auth with `X-User-Id` UUID validation
- **Authorization**: Organizer-only access to trip management
- **Input Validation**: Comprehensive Zod-based validation for all inputs
- **Database Integration**: Full Prisma ORM with PostgreSQL
- **Error Handling**: Proper HTTP status codes and detailed error messages
- **Security**: Phone number validation, duplicate prevention, secure tokens
- **Testing**: Integration tests and manual API validation

#### **Architecture**
- **Service Layer**: Clean separation with `TripService` for business logic
- **Middleware**: Authentication and validation middleware
- **Database**: Retry logic, error handling, and connection management
- **Containerization**: Full Docker support for development and production

## Development Notes

### Docker Setup
- **Production**: Frontend served via nginx on port 80, backend on port 3001
- **Development**: Frontend on port 5173, backend on port 3001
- Nginx handles API proxying and static file serving
- Health checks ensure backend is ready before frontend starts

### Local Setup
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`

### General
- Both projects use TypeScript with strict type checking
- ESLint and Prettier are configured for consistent code style
- Tests are set up with Vitest (frontend) and Jest (backend)
- Docker images are optimized for production with multi-stage builds