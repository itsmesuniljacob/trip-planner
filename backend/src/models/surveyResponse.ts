import { z } from 'zod';

// Survey response interfaces
export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface AvailableDates {
  startDate: Date;
  endDate: Date;
  flexibility: 'fixed' | 'flexible' | 'very-flexible';
}

export interface DestinationPreferences {
  regions: string[];
  climatePreference: string;
  activityTypes: string[];
  accommodationStyle: string;
}

export interface SurveyResponse {
  id: string;
  participantId: string;
  tripId: string;
  budgetRange: BudgetRange;
  availableDates: AvailableDates;
  destinationPreferences: DestinationPreferences;
  travelVibe: string;
  additionalNotes?: string;
  submittedAt: Date;
}

// Zod validation schemas
export const BudgetRangeSchema = z.object({
  min: z.number()
    .min(0, 'Minimum budget must be non-negative')
    .max(1000000, 'Minimum budget must be reasonable'),
  max: z.number()
    .min(0, 'Maximum budget must be non-negative')
    .max(1000000, 'Maximum budget must be reasonable'),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase ISO code (e.g., USD, EUR)')
}).refine(data => data.max >= data.min, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['max']
});

export const DateFlexibilitySchema = z.enum(['fixed', 'flexible', 'very-flexible']);

export const AvailableDatesSchema = z.object({
  startDate: z.string()
    .datetime('Start date must be a valid ISO datetime')
    .transform((str) => new Date(str)),
  endDate: z.string()
    .datetime('End date must be a valid ISO datetime')
    .transform((str) => new Date(str)),
  flexibility: DateFlexibilitySchema
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export const DestinationPreferencesSchema = z.object({
  regions: z.array(z.string().min(1))
    .min(1, 'At least one region preference is required')
    .max(10, 'Maximum 10 region preferences allowed'),
  climatePreference: z.string()
    .min(1, 'Climate preference is required')
    .max(100, 'Climate preference must be less than 100 characters'),
  activityTypes: z.array(z.string().min(1))
    .min(1, 'At least one activity type is required')
    .max(15, 'Maximum 15 activity types allowed'),
  accommodationStyle: z.string()
    .min(1, 'Accommodation style is required')
    .max(100, 'Accommodation style must be less than 100 characters')
});

export const CreateSurveyResponseSchema = z.object({
  participantId: z.string()
    .uuid('Participant ID must be a valid UUID'),
  tripId: z.string()
    .uuid('Trip ID must be a valid UUID'),
  budgetRange: BudgetRangeSchema,
  availableDates: AvailableDatesSchema,
  destinationPreferences: DestinationPreferencesSchema,
  travelVibe: z.string()
    .min(1, 'Travel vibe is required')
    .max(200, 'Travel vibe must be less than 200 characters')
    .trim(),
  additionalNotes: z.string()
    .max(1000, 'Additional notes must be less than 1000 characters')
    .trim()
    .optional()
});

export const SurveyResponseSchema = z.object({
  id: z.string().uuid(),
  participantId: z.string().uuid(),
  tripId: z.string().uuid(),
  budgetRange: BudgetRangeSchema,
  availableDates: AvailableDatesSchema,
  destinationPreferences: DestinationPreferencesSchema,
  travelVibe: z.string().min(1).max(200),
  additionalNotes: z.string().max(1000).optional(),
  submittedAt: z.date()
});

// Type exports for validation
export type CreateSurveyResponseInput = z.infer<typeof CreateSurveyResponseSchema>;
export type ValidatedSurveyResponse = z.infer<typeof SurveyResponseSchema>;