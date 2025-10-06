import { getPrismaClient, testDatabaseConnection } from './database.js';

/**
 * Comprehensive database health check
 * Tests connection and basic operations
 */
export async function performDatabaseHealthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connection: boolean;
    tablesAccessible: boolean;
    sampleDataExists: boolean;
  };
  error?: string;
}> {
  const details = {
    connection: false,
    tablesAccessible: false,
    sampleDataExists: false,
  };

  try {
    // Test basic connection
    details.connection = await testDatabaseConnection();
    
    if (!details.connection) {
      return {
        status: 'unhealthy',
        details,
        error: 'Database connection failed',
      };
    }

    const prisma = getPrismaClient();

    // Test table accessibility by counting records
    const tripCount = await prisma.trip.count();
    const participantCount = await prisma.participant.count();
    
    details.tablesAccessible = true;
    details.sampleDataExists = tripCount > 0 && participantCount > 0;

    return {
      status: 'healthy',
      details,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get database statistics for monitoring
 */
export async function getDatabaseStats(): Promise<{
  trips: number;
  participants: number;
  surveyResponses: number;
  recommendations: number;
  votes: number;
  votingResults: number;
}> {
  const prisma = getPrismaClient();

  const [
    trips,
    participants,
    surveyResponses,
    recommendations,
    votes,
    votingResults,
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.participant.count(),
    prisma.surveyResponse.count(),
    prisma.recommendation.count(),
    prisma.vote.count(),
    prisma.votingResult.count(),
  ]);

  return {
    trips,
    participants,
    surveyResponses,
    recommendations,
    votes,
    votingResults,
  };
}