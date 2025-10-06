import { Request, Response, NextFunction } from 'express';

// Extended Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Mock authentication middleware for MVP
 * In production, this would validate JWT tokens and extract user information
 * For now, we'll use a simple header-based approach for testing
 */
export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // For MVP, we'll use a simple X-User-Id header
  // In production, this would parse and validate JWT tokens
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide X-User-Id header for authentication'
    });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(401).json({
      error: 'Invalid authentication',
      message: 'User ID must be a valid UUID'
    });
  }

  // Attach user to request
  req.user = { id: userId };
  next();
}

/**
 * Optional authentication middleware
 * Attaches user if present but doesn't require it
 */
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.headers['x-user-id'] as string;
  
  if (userId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userId)) {
      req.user = { id: userId };
    }
  }
  
  next();
}

/**
 * Authorization middleware to check if user is trip organizer
 */
export function requireTripOrganizer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // This will be implemented when we have the trip service integrated
  // For now, we'll skip this check in MVP
  next();
}