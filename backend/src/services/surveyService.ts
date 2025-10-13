import { getPrismaClient, handlePrismaError, withRetry } from '../lib/database.js';
import { SurveyResponse, Participant } from '../generated/prisma/index.js';
import { CreateSurveyResponseInput } from '../models/surveyResponse.js';
import { TripStatus } from '../models/trip.js';

const prisma = getPrismaClient();

/**
 * Survey Service - handles all survey-related database operations
 */
export class SurveyService {
  /**
   * Get participant by survey token for public survey access
   */
  async getParticipantBySurveyToken(token: string): Promise<{
    participant: Participant;
    trip: { id: string; name: string; status: string };
  } | null> {
    return withRetry(async () => {
      try {
        const participant = await prisma.participant.findUnique({
          where: { surveyToken: token },
          include: {
            trip: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        });

        if (!participant) {
          return null;
        }

        return {
          participant,
          trip: participant.trip,
        };
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Submit survey response
   */
  async submitSurveyResponse(
    token: string,
    input: Omit<CreateSurveyResponseInput, 'participantId' | 'tripId'>
  ): Promise<SurveyResponse> {
    return withRetry(async () => {
      try {
        // Get participant by token
        const participantData = await this.getParticipantBySurveyToken(token);
        
        if (!participantData) {
          throw new Error('Invalid survey token');
        }

        const { participant, trip } = participantData;

        // Check if participant has already completed survey
        if (participant.hasCompletedSurvey) {
          throw new Error('Survey already completed');
        }

        // Check if trip is in correct status for surveys
        if (trip.status !== TripStatus.CREATED && trip.status !== TripStatus.SURVEYING) {
          throw new Error('Survey submission not allowed for this trip status');
        }

        // Create survey response in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create survey response
          const surveyResponse = await tx.surveyResponse.create({
            data: {
              participantId: participant.id,
              tripId: participant.tripId,
              budgetMin: input.budgetRange.min,
              budgetMax: input.budgetRange.max,
              budgetCurrency: input.budgetRange.currency,
              availableStartDate: input.availableDates.startDate,
              availableEndDate: input.availableDates.endDate,
              dateFlexibility: input.availableDates.flexibility,
              destinationPreferences: input.destinationPreferences,
              travelVibe: input.travelVibe,
              additionalNotes: input.additionalNotes || null,
            },
          });

          // Update participant status
          await tx.participant.update({
            where: { id: participant.id },
            data: { hasCompletedSurvey: true },
          });

          // Update trip status to surveying if this is the first response
          const tripParticipantCount = await tx.participant.count({
            where: { tripId: participant.tripId },
          });
          
          const completedSurveyCount = await tx.participant.count({
            where: { 
              tripId: participant.tripId,
              hasCompletedSurvey: true,
            },
          });

          // If this is the first survey response, update trip status to surveying
          if (completedSurveyCount === 1 && trip.status === TripStatus.CREATED) {
            await tx.trip.update({
              where: { id: participant.tripId },
              data: { status: TripStatus.SURVEYING },
            });
          }

          return surveyResponse;
        });

        return result;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Get survey status for a trip
   */
  async getSurveyStatus(tripId: string): Promise<{
    totalParticipants: number;
    completedSurveys: number;
    pendingParticipants: Array<{
      id: string;
      name: string;
      phoneNumber: string;
    }>;
    completedParticipants: Array<{
      id: string;
      name: string;
      phoneNumber: string;
      submittedAt: Date;
    }>;
  }> {
    return withRetry(async () => {
      try {
        const participants = await prisma.participant.findMany({
          where: { tripId },
          include: {
            surveyResponses: {
              select: {
                submittedAt: true,
              },
              orderBy: {
                submittedAt: 'desc',
              },
              take: 1,
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const totalParticipants = participants.length;
        const completedParticipants = participants
          .filter(p => p.hasCompletedSurvey)
          .map(p => ({
            id: p.id,
            name: p.name,
            phoneNumber: p.phoneNumber,
            submittedAt: p.surveyResponses[0]?.submittedAt || new Date(),
          }));

        const pendingParticipants = participants
          .filter(p => !p.hasCompletedSurvey)
          .map(p => ({
            id: p.id,
            name: p.name,
            phoneNumber: p.phoneNumber,
          }));

        return {
          totalParticipants,
          completedSurveys: completedParticipants.length,
          pendingParticipants,
          completedParticipants,
        };
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Send survey invitations (placeholder for SMS integration)
   * This will be implemented when SMS service is available
   */
  async sendSurveyInvitations(tripId: string): Promise<{
    sent: number;
    failed: number;
    participants: Array<{
      id: string;
      name: string;
      phoneNumber: string;
      status: 'sent' | 'failed' | 'already_completed';
      surveyUrl?: string;
    }>;
  }> {
    return withRetry(async () => {
      try {
        // Get trip and participants
        const trip = await prisma.trip.findUnique({
          where: { id: tripId },
          include: {
            participants: true,
          },
        });

        if (!trip) {
          throw new Error('Trip not found');
        }

        // Update trip status to surveying if not already
        if (trip.status === TripStatus.CREATED) {
          await prisma.trip.update({
            where: { id: tripId },
            data: { status: TripStatus.SURVEYING },
          });
        }

        const results = trip.participants.map(participant => {
          if (participant.hasCompletedSurvey) {
            return {
              id: participant.id,
              name: participant.name,
              phoneNumber: participant.phoneNumber,
              status: 'already_completed' as const,
            };
          }

          // Generate survey URL
          const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${participant.surveyToken}`;

          // TODO: Implement actual SMS sending when SMS service is available
          // For now, we'll log the message that would be sent
          console.log(`[SURVEY SMS] To: ${participant.phoneNumber}`);
          console.log(`[SURVEY SMS] Message: Hi ${participant.name}! Please complete the survey for "${trip.name}": ${surveyUrl}`);

          return {
            id: participant.id,
            name: participant.name,
            phoneNumber: participant.phoneNumber,
            status: 'sent' as const,
            surveyUrl,
          };
        });

        const sent = results.filter(r => r.status === 'sent').length;
        const failed = 0; // No failures in mock implementation
        
        return {
          sent,
          failed,
          participants: results,
        };
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Get all survey responses for a trip
   */
  async getTripSurveyResponses(tripId: string): Promise<SurveyResponse[]> {
    return withRetry(async () => {
      try {
        const responses = await prisma.surveyResponse.findMany({
          where: { tripId },
          include: {
            participant: {
              select: {
                id: true,
                name: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: { submittedAt: 'asc' },
        });

        return responses;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }

  /**
   * Check if all participants have completed surveys
   */
  async areAllSurveysCompleted(tripId: string): Promise<boolean> {
    return withRetry(async () => {
      try {
        const totalParticipants = await prisma.participant.count({
          where: { tripId },
        });

        const completedSurveys = await prisma.participant.count({
          where: { 
            tripId,
            hasCompletedSurvey: true,
          },
        });

        return totalParticipants > 0 && totalParticipants === completedSurveys;
      } catch (error) {
        throw handlePrismaError(error);
      }
    });
  }
}

export const surveyService = new SurveyService();