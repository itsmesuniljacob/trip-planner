import { Router, Response } from 'express';
import { z } from 'zod';
import { tripService } from '../services/tripService.js';
import { AuthenticatedRequest, authenticateUser } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { CreateTripSchema, UpdateTripSchema } from '../models/trip.js';
import { CreateParticipantSchema } from '../models/participant.js';

const router = Router();

// Parameter validation schemas
const TripIdParamsSchema = z.object({
  id: z.string().uuid('Trip ID must be a valid UUID'),
});

const ParticipantParamsSchema = z.object({
  id: z.string().uuid('Trip ID must be a valid UUID'),
  participantId: z.string().uuid('Participant ID must be a valid UUID'),
});

/**
 * POST /api/trips
 * Create a new trip
 */
router.post(
  '/',
  authenticateUser,
  validateBody(CreateTripSchema.omit({ organizerId: true })),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tripData = {
        ...req.body,
        organizerId: req.user!.id, // Override with authenticated user ID
      };

      const trip = await tripService.createTrip(tripData);
      
      res.status(201).json({
        success: true,
        data: trip,
        message: 'Trip created successfully',
      });
    } catch (error: any) {
      console.error('Error creating trip:', error);
      res.status(500).json({
        error: 'Failed to create trip',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/trips/:id
 * Get trip by ID with proper authorization
 */
router.get(
  '/:id',
  authenticateUser,
  validateParams(TripIdParamsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Get trip with participants
      const trip = await tripService.getTripById(id, true);
      
      if (!trip) {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }

      // Check authorization - only organizer can view trip details
      if (trip.organizerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to view this trip',
        });
      }

      // Get trip statistics
      const stats = await tripService.getTripStats(id);

      res.json({
        success: true,
        data: {
          ...trip,
          stats,
        },
      });
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      res.status(500).json({
        error: 'Failed to fetch trip',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * PUT /api/trips/:id
 * Update trip
 */
router.put(
  '/:id',
  authenticateUser,
  validateParams(TripIdParamsSchema),
  validateBody(UpdateTripSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if trip exists and user is organizer
      const existingTrip = await tripService.getTripById(id, false);
      
      if (!existingTrip) {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }

      if (existingTrip.organizerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to update this trip',
        });
      }

      // Update trip
      const updatedTrip = await tripService.updateTrip(id, req.body);

      res.json({
        success: true,
        data: updatedTrip,
        message: 'Trip updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating trip:', error);
      res.status(500).json({
        error: 'Failed to update trip',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * POST /api/trips/:id/participants
 * Add participant to trip
 */
router.post(
  '/:id/participants',
  authenticateUser,
  validateParams(TripIdParamsSchema),
  validateBody(CreateParticipantSchema.omit({ tripId: true })), // tripId comes from URL
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if trip exists and user is organizer
      const trip = await tripService.getTripById(id, false);
      
      if (!trip) {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }

      if (trip.organizerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to add participants to this trip',
        });
      }

      // Add participant
      const participantData = {
        ...req.body,
        tripId: id,
      };

      const participant = await tripService.addParticipant(participantData);

      res.status(201).json({
        success: true,
        data: participant,
        message: 'Participant added successfully',
      });
    } catch (error: any) {
      console.error('Error adding participant:', error);
      
      // Handle specific error cases
      if (error.message === 'Trip not found') {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }
      
      if (error.message === 'Participant with this phone number already exists in this trip') {
        return res.status(409).json({
          error: 'Duplicate participant',
          message: 'A participant with this phone number already exists in this trip',
        });
      }

      res.status(500).json({
        error: 'Failed to add participant',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * DELETE /api/trips/:id/participants/:participantId
 * Remove participant from trip
 */
router.delete(
  '/:id/participants/:participantId',
  authenticateUser,
  validateParams(ParticipantParamsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, participantId } = req.params;
      const userId = req.user!.id;

      // Check if trip exists and user is organizer
      const trip = await tripService.getTripById(id, false);
      
      if (!trip) {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }

      if (trip.organizerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to remove participants from this trip',
        });
      }

      // Remove participant
      await tripService.removeParticipant(id, participantId);

      res.json({
        success: true,
        message: 'Participant removed successfully',
      });
    } catch (error: any) {
      console.error('Error removing participant:', error);
      
      if (error.message === 'Participant not found in this trip') {
        return res.status(404).json({
          error: 'Participant not found',
          message: 'The requested participant does not exist in this trip',
        });
      }

      res.status(500).json({
        error: 'Failed to remove participant',
        message: error.message || 'Internal server error',
      });
    }
  }
);

/**
 * GET /api/trips/:id/participants
 * Get all participants for a trip
 */
router.get(
  '/:id/participants',
  authenticateUser,
  validateParams(TripIdParamsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if trip exists and user is organizer
      const trip = await tripService.getTripById(id, false);
      
      if (!trip) {
        return res.status(404).json({
          error: 'Trip not found',
          message: 'The requested trip does not exist',
        });
      }

      if (trip.organizerId !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not authorized to view participants for this trip',
        });
      }

      // Get participants
      const participants = await tripService.getTripParticipants(id);

      res.json({
        success: true,
        data: participants,
      });
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      res.status(500).json({
        error: 'Failed to fetch participants',
        message: error.message || 'Internal server error',
      });
    }
  }
);

export default router;