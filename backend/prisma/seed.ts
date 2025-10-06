import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.votingResult.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.trip.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create sample trips
  const trip1 = await prisma.trip.create({
    data: {
      name: 'Summer Europe Adventure',
      organizerId: 'org-123',
      status: 'created',
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      name: 'Winter Ski Trip',
      organizerId: 'org-456',
      status: 'surveying',
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      name: 'Beach Vacation',
      organizerId: 'org-789',
      status: 'voting',
    },
  });

  console.log('✅ Created sample trips');

  // Create participants for trip1
  const participants1 = await Promise.all([
    prisma.participant.create({
      data: {
        tripId: trip1.id,
        name: 'Alice Johnson',
        phoneNumber: '+1234567890',
        surveyToken: 'survey-token-alice-1',
        voteToken: 'vote-token-alice-1',
      },
    }),
    prisma.participant.create({
      data: {
        tripId: trip1.id,
        name: 'Bob Smith',
        phoneNumber: '+1234567891',
        surveyToken: 'survey-token-bob-1',
        voteToken: 'vote-token-bob-1',
      },
    }),
    prisma.participant.create({
      data: {
        tripId: trip1.id,
        name: 'Carol Davis',
        phoneNumber: '+1234567892',
        surveyToken: 'survey-token-carol-1',
        voteToken: 'vote-token-carol-1',
      },
    }),
  ]);

  // Create participants for trip2
  const participants2 = await Promise.all([
    prisma.participant.create({
      data: {
        tripId: trip2.id,
        name: 'David Wilson',
        phoneNumber: '+1234567893',
        hasCompletedSurvey: true,
        surveyToken: 'survey-token-david-2',
        voteToken: 'vote-token-david-2',
      },
    }),
    prisma.participant.create({
      data: {
        tripId: trip2.id,
        name: 'Emma Brown',
        phoneNumber: '+1234567894',
        hasCompletedSurvey: true,
        surveyToken: 'survey-token-emma-2',
        voteToken: 'vote-token-emma-2',
      },
    }),
  ]);

  // Create participants for trip3
  const participants3 = await Promise.all([
    prisma.participant.create({
      data: {
        tripId: trip3.id,
        name: 'Frank Miller',
        phoneNumber: '+1234567895',
        hasCompletedSurvey: true,
        hasVoted: true,
        surveyToken: 'survey-token-frank-3',
        voteToken: 'vote-token-frank-3',
      },
    }),
    prisma.participant.create({
      data: {
        tripId: trip3.id,
        name: 'Grace Lee',
        phoneNumber: '+1234567896',
        hasCompletedSurvey: true,
        hasVoted: true,
        surveyToken: 'survey-token-grace-3',
        voteToken: 'vote-token-grace-3',
      },
    }),
  ]);

  console.log('✅ Created sample participants');

  // Create survey responses for trip2 participants
  await Promise.all([
    prisma.surveyResponse.create({
      data: {
        participantId: participants2[0].id,
        tripId: trip2.id,
        budgetMin: 1500,
        budgetMax: 2500,
        budgetCurrency: 'USD',
        availableStartDate: new Date('2024-12-15'),
        availableEndDate: new Date('2024-12-22'),
        dateFlexibility: 'flexible',
        destinationPreferences: {
          regions: ['Europe', 'North America'],
          climatePreference: 'cold',
          activityTypes: ['skiing', 'snowboarding', 'winter sports'],
          accommodationStyle: 'hotel',
        },
        travelVibe: 'adventure',
        additionalNotes: 'Looking for great ski slopes and cozy lodges',
      },
    }),
    prisma.surveyResponse.create({
      data: {
        participantId: participants2[1].id,
        tripId: trip2.id,
        budgetMin: 2000,
        budgetMax: 3000,
        budgetCurrency: 'USD',
        availableStartDate: new Date('2024-12-10'),
        availableEndDate: new Date('2024-12-25'),
        dateFlexibility: 'very-flexible',
        destinationPreferences: {
          regions: ['Europe'],
          climatePreference: 'cold',
          activityTypes: ['skiing', 'spa', 'fine dining'],
          accommodationStyle: 'luxury resort',
        },
        travelVibe: 'luxury',
        additionalNotes: 'Prefer luxury accommodations with spa facilities',
      },
    }),
  ]);

  // Create survey responses for trip3 participants
  await Promise.all([
    prisma.surveyResponse.create({
      data: {
        participantId: participants3[0].id,
        tripId: trip3.id,
        budgetMin: 1000,
        budgetMax: 2000,
        budgetCurrency: 'USD',
        availableStartDate: new Date('2024-07-01'),
        availableEndDate: new Date('2024-07-15'),
        dateFlexibility: 'fixed',
        destinationPreferences: {
          regions: ['Caribbean', 'Mediterranean'],
          climatePreference: 'tropical',
          activityTypes: ['beach', 'water sports', 'relaxation'],
          accommodationStyle: 'resort',
        },
        travelVibe: 'relaxation',
        additionalNotes: 'Want beautiful beaches and water activities',
      },
    }),
    prisma.surveyResponse.create({
      data: {
        participantId: participants3[1].id,
        tripId: trip3.id,
        budgetMin: 1200,
        budgetMax: 1800,
        budgetCurrency: 'USD',
        availableStartDate: new Date('2024-07-05'),
        availableEndDate: new Date('2024-07-12'),
        dateFlexibility: 'flexible',
        destinationPreferences: {
          regions: ['Mediterranean', 'Southeast Asia'],
          climatePreference: 'warm',
          activityTypes: ['beach', 'cultural sites', 'local cuisine'],
          accommodationStyle: 'boutique hotel',
        },
        travelVibe: 'cultural',
        additionalNotes: 'Interested in local culture and authentic experiences',
      },
    }),
  ]);

  console.log('✅ Created sample survey responses');

  // Create recommendations for trip3
  const recommendations = await Promise.all([
    prisma.recommendation.create({
      data: {
        tripId: trip3.id,
        destinationName: 'Santorini, Greece',
        destinationCountry: 'Greece',
        destinationRegion: 'Mediterranean',
        description: 'Beautiful Greek island with stunning sunsets, white-washed buildings, and crystal-clear waters.',
        imageUrl: 'https://example.com/santorini.jpg',
        rationale: 'Perfect blend of beach relaxation and cultural experiences. Matches both participants\' preferences for Mediterranean destinations and offers beautiful beaches with rich cultural heritage.',
        matchScore: 0.92,
        estimatedCostMin: 1400,
        estimatedCostMax: 1900,
        costCurrency: 'USD',
        bestTimeToVisit: 'July - Perfect weather and long sunny days',
        keyActivities: ['beach lounging', 'sunset viewing', 'wine tasting', 'archaeological sites'],
        generatedBy: 'openai',
      },
    }),
    prisma.recommendation.create({
      data: {
        tripId: trip3.id,
        destinationName: 'Bali, Indonesia',
        destinationCountry: 'Indonesia',
        destinationRegion: 'Southeast Asia',
        description: 'Tropical paradise with beautiful beaches, rich culture, and affordable luxury.',
        imageUrl: 'https://example.com/bali.jpg',
        rationale: 'Excellent value for money with stunning beaches and deep cultural experiences. Fits within budget constraints while offering both relaxation and cultural immersion.',
        matchScore: 0.88,
        estimatedCostMin: 1100,
        estimatedCostMax: 1600,
        costCurrency: 'USD',
        bestTimeToVisit: 'July - Dry season with perfect beach weather',
        keyActivities: ['beach activities', 'temple visits', 'local cuisine', 'spa treatments'],
        generatedBy: 'claude',
      },
    }),
    prisma.recommendation.create({
      data: {
        tripId: trip3.id,
        destinationName: 'Barbados',
        destinationCountry: 'Barbados',
        destinationRegion: 'Caribbean',
        description: 'Caribbean island with pristine beaches, friendly locals, and excellent water sports.',
        imageUrl: 'https://example.com/barbados.jpg',
        rationale: 'Classic Caribbean experience with world-class beaches and water activities. Matches the tropical climate preference and offers great water sports opportunities.',
        matchScore: 0.85,
        estimatedCostMin: 1500,
        estimatedCostMax: 2100,
        costCurrency: 'USD',
        bestTimeToVisit: 'July - Peak season with ideal weather',
        keyActivities: ['water sports', 'beach relaxation', 'snorkeling', 'local rum tours'],
        generatedBy: 'openai',
      },
    }),
  ]);

  console.log('✅ Created sample recommendations');

  // Create votes for trip3
  await Promise.all([
    prisma.vote.create({
      data: {
        participantId: participants3[0].id,
        tripId: trip3.id,
        rankings: [
          { recommendationId: recommendations[2].id, rank: 1 }, // Barbados
          { recommendationId: recommendations[0].id, rank: 2 }, // Santorini
          { recommendationId: recommendations[1].id, rank: 3 }, // Bali
        ],
      },
    }),
    prisma.vote.create({
      data: {
        participantId: participants3[1].id,
        tripId: trip3.id,
        rankings: [
          { recommendationId: recommendations[1].id, rank: 1 }, // Bali
          { recommendationId: recommendations[0].id, rank: 2 }, // Santorini
          { recommendationId: recommendations[2].id, rank: 3 }, // Barbados
        ],
      },
    }),
  ]);

  console.log('✅ Created sample votes');

  // Create voting result for trip3
  await prisma.votingResult.create({
    data: {
      tripId: trip3.id,
      winningRecommendationId: recommendations[0].id, // Santorini wins
      roundsData: {
        rounds: [
          {
            roundNumber: 1,
            voteCounts: [
              { recommendationId: recommendations[0].id, votes: 2 },
              { recommendationId: recommendations[1].id, votes: 1 },
              { recommendationId: recommendations[2].id, votes: 1 },
            ],
          },
        ],
      },
      finalTally: [
        { recommendationId: recommendations[0].id, finalVotes: 2 },
        { recommendationId: recommendations[1].id, finalVotes: 1 },
        { recommendationId: recommendations[2].id, finalVotes: 1 },
      ],
    },
  });

  console.log('✅ Created sample voting result');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Seeded data summary:
- 3 trips (different statuses: created, surveying, voting)
- 7 participants across all trips
- 4 survey responses (for trips 2 and 3)
- 3 recommendations (for trip 3)
- 2 votes (for trip 3)
- 1 voting result (for trip 3)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });