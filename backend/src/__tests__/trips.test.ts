import request from 'supertest';
import express from 'express';
import { getPrismaClient } from '../lib/database';
import tripsRouter from '../routes/trips';

// Test app setup
const app = express();
app.use(express.json());
app.use('/api/trips', tripsRouter);

const prisma = getPrismaClient();

// Test data
const testUserId = '123e4567-e89b-12d3-a456-426614174000';
const testUserId2 = '123e4567-e89b-12d3-a456-426614174001';

describe('Trip Management API', () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    await prisma.participant.deleteMany({});
    await prisma.trip.deleteMany({});
  });

  afterAll(async () => {
    // Clean up test data after running tests
    await prisma.participant.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/trips', () => {
    it('should create a new trip with valid data', async () => {
      const tripData = {
        name: 'Test Trip to Paris',
      };

      const response = await request(app)
        .post('/api/trips')
        .set('X-User-Id', testUserId)
        .send(tripData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'Test Trip to Paris',
        organizerId: testUserId,
        status: 'created',
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should reject trip creation without authentication', async () => {
      const tripData = {
        name: 'Test Trip',
      };

      const response = await request(app)
        .post('/api/trips')
        .send(tripData)
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should reject trip creation with invalid data', async () => {
      const tripData = {
        name: '', // Empty name should fail validation
      };

      const response = await request(app)
        .post('/api/trips')
        .set('X-User-Id', testUserId)
        .send(tripData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringContaining('String must contain at least 1 character'),
          }),
        ])
      );
    });

    it('should reject trip creation with invalid user ID format', async () => {
      const tripData = {
        name: 'Test Trip',
      };

      const response = await request(app)
        .post('/api/trips')
        .set('X-User-Id', 'invalid-uuid')
        .send(tripData)
        .expect(401);

      expect(response.body.error).toBe('Invalid authentication');
    });
  });

  describe('GET /api/trips/:id', () => {
    let testTripId: string;

    beforeEach(async () => {
      // Create a test trip
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for GET',
          organizerId: testUserId,
          status: 'created',
        },
      });
      testTripId = trip.id;
    });

    afterEach(async () => {
      // Clean up
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should get trip by ID for organizer', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTripId}`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testTripId,
        name: 'Test Trip for GET',
        organizerId: testUserId,
        status: 'created',
      });
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.participants).toBeDefined();
    });

    it('should reject access for non-organizer', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTripId}`)
        .set('X-User-Id', testUserId2)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 for non-existent trip', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      
      const response = await request(app)
        .get(`/api/trips/${nonExistentId}`)
        .set('X-User-Id', testUserId)
        .expect(404);

      expect(response.body.error).toBe('Trip not found');
    });

    it('should reject request with invalid trip ID format', async () => {
      const response = await request(app)
        .get('/api/trips/invalid-id')
        .set('X-User-Id', testUserId)
        .expect(400);

      expect(response.body.error).toBe('Invalid parameters');
    });
  });

  describe('PUT /api/trips/:id', () => {
    let testTripId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for PUT',
          organizerId: testUserId,
          status: 'created',
        },
      });
      testTripId = trip.id;
    });

    afterEach(async () => {
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should update trip name', async () => {
      const updateData = {
        name: 'Updated Trip Name',
      };

      const response = await request(app)
        .put(`/api/trips/${testTripId}`)
        .set('X-User-Id', testUserId)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Trip Name');
    });

    it('should update trip status', async () => {
      const updateData = {
        status: 'surveying' as const,
      };

      const response = await request(app)
        .put(`/api/trips/${testTripId}`)
        .set('X-User-Id', testUserId)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('surveying');
    });

    it('should reject update for non-organizer', async () => {
      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/trips/${testTripId}`)
        .set('X-User-Id', testUserId2)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('POST /api/trips/:id/participants', () => {
    let testTripId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for Participants',
          organizerId: testUserId,
          status: 'created',
        },
      });
      testTripId = trip.id;
    });

    afterEach(async () => {
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should add participant to trip', async () => {
      const participantData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId)
        .send(participantData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        tripId: testTripId,
        hasCompletedSurvey: false,
        hasVoted: false,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.surveyToken).toBeDefined();
      expect(response.body.data.voteToken).toBeDefined();
    });

    it('should reject duplicate phone numbers in same trip', async () => {
      const participantData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
      };

      // Add participant first time
      await request(app)
        .post(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId)
        .send(participantData)
        .expect(201);

      // Try to add same phone number again
      const response = await request(app)
        .post(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId)
        .send({ ...participantData, name: 'Jane Doe' })
        .expect(409);

      expect(response.body.error).toBe('Duplicate participant');
    });

    it('should reject invalid phone number format', async () => {
      const participantData = {
        name: 'John Doe',
        phoneNumber: 'invalid-phone',
      };

      const response = await request(app)
        .post(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId)
        .send(participantData)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject participant addition for non-organizer', async () => {
      const participantData = {
        name: 'John Doe',
        phoneNumber: '+1234567890',
      };

      const response = await request(app)
        .post(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId2)
        .send(participantData)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('DELETE /api/trips/:id/participants/:participantId', () => {
    let testTripId: string;
    let testParticipantId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for Participant Removal',
          organizerId: testUserId,
          status: 'created',
        },
      });
      testTripId = trip.id;

      const participant = await prisma.participant.create({
        data: {
          tripId: testTripId,
          name: 'Test Participant',
          phoneNumber: '+1234567890',
          surveyToken: 'test-survey-token',
          voteToken: 'test-vote-token',
        },
      });
      testParticipantId = participant.id;
    });

    afterEach(async () => {
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should remove participant from trip', async () => {
      const response = await request(app)
        .delete(`/api/trips/${testTripId}/participants/${testParticipantId}`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Participant removed successfully');

      // Verify participant was deleted
      const participant = await prisma.participant.findUnique({
        where: { id: testParticipantId },
      });
      expect(participant).toBeNull();
    });

    it('should reject removal for non-organizer', async () => {
      const response = await request(app)
        .delete(`/api/trips/${testTripId}/participants/${testParticipantId}`)
        .set('X-User-Id', testUserId2)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });

    it('should return 404 for non-existent participant', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      
      const response = await request(app)
        .delete(`/api/trips/${testTripId}/participants/${nonExistentId}`)
        .set('X-User-Id', testUserId)
        .expect(404);

      expect(response.body.error).toBe('Participant not found');
    });
  });

  describe('GET /api/trips/:id/participants', () => {
    let testTripId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for Participant List',
          organizerId: testUserId,
          status: 'created',
        },
      });
      testTripId = trip.id;

      // Add some test participants
      await prisma.participant.createMany({
        data: [
          {
            tripId: testTripId,
            name: 'Participant 1',
            phoneNumber: '+1234567890',
            surveyToken: 'token1',
            voteToken: 'vote-token1',
          },
          {
            tripId: testTripId,
            name: 'Participant 2',
            phoneNumber: '+1234567891',
            surveyToken: 'token2',
            voteToken: 'vote-token2',
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should get all participants for trip organizer', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        name: 'Participant 1',
        phoneNumber: '+1234567890',
        tripId: testTripId,
      });
    });

    it('should reject access for non-organizer', async () => {
      const response = await request(app)
        .get(`/api/trips/${testTripId}/participants`)
        .set('X-User-Id', testUserId2)
        .expect(403);

      expect(response.body.error).toBe('Access denied');
    });
  });
});