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
- **Jest** for testing
- **ESLint + Prettier** for code quality

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OR Node.js (v20 or higher) and npm for local development

## 🐳 Docker Setup (Recommended for Prototyping)

### Production Mode
Run the complete application with one command:
```bash
docker-compose up --build
```

This will:
- Build and start both frontend and backend
- Frontend available at `http://localhost`
- Backend API available at `http://localhost/api`
- Includes nginx reverse proxy and health checks

### Development Mode
For development with hot reload:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will:
- Frontend with hot reload at `http://localhost:5173`
- Backend with hot reload at `http://localhost:3001`
- Volume mounts for live code changes

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

The backend provides the following API endpoints:

- `GET /health` - Health check
- `POST /api/trips` - Create a new trip
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips/:id/participants` - Add participants
- `POST /api/trips/:id/preferences` - Set participant preferences
- `GET /api/trips/:id/recommendations` - Get AI recommendations
- `POST /api/trips/:id/votes` - Submit votes
- `GET /api/trips/:id/results` - Get voting results

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