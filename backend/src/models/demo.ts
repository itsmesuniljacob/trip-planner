#!/usr/bin/env node

// Demo script to showcase the data models and validation
import {
  TripStatus,
  CreateTripSchema,
  CreateParticipantSchema,
  CreateSurveyResponseSchema,
  CreateRecommendationSchema,
  CreateVoteSchema,
  validateData,
  ValidationHelpers,
  type CreateTripInput,
  type CreateParticipantInput,
  type CreateSurveyResponseInput,
  type CreateRecommendationInput,
  type CreateVoteInput
} from './index.js';

console.log('🚀 Group Trip Planner - Data Models Demo\n');

// Demo 1: Trip Creation
console.log('1. Creating a trip...');
const tripData: CreateTripInput = {
  name: 'Summer Adventure 2024',
  organizerId: '123e4567-e89b-12d3-a456-426614174000'
};

const tripResult = validateData(CreateTripSchema, tripData);
if (tripResult.success) {
  console.log('✅ Trip validation successful:', tripResult.data);
} else {
  console.log('❌ Trip validation failed:', tripResult.errors);
}

// Demo 2: Participant Creation
console.log('\n2. Adding a participant...');
const participantData: CreateParticipantInput = {
  tripId: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Alice Johnson',
  phoneNumber: '+1234567890'
};

const participantResult = validateData(CreateParticipantSchema, participantData);
if (participantResult.success) {
  console.log('✅ Participant validation successful:', participantResult.data);
} else {
  console.log('❌ Participant validation failed:', participantResult.errors);
}

// Demo 3: Survey Response
console.log('\n3. Creating a survey response...');
const surveyData: CreateSurveyResponseInput = {
  participantId: '123e4567-e89b-12d3-a456-426614174002',
  tripId: '123e4567-e89b-12d3-a456-426614174001',
  budgetRange: {
    min: 2000,
    max: 5000,
    currency: 'USD'
  },
  availableDates: {
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    flexibility: 'flexible'
  },
  destinationPreferences: {
    regions: ['Europe', 'Southeast Asia'],
    climatePreference: 'Tropical',
    activityTypes: ['Beach', 'Culture', 'Adventure'],
    accommodationStyle: 'Resort'
  },
  travelVibe: 'Relaxing beach vacation with cultural experiences',
  additionalNotes: 'Looking forward to trying local cuisine!'
};

const surveyResult = validateData(CreateSurveyResponseSchema, surveyData);
if (surveyResult.success) {
  console.log('✅ Survey response validation successful');
  console.log('   Budget:', surveyResult.data?.budgetRange);
  console.log('   Preferences:', surveyResult.data?.destinationPreferences);
} else {
  console.log('❌ Survey response validation failed:', surveyResult.errors);
}

// Demo 4: AI Recommendation
console.log('\n4. Creating an AI recommendation...');
const recommendationData: CreateRecommendationInput = {
  tripId: '123e4567-e89b-12d3-a456-426614174001',
  destination: {
    name: 'Bali, Indonesia',
    country: 'Indonesia',
    region: 'Southeast Asia',
    description: 'A tropical paradise offering stunning beaches, rich culture, and incredible cuisine. Perfect for relaxation and adventure.',
    imageUrl: 'https://example.com/bali-beach.jpg'
  },
  rationale: 'Based on your group preferences for tropical climate, beach activities, and cultural experiences, Bali offers the perfect combination. The budget range fits well with resort accommodations and local experiences.',
  matchScore: 0.92,
  estimatedCost: {
    min: 2200,
    max: 4800,
    currency: 'USD'
  },
  bestTimeToVisit: 'April to October (dry season)',
  keyActivities: ['Beach relaxation', 'Temple visits', 'Surfing', 'Local cuisine tours', 'Rice terrace hiking'],
  generatedBy: 'openai'
};

const recommendationResult = validateData(CreateRecommendationSchema, recommendationData);
if (recommendationResult.success) {
  console.log('✅ Recommendation validation successful');
  console.log('   Destination:', recommendationResult.data?.destination.name);
  console.log('   Match Score:', recommendationResult.data?.matchScore);
  console.log('   Activities:', recommendationResult.data?.keyActivities);
} else {
  console.log('❌ Recommendation validation failed:', recommendationResult.errors);
}

// Demo 5: Vote Creation
console.log('\n5. Creating a vote...');
const voteData: CreateVoteInput = {
  participantId: '123e4567-e89b-12d3-a456-426614174002',
  tripId: '123e4567-e89b-12d3-a456-426614174001',
  rankings: [
    { recommendationId: '123e4567-e89b-12d3-a456-426614174003', rank: 1 },
    { recommendationId: '123e4567-e89b-12d3-a456-426614174004', rank: 2 },
    { recommendationId: '123e4567-e89b-12d3-a456-426614174005', rank: 3 }
  ]
};

const voteResult = validateData(CreateVoteSchema, voteData);
if (voteResult.success) {
  console.log('✅ Vote validation successful');
  console.log('   Rankings:', voteResult.data?.rankings);
} else {
  console.log('❌ Vote validation failed:', voteResult.errors);
}

// Demo 6: Validation Helpers
console.log('\n6. Testing validation helpers...');
console.log('UUID validation:', ValidationHelpers.isValidUUID('123e4567-e89b-12d3-a456-426614174000'));
console.log('Phone validation:', ValidationHelpers.isValidInternationalPhone('+1234567890'));
console.log('Currency validation:', ValidationHelpers.isValidCurrencyCode('USD'));
console.log('Match score validation:', ValidationHelpers.isValidMatchScore(0.92));

// Demo 7: Error Handling
console.log('\n7. Testing error handling...');
const invalidTripData = {
  name: '', // Invalid: empty name
  organizerId: 'invalid-uuid' // Invalid: not a UUID
};

const invalidResult = validateData(CreateTripSchema, invalidTripData);
if (!invalidResult.success) {
  console.log('✅ Error handling working correctly:');
  invalidResult.errors?.forEach(error => {
    console.log(`   - ${error.field}: ${error.message}`);
  });
}

console.log('\n🎉 Data models demo completed successfully!');
console.log('\nAvailable Trip Statuses:', Object.values(TripStatus));
console.log('\nAll models are ready for use in the Group Trip Planner application.');