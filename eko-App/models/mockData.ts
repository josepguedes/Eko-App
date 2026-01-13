import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car } from './cars';
import { Viagem } from './trip';

export async function initializeMockData(): Promise<void> {
  try {
    // Check if mock data already exists
    const existingTrips = await AsyncStorage.getItem('trips');
    const existingCars = await AsyncStorage.getItem('cars');
    
    if (existingTrips && existingCars) {
      console.log('Mock data already exists');
      return;
    }

    // Create mock cars for Maria Silva (userId: '1')
    const mockCars: Car[] = [
      {
        id: '1',
        model: 'BMW 320d',
        fuelType: 'diesel',
        userId: '1',
        createdAt: new Date('2024-01-20'),
      },
      {
        id: '2',
        model: 'Tesla Model 3',
        fuelType: 'electric',
        userId: '1',
        createdAt: new Date('2024-03-15'),
      },
      {
        id: '3',
        model: 'Toyota Prius',
        fuelType: 'hybrid',
        userId: '1',
        createdAt: new Date('2024-02-10'),
      },
    ];

    // Create 10 mock trips for Maria Silva with realistic data
    const mockTrips: Viagem[] = [
      {
        id: '1',
        data: new Date('2026-01-13T09:15:00').toISOString(),
        distanciaKm: 15.3,
        velocidadeMedia: 42,
        ecoScore: 87,
        eventosBruscos: 2,
        duration: 1320, // 22 minutes
        carId: '1',
        fuelType: 'diesel',
        fuelConsumed: 0.9,
        fuelCost: 1.62,
        co2Emissions: 2.37,
        avgConsumption: 5.88,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1612, longitude: -8.6324 },
          { latitude: 41.1645, longitude: -8.6357 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1590, longitude: -8.6300 },
            timestamp: Date.now() - 1000000,
            speedDiff: 15,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1620, longitude: -8.6330 },
            timestamp: Date.now() - 800000,
            speedDiff: 12,
            type: 'acceleration',
          },
        ],
      },
      {
        id: '2',
        data: new Date('2026-01-12T18:30:00').toISOString(),
        distanciaKm: 8.7,
        velocidadeMedia: 35,
        ecoScore: 92,
        eventosBruscos: 1,
        duration: 900, // 15 minutes
        carId: '2',
        fuelType: 'electric',
        fuelConsumed: 1.39,
        fuelCost: 0.35,
        co2Emissions: 0,
        avgConsumption: 15.98,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1550, longitude: -8.6250 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1560, longitude: -8.6270 },
            timestamp: Date.now() - 900000,
            speedDiff: 10,
            type: 'braking',
          },
        ],
      },
      {
        id: '3',
        data: new Date('2026-01-11T14:20:00').toISOString(),
        distanciaKm: 22.5,
        velocidadeMedia: 55,
        ecoScore: 78,
        eventosBruscos: 4,
        duration: 1470, // 24.5 minutes
        carId: '1',
        fuelType: 'diesel',
        fuelConsumed: 1.35,
        fuelCost: 2.43,
        co2Emissions: 3.56,
        avgConsumption: 6.0,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1700, longitude: -8.6500 },
          { latitude: 41.1800, longitude: -8.6600 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1650, longitude: -8.6400 },
            timestamp: Date.now() - 1200000,
            speedDiff: 18,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1720, longitude: -8.6520 },
            timestamp: Date.now() - 1100000,
            speedDiff: 20,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1750, longitude: -8.6550 },
            timestamp: Date.now() - 1000000,
            speedDiff: 16,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1780, longitude: -8.6580 },
            timestamp: Date.now() - 900000,
            speedDiff: 14,
            type: 'braking',
          },
        ],
      },
      {
        id: '4',
        data: new Date('2026-01-10T08:45:00').toISOString(),
        distanciaKm: 12.1,
        velocidadeMedia: 38,
        ecoScore: 85,
        eventosBruscos: 2,
        duration: 1140, // 19 minutes
        carId: '3',
        fuelType: 'hybrid',
        fuelConsumed: 0.58,
        fuelCost: 1.04,
        co2Emissions: 1.53,
        avgConsumption: 4.79,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1620, longitude: -8.6350 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1600, longitude: -8.6320 },
            timestamp: Date.now() - 1300000,
            speedDiff: 13,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1615, longitude: -8.6340 },
            timestamp: Date.now() - 1200000,
            speedDiff: 11,
            type: 'acceleration',
          },
        ],
      },
      {
        id: '5',
        data: new Date('2025-12-26T17:10:00').toISOString(),
        distanciaKm: 5.4,
        velocidadeMedia: 28,
        ecoScore: 95,
        eventosBruscos: 0,
        duration: 690, // 11.5 minutes
        carId: '2',
        fuelType: 'electric',
        fuelConsumed: 0.81,
        fuelCost: 0.20,
        co2Emissions: 0,
        avgConsumption: 15.0,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1600, longitude: -8.6310 },
        ],
        aggressiveEvents: [],
      },
      {
        id: '6',
        data: new Date('2025-12-22T12:30:00').toISOString(),
        distanciaKm: 18.9,
        velocidadeMedia: 48,
        ecoScore: 81,
        eventosBruscos: 3,
        duration: 1410, // 23.5 minutes
        carId: '1',
        fuelType: 'diesel',
        fuelConsumed: 1.13,
        fuelCost: 2.03,
        co2Emissions: 2.98,
        avgConsumption: 5.98,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1680, longitude: -8.6450 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1620, longitude: -8.6350 },
            timestamp: Date.now() - 1400000,
            speedDiff: 17,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1640, longitude: -8.6380 },
            timestamp: Date.now() - 1300000,
            speedDiff: 14,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1660, longitude: -8.6420 },
            timestamp: Date.now() - 1200000,
            speedDiff: 15,
            type: 'braking',
          },
        ],
      },
      {
        id: '7',
        data: new Date('2025-12-22T10:15:00').toISOString(),
        distanciaKm: 28.3,
        velocidadeMedia: 62,
        ecoScore: 72,
        eventosBruscos: 5,
        duration: 1638, // 27.3 minutes
        carId: '3',
        fuelType: 'hybrid',
        fuelConsumed: 1.42,
        fuelCost: 2.56,
        co2Emissions: 3.74,
        avgConsumption: 5.02,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1900, longitude: -8.6700 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1650, longitude: -8.6400 },
            timestamp: Date.now() - 1600000,
            speedDiff: 22,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1700, longitude: -8.6450 },
            timestamp: Date.now() - 1500000,
            speedDiff: 19,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1750, longitude: -8.6500 },
            timestamp: Date.now() - 1400000,
            speedDiff: 21,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1800, longitude: -8.6600 },
            timestamp: Date.now() - 1300000,
            speedDiff: 18,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1850, longitude: -8.6650 },
            timestamp: Date.now() - 1200000,
            speedDiff: 16,
            type: 'acceleration',
          },
        ],
      },
      {
        id: '8',
        data: new Date('2025-12-21T16:45:00').toISOString(),
        distanciaKm: 9.2,
        velocidadeMedia: 32,
        ecoScore: 89,
        eventosBruscos: 1,
        duration: 1035, // 17.25 minutes
        carId: '2',
        fuelType: 'electric',
        fuelConsumed: 1.47,
        fuelCost: 0.37,
        co2Emissions: 0,
        avgConsumption: 15.98,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1630, longitude: -8.6340 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1600, longitude: -8.6310 },
            timestamp: Date.now() - 1700000,
            speedDiff: 12,
            type: 'braking',
          },
        ],
      },
      {
        id: '9',
        data: new Date('2025-12-21T13:20:00').toISOString(),
        distanciaKm: 16.7,
        velocidadeMedia: 45,
        ecoScore: 83,
        eventosBruscos: 3,
        duration: 1332, // 22.2 minutes
        carId: '1',
        fuelType: 'diesel',
        fuelConsumed: 1.0,
        fuelCost: 1.80,
        co2Emissions: 2.64,
        avgConsumption: 5.99,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1720, longitude: -8.6480 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1620, longitude: -8.6350 },
            timestamp: Date.now() - 1800000,
            speedDiff: 16,
            type: 'acceleration',
          },
          {
            coordinate: { latitude: 41.1660, longitude: -8.6400 },
            timestamp: Date.now() - 1700000,
            speedDiff: 14,
            type: 'braking',
          },
          {
            coordinate: { latitude: 41.1690, longitude: -8.6440 },
            timestamp: Date.now() - 1600000,
            speedDiff: 13,
            type: 'acceleration',
          },
        ],
      },
      {
        id: '10',
        data: new Date('2025-12-20T11:00:00').toISOString(),
        distanciaKm: 6.8,
        velocidadeMedia: 30,
        ecoScore: 93,
        eventosBruscos: 1,
        duration: 816, // 13.6 minutes
        carId: '3',
        fuelType: 'hybrid',
        fuelConsumed: 0.34,
        fuelCost: 0.61,
        co2Emissions: 0.90,
        avgConsumption: 5.0,
        route: [
          { latitude: 41.1579, longitude: -8.6291 },
          { latitude: 41.1620, longitude: -8.6330 },
        ],
        aggressiveEvents: [
          {
            coordinate: { latitude: 41.1600, longitude: -8.6310 },
            timestamp: Date.now() - 1900000,
            speedDiff: 11,
            type: 'braking',
          },
        ],
      },
    ];

    // Save mock data
    await AsyncStorage.setItem('cars', JSON.stringify(mockCars));
    await AsyncStorage.setItem('trips', JSON.stringify(mockTrips));

    // Update user's car IDs
    const usersData = await AsyncStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      const mariaIndex = users.findIndex((u: any) => u.id === '1');
      if (mariaIndex !== -1) {
        users[mariaIndex].cars = ['1', '2', '3'];
        users[mariaIndex].selectedCarId = '1';
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
    }

    console.log('✅ Mock data initialized successfully');
    console.log('📊 Created 3 cars and 10 trips for Maria Silva');
  } catch (error) {
    console.error('❌ Error initializing mock data:', error);
  }
}