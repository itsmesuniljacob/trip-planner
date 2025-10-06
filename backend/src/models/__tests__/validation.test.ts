import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  validateData,
  safeValidateData,
  validateArray,
  ValidationHelpers,
  type ValidationResult
} from '../validation.js';

describe('Validation Utilities', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(0),
    email: z.string().email()
  });

  describe('validateData', () => {
    it('should return success for valid data', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      const result = validateData(TestSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: '',
        age: -5,
        email: 'invalid-email'
      };

      const result = validateData(TestSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should handle unexpected errors gracefully', () => {
      const circularData = {};
      (circularData as any).self = circularData;

      const result = validateData(TestSchema, circularData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should format validation errors correctly', () => {
      const invalidData = {
        name: '',
        age: 30,
        email: 'john@example.com'
      };

      const result = validateData(TestSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.any(String),
          code: expect.any(String)
        })
      );
    });
  });

  describe('safeValidateData', () => {
    it('should return partial data on validation errors', () => {
      const mixedData = {
        name: 'John Doe',
        age: -5, // Invalid
        email: 'john@example.com'
      };

      const result = safeValidateData(TestSchema, mixedData);
      expect(result.success).toBe(false);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should handle non-object data gracefully', () => {
      const result = safeValidateData(TestSchema, 'not an object');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateArray', () => {
    const ItemSchema = z.object({
      id: z.number(),
      name: z.string().min(1)
    });

    it('should validate array of valid items', () => {
      const validArray = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      const result = validateArray(ItemSchema, validArray);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validArray);
    });

    it('should reject non-array input', () => {
      const result = validateArray(ItemSchema, 'not an array' as any);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'root',
          message: 'Expected an array',
          code: 'INVALID_TYPE'
        })
      );
    });

    it('should collect errors from invalid array items', () => {
      const invalidArray = [
        { id: 1, name: 'Valid Item' },
        { id: 'invalid', name: '' }, // Invalid item
        { id: 3, name: 'Another Valid Item' }
      ];

      const result = validateArray(ItemSchema, invalidArray);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(error => error.field.startsWith('[1]'))).toBe(true);
    });

    it('should return valid items when all are valid', () => {
      const validArray = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];

      const result = validateArray(ItemSchema, validArray);
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
    });
  });

  describe('ValidationHelpers', () => {
    describe('isValidUUID', () => {
      it('should validate correct UUIDs', () => {
        const validUUIDs = [
          '123e4567-e89b-12d3-a456-426614174000',
          '550e8400-e29b-41d4-a716-446655440000',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479'
        ];

        for (const uuid of validUUIDs) {
          expect(ValidationHelpers.isValidUUID(uuid)).toBe(true);
        }
      });

      it('should reject invalid UUIDs', () => {
        const invalidUUIDs = [
          'not-a-uuid',
          '123e4567-e89b-12d3-a456',
          '123e4567-e89b-12d3-a456-426614174000-extra',
          ''
        ];

        for (const uuid of invalidUUIDs) {
          expect(ValidationHelpers.isValidUUID(uuid)).toBe(false);
        }
      });
    });

    describe('isValidInternationalPhone', () => {
      it('should validate correct international phone numbers', () => {
        const validPhones = [
          '+1234567890',
          '+12345678901',
          '+123456789012345'
        ];

        for (const phone of validPhones) {
          expect(ValidationHelpers.isValidInternationalPhone(phone)).toBe(true);
        }
      });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '1234567890',
          '+0234567890',
          '+abc1234567890',
          '+1234-567-890'
        ];

        for (const phone of invalidPhones) {
          expect(ValidationHelpers.isValidInternationalPhone(phone)).toBe(false);
        }
      });
    });

    describe('isValidCurrencyCode', () => {
      it('should validate correct currency codes', () => {
        const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];

        for (const currency of validCurrencies) {
          expect(ValidationHelpers.isValidCurrencyCode(currency)).toBe(true);
        }
      });

      it('should reject invalid currency codes', () => {
        const invalidCurrencies = ['usd', 'USDD', 'US', '123'];

        for (const currency of invalidCurrencies) {
          expect(ValidationHelpers.isValidCurrencyCode(currency)).toBe(false);
        }
      });
    });

    describe('isFutureDate', () => {
      it('should validate future dates', () => {
        const futureDate = new Date(Date.now() + 86400000); // Tomorrow
        expect(ValidationHelpers.isFutureDate(futureDate)).toBe(true);
      });

      it('should reject past dates', () => {
        const pastDate = new Date('2020-01-01');
        expect(ValidationHelpers.isFutureDate(pastDate)).toBe(false);
      });
    });

    describe('isValidDateRange', () => {
      it('should validate correct date ranges', () => {
        const startDate = new Date('2025-06-01');
        const endDate = new Date('2025-06-15');
        expect(ValidationHelpers.isValidDateRange(startDate, endDate)).toBe(true);
      });

      it('should allow same start and end dates', () => {
        const date = new Date('2025-06-01');
        expect(ValidationHelpers.isValidDateRange(date, date)).toBe(true);
      });

      it('should reject invalid date ranges', () => {
        const startDate = new Date('2025-06-15');
        const endDate = new Date('2025-06-01');
        expect(ValidationHelpers.isValidDateRange(startDate, endDate)).toBe(false);
      });
    });

    describe('isValidMatchScore', () => {
      it('should validate correct match scores', () => {
        const validScores = [0, 0.5, 1, 0.95];

        for (const score of validScores) {
          expect(ValidationHelpers.isValidMatchScore(score)).toBe(true);
        }
      });

      it('should reject invalid match scores', () => {
        const invalidScores = [-0.1, 1.1, 2, -1];

        for (const score of invalidScores) {
          expect(ValidationHelpers.isValidMatchScore(score)).toBe(false);
        }
      });
    });
  });
});