# Docker Setup Guide

This guide explains how to run the Trip Planner application using Docker and Docker Compose, including the PostgreSQL database.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

### Development Environment

1. **Set up the database and run migrations**:
   ```bash
   ./scripts/docker-db-setup.sh dev
   ```

2. **Start all services**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database: localhost:5433 (postgres/password)

### Production Environment

1. **Set up the database and run migrations**:
   ```bash
   ./scripts/docker-db-setup.sh prod
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3001
   - Database: localhost:5432 (postgres/password)

## Services Overview

### PostgreSQL Database
- **Image**: postgres:16-alpine
- **Development Port**: 5433
- **Production Port**: 5432
- **Database**: trip_planner (prod) / trip_planner_dev (dev)
- **Credentials**: postgres/password

### Backend API
- **Development Port**: 3001
- **Production Port**: 3001
- **Health Check**: http://localhost:3001/health
- **Environment**: Automatically configured for Docker

### Frontend (Development only)
- **Port**: 5173
- **Hot Reload**: Enabled with volume mounts

## Database Management

### Running Migrations
```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend npm run db:migrate:dev

# Production
docker-compose exec backend npm run db:migrate
```

### Seeding Database
```bash
# Development only
docker-compose -f docker-compose.dev.yml exec backend npm run db:seed
```

### Database Studio (Prisma Studio)
```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend npm run db:studio
# Then access http://localhost:5555
```

### Reset Database
```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend npm run db:reset
```

## Useful Commands

### View Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Specific service
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs postgres
```

### Stop Services
```bash
# Development
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose down
```

### Stop and Remove Volumes (⚠️ This will delete all data)
```bash
# Development
docker-compose -f docker-compose.dev.yml down -v

# Production
docker-compose down -v
```

### Rebuild Services
```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose up --build
```

## Environment Configuration

### Development (.env.docker.dev)
- Uses `trip_planner_dev` database
- Includes development-specific settings
- Enables hot reload and debugging

### Production (.env.docker)
- Uses `trip_planner` database
- Optimized for production performance
- Minimal logging and security hardening

## Volumes

### Development
- `postgres_dev_data`: PostgreSQL data persistence
- Source code volumes for hot reload

### Production
- `postgres_data`: PostgreSQL data persistence
- No source code volumes (built into image)

## Networking

All services communicate through the `trip-planner-network` bridge network:
- Services can reach each other using service names (e.g., `postgres`, `backend`)
- External access through mapped ports

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL container is healthy:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs postgres
   ```

3. Test database connection:
   ```bash
   docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d trip_planner_dev -c "SELECT 1;"
   ```

### Backend Issues
1. Check backend logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs backend
   ```

2. Verify environment variables:
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend env | grep DATABASE_URL
   ```

3. Test backend health:
   ```bash
   curl http://localhost:3001/health
   ```

### Migration Issues
1. Check if database is ready:
   ```bash
   docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres
   ```

2. Run migrations manually:
   ```bash
   docker-compose -f docker-compose.dev.yml exec backend npm run db:migrate:dev
   ```

### Port Conflicts
If you get port conflicts:
1. Check what's using the ports:
   ```bash
   lsof -i :5432  # or :5433, :3001, :5173
   ```

2. Stop conflicting services or change ports in docker-compose files

## Security Notes

- Default passwords are used for development convenience
- Change passwords in production environments
- Database ports are exposed for development access
- Consider using Docker secrets for production deployments

## Performance Tips

- Use `docker-compose up -d` to run in background
- Use `docker system prune` periodically to clean up unused resources
- Monitor resource usage with `docker stats`
- Use multi-stage builds for smaller production images