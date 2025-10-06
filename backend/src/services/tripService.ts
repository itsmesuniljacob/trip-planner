import { getPrismaClient, handlePrismaError, withRetry } from '../lib/database.js';
import { Trip, Participant } from '../generated/prisma/index.js';
import { CreateTripInput, UpdateTripInput, TripStatus } from '../models/trip.js';
import { CreateParticipantInput } from '../models/participant.js';
import { randomBytes } from 'crypto';

const prisma = getPrismaClient();

/**
 * Generate secure tokens for survey and voting links
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Trip Service - handles all trip-related database operations
 */
export class TripService {
  /**
   * Create a new trip
   */
  async createTrip(input: CreateTripInput): Promise<Trip> {
    return withRetry(async () => {
      try {
        const trip = await prisma.trip.create({
          data: {
            name: input.name,
            organizerId: input.organizerId,
            status: TripStatus.CREATED,
          },
          include: {
            participants: true,
          },
        });
        return trip;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Get trip by ID with optional includes
   */
  async getTripById(
    tripId: string, 
    includeParticipants: boolean = true
  ): Promise<Trip | null> {
    return withRetry(async () => {
      try {
        const trip = await prisma.trip.findUnique({
          where: { id: tripId },
          include: {
            participants: includeParticipants,
            surveyResponses: false,
            recommendations: false,
            votes: false,
          },
        });
        return trip;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Update trip
   */
  async updateTrip(tripId: string, input: UpdateTripInput): Promise<Trip> {
    return withRetry(async () => {
      try {
        const trip = await prisma.trip.update({
          where: { id: tripId },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.status && { status: input.status }),
            updatedAt: new Date(),
          },
          include: {
            participants: true,
          },
        });
        return trip;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Delete trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    return withRetry(async () => {
      try {
        await prisma.trip.delete({
          where: { id: tripId },
        });
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Add participant to trip
   */
  async addParticipant(input: CreateParticipantInput): Promise<Participant> {
    return withRetry(async () => {
      try {
        // Check if trip exists
        const trip = await prisma.trip.findUnique({
          where: { id: input.tripId },
        });
        
        if (!trip) {
          throw new Error('Trip not found');
        }

        // Check if participant with same phone number already exists in this trip
        const existingParticipant = await prisma.participant.findFirst({
          where: {
            tripId: input.tripId,
            phoneNumber: input.phoneNumber,
          },
        });

        if (existingParticipant) {
          throw new Error('Participant with this phone number already exists in this trip');
        }

        // Create participant with secure tokens
        const participant = await prisma.participant.create({
          data: {
            tripId: input.tripId,
            name: input.name,
            phoneNumber: input.phoneNumber,
            surveyToken: generateSecureToken(),
            voteToken: generateSecureToken(),
          },
        });

        return participant;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Remove participant from trip
   */
  async removeParticipant(tripId: string, participantId: string): Promise<void> {
    return withRetry(async () => {
      try {
        // Verify participant belongs to the trip
        const participant = await prisma.participant.findFirst({
          where: {
            id: participantId,
            tripId: tripId,
          },
        });

        if (!participant) {
          throw new Error('Participant not found in this trip');
        }

        await prisma.participant.delete({
          where: { id: participantId },
        });
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Get all participants for a trip
   */
  async getTripParticipants(tripId: string): Promise<Participant[]> {
    return withRetry(async () => {
      try {
        const participants = await prisma.participant.findMany({
          where: { tripId },
          orderBy: { createdAt: 'asc' },
        });
        return participants;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Check if user is trip organizer
   */
  async isOrganizer(tripId: string, userId: string): Promise<boolean> {
    return withRetry(async () => {
      try {
        const trip = await prisma.trip.findUnique({
          where: { id: tripId },
          select: { organizerId: true },
        });
        return trip?.organizerId === userId;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Get trip statistics
   */
  async getTripStats(tripId: string): Promise<{
    participantCount: number;
    surveyCompletionCount: number;
    voteCount: number;
  }> {
    return withRetry(async () => {
      try {
        const [participantCount, surveyCompletionCount, voteCount] = await Promise.all([
          prisma.participant.count({ where: { tripId } }),
          prisma.participant.count({ where: { tripId, hasCompletedSurvey: true } }),
          prisma.participant.count({ where: { tripId, hasVoted: true } }),
        ]);

        return {
          participantCount,
          surveyCompletionCount,
          voteCount,
        };
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }
}

export const tripService = new TripService();