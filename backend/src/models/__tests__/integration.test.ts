import { describe, it, expect } from '@jest/globals';
import * as Models from '../index.js';

describe('Models Integration', () => {
  it('should export all model interfaces and schemas', () => {
    // Check that all main exports are available
    expect(Models.TripStatus).toBeDefined();
    expect(Models.CreateTripSchema).toBeDefined();
    expect(Models.TripSchema).toBeDefined();
    
    expect(Models.CreateParticipantSchema).toBeDefined();
    expect(Models.ParticipantSchema).toBeDefined();
    
    expect(Models.BudgetRangeSchema).toBeDefined();
    expect(Models.CreateSurveyResponseSchema).toBeDefined();
    expect(Models.SurveyResponseSchema).toBeDefined();
    
    expect(Models.CreateRecommendationSchema).toBeDefined();
    expect(Models.RecommendationSchema).toBeDefined();
    
    expect(Models.CreateVoteSchema).toBeDefined();
    expect(Models.VoteSchema).toBeDefined();
    expect(Models.VotingResultSchema).toBeDefined();
    
    expect(Models.validateData).toBeDefined();
    expect(Models.ValidationHelpers).toBeDefined();
  });

  it('should validate a complete trip creation workflow', () => {
    // Test creating a trip
    const tripData = {
      name: 'Summer Vacation 2024',
      organizerId: '123e4567-e89b-12d3-a456-426614174000'
    };
    
    const tripResult = Models.validateData(Models.CreateTripSchema, tripData);
    expect(tripResult.success).toBe(true);
    
    // Test creating a participant
    const participantData = {
      tripId: '123e4567-e89b-12d3-a456-426614174001',
      name: 'John Doe',
      phoneNumber: '+1234567890'
    };
    
    const participantResult = Models.validateData(Models.CreateParticipantSchema, participantData);
    expect(participantResult.success).toBe(true);
    
    // Test creating a survey response
    const surveyData = {
      participantId: '123e4567-e89b-12d3-a456-426614174002',
      tripId: '123e4567-e89b-12d3-a456-426614174001',
      budgetRange: {
        min: 1000,
        max: 5000,
        currency: 'USD'
      },
      availableDates: {
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        flexibility: 'flexible' as const
      },
      destinationPreferences: {
        regions: ['Europe', 'Asia'],
        climatePreference: 'Tropical',
        activityTypes: ['Beach', 'Culture'],
        accommodationStyle: 'Hotel'
      },
      travelVibe: 'Relaxing beach vacation'
    };
    
    const surveyResult = Models.validateData(Models.CreateSurveyResponseSchema, surveyData);
    expect(surveyResult.success).toBe(true);
    
    // Test creating a recommendation
    const recommendationData = {
      tripId: '123e4567-e89b-12d3-a456-426614174001',
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
      generatedBy: 'openai' as const
    };
    
    const recommendationResult = Models.validateData(Models.CreateRecommendationSchema, recommendationData);
    expect(recommendationResult.success).toBe(true);
    
    // Test creating a vote
    const voteData = {
      participantId: '123e4567-e89b-12d3-a456-426614174002',
      tripId: '123e4567-e89b-12d3-a456-426614174001',
      rankings: [
        { recommendationId: '123e4567-e89b-12d3-a456-426614174003', rank: 1 },
        { recommendationId: '123e4567-e89b-12d3-a456-426614174004', rank: 2 }
      ]
    };
    
    const voteResult = Models.validateData(Models.CreateVoteSchema, voteData);
    expect(voteResult.success).toBe(true);
  });

  it('should validate using ValidationHelpers', () => {
    expect(Models.ValidationHelpers.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(Models.ValidationHelpers.isValidUUID('invalid-uuid')).toBe(false);
    
    expect(Models.ValidationHelpers.isValidInternationalPhone('+1234567890')).toBe(true);
    expect(Models.ValidationHelpers.isValidInternationalPhone('1234567890')).toBe(false);
    
    expect(Models.ValidationHelpers.isValidCurrencyCode('USD')).toBe(true);
    expect(Models.ValidationHelpers.isValidCurrencyCode('usd')).toBe(false);
    
    expect(Models.ValidationHelpers.isValidMatchScore(0.5)).toBe(true);
    expect(Models.ValidationHelpers.isValidMatchScore(1.5)).toBe(false);
  });
});