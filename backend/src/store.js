// Simple in-memory store for the MVP session

function generateId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${random}`;
}

class InMemoryStore {
  constructor() {
    this.trips = new Map();
  }

  createTrip(name) {
    const id = generateId('trip');
    const trip = {
      id,
      name,
      participants: new Map(),
      recommendations: [], // set in subtask 4
      votes: [], // { participantId, rankings }
    };
    this.trips.set(id, trip);
    return this.serializeTrip(trip);
  }

  getTrip(tripId) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    return this.serializeTrip(trip);
  }

  addParticipant(tripId, name) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const participantId = generateId('p');
    trip.participants.set(participantId, { id: participantId, name, preferences: null });
    return { id: participantId, name };
  }

  setPreferences(tripId, participantId, prefs) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const participant = trip.participants.get(participantId);
    if (!participant) return null;
    participant.preferences = {
      budget: prefs.budget,
      dates: prefs.dates,
      vibe: prefs.vibe,
      destinations: prefs.destinations,
    };
    return { participantId: participant.id, preferences: participant.preferences };
  }

  listRecommendations(tripId) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    // Placeholder until Subtask 4 populates
    return Array.isArray(trip.recommendations) ? trip.recommendations : [];
  }

  submitVote(tripId, participantId, rankings) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const participant = trip.participants.get(participantId);
    if (!participant) return null;
    // Replace previous vote from this participant if exists
    trip.votes = trip.votes.filter(v => v.participantId !== participantId);
    trip.votes.push({ participantId, rankings });
    return { participantId, rankings };
  }

  getResults(tripId) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    // Basic aggregate without scoring logic (Subtask 5 will implement RCV scoring)
    const tally = {};
    for (const vote of trip.votes) {
      for (const item of vote.rankings) {
        tally[item] = (tally[item] || 0) + 1;
      }
    }
    return { votes: trip.votes, tally };
  }

  serializeTrip(trip) {
    return {
      id: trip.id,
      name: trip.name,
      participants: Array.from(trip.participants.values()).map(p => ({
        id: p.id,
        name: p.name,
        preferences: p.preferences || null,
      })),
    };
  }
}

const store = new InMemoryStore();

export default store;
export { generateId };


