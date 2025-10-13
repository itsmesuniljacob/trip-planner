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

The database connection is managed through the `src/lib/database.ts` utility with comprehensive error handling and retry logic:

```typescript
import { getPrismaClient, connectDatabase, disconnectDatabase, withRetry } from './lib/database.js';

// Get Prisma client instance (singleton pattern)
const prisma = getPrismaClient();

// Connect to database (call once at app startup)
await connectDatabase();

// Use retry wrapper for database operations
const result = await withRetry(async () => {
  return await prisma.trip.findMany();
});

// Disconnect from database (call at app shutdown)
await disconnectDatabase();
```

### Connection Features

- **Singleton Pattern**: Single Prisma client instance across the application
- **Automatic Retry**: Failed operations are retried with exponential backoff
- **Error Mapping**: Prisma errors are mapped to meaningful application errors
- **Health Checks**: Built-in database connectivity testing
- **Connection Pooling**: Optimized connection management for production

## Error Handling

The database utilities include comprehensive error handling with the `DatabaseError` class and `handlePrismaError` function:

### Error Types
- **P2002**: Unique constraint violation (e.g., duplicate phone numbers)
- **P2003**: Foreign key constraint violation
- **P2025**: Record not found
- **P1001**: Database connection failed (retryable)
- **P1008**: Database timeout (retryable)

### Usage Example
```typescript
import { handlePrismaError, withRetry } from './lib/database.js';

try {
  const trip = await withRetry(() => prisma.trip.create({ data: tripData }));
} catch (error) {
  const dbError = handlePrismaError(error);
  if (dbError.isRetryable) {
    // Handle retryable errors
  } else {
    // Handle permanent errors
  }
}
```

### Features
- **Automatic Retry**: Retryable errors are automatically retried up to 3 times
- **Error Classification**: Errors are classified as retryable or permanent
- **Consistent Error Format**: All database errors follow the same structure
- **Graceful Degradation**: Health checks prevent cascading failures

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

Database connection is configured via environment variables:

### Development (Docker)
```env
# .env (for Docker containers)
DATABASE_URL="postgresql://postgres:password@postgres:5432/trip_planner_dev?schema=public"
NODE_ENV=development
```

### Development (Local)
```env
# .env.local (for local development)
DATABASE_URL="postgresql://postgres:password@localhost:5433/trip_planner_dev?schema=public"
NODE_ENV=development
```

### Testing
```env
# .env.test (for running tests)
DATABASE_URL="postgresql://postgres:password@localhost:5433/trip_planner_dev?schema=public"
NODE_ENV=test
```

### Production
```env
# Production environment
DATABASE_URL="postgresql://user:password@host:5432/trip_planner_prod?schema=public"
NODE_ENV=production
```

### Prisma Configuration
The Prisma client is generated to `dist/generated/prisma` to match the TypeScript build output structure.

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