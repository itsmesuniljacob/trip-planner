import request from 'supertest';
import express from 'express';
import { getPrismaClient } from '../lib/database';
import { generateSecureToken } from '../services/tripService';
import tripsRouter from '../routes/trips';
import surveysRouter from '../routes/surveys';

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/trips', tripsRouter);
app.use('/api/surveys', surveysRouter);

const prisma = getPrismaClient();

describe('Survey Management Integration Tests', () => {
  let testTripId: string;
  let testParticipantId: string;
  let testSurveyToken: string;
  let organizerToken: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.surveyResponse.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.trip.deleteMany({});

    // Create test organizer (mock user)
    const organizerId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID
    organizerToken = organizerId; // For testing, we'll use the user ID directly

    // Create test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Survey Trip',
        organizerId: organizerId,
        status: 'created',
      },
    });
    testTripId = trip.id;

    // Create test participant with survey token
    testSurveyToken = generateSecureToken();
    const participant = await prisma.participant.create({
      data: {
        tripId: testTripId,
        name: 'Test Participant',
        phoneNumber: '+1234567890',
        surveyToken: testSurveyToken,
        voteToken: generateSecureToken(),
      },
    });
    testParticipantId = participant.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.surveyResponse.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.$disconnect();
  });

  describe('GET /api/surveys/:token', () => {
    it('should return survey form for valid token', async () => {
      const response = await request(app)
        .get(`/api/surveys/${testSurveyToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.participant.name).toBe('Test Participant');
      expect(response.body.data.trip.name).toBe('Test Survey Trip');
      expect(response.body.data.surveyFields).toBeDefined();
    });

    it('should return 404 for invalid token', async () => {
      const response = await request(app)
        .get('/api/surveys/invalid-token')
        .expect(404);

      expect(response.body.error).toBe('Survey not found');
    });

    it('should return 409 if survey already completed', async () => {
      // First, mark participant as having completed survey
      await prisma.participant.update({
        where: { id: testParticipantId },
        data: { hasCompletedSurvey: true },
      });

      const response = await request(app)
        .get(`/api/surveys/${testSurveyToken}`)
        .expect(409);

      expect(response.body.error).toBe('Survey already completed');

      // Reset for other tests
      await prisma.participant.update({
        where: { id: testParticipantId },
        data: { hasCompletedSurvey: false },
      });
    });
  });

  describe('POST /api/surveys/:token', () => {
    const validSurveyData = {
      budgetRange: {
        min: 1000,
        max: 2000,
        currency: 'USD',
      },
      availableDates: {
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-15'),
        flexibility: 'flexible' as const,
      },
      destinationPreferences: {
        regions: ['Europe', 'Asia'],
        climatePreference: 'temperate',
        activityTypes: ['sightseeing', 'culture'],
        accommodationStyle: 'hotel',
      },
      travelVibe: 'relaxed exploration',
      additionalNotes: 'Looking forward to this trip!',
    };

    it('should successfully submit survey response', async () => {
      const response = await request(app)
        .post(`/api/surveys/${testSurveyToken}`)
        .send(validSurveyData)
        .expect(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.submittedAt).toBeDefined();

      // Verify participant is marked as completed
      const participant = await prisma.participant.findUnique({
        where: { id: testParticipantId },
      });
      expect(participant?.hasCompletedSurvey).toBe(true);

      // Verify survey response was created
      const surveyResponse = await prisma.surveyResponse.findFirst({
        where: { participantId: testParticipantId },
      });
      expect(surveyResponse).toBeDefined();
      expect(surveyResponse?.budgetMin).toBe(1000);
      expect(surveyResponse?.budgetMax).toBe(2000);
      expect(surveyResponse?.travelVibe).toBe('relaxed exploration');
    });

    it('should return 409 if survey already completed', async () => {
      const response = await request(app)
        .post(`/api/surveys/${testSurveyToken}`)
        .send(validSurveyData)
        .expect(409);

      expect(response.body.error).toBe('Survey already completed');
    });

    it('should return 404 for invalid token', async () => {
      const response = await request(app)
        .post('/api/surveys/invalid-token')
        .send(validSurveyData)
        .expect(404);

      expect(response.body.error).toBe('Survey not found');
    });

    it('should validate required fields', async () => {
      // Create new participant for this test
      const newToken = generateSecureToken();
      await prisma.participant.create({
        data: {
          tripId: testTripId,
          name: 'Test Participant 2',
          phoneNumber: '+1234567891',
          surveyToken: newToken,
          voteToken: generateSecureToken(),
        },
      });

      const invalidData = {
        budgetRange: {
          min: -100, // Invalid negative budget
          max: 2000,
          currency: 'USD',
        },
        // Missing required fields
      };

      const response = await request(app)
        .post(`/api/surveys/${newToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/trips/:id/surveys/send', () => {
    beforeEach(async () => {
      // Reset participant survey status
      await prisma.participant.updateMany({
        where: { tripId: testTripId },
        data: { hasCompletedSurvey: false },
      });
      
      // Delete existing survey responses
      await prisma.surveyResponse.deleteMany({
        where: { tripId: testTripId },
      });
    });

    it('should send survey invitations to all participants', async () => {
      const response = await request(app)
        .post(`/api/trips/${testTripId}/surveys/send`)
        .set('X-User-Id', organizerToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sent).toBeGreaterThan(0);
      expect(response.body.data.participants).toBeDefined();
      expect(response.body.data.participants[0].surveyUrl).toContain(testSurveyToken);
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .post('/api/trips/550e8400-e29b-41d4-a716-446655440001/surveys/send')
        .set('X-User-Id', organizerToken)
        .expect(404);

      expect(response.body.error).toBe('Trip not found');
    });

    it('should handle participants who already completed surveys', async () => {
      // Mark one participant as completed
      await prisma.participant.update({
        where: { id: testParticipantId },
        data: { hasCompletedSurvey: true },
      });

      const response = await request(app)
        .post(`/api/trips/${testTripId}/surveys/send`)
        .set('X-User-Id', organizerToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      const alreadyCompleted = response.body.data.participants.filter(
        (p: any) => p.status === 'already_completed'
      );
      expect(alreadyCompleted.length).toBe(1);
    });
  });

  describe('GET /api/trips/:id/survey-status', () => {
    beforeEach(async () => {
      // Reset survey responses
      await prisma.surveyResponse.deleteMany({
        where: { tripId: testTripId },
      });
      await prisma.participant.updateMany({
        where: { tripId: testTripId },
        data: { hasCompletedSurvey: false },
      });
    });

    it('should return survey status with no completed surveys', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTripId}/survey-status`)
        .set('X-User-Id', organizerToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalParticipants).toBeGreaterThan(0);
      expect(response.body.data.completedSurveys).toBe(0);
      expect(response.body.data.allCompleted).toBe(false);
      expect(response.body.data.completionPercentage).toBe(0);
    });

    it('should return survey status with completed surveys', async () => {
      // Create a survey response
      await prisma.surveyResponse.create({
        data: {
          participantId: testParticipantId,
          tripId: testTripId,
          budgetMin: 1000,
          budgetMax: 2000,
          budgetCurrency: 'USD',
          availableStartDate: new Date('2025-06-01'),
          availableEndDate: new Date('2025-06-15'),
          dateFlexibility: 'flexible',
          destinationPreferences: {
            regions: ['Europe'],
            climatePreference: 'temperate',
            activityTypes: ['sightseeing'],
            accommodationStyle: 'hotel',
          },
          travelVibe: 'relaxed',
        },
      });

      // Mark participant as completed
      await prisma.participant.update({
        where: { id: testParticipantId },
        data: { hasCompletedSurvey: true },
      });

      const response = await request(app)
        .get(`/api/trips/${testTripId}/survey-status`)
        .set('X-User-Id', organizerToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completedSurveys).toBe(1);
      expect(response.body.data.completionPercentage).toBeGreaterThan(0);
      expect(response.body.data.completedParticipants).toHaveLength(1);
      expect(response.body.data.completedParticipants[0].name).toBe('Test Participant');
    });

    it('should return 404 for non-existent trip', async () => {
      const response = await request(app)
        .get('/api/trips/550e8400-e29b-41d4-a716-446655440001/survey-status')
        .set('X-User-Id', organizerToken)
        .expect(404);

      expect(response.body.error).toBe('Trip not found');
    });
  });

  describe('Survey Token Validation', () => {
    it('should validate token format in survey endpoints', async () => {
      const response = await request(app)
        .get('/api/surveys/')
        .expect(404); // Should not match route without token

      // Test with a very short token that doesn't meet minimum requirements
      const shortTokenResponse = await request(app)
        .get('/api/surveys/abc')
        .expect(404); // Should return 404 for invalid token format
    });

    it('should handle expired or revoked tokens gracefully', async () => {
      // Test with a token that looks valid but doesn't exist
      const fakeToken = 'a'.repeat(64); // 64 character hex string
      
      const response = await request(app)
        .get(`/api/surveys/${fakeToken}`)
        .expect(404);

      expect(response.body.error).toBe('Survey not found');
      expect(response.body.message).toBe('Invalid or expired survey link');
    });
  });

  describe('Survey Data Validation', () => {
    let validationTestToken: string;

    beforeEach(async () => {
      // Create a fresh participant for validation tests
      validationTestToken = generateSecureToken();
      await prisma.participant.create({
        data: {
          tripId: testTripId,
          name: 'Validation Test Participant',
          phoneNumber: '+1234567892',
          surveyToken: validationTestToken,
          voteToken: generateSecureToken(),
        },
      });
    });

    it('should validate budget range constraints', async () => {
      const invalidBudgetData = {
        budgetRange: {
          min: 2000,
          max: 1000, // max < min should fail
          currency: 'USD',
        },
        availableDates: {
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-15'),
          flexibility: 'flexible' as const,
        },
        destinationPreferences: {
          regions: ['Europe'],
          climatePreference: 'temperate',
          activityTypes: ['sightseeing'],
          accommodationStyle: 'hotel',
        },
        travelVibe: 'relaxed',
      };

      const response = await request(app)
        .post(`/api/surveys/${validationTestToken}`)
        .send(invalidBudgetData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate date range constraints', async () => {
      const invalidDateData = {
        budgetRange: {
          min: 1000,
          max: 2000,
          currency: 'USD',
        },
        availableDates: {
          startDate: new Date('2025-06-15'),
          endDate: new Date('2025-06-01'), // end < start should fail
          flexibility: 'flexible' as const,
        },
        destinationPreferences: {
          regions: ['Europe'],
          climatePreference: 'temperate',
          activityTypes: ['sightseeing'],
          accommodationStyle: 'hotel',
        },
        travelVibe: 'relaxed',
      };

      const response = await request(app)
        .post(`/api/surveys/${validationTestToken}`)
        .send(invalidDateData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate required destination preferences', async () => {
      const missingPreferencesData = {
        budgetRange: {
          min: 1000,
          max: 2000,
          currency: 'USD',
        },
        availableDates: {
          startDate: new Date('2025-06-01'),
          endDate: new Date('2025-06-15'),
          flexibility: 'flexible' as const,
        },
        destinationPreferences: {
          regions: [], // Empty array should fail
          climatePreference: 'temperate',
          activityTypes: ['sightseeing'],
          accommodationStyle: 'hotel',
        },
        travelVibe: 'relaxed',
      };

      const response = await request(app)
        .post(`/api/surveys/${validationTestToken}`)
        .send(missingPreferencesData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});