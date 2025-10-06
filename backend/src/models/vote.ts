import { z } from 'zod';

// Vote interfaces
export interface VoteRanking {
  recommendationId: string;
  rank: number;
}

export interface Vote {
  id: string;
  participantId: string;
  tripId: string;
  rankings: VoteRanking[];
  submittedAt: Date;
}

export interface VotingRound {
  roundNumber: number;
  eliminatedRecommendation?: string;
  voteCounts: {
    recommendationId: string;
    votes: number;
  }[];
}

export interface VotingResult {
  id: string;
  tripId: string;
  winningRecommendationId: string;
  rounds: VotingRound[];
  finalTally: {
    recommendationId: string;
    finalVotes: number;
    eliminationRound?: number;
  }[];
  calculatedAt: Date;
}

// Zod validation schemas
export const VoteRankingSchema = z.object({
  recommendationId: z.string()
    .uuid('Recommendation ID must be a valid UUID'),
  rank: z.number()
    .int('Rank must be an integer')
    .min(1, 'Rank must be at least 1')
    .max(10, 'Rank cannot exceed 10')
});

export const CreateVoteSchema = z.object({
  participantId: z.string()
    .uuid('Participant ID must be a valid UUID'),
  tripId: z.string()
    .uuid('Trip ID must be a valid UUID'),
  rankings: z.array(VoteRankingSchema)
    .min(1, 'At least one ranking is required')
    .max(10, 'Maximum 10 rankings allowed')
    .refine(rankings => {
      // Check for duplicate recommendation IDs
      const recommendationIds = rankings.map(r => r.recommendationId);
      return new Set(recommendationIds).size === recommendationIds.length;
    }, {
      message: 'Each recommendation can only be ranked once'
    })
    .refine(rankings => {
      // Check for duplicate ranks
      const ranks = rankings.map(r => r.rank);
      return new Set(ranks).size === ranks.length;
    }, {
      message: 'Each rank can only be used once'
    })
    .refine(rankings => {
      // Check that ranks are consecutive starting from 1
      const sortedRanks = rankings.map(r => r.rank).sort((a, b) => a - b);
      for (let i = 0; i < sortedRanks.length; i++) {
        if (sortedRanks[i] !== i + 1) {
          return false;
        }
      }
      return true;
    }, {
      message: 'Rankings must be consecutive starting from 1 (e.g., 1, 2, 3...)'
    })
});

export const VoteSchema = z.object({
  id: z.string().uuid(),
  participantId: z.string().uuid(),
  tripId: z.string().uuid(),
  rankings: z.array(VoteRankingSchema).min(1).max(10),
  submittedAt: z.date()
});

export const VotingRoundSchema = z.object({
  roundNumber: z.number().int().min(1),
  eliminatedRecommendation: z.string().uuid().optional(),
  voteCounts: z.array(z.object({
    recommendationId: z.string().uuid(),
    votes: z.number().int().min(0)
  })).min(1)
});

export const VotingResultSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  winningRecommendationId: z.string().uuid(),
  rounds: z.array(VotingRoundSchema).min(1),
  finalTally: z.array(z.object({
    recommendationId: z.string().uuid(),
    finalVotes: z.number().int().min(0),
    eliminationRound: z.number().int().min(1).optional()
  })).min(1),
  calculatedAt: z.date()
});

// Type exports for validation
export type CreateVoteInput = z.infer<typeof CreateVoteSchema>;
export type ValidatedVote = z.infer<typeof VoteSchema>;
export type ValidatedVotingResult = z.infer<typeof VotingResultSchema>;