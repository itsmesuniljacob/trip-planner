import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { surveyService } from '../services/surveyService.js';
import { tripService } from '../services/tripService.js';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { CreateSurveyResponseSchema } from '../models/surveyResponse.js';

const router = Router();

// Parameter validation schemas
const SurveyTokenParamsSchema = z.object({
  token: z.string().min(1, 'Survey token is required'),
});

const TripIdParamsSchema = z.object({
  id: z.string().uuid('Trip ID must be a valid UUID'),
});

/**
 * GET /api/surveys/:token
 * Get survey form for public access (no authentication required)
 */
router.get(
  '/:token',
  validateParams(SurveyTokenParamsSchema),
  async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const participantData = await surveyService.getParticipantBySurveyToken(token);

      if (!participantData) {
        return res.status(404).json({
          error: 'Survey not found',
          message: 'Invalid or expired survey link',
        });
      }

      const { participant, trip } = participantData;

      // Check if survey is already completed
      if (participant.hasCompletedSurvey) {
        return res.status(409).json({
          error: 'Survey already completed',
          message: 'You have already completed this survey',
          data: {
            participantName: participant.name,
            tripName: trip.name,
          },
        });
      }

      // Return survey form data
      res.json({
        success: true,
        data: {
          participant: {
            id: participant.id,
            name: participant.name,
          },
          trip: {
            id: trip.id,
            name: trip.name,
          },
          surveyFields: {
            budgetRange: {
              required: true,
              description: 'What is your budget range for this trip?',
            },
            availableDates: {
              required: true,
              description: 'When are you available to travel?',
            },
            destinationPreferences: {
              required: true,
              description: 'What are your destination preferences?',
            },
            travelVibe: {
              required: true,
              description: 'What kind of travel vibe are you looking for?',
            },
            additionalNotes: {
              required: false,
              description: 'Any additional notes or special requirements?',
            },
          },
        },
      });
    } catch (error: any) {
      console.error('Error fetching survey:', error);
      res.status(500).json({
        error: 'Failed to fetch survey',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/surveys/:token
 * Submit survey response (no authentication required)
 */
router.post(
  '/:token',
  validateParams(SurveyTokenParamsSchema),
  validateBody(CreateSurveyResponseSchema.omit({ participantId: true, tripId: true })),
  async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const surveyResponse = await surveyService.submitSurveyResponse(token, req.body);

      res.status(201).json({
        success: true,
        data: {
          id: surveyResponse.id,
          submittedAt: surveyResponse.submittedAt,
        },
        message: 'Survey response submitted successfully',
      });
    } catch (error: any) {
      // Handle specific error cases
      if (error.message === 'Invalid survey token') {
        return res.status(404).json({
          error: 'Survey not found',
          message: 'Invalid or expired survey link',
        });
      }

      if (error.message === 'Survey already completed') {
        return res.status(409).json({
          error: 'Survey already completed',
          message: 'You have already completed this survey',
        });
      }

      if (error.message === 'Survey submission not allowed for this trip status') {
        return res.status(409).json({
          error: 'Survey closed',
          message: 'Survey submission is no longer allowed for this trip',
        });
      }

      res.status(500).json({
        error: 'Failed to submit survey response',
        message: error.message || 'Internal server error',
      });
    }
  }
);



export default router;