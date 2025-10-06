import { z } from 'zod';

// Participant interface
export interface Participant {
  id: string;
  tripId: string;
  name: string;
  phoneNumber: string;
  hasCompletedSurvey: boolean;
  hasVoted: boolean;
  surveyToken: string;
  voteToken: string;
  createdAt: Date;
}

// Phone number validation regex (international format)
const phoneRegex = /^\+[1-9]\d{1,14}$/;

// Zod validation schemas
export const CreateParticipantSchema = z.object({
  tripId: z.string()
    .uuid('Trip ID must be a valid UUID'),
  name: z.string()
    .min(1, 'Participant name is required')
    .max(255, 'Participant name must be less than 255 characters')
    .trim(),
  phoneNumber: z.string()
    .regex(phoneRegex, 'Phone number must be in international format (e.g., +1234567890)')
    .min(8, 'Phone number must be at least 8 digits')
    .max(16, 'Phone number must be less than 16 digits')
});

export const UpdateParticipantSchema = z.object({
  name: z.string()
    .min(1, 'Participant name is required')
    .max(255, 'Participant name must be less than 255 characters')
    .trim()
    .optional(),
  phoneNumber: z.string()
    .regex(phoneRegex, 'Phone number must be in international format (e.g., +1234567890)')
    .min(8, 'Phone number must be at least 8 digits')
    .max(16, 'Phone number must be less than 16 digits')
    .optional(),
  hasCompletedSurvey: z.boolean().optional(),
  hasVoted: z.boolean().optional()
});

export const ParticipantSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  name: z.string().min(1).max(255),
  phoneNumber: z.string().regex(phoneRegex),
  hasCompletedSurvey: z.boolean(),
  hasVoted: z.boolean(),
  surveyToken: z.string().min(1),
  voteToken: z.string().min(1),
  createdAt: z.date()
});

// Type exports for validation
export type CreateParticipantInput = z.infer<typeof CreateParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof UpdateParticipantSchema>;
export type ValidatedParticipant = z.infer<typeof ParticipantSchema>;