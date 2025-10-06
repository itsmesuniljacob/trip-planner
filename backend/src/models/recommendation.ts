import { z } from 'zod';

// Recommendation interfaces
export interface Destination {
  name: string;
  country: string;
  region: string;
  description: string;
  imageUrl: string;
}

export interface EstimatedCost {
  min: number;
  max: number;
  currency: string;
}

export interface Recommendation {
  id: string;
  tripId: string;
  destination: Destination;
  rationale: string;
  matchScore: number;
  estimatedCost: EstimatedCost;
  bestTimeToVisit: string;
  keyActivities: string[];
  generatedBy: 'openai' | 'claude';
  createdAt: Date;
}

// Zod validation schemas
export const DestinationSchema = z.object({
  name: z.string()
    .min(1, 'Destination name is required')
    .max(255, 'Destination name must be less than 255 characters')
    .trim(),
  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),
  region: z.string()
    .min(1, 'Region is required')
    .max(100, 'Region must be less than 100 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .max(500, 'Image URL must be less than 500 characters')
});

export const EstimatedCostSchema = z.object({
  min: z.number()
    .min(0, 'Minimum cost must be non-negative')
    .max(1000000, 'Minimum cost must be reasonable'),
  max: z.number()
    .min(0, 'Maximum cost must be non-negative')
    .max(1000000, 'Maximum cost must be reasonable'),
  currency: z.string()
    .length(3, 'Currency must be a 3-letter ISO code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase ISO code (e.g., USD, EUR)')
}).refine(data => data.max >= data.min, {
  message: 'Maximum cost must be greater than or equal to minimum cost',
  path: ['max']
});

export const AIProviderSchema = z.enum(['openai', 'claude']);

export const CreateRecommendationSchema = z.object({
  tripId: z.string()
    .uuid('Trip ID must be a valid UUID'),
  destination: DestinationSchema,
  rationale: z.string()
    .min(1, 'Rationale is required')
    .max(2000, 'Rationale must be less than 2000 characters')
    .trim(),
  matchScore: z.number()
    .min(0, 'Match score must be between 0 and 1')
    .max(1, 'Match score must be between 0 and 1'),
  estimatedCost: EstimatedCostSchema,
  bestTimeToVisit: z.string()
    .min(1, 'Best time to visit is required')
    .max(100, 'Best time to visit must be less than 100 characters')
    .trim(),
  keyActivities: z.array(z.string().min(1).max(100))
    .min(1, 'At least one key activity is required')
    .max(10, 'Maximum 10 key activities allowed'),
  generatedBy: AIProviderSchema
});

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  destination: DestinationSchema,
  rationale: z.string().min(1).max(2000),
  matchScore: z.number().min(0).max(1),
  estimatedCost: EstimatedCostSchema,
  bestTimeToVisit: z.string().min(1).max(100),
  keyActivities: z.array(z.string().min(1).max(100)).min(1).max(10),
  generatedBy: AIProviderSchema,
  createdAt: z.date()
});

// Type exports for validation
export type CreateRecommendationInput = z.infer<typeof CreateRecommendationSchema>;
export type ValidatedRecommendation = z.infer<typeof RecommendationSchema>;