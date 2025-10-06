import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { TripService } from './services/tripService.js';
import { handlePrismaError } from './lib/database.js';

const router = Router();

// Validation middleware
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
}

// Error handler for async routes
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Routes

/**
 * GET /api/trips - List all trips
 */
router.get(
  '/trips',
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be 0 or greater'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const trips = await TripService.getAllTrips();
      
      // Apply pagination if requested
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      
      let paginatedTrips = trips;
      if (limit) {
        paginatedTrips = trips.slice(offset, offset + limit);
      }
      
      res.json({
        trips: paginatedTrips,
        total: trips.length,
        limit: limit || trips.length,
        offset: offset,
      });
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

/**
 * POST /api/trips - Create a new trip
 */
router.post(
  '/trips',
  body('name').isString().trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be 1-255 characters'),
  body('organizerId').isString().trim().isLength({ min: 1 }).withMessage('Organizer ID is required'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { name, organizerId } = req.body;
      const trip = await TripService.createTrip(name, organizerId);
      res.status(201).json(trip);
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

/**
 * GET /api/trips/:id - Get a specific trip with full details
 */
router.get(
  '/trips/:id',
  param('id').isUUID().withMessage('Trip ID must be a valid UUID'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      res.json(trip);
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

/**
 * PUT /api/trips/:id/status - Update trip status
 */
router.put(
  '/trips/:id/status',
  param('id').isUUID().withMessage('Trip ID must be a valid UUID'),
  body('status').isIn(['created', 'surveying', 'voting', 'completed', 'cancelled']).withMessage('Invalid status'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const trip = await TripService.updateTripStatus(id, status);
      res.json(trip);
    } catch (error) {
      const dbError = handlePrismaError(error);
      if (dbError.code === 'RECORD_NOT_FOUND') {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.status(500).json({ error: dbError.message });
    }
  })
);

/**
 * DELETE /api/trips/:id - Delete a trip
 */
router.delete(
  '/trips/:id',
  param('id').isUUID().withMessage('Trip ID must be a valid UUID'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      await TripService.deleteTrip(id);
      res.status(204).send();
    } catch (error) {
      const dbError = handlePrismaError(error);
      if (dbError.code === 'RECORD_NOT_FOUND') {
        return res.status(404).json({ error: 'Trip not found' });
      }
      res.status(500).json({ error: dbError.message });
    }
  })
);

/**
 * GET /api/trips/:id/stats - Get trip statistics
 */
router.get(
  '/trips/:id/stats',
  param('id').isUUID().withMessage('Trip ID must be a valid UUID'),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await TripService.getTripStats(id);
      
      if (!stats) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      res.json(stats);
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

// Legacy endpoints (keeping for backward compatibility but will be deprecated)

router.post(
  '/trips/:id/participants',
  param('id').isUUID(),
  body('name').isString().notEmpty(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement with Prisma - for now return not implemented
    res.status(501).json({ error: 'Not implemented - use participant service endpoints' });
  })
);

router.post(
  '/trips/:id/preferences',
  param('id').isUUID(),
  body('participantId').isUUID(),
  body('budget').isString().notEmpty(),
  body('dates').isString().notEmpty(),
  body('vibe').isString().notEmpty(),
  body('destinations').isArray().notEmpty(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement with Prisma - for now return not implemented
    res.status(501).json({ error: 'Not implemented - use survey service endpoints' });
  })
);

router.get(
  '/trips/:id/recommendations',
  param('id').isUUID(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      res.json({ recommendations: trip.recommendations || [] });
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

router.post(
  '/trips/:id/votes',
  param('id').isUUID(),
  body('participantId').isUUID(),
  body('rankings').isArray({ min: 1 }),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    // TODO: Implement with Prisma - for now return not implemented
    res.status(501).json({ error: 'Not implemented - use voting service endpoints' });
  })
);

router.get(
  '/trips/:id/results',
  param('id').isUUID(),
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const trip = await TripService.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }
      
      res.json({ 
        votes: trip.votes || [], 
        results: trip.votingResults || [] 
      });
    } catch (error) {
      const dbError = handlePrismaError(error);
      res.status(500).json({ error: dbError.message });
    }
  })
);

export default router;


