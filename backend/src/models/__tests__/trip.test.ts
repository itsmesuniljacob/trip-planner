import { describe, it, expect } from '@jest/globals';
import {
  TripStatus,
  CreateTripSchema,
  UpdateTripSchema,
  TripSchema,
  type CreateTripInput,
  type UpdateTripInput
} from '../trip.js';
import { validateData } from '../validation.js';

describe('Trip Model Validation', () => {
  describe('CreateTripSchema', () => {
    it('should validate a valid trip creation input', () => {
      const validInput: CreateTripInput = {
        name: 'Summer Vacation 2024',
        organizerId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = validateData(CreateTripSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should reject empty trip name', () => {
      const invalidInput = {
        name: '',
        organizerId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = validateData(CreateTripSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Trip name is required'
        })
      );
    });

    it('should reject trip name that is too long', () => {
      const invalidInput = {
        name: 'a'.repeat(256),
        organizerId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = validateData(CreateTripSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Trip name must be less than 255 characters'
        })
      );
    });

    it('should trim whitespace from trip name', () => {
      const inputWithWhitespace = {
        name: '  Summer Vacation 2024  ',
        organizerId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = validateData(CreateTripSchema, inputWithWhitespace);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Summer Vacation 2024');
    });

    it('should reject invalid UUID for organizerId', () => {
      const invalidInput = {
        name: 'Summer Vacation 2024',
        organizerId: 'invalid-uuid'
      };

      const result = validateData(CreateTripSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'organizerId',
          message: 'Organizer ID must be a valid UUID'
        })
      );
    });

    it('should reject missing required fields', () => {
      const invalidInput = {};

      const result = validateData(CreateTripSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateTripSchema', () => {
    it('should validate a valid trip update input', () => {
      const validInput: UpdateTripInput = {
        name: 'Updated Summer Vacation 2024',
        status: 'surveying'
      };

      const result = validateData(UpdateTripSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should allow partial updates', () => {
      const validInput: UpdateTripInput = {
        name: 'Updated Trip Name'
      };

      const result = validateData(UpdateTripSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate status enum values', () => {
      const validStatuses = ['created', 'surveying', 'voting', 'completed', 'cancelled'];
      
      for (const status of validStatuses) {
        const input = { status };
        const result = validateData(UpdateTripSchema, input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid status values', () => {
      const invalidInput = {
        status: 'invalid-status'
      };

      const result = validateData(UpdateTripSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'status'
        })
      );
    });

    it('should allow empty update object', () => {
      const emptyInput = {};

      const result = validateData(UpdateTripSchema, emptyInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('TripSchema', () => {
    it('should validate a complete trip object', () => {
      const validTrip = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Summer Vacation 2024',
        organizerId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'created',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      };

      const result = validateData(TripSchema, validTrip);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validTrip);
    });

    it('should reject trip with invalid UUID', () => {
      const invalidTrip = {
        id: 'invalid-uuid',
        name: 'Summer Vacation 2024',
        organizerId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'created',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = validateData(TripSchema, invalidTrip);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id'
        })
      );
    });
  });

  describe('TripStatus', () => {
    it('should contain all expected status values', () => {
      expect(TripStatus.CREATED).toBe('created');
      expect(TripStatus.SURVEYING).toBe('surveying');
      expect(TripStatus.VOTING).toBe('voting');
      expect(TripStatus.COMPLETED).toBe('completed');
      expect(TripStatus.CANCELLED).toBe('cancelled');
    });
  });
});