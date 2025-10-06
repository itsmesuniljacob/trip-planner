import { describe, it, expect } from '@jest/globals';
import {
  VoteRankingSchema,
  CreateVoteSchema,
  VoteSchema,
  VotingResultSchema,
  type CreateVoteInput
} from '../vote.js';
import { validateData } from '../validation.js';

describe('Vote Model Validation', () => {
  describe('VoteRankingSchema', () => {
    it('should validate a valid vote ranking', () => {
      const validRanking = {
        recommendationId: '123e4567-e89b-12d3-a456-426614174000',
        rank: 1
      };

      const result = validateData(VoteRankingSchema, validRanking);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validRanking);
    });

    it('should reject invalid rank values', () => {
      const invalidRanks = [0, -1, 11, 1.5];
      
      for (const rank of invalidRanks) {
        const invalidRanking = {
          recommendationId: '123e4567-e89b-12d3-a456-426614174000',
          rank
        };

        const result = validateData(VoteRankingSchema, invalidRanking);
        expect(result.success).toBe(false);
      }
    });

    it('should reject invalid UUID for recommendationId', () => {
      const invalidRanking = {
        recommendationId: 'invalid-uuid',
        rank: 1
      };

      const result = validateData(VoteRankingSchema, invalidRanking);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'recommendationId',
          message: 'Recommendation ID must be a valid UUID'
        })
      );
    });
  });

  describe('CreateVoteSchema', () => {
    it('should validate a valid vote', () => {
      const validVote: CreateVoteInput = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        rankings: [
          { recommendationId: '123e4567-e89b-12d3-a456-426614174002', rank: 1 },
          { recommendationId: '123e4567-e89b-12d3-a456-426614174003', rank: 2 },
          { recommendationId: '123e4567-e89b-12d3-a456-426614174004', rank: 3 }
        ]
      };

      const result = validateData(CreateVoteSchema, validVote);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validVote);
    });

    it('should reject duplicate recommendation IDs', () => {
      const invalidVote = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        rankings: [
          { recommendationId: '123e4567-e89b-12d3-a456-426614174002', rank: 1 },
          { recommendationId: '123e4567-e89b-12d3-a456-426614174002', rank: 2 }
        ]
      };

      const result = validateData(CreateVoteSchema, invalidVote);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Each recommendation can only be ranked once'
        })
      );
    });

    it('should reject duplicate ranks', () => {
      const invalidVote = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        rankings: [
          { recommendationId: '123e4567-e89b-12d3-a456-426614174002', rank: 1 },
          { recommendationId: '123e4567-e89b-12d3-a456-426614174003', rank: 1 }
        ]
      };

      const result = validateData(CreateVoteSchema, invalidVote);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Each rank can only be used once'
        })
      );
    });

    it('should reject non-consecutive ranks', () => {
      const invalidVote = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        rankings: [
          { recommendationId: '123e4567-e89b-12d3-a456-426614174002', rank: 1 },
          { recommendationId: '123e4567-e89b-12d3-a456-426614174003', rank: 3 }
        ]
      };

      const result = validateData(CreateVoteSchema, invalidVote);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: 'Rankings must be consecutive starting from 1 (e.g., 1, 2, 3...)'
        })
      );
    });

    it('should reject empty rankings array', () => {
      const invalidVote = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        tripId: '123e4567-e89b-12d3-a456-426614174001',
        rankings: []
      };

      const result = validateData(CreateVoteSchema, invalidVote);
      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'rankings',
          message: 'At least one ranking is required'
        })
      );
    });
  });
});