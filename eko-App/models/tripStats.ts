import { getAllTrips, Viagem } from './trip';

export interface TripStatistics {
  overallScore: number;
  timeSpent: string;
  distance: number;
  gasSaved: number;
  maxSpeed: number;
  avgSpeed: number;
  gasSpent: number;
  gasChange: number;
  totalTrips: number;
}

export type TimePeriod = 'Today' | 'Week' | 'Month' | 'Year' | 'All Time';

function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'Today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'Week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'Month':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'Year':
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'All Time':
      start.setFullYear(2020, 0, 1); // Far back enough
      break;
  }

  return { start, end };
}

function formatTimeSpent(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function calculateGasSaved(trips: Viagem[]): number {
  // Calculate gas saved by comparing eco-driving vs normal driving
  // Assume 10% fuel savings for eco scores above 80
  let saved = 0;
  trips.forEach(trip => {
    if (trip.fuelConsumed && trip.ecoScore > 80) {
      const savingsRate = (trip.ecoScore - 80) / 200; // 0-10% savings
      saved += trip.fuelConsumed * savingsRate;
    }
  });
  return saved;
}

export async function calculateTripStatistics(
  period: TimePeriod,
  userId: string
): Promise<TripStatistics> {
  try {
    const trips = await getAllTrips(userId);
    
    if (!trips || trips.length === 0) {
      return {
        overallScore: 0,
        timeSpent: '0:00',
        distance: 0,
        gasSaved: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        gasSpent: 0,
        gasChange: 0,
        totalTrips: 0,
      };
    }

    const filteredTrips = filterTripsByPeriod(trips, period);
    
    if (filteredTrips.length === 0) {
      return {
        overallScore: 0,
        timeSpent: '0:00',
        distance: 0,
        gasSaved: 0,
        maxSpeed: 0,
        avgSpeed: 0,
        gasSpent: 0,
        gasChange: 0,
        totalTrips: 0,
      };
    }

    // Calculate totals
    const totalDistance = filteredTrips.reduce((sum, trip) => sum + trip.distanciaKm, 0);
    const totalDuration = filteredTrips.reduce((sum, trip) => sum + trip.duration, 0);
    const avgEcoScore = filteredTrips.reduce((sum, trip) => sum + trip.ecoScore, 0) / filteredTrips.length;

    // Calculate max speed and average speed
    const maxSpeed = Math.max(...filteredTrips.map(trip => trip.velocidadeMaxima ?? 0));
    const avgSpeed = filteredTrips.reduce((sum, trip) => sum + (trip.velocidadeMedia ?? 0), 0) / filteredTrips.length;

    // Calculate fuel consumption (approximate)
    const gasSpent = totalDistance * 0.065; // ~6.5L/100km average
    const gasSaved = totalDistance * 0.01 * (avgEcoScore / 5);

    // Format time spent
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const timeSpent = `${hours}:${minutes.toString().padStart(2, '0')}`;

    return {
      overallScore: avgEcoScore,
      timeSpent,
      distance: totalDistance,
      gasSaved,
      maxSpeed,
      avgSpeed,
      gasSpent,
      gasChange: -3.4, // Mock value for now
      totalTrips: filteredTrips.length,
    };
  } catch (error) {
    console.error('Error calculating trip statistics:', error);
    return {
      overallScore: 0,
      timeSpent: '0:00',
      distance: 0,
      gasSaved: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      gasSpent: 0,
      gasChange: 0,
      totalTrips: 0,
    };
  }
}

function filterTripsByPeriod(trips: Viagem[], period: TimePeriod): Viagem[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let filterDate: Date;

  switch (period) {
    case 'Today':
      filterDate = startOfToday;
      break;
    case 'Week':
      filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'Month':
      filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'Year':
      filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'All Time':
      return trips;
    default:
      return trips;
  }

  return trips.filter(trip => {
    const tripDate = new Date(trip.data);
    return tripDate >= filterDate;
  });
}

function getPreviousPeriod(period: TimePeriod): TimePeriod {
  // Return the same period for comparison (e.g., previous week, previous month)
  return period;
}

export async function getRecentTrips(limit: number, userId: string): Promise<Viagem[]> {
  try {
    const trips = await getAllTrips(userId);
    
    if (!trips || trips.length === 0) {
      return [];
    }

    // Sort by date descending
    trips.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
    return trips.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent trips:', error);
    return [];
  }
}

export async function getGasSpentHistory(days: number, userId: string): Promise<number[]> {
  try {
    const trips = await getAllTrips(userId);
    
    if (!trips || trips.length === 0) {
      return Array(days).fill(0);
    }

    const now = new Date();
    const history: number[] = Array(days).fill(0);

    // Group trips by day and sum fuel consumption
    trips.forEach(trip => {
      const tripDate = new Date(trip.data);
      const dayDiff = Math.floor((now.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff >= 0 && dayDiff < days) {
        const fuelUsed = trip.distanciaKm * 0.065; // ~6.5L/100km
        history[days - 1 - dayDiff] += fuelUsed;
      }
    });

    // Normalize to 0-100 range for chart display
    const maxValue = Math.max(...history);
    if (maxValue > 0) {
      return history.map(val => (val / maxValue) * 100);
    }

    return history;
  } catch (error) {
    console.error('Error getting gas spent history:', error);
    return Array(days).fill(0);
  }
}