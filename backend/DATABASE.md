# Database Setup Documentation

## Overview

This project uses PostgreSQL with Prisma ORM for database management. The database schema includes tables for trips, participants, survey responses, recommendations, votes, and voting results.

## Database Schema

### Tables

- **trips**: Core trip information and status
- **participants**: Trip participants with survey and voting tokens
- **survey_responses**: Participant preferences and requirements
- **recommendations**: AI-generated destination recommendations
- **votes**: Participant rankings of recommendations
- **voting_results**: Final voting outcomes using ranked choice voting

### Key Features

- UUID primary keys for all tables
- Proper foreign key relationships with cascade deletes
- JSON fields for flexible data storage (preferences, rankings, etc.)
- Timestamps for audit trails
- Unique constraints on tokens for security

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Prisma CLI (installed via npm)

### Database Setup

1. **Start Prisma Postgres Server** (if not already running):
   ```bash
   npx prisma dev
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

3. **Run Database Migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed Database with Sample Data**:
   ```bash
   npm run db:seed
   ```

### Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (drops all data)
- `npm run db:studio` - Open Prisma Studio for database inspection

## Database Connection

The database connection is managed through the `src/lib/database.ts` utility:

```typescript
import { getPrismaClient, connectDatabase, disconnectDatabase } from './lib/database.js';

// Get Prisma client instance
const prisma = getPrismaClient();

// Connect to database (call once at app startup)
await connectDatabase();

// Disconnect from database (call at app shutdown)
await disconnectDatabase();
```

## Error Handling

The database utilities include comprehensive error handling:

- **Connection errors**: Automatic retry with exponential backoff
- **Constraint violations**: Proper error mapping for unique/foreign key violations
- **Timeout handling**: Configurable timeouts for long-running operations
- **Graceful degradation**: Health checks and connection testing

## Sample Data

The seeding script creates:

- 3 trips in different statuses (created, surveying, voting)
- 7 participants across all trips
- 4 survey responses with realistic preferences
- 3 destination recommendations with match scores
- 2 votes with ranked preferences
- 1 voting result showing the winner

## Health Monitoring

Use the health check utilities to monitor database status:

```typescript
import { performDatabaseHealthCheck, getDatabaseStats } from './lib/health-check.js';

// Check database health
const health = await performDatabaseHealthCheck();
console.log('Database status:', health.status);

// Get database statistics
const stats = await getDatabaseStats();
console.log('Record counts:', stats);
```

## Environment Configuration

Database connection is configured via the `DATABASE_URL` environment variable in `.env`:

```env
# Using Prisma Postgres (default for development)
DATABASE_URL="prisma+postgres://localhost:51213/..."

# Alternative: Standard PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/trip_planner"
```

## Migration Files

Database migrations are stored in `prisma/migrations/` and track schema changes over time. Each migration includes:

- SQL statements to modify the database schema
- Timestamp and descriptive name
- Rollback information (where applicable)

## Security Considerations

- All sensitive tokens are stored as unique, indexed fields
- Foreign key constraints prevent orphaned records
- Cascade deletes ensure data consistency
- Connection pooling limits concurrent connections
- Environment variables protect connection credentials