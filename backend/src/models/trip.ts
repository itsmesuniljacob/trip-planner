import { z } from 'zod';
import type { Participant } from './participant.js';
import type { SurveyResponse } from './surveyResponse.js';
import type { Recommendation } from './recommendation.js';
import type { Vote } from './vote.js';

// Trip status enum
export const TripStatus = {
  CREATED: 'created',
  SURVEYING: 'surveying', 
  VOTING: 'voting',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export type TripStatusType = typeof TripStatus[keyof typeof TripStatus];

// Trip interface
export interface Trip {
  id: string;
  name: string;
  organizerId: string;
  status: TripStatusType;
  createdAt: Date;
  updatedAt: Date;
  participants?: Participant[];
  surveyResponses?: SurveyResponse[];
  recommendations?: Recommendation[];
  votes?: Vote[];
}

// Zod validation schemas
export const TripStatusSchema = z.enum(['created', 'surveying', 'voting', 'completed', 'cancelled']);

export const CreateTripSchema = z.object({
  name: z.string()
    .min(1, 'Trip name is required')
    .max(255, 'Trip name must be less than 255 characters')
    .trim(),
  organizerId: z.string()
    .uuid('Organizer ID must be a valid UUID')
});

export const UpdateTripSchema = z.object({
  name: z.string()
    .min(1, 'Trip name is required')
    .max(255, 'Trip name must be less than 255 characters')
    .trim()
    .optional(),
  status: TripStatusSchema.optional()
});

export const TripSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  organizerId: z.string().uuid(),
  status: TripStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// Type exports for validation
export type CreateTripInput = z.infer<typeof CreateTripSchema>;
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>;
export type ValidatedTrip = z.infer<typeof TripSchema>;