import { getPrismaClient, handlePrismaError, withRetry } from '../lib/database.js';

const prisma = getPrismaClient();

/**
 * Trip Service - Database operations for trips
 */
export class TripService {
  /**
   * Get all trips with basic information
   */
  static async getAllTrips() {
    return withRetry(async () => {
      const trips = await prisma.trip.findMany({
        select: {
          id: true,
          name: true,
          organizerId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              participants: true,
              surveyResponses: true,
              recommendations: true,
              votes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return trips.map(trip => ({
        id: trip.id,
        name: trip.name,
        organizerId: trip.organizerId,
        status: trip.status,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        participantCount: trip._count.participants,
        surveyResponseCount: trip._count.surveyResponses,
        recommendationCount: trip._count.recommendations,
        voteCount: trip._count.votes,
      }));
    });
  }

  /**
   * Get a specific trip with full details
   */
  static async getTripById(tripId) {
    return withRetry(async () => {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
              hasCompletedSurvey: true,
              hasVoted: true,
              createdAt: true,
            },
          },
          surveyResponses: {
            select: {
              id: true,
              participantId: true,
              budgetMin: true,
              budgetMax: true,
              budgetCurrency: true,
              availableStartDate: true,
              availableEndDate: true,
              dateFlexibility: true,
              destinationPreferences: true,
              travelVibe: true,
              submittedAt: true,
            },
          },
          recommendations: {
            select: {
              id: true,
              destinationName: true,
              destinationCountry: true,
              destinationRegion: true,
              description: true,
              imageUrl: true,
              matchScore: true,
              estimatedCostMin: true,
              estimatedCostMax: true,
              costCurrency: true,
              bestTimeToVisit: true,
              keyActivities: true,
              createdAt: true,
            },
          },
          votes: {
            select: {
              id: true,
              participantId: true,
              rankings: true,
              submittedAt: true,
            },
          },
          votingResults: {
            select: {
              id: true,
              winningRecommendationId: true,
              roundsData: true,
              finalTally: true,
              calculatedAt: true,
            },
          },
        },
      });

      return trip;
    });
  }

  /**
   * Create a new trip
   */
  static async createTrip(name, organizerId) {
    return withRetry(async () => {
      const trip = await prisma.trip.create({
        data: {
          name,
          organizerId,
          status: 'created',
        },
        select: {
          id: true,
          name: true,
          organizerId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return trip;
    });
  }

  /**
   * Update trip status
   */
  static async updateTripStatus(tripId, status) {
    return withRetry(async () => {
      const trip = await prisma.trip.update({
        where: { id: tripId },
        data: { status },
        select: {
          id: true,
          name: true,
          organizerId: true,
          status: true,
          updatedAt: true,
        },
      });

      return trip;
    });
  }

  /**
   * Delete a trip and all related data
   */
  static async deleteTrip(tripId) {
    return withRetry(async () => {
      // Prisma will handle cascade deletes based on our schema
      await prisma.trip.delete({
        where: { id: tripId },
      });

      return { success: true };
    });
  }

  /**
   * Get trip statistics
   */
  static async getTripStats(tripId) {
    return withRetry(async () => {
      const stats = await prisma.trip.findUnique({
        where: { id: tripId },
        select: {
          _count: {
            select: {
              participants: true,
              surveyResponses: true,
              recommendations: true,
              votes: true,
            },
          },
        },
      });

      if (!stats) {
        return null;
      }

      return {
        participantCount: stats._count.participants,
        surveyResponseCount: stats._count.surveyResponses,
        recommendationCount: stats._count.recommendations,
        voteCount: stats._count.votes,
        completionRate: stats._count.participants > 0 
          ? (stats._count.surveyResponses / stats._count.participants) * 100 
          : 0,
        votingRate: stats._count.participants > 0 
          ? (stats._count.votes / stats._count.participants) * 100 
          : 0,
      };
    });
  }
}