import { describe, it, expect } from '@jest/globals';
import {
  DestinationSchema,
  EstimatedCostSchema,
  CreateRecommendationSchema,
  RecommendationSchema,
  type CreateRecommendationInput
} from '../recommendation.js';
import { validateData } from '../validation.js';

describe('Recommendation Model Validation', () => {
  describe('DestinationSchema', () => {
    it('should validate a valid destination', () => {
      const validDestination = {
        name: 'Bali, Indonesia',
        country: 'Indonesia',
        region: 'Southeast Asia',
        description: 'A tropical paradise with beautiful beaches and rich culture.',
        imageUrl: 'https://example.com/bali.jpg'
      };

      const result = validateData(DestinationSchema, validDestination);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validDestination);
    });

    it('should trim whitespace from destination fields', () => {
      const destinationWithWhitespace = {
        name: '  Bali, Indonesia  ',
        country: '  Indonesia  ',
        region: '  Southeast Asia  ',
        description: '  A tropical paradise.  ',
        imageUrl: 'https://example.com/bali.jpg'
      };

      const result = validateData(DestinationSchema, destinationWithWhitespace);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Bali, Indonesia');
      expect(result.data?.country).toBe('Indonesia');
      expect(result.data?.region).toBe('Southeast Asia');
      expect(result.data?.description).toBe('A tropical paradise.');
    });

    it('should reject invalid image URLs', () => {
      const invalidDestination = {
        name: 'Bali, Indonesia',
        country: 'Indonesia',
        region: 'Southeast Asia',
        description: 'A tropical paradise.',
        imageUrl: 'not-a-valid-url'
      };

      const result = validateData(DestinationSchema, invalidDestination);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'imageUrl',
          message: 'Image URL must be a valid URL'
        })
      );
    });

    it('should reject empty required fields', () => {
      const invalidDestination = {
        name: '',
        country: 'Indonesia',
        region: 'Southeast Asia',
        description: 'A tropical paradise.',
        imageUrl: 'https://example.com/bali.jpg'
      };

      const result = validateData(DestinationSchema, invalidDestination);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Destination name is required'
        })
      );
    });
  });

  describe('EstimatedCostSchema', () => {
    it('should validate a valid cost range', () => {
      const validCost = {
        min: 1000,
        max: 3000,
        currency: 'USD'
      };

      const result = validateData(EstimatedCostSchema, validCost);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validCost);
    });

    it('should reject cost with max less than min', () => {
      const invalidCost = {
        min: 3000,
        max: 1000,
        currency: 'USD'
      };

      const result = validateData(EstimatedCostSchema, invalidCost);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'max',
          message: 'Maximum cost must be greater than or equal to minimum cost'
        })
      );
    });
  });

  describe('CreateRecommendationSchema', () => {
    it('should validate a complete recommendation', () => {
      const validRecommendation: CreateRecommendationInput = {
        tripId: '123e4567-e89b-12d3-a456-426614174000',
        destination: {
          name: 'Bali, Indonesia',
          country: 'Indonesia',
          region: 'Southeast Asia',
          description: 'A tropical paradise with beautiful beaches.',
          imageUrl: 'https://example.com/bali.jpg'
        },
        rationale: 'Perfect match for your group preferences.',
        matchScore: 0.95,
        estimatedCost: {
          min: 1500,
          max: 2500,
          currency: 'USD'
        },
        bestTimeToVisit: 'April to October',
        keyActivities: ['Beach relaxation', 'Temple visits', 'Surfing'],
        generatedBy: 'openai'
      };

      const result = validateData(CreateRecommendationSchema, validRecommendation);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validRecommendation);
    });

    it('should reject invalid match scores', () => {
      const invalidScores = [-0.1, 1.1, 2.0];
      
      for (const matchScore of invalidScores) {
        const invalidRecommendation = {
          tripId: '123e4567-e89b-12d3-a456-426614174000',
          destination: {
            name: 'Bali',
            country: 'Indonesia',
            region: 'Asia',
            description: 'Nice place',
            imageUrl: 'https://example.com/bali.jpg'
          },
          rationale: 'Good match',
          matchScore,
          estimatedCost: { min: 1000, max: 2000, currency: 'USD' },
          bestTimeToVisit: 'Summer',
          keyActivities: ['Beach'],
          generatedBy: 'openai' as const
        };

        const result = validateData(CreateRecommendationSchema, invalidRecommendation);
        expect(result.success).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'matchScore'
          })
        );
      }
    });
  });
});