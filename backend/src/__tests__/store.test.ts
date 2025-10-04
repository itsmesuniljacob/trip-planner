import store, { generateId } from '../store';

describe('Store', () => {
  test('generateId creates unique IDs', () => {
    const id1 = generateId('test');
    const id2 = generateId('test');
    
    expect(id1).toMatch(/^test_/);
    expect(id2).toMatch(/^test_/);
    expect(id1).not.toBe(id2);
  });

  test('createTrip creates a new trip', () => {
    const trip = store.createTrip('Test Trip');
    
    expect(trip).toHaveProperty('id');
    expect(trip).toHaveProperty('name', 'Test Trip');
    expect(trip).toHaveProperty('participants');
    expect(Array.isArray(trip.participants)).toBe(true);
  });
});