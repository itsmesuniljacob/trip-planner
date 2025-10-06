import { describe, it, expect } from '@jest/globals';
import {
  BudgetRangeSchema,
  AvailableDatesSchema,
  DestinationPreferencesSchema,
  CreateSurveyResponseSchema,
  SurveyResponseSchema,
  type CreateSurveyResponseInput
} from '../surveyResponse.js';
import { validateData } from '../validation.js';

describe('SurveyResponse Model Validation', () => {
  describe('BudgetRangeSchema', () => {
    it('should validate a valid budget range', () => {
      const validBudget = {
        min: 1000,
        max: 5000,
        currency: 'USD'
      };

      const result = validateData(BudgetRangeSchema, validBudget);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validBudget);
    });

    it('should reject budget with max less than min', () => {
      const invalidBudget = {
        min: 5000,
        max: 1000,
        currency: 'USD'
      };

      const result = validateData(BudgetRangeSchema, invalidBudget);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'max',
          message: 'Maximum budget must be greater than or equal to minimum budget'
        })
      );
    });

    it('should reject negative budget values', () => {
      const invalidBudget = {
        min: -100,
        max: 1000,
        currency: 'USD'
      };

      const result = validateData(BudgetRangeSchema, invalidBudget);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'min',
          message: 'Minimum budget must be non-negative'
        })
      );
    });

    it('should reject invalid currency codes', () => {
      const invalidCurrencies = ['us', 'USDD', 'usd', '123'];
      
      for (const currency of invalidCurrencies) {
        const invalidBudget = {
          min: 1000,
          max: 5000,
          currency
        };

        const result = validateData(BudgetRangeSchema, invalidBudget);
        expect(result.success).toBe(false);
      }
    });

    it('should accept valid currency codes', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD'];
      
      for (const currency of validCurrencies) {
        const validBudget = {
          min: 1000,
          max: 5000,
          currency
        };

        const result = validateData(BudgetRangeSchema, validBudget);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('AvailableDatesSchema', () => {
    it('should validate valid date range', () => {
      const futureDate1 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const futureDate2 = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days from now
      
      const validDates = {
        startDate: futureDate1,
        endDate: futureDate2,
        flexibility: 'flexible' as const
      };

      const result = validateData(AvailableDatesSchema, validDates);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validDates);
    });

    it('should reject past start dates', () => {
      const pastDate = new Date('2020-01-01');
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const invalidDates = {
        startDate: pastDate,
        endDate: futureDate,
        flexibility: 'fixed' as const
      };

      const result = validateData(AvailableDatesSchema, invalidDates);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'startDate',
          message: 'Start date must be in the future'
        })
      );
    });
  });

  describe('DestinationPreferencesSchema', () => {
    it('should validate valid destination preferences', () => {
      const validPreferences = {
        regions: ['Europe', 'Asia'],
        climatePreference: 'Tropical',
        activityTypes: ['Beach', 'Culture', 'Adventure'],
        accommodationStyle: 'Hotel'
      };

      const result = validateData(DestinationPreferencesSchema, validPreferences);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validPreferences);
    });

    it('should reject empty regions array', () => {
      const invalidPreferences = {
        regions: [],
        climatePreference: 'Tropical',
        activityTypes: ['Beach'],
        accommodationStyle: 'Hotel'
      };

      const result = validateData(DestinationPreferencesSchema, invalidPreferences);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'regions',
          message: 'At least one region preference is required'
        })
      );
    });
  });

  describe('CreateSurveyResponseSchema', () => {
    it('should validate a complete survey response', () => {
      const validResponse: CreateSurveyResponseInput = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        budgetRange: {
          min: 1000,
          max: 5000,
          currency: 'USD'
        },
        availableDates: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          flexibility: 'flexible'
        },
        destinationPreferences: {
          regions: ['Europe', 'Asia'],
          climatePreference: 'Tropical',
          activityTypes: ['Beach', 'Culture'],
          accommodationStyle: 'Hotel'
        },
        travelVibe: 'Relaxing beach vacation',
        additionalNotes: 'Looking forward to this trip!'
      };

      const result = validateData(CreateSurveyResponseSchema, validResponse);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validResponse);
    });

    it('should trim travel vibe whitespace', () => {
      const responseWithWhitespace = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        budgetRange: { min: 1000, max: 5000, currency: 'USD' },
        availableDates: {
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          flexibility: 'flexible' as const
        },
        destinationPreferences: {
          regions: ['Europe'],
          climatePreference: 'Tropical',
          activityTypes: ['Beach'],
          accommodationStyle: 'Hotel'
        },
        travelVibe: '  Relaxing vacation  '
      };

      const result = validateData(CreateSurveyResponseSchema, responseWithWhitespace);
      expect(result.success).toBe(true);
      expect(result.data?.travelVibe).toBe('Relaxing vacation');
    });
  });
});