import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

export interface AggressiveEvent {
    coordinate: LocationCoords;
    timestamp: number;
    speedDiff: number;
    type: 'acceleration' | 'braking';
}

export interface Viagem {
    id: string;
    data: string;
    distanciaKm: number;
    velocidadeMedia: number;
    ecoScore: number; // 0 a 100
    eventosBruscos: number; // contador de travagens/acelerações
    route?: LocationCoords[];
    aggressiveEvents?: AggressiveEvent[];
    duration?: number; // em segundos
    carId?: string; // ID do carro usado
    fuelType?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    fuelConsumed?: number; // litros ou kWh
    fuelCost?: number; // custo em euros
    co2Emissions?: number; // kg de CO2
    avgConsumption?: number; // L/100km ou kWh/100km
}

const STORAGE_KEY = '@viagens_eco';
const AGGRESSIVE_THRESHOLD = 15; // km/h difference threshold

// Fuel consumption constants (average L/100km or kWh/100km)
const BASE_CONSUMPTION = {
    gasoline: 7.5,  // L/100km
    diesel: 6.5,    // L/100km
    electric: 18,   // kWh/100km
    hybrid: 5.0     // L/100km
};

// Fuel prices in Portugal (€/L or €/kWh)
const FUEL_PRICES = {
    gasoline: 1.85,  // €/L
    diesel: 1.65,    // €/L
    electric: 0.25,  // €/kWh
    hybrid: 1.75     // €/L
};

// CO2 emissions (kg CO2 per L or kWh)
const CO2_EMISSIONS = {
    gasoline: 2.31,  // kg CO2 per liter
    diesel: 2.68,    // kg CO2 per liter
    electric: 0.0,   // kg CO2 (assuming renewable energy)
    hybrid: 1.5      // kg CO2 per liter (average)
};

// Calculate fuel consumption based on distance, fuel type, and driving behavior
export function calculateFuelConsumption(
    distance: number,
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid',
    ecoScore: number,
    aggressiveEvents: number
): { fuelConsumed: number; avgConsumption: number; fuelCost: number; co2Emissions: number } {
    if (distance === 0) {
        return { fuelConsumed: 0, avgConsumption: 0, fuelCost: 0, co2Emissions: 0 };
    }

    // Base consumption for fuel type
    let consumption = BASE_CONSUMPTION[fuelType];

    // Adjust consumption based on eco score (lower score = higher consumption)
    const ecoFactor = 1 + ((100 - ecoScore) / 100) * 0.3; // Up to 30% increase
    consumption *= ecoFactor;

    // Additional penalty for aggressive events
    const aggressivePenalty = Math.min(aggressiveEvents * 0.02, 0.2); // Up to 20% increase
    consumption *= (1 + aggressivePenalty);

    // Calculate total fuel consumed
    const fuelConsumed = (consumption * distance) / 100;

    // Calculate cost
    const fuelCost = fuelConsumed * FUEL_PRICES[fuelType];

    // Calculate CO2 emissions
    const co2Emissions = fuelType === 'electric' ? 0 : fuelConsumed * CO2_EMISSIONS[fuelType];

    return {
        fuelConsumed: parseFloat(fuelConsumed.toFixed(2)),
        avgConsumption: parseFloat(consumption.toFixed(2)),
        fuelCost: parseFloat(fuelCost.toFixed(2)),
        co2Emissions: parseFloat(co2Emissions.toFixed(2))
    };
}

// Get fuel unit based on type
export function getFuelUnit(fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'): string {
    return fuelType === 'electric' ? 'kWh' : 'L';
}

// Get consumption unit based on type
export function getConsumptionUnit(fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'): string {
    return fuelType === 'electric' ? 'kWh/100km' : 'L/100km';
}

export class TripManager {
    private route: LocationCoords[] = [];
    private aggressiveEvents: AggressiveEvent[] = [];
    private distance: number = 0;
    private previousSpeed: number = 0;
    private speedReadings: number[] = [];
    private startTime: Date | null = null;
    private locationSubscription: Location.LocationSubscription | null = null;

    constructor() {
        // No need to load anything - expo-location works on all platforms
    }

    // Calculate distance between two coordinates using Haversine formula
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Calculate eco score based on aggressive events and distance
    private calculateEcoScore(): number {
        if (this.distance === 0) return 100;

        // Base score
        let score = 100;

        // Penalize for aggressive events (more events = lower score)
        const eventsPerKm = this.aggressiveEvents.length / this.distance;
        score -= Math.min(eventsPerKm * 20, 60); // Max penalty of 60 points

        // Bonus for smooth driving
        if (this.aggressiveEvents.length === 0) {
            score = Math.min(score + 10, 100);
        }

        return Math.max(0, Math.round(score));
    }

    // Calculate average speed
    private calculateAverageSpeed(): number {
        if (this.speedReadings.length === 0) return 0;
        const sum = this.speedReadings.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.speedReadings.length);
    }

    // Get current trip data
    getTrip(): Viagem {
        const duration = this.startTime ? Math.floor((Date.now() - this.startTime.getTime()) / 1000) : 0;

        return {
            id: Date.now().toString(),
            data: new Date().toISOString(),
            distanciaKm: this.distance,
            velocidadeMedia: this.calculateAverageSpeed(),
            ecoScore: this.calculateEcoScore(),
            eventosBruscos: this.aggressiveEvents.length,
            route: this.route,
            aggressiveEvents: this.aggressiveEvents,
            duration
        };
    }

    // Start tracking location
    async startTracking(
        onLocationUpdate: (coords: LocationCoords, speed: number) => void,
        onError: (error: any) => void
    ): Promise<void> {
        try {
            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                onError(new Error('Permission to access location was denied'));
                return;
            }

            this.reset();
            this.startTime = new Date();

            this.locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    distanceInterval: 3,
                    timeInterval: 1000,
                },
                (location) => {
                    const { latitude, longitude, speed } = location.coords;
                    const speedKmh = Math.max(0, (speed || 0) * 3.6);
                    const roundedSpeed = Math.max(0, Math.round(speedKmh));

                    // Add speed reading
                    this.speedReadings.push(roundedSpeed);

                    // Add to route
                    const newCoord = { latitude, longitude };

                    // Calculate distance if we have previous coordinates
                    if (this.route.length > 0) {
                        const lastCoord = this.route[this.route.length - 1];
                        const distDiff = this.calculateDistance(
                            lastCoord.latitude,
                            lastCoord.longitude,
                            latitude,
                            longitude
                        );
                        this.distance += distDiff;
                    }

                    this.route.push(newCoord);

                    // Check for aggressive driving
                    const speedDiff = roundedSpeed - this.previousSpeed;
                    if (Math.abs(speedDiff) > AGGRESSIVE_THRESHOLD && this.previousSpeed > 0) {
                        const event: AggressiveEvent = {
                            coordinate: newCoord,
                            timestamp: Date.now(),
                            speedDiff,
                            type: speedDiff > 0 ? 'acceleration' : 'braking'
                        };
                        this.aggressiveEvents.push(event);
                    }

                    this.previousSpeed = roundedSpeed;
                    onLocationUpdate(newCoord, roundedSpeed);
                }
            );
        } catch (error) {
            console.error('Location tracking error:', error);
            onError(error);
        }
    }

    // Stop tracking
    stopTracking(): void {
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
    }

    // Reset trip data
    reset(): void {
        this.route = [];
        this.aggressiveEvents = [];
        this.distance = 0;
        this.previousSpeed = 0;
        this.speedReadings = [];
        this.startTime = null;
    }

    // Get current location
    async getCurrentLocation(): Promise<LocationCoords> {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access location was denied');
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
        } catch (error) {
            throw error;
        }
    }

    // Getters
    getRoute(): LocationCoords[] {
        return this.route;
    }

    getAggressiveEvents(): AggressiveEvent[] {
        return this.aggressiveEvents;
    }

    getDistance(): number {
        return this.distance;
    }

    getEventCount(): number {
        return this.aggressiveEvents.length;
    }

    isTracking(): boolean {
        return this.locationSubscription !== null;
    }
}

// Save trip to storage
export default async function savetrip(trip: Viagem, userId?: string): Promise<void> {
    console.log('=== GUARDAR VIAGEM ===');
    console.log('ID:', trip.id);
    console.log('Data:', trip.data);
    console.log('Distância (km):', trip.distanciaKm);
    console.log('Velocidade Média (km/h):', trip.velocidadeMedia);
    console.log('Eco Score:', trip.ecoScore);
    console.log('Eventos Bruscos:', trip.eventosBruscos);
    console.log('Duração (segundos):', trip.duration);
    console.log('Pontos da Rota:', trip.route?.length || 0);
    console.log('Eventos Agressivos:', trip.aggressiveEvents?.length || 0);
    console.log('======================');

    const data = await AsyncStorage.getItem('trips');
    let trips: Viagem[] = [];
    if (data) {
        trips = JSON.parse(data);
    }
    trips.push(trip);
    await AsyncStorage.setItem('trips', JSON.stringify(trips));

    // ✅ AUTO-UPDATE GOALS AFTER TRIP
    if (userId) {
        console.log('🎯 Atualizando goals para user:', userId);
        
        // Import goal update functions dynamically to avoid circular dependencies
        const { updateGoalsAfterTrip } = await import('./goals');
        const { updateGroupGoalsAfterTrip } = await import('./groupGoals');
        const { getUserById } = await import('./users');
        
        // Update personal goals
        await updateGoalsAfterTrip(userId, {
            distanciaKm: trip.distanciaKm,
            ecoScore: trip.ecoScore,
            velocidadeMedia: trip.velocidadeMedia,
            eventosBruscos: trip.eventosBruscos,
            co2Emissions: trip.co2Emissions,
        });
        
        // Update group goals
        const user = await getUserById(userId);
        
        if (user && user.groups && user.groups.length > 0) {
            console.log('✅ Calling updateGroupGoalsAfterTrip for', user.groups.length, 'groups...');
            await updateGroupGoalsAfterTrip(userId, user.groups, {
                distanciaKm: trip.distanciaKm,
                ecoScore: trip.ecoScore,
                velocidadeMedia: trip.velocidadeMedia,
                eventosBruscos: trip.eventosBruscos,
                co2Emissions: trip.co2Emissions,
            });
        } else {
            console.log('⚠️ User has no groups:', user?.groups?.length || 0);
        }
        
        console.log('✅ Goals atualizados com sucesso!');
    }
}

// Get all trips
export async function getAllTrips(): Promise<Viagem[]> {
    try {
        const data = await AsyncStorage.getItem('trips');
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao obter viagens:', error);
        return [];
    }
}

// Delete a trip
export async function deleteTrip(tripId: string): Promise<void> {
    try {
        const trips = await getAllTrips();
        const filteredTrips = trips.filter(trip => trip.id !== tripId);
        await AsyncStorage.setItem('trips', JSON.stringify(filteredTrips));
    } catch (error) {
        console.error('Erro ao deletar viagem:', error);
        throw error;
    }
}

// Get trip by ID
export async function getTripById(tripId: string): Promise<Viagem | null> {
    try {
        const trips = await getAllTrips();
        return trips.find(trip => trip.id === tripId) || null;
    } catch (error) {
        console.error('Erro ao obter viagem:', error);
        return null;
    }
}