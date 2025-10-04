// Simple in-memory store for the MVP session

interface Participant {
  id: string;
  name: string;
  preferences: {
    budget: string;
    dates: string;
    vibe: string;
    destinations: string[];
  } | null;
}

interface Vote {
  participantId: string;
  rankings: string[];
}

interface Trip {
  id: string;
  name: string;
  participants: Map<string, Participant>;
  recommendations: any[]; // set in subtask 4
  votes: Vote[]; // { participantId, rankings }
}

function generateId(prefix: string = 'id'): string {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${random}`;
}

class InMemoryStore {
  private trips: Map<string, Trip>;

  constructor() {
    this.trips = new Map();
  }

  createTrip(name: string) {
    const id = generateId('trip');
    const trip: Trip = {
      id,
      name,
      participants: new Map(),
      recommendations: [], // set in subtask 4
      votes: [], // { participantId, rankings }
    };
    this.trips.set(id, trip);
    return this.serializeTrip(trip);
  }

  getTrip(tripId: string) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    return this.serializeTrip(trip);
  }

  addParticipant(tripId: string, name: string) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const participantId = generateId('p');
    trip.participants.set(participantId, { id: participantId, name, preferences: null });
    return { id: participantId, name };
  }

  setPreferences(tripId: string, participantId: string, prefs: {
    budget: string;
    dates: string;
    vibe: string;
    destinations: string[];
  }) {
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

  listRecommendations(tripId: string) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    // Placeholder until Subtask 4 populates
    return Array.isArray(trip.recommendations) ? trip.recommendations : [];
  }

  submitVote(tripId: string, participantId: string, rankings: string[]) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    const participant = trip.participants.get(participantId);
    if (!participant) return null;
    // Replace previous vote from this participant if exists
    trip.votes = trip.votes.filter(v => v.participantId !== participantId);
    trip.votes.push({ participantId, rankings });
    return { participantId, rankings };
  }

  getResults(tripId: string) {
    const trip = this.trips.get(tripId);
    if (!trip) return null;
    // Basic aggregate without scoring logic (Subtask 5 will implement RCV scoring)
    const tally: Record<string, number> = {};
    for (const vote of trip.votes) {
      for (const item of vote.rankings) {
        tally[item] = (tally[item] || 0) + 1;
      }
    }
    return { votes: trip.votes, tally };
  }

  serializeTrip(trip: Trip) {
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