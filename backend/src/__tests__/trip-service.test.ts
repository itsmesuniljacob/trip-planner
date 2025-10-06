import { getPrismaClient } from '../lib/database';
import { TripService } from '../services/tripService';

const prisma = getPrismaClient();
const tripService = new TripService();

// Test data
const testUserId = '123e4567-e89b-12d3-a456-426614174000';

describe('TripService', () => {
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

  describe('createTrip', () => {
    it('should create a new trip', async () => {
      const tripData = {
        name: 'Test Trip to Paris',
        organizerId: testUserId,
      };

      const trip = await tripService.createTrip(tripData);

      expect(trip).toMatchObject({
        name: 'Test Trip to Paris',
        organizerId: testUserId,
        status: 'created',
      });
      expect(trip.id).toBeDefined();
      expect(trip.createdAt).toBeDefined();
    });
  });

  describe('getTripById', () => {
    let testTripId: string;

    beforeEach(async () => {
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
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should get trip by ID', async () => {
      const trip = await tripService.getTripById(testTripId);

      expect(trip).toMatchObject({
        id: testTripId,
        name: 'Test Trip for GET',
        organizerId: testUserId,
        status: 'created',
      });
    });

    it('should return null for non-existent trip', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const trip = await tripService.getTripById(nonExistentId);
      expect(trip).toBeNull();
    });
  });

  describe('addParticipant', () => {
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
        tripId: testTripId,
        name: 'John Doe',
        phoneNumber: '+1234567890',
      };

      const participant = await tripService.addParticipant(participantData);

      expect(participant).toMatchObject({
        name: 'John Doe',
        phoneNumber: '+1234567890',
        tripId: testTripId,
        hasCompletedSurvey: false,
        hasVoted: false,
      });
      expect(participant.id).toBeDefined();
      expect(participant.surveyToken).toBeDefined();
      expect(participant.voteToken).toBeDefined();
    });

    it('should reject duplicate phone numbers in same trip', async () => {
      const participantData = {
        tripId: testTripId,
        name: 'John Doe',
        phoneNumber: '+1234567890',
      };

      // Add participant first time
      await tripService.addParticipant(participantData);

      // Try to add same phone number again
      await expect(
        tripService.addParticipant({ ...participantData, name: 'Jane Doe' })
      ).rejects.toThrow('Participant with this phone number already exists in this trip');
    });
  });

  describe('updateTrip', () => {
    let testTripId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for Update',
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

      const updatedTrip = await tripService.updateTrip(testTripId, updateData);

      expect(updatedTrip.name).toBe('Updated Trip Name');
    });

    it('should update trip status', async () => {
      const updateData = {
        status: 'surveying' as const,
      };

      const updatedTrip = await tripService.updateTrip(testTripId, updateData);

      expect(updatedTrip.status).toBe('surveying');
    });
  });

  describe('getTripStats', () => {
    let testTripId: string;

    beforeEach(async () => {
      const trip = await prisma.trip.create({
        data: {
          name: 'Test Trip for Stats',
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
            hasCompletedSurvey: true,
            hasVoted: false,
          },
          {
            tripId: testTripId,
            name: 'Participant 2',
            phoneNumber: '+1234567891',
            surveyToken: 'token2',
            voteToken: 'vote-token2',
            hasCompletedSurvey: false,
            hasVoted: true,
          },
        ],
      });
    });

    afterEach(async () => {
      await prisma.participant.deleteMany({ where: { tripId: testTripId } });
      await prisma.trip.deleteMany({ where: { id: testTripId } });
    });

    it('should get trip statistics', async () => {
      const stats = await tripService.getTripStats(testTripId);

      expect(stats).toEqual({
        participantCount: 2,
        surveyCompletionCount: 1,
        voteCount: 1,
      });
    });
  });
});