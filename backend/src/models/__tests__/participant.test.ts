import { describe, it, expect } from '@jest/globals';
import {
  CreateParticipantSchema,
  UpdateParticipantSchema,
  ParticipantSchema,
  type CreateParticipantInput,
  type UpdateParticipantInput
} from '../participant.js';
import { validateData } from '../validation.js';

describe('Participant Model Validation', () => {
  describe('CreateParticipantSchema', () => {
    it('should validate a valid participant creation input', () => {
      const validInput: CreateParticipantInput = {
        tripId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };

      const result = validateData(CreateParticipantSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should reject empty participant name', () => {
      const invalidInput = {
        tripId: '123e4567-e89b-12d3-a456-426614174000',
        name: '',
        phoneNumber: '+1234567890'
      };

      const result = validateData(CreateParticipantSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Participant name is required'
        })
      );
    });

    it('should trim whitespace from participant name', () => {
      const inputWithWhitespace = {
        tripId: '123e4567-e89b-12d3-a456-426614174000',
        name: '  John Doe  ',
        phoneNumber: '+1234567890'
      };

      const result = validateData(CreateParticipantSchema, inputWithWhitespace);
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('John Doe');
    });

    it('should reject participant name that is too long', () => {
      const invalidInput = {
        tripId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'a'.repeat(256),
        phoneNumber: '+1234567890'
      };

      const result = validateData(CreateParticipantSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: 'Participant name must be less than 255 characters'
        })
      );
    });

    it('should validate international phone number formats', () => {
      const validPhoneNumbers = [
        '+1234567890',
        '+12345678901',
        '+123456789012',
        '+1234567890123',
        '+12345678901234',
        '+123456789012345'
      ];

      for (const phoneNumber of validPhoneNumbers) {
        const input = {
          tripId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          phoneNumber
        };

        const result = validateData(CreateParticipantSchema, input);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid phone number formats', () => {
      const invalidPhoneNumbers = [
        '1234567890',      // Missing +
        '+',               // Just +
        '+0234567890',     // Starts with 0
        '+12345',          // Too short
        '+12345678901234567', // Too long
        '+abc1234567890',  // Contains letters
        '+1234-567-890',   // Contains dashes
        '+1 234 567 890'   // Contains spaces
      ];

      for (const phoneNumber of invalidPhoneNumbers) {
        const input = {
          tripId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Doe',
          phoneNumber
        };

        const result = validateData(CreateParticipantSchema, input);
        expect(result.success).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            field: 'phoneNumber'
          })
        );
      }
    });

    it('should reject invalid UUID for tripId', () => {
      const invalidInput = {
        tripId: 'invalid-uuid',
        name: 'John Doe',
        phoneNumber: '+1234567890'
      };

      const result = validateData(CreateParticipantSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tripId',
          message: 'Trip ID must be a valid UUID'
        })
      );
    });
  });

  describe('UpdateParticipantSchema', () => {
    it('should validate a valid participant update input', () => {
      const validInput: UpdateParticipantInput = {
        name: 'Jane Doe',
        phoneNumber: '+9876543210',
        hasCompletedSurvey: true,
        hasVoted: false
      };

      const result = validateData(UpdateParticipantSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should allow partial updates', () => {
      const validInput: UpdateParticipantInput = {
        hasCompletedSurvey: true
      };

      const result = validateData(UpdateParticipantSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should validate boolean fields', () => {
      const validInput = {
        hasCompletedSurvey: true,
        hasVoted: false
      };

      const result = validateData(UpdateParticipantSchema, validInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validInput);
    });

    it('should reject invalid boolean values', () => {
      const invalidInput = {
        hasCompletedSurvey: 'true' // String instead of boolean
      };

      const result = validateData(UpdateParticipantSchema, invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'hasCompletedSurvey'
        })
      );
    });

    it('should allow empty update object', () => {
      const emptyInput = {};

      const result = validateData(UpdateParticipantSchema, emptyInput);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
    });
  });

  describe('ParticipantSchema', () => {
    it('should validate a complete participant object', () => {
      const validParticipant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        hasCompletedSurvey: false,
        hasVoted: false,
        surveyToken: 'survey-token-123',
        voteToken: 'vote-token-123',
        createdAt: new Date('2024-01-01T00:00:00Z')
      };

      const result = validateData(ParticipantSchema, validParticipant);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validParticipant);
    });

    it('should reject participant with invalid UUID', () => {
      const invalidParticipant = {
        id: 'invalid-uuid',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        hasCompletedSurvey: false,
        hasVoted: false,
        surveyToken: 'survey-token-123',
        voteToken: 'vote-token-123',
        createdAt: new Date()
      };

      const result = validateData(ParticipantSchema, invalidParticipant);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'id'
        })
      );
    });

    it('should reject participant with empty tokens', () => {
      const invalidParticipant = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        hasCompletedSurvey: false,
        hasVoted: false,
        surveyToken: '',
        voteToken: 'vote-token-123',
        createdAt: new Date()
      };

      const result = validateData(ParticipantSchema, invalidParticipant);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'surveyToken'
        })
      );
    });
  });
});