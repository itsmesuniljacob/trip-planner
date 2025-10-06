import { PrismaClient } from '../generated/prisma/index.js';

// Global variable to store the Prisma client instance
let prisma: PrismaClient;

/**
 * Get or create a Prisma client instance
 * Uses singleton pattern to ensure only one connection pool
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
}

/**
 * Connect to the database
 * Should be called when the application starts
 */
export async function connectDatabase(): Promise<void> {
  try {
    const client = getPrismaClient();
    await client.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from the database
 * Should be called when the application shuts down
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    }
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
}

/**
 * Test database connection
 * Useful for health checks
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Database error handler utility
 * Provides consistent error handling for database operations
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly isRetryable: boolean;

  constructor(message: string, code: string = 'DATABASE_ERROR', isRetryable: boolean = false) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

/**
 * Handle Prisma errors and convert them to DatabaseError
 */
export function handlePrismaError(error: any): DatabaseError {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (error.code) {
    case 'P2002':
      return new DatabaseError('Unique constraint violation', 'UNIQUE_CONSTRAINT_ERROR', false);
    case 'P2003':
      return new DatabaseError('Foreign key constraint violation', 'FOREIGN_KEY_ERROR', false);
    case 'P2025':
      return new DatabaseError('Record not found', 'RECORD_NOT_FOUND', false);
    case 'P1001':
      return new DatabaseError('Database connection failed', 'CONNECTION_ERROR', true);
    case 'P1008':
      return new DatabaseError('Database timeout', 'TIMEOUT_ERROR', true);
    default:
      return new DatabaseError(
        error.message || 'Unknown database error',
        error.code || 'UNKNOWN_ERROR',
        false
      );
  }
}

/**
 * Retry wrapper for database operations
 * Automatically retries operations that fail with retryable errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      const dbError = error instanceof DatabaseError ? error : handlePrismaError(error);
      
      if (!dbError.isRetryable || attempt === maxRetries) {
        throw dbError;
      }

      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError!;
}

// Export the Prisma client instance for direct use
export { prisma };