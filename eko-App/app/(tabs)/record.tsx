import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated, ScrollView } from 'react-native';
import { TripManager, LocationCoords, AggressiveEvent, calculateFuelConsumption, getFuelUnit, getConsumptionUnit } from '../../models/trip';
import savetrip from '../../models/trip';
import { Colors } from '../../constants/colors';
import { getLoggedInUser } from '@/models/users';
import { getCarById } from '@/models/cars';
import { useNotification } from '@/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

// Conditional imports for native platforms only
let MapView: any;
let PROVIDER_GOOGLE: any;
let Marker: any;
let Polyline: any;

if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
  PROVIDER_GOOGLE = require('react-native-maps').PROVIDER_GOOGLE;
  Marker = require('react-native-maps').Marker;
  Polyline = require('react-native-maps').Polyline;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function RecordScreen() {
  const router = useRouter();
  const [velocidade, setVelocidade] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<LocationCoords[]>([]);
  const [aggressiveMarkers, setAggressiveMarkers] = useState<AggressiveEvent[]>([]);
  const [distance, setDistance] = useState(0);
  const [region, setRegion] = useState<Region>({
    latitude: 41.1579, // Porto default
    longitude: -8.6291,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [selectedCarName, setSelectedCarName] = useState<string>('No Car Selected');
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel' | 'electric' | 'hybrid'>('gasoline');
  const [fuelStats, setFuelStats] = useState({
    fuelConsumed: 0,
    avgConsumption: 0,
    fuelCost: 0,
    co2Emissions: 0
  });
  const [activeStatsTab, setActiveStatsTab] = useState<'trip' | 'fuel'>('trip');
  const { showNotification } = useNotification();

  const mapRef = useRef<any>(null);
  const tripManager = useRef(new TripManager()).current;
  const velocidadeAnimada = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<any>(null);

  const startTracking = () => {
    // Check if car is selected
    if (!selectedCarId) {
      showNotification('critical', 'Please select a car before starting a trip');
      return;
    }

    setIsTracking(true);
    setDuration(0);

    // Start duration timer
    durationInterval.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    tripManager.startTracking(
      (coords, speed) => {
        // Update UI with new data - ensure speed is never negative
        const validSpeed = Math.max(0, Math.round(speed));
        setVelocidade(validSpeed);
        
        // Track max speed
        if (validSpeed > maxSpeed) {
          setMaxSpeed(validSpeed);
        }
        
        // Animar a velocidade de forma fluida
        Animated.spring(velocidadeAnimada, {
          toValue: validSpeed,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();

        // Update map region to follow user
        const newRegion = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);

        if (mapRef.current && Platform.OS !== 'web') {
          mapRef.current.animateToRegion(newRegion, 1000);
        }

        // Update route and stats from trip manager
        setRoute([...tripManager.getRoute()]);
        setAggressiveMarkers([...tripManager.getAggressiveEvents()]);
        setDistance(tripManager.getDistance());
      },
      (error) => {
        console.error('Tracking error:', error);
        showNotification('critical', 'Unable to get location');
        setIsTracking(false);
      }
    );
  };

  const stopTracking = async () => {
    tripManager.stopTracking();
    setIsTracking(false);

    // Stop duration timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }

    // Calculate final fuel stats
    const ecoScore = getCurrentEcoScore();
    const finalStats = calculateFuelConsumption(distance, fuelType, ecoScore, aggressiveMarkers.length);
    setFuelStats(finalStats);

    // Get final trip data (already stored in state)
    // Dashboard will automatically show the summary view
  };

  const resetTrip = () => {
    tripManager.reset();
    setRoute([]);
    setAggressiveMarkers([]);
    setDistance(0);
    setVelocidade(0);
    setMaxSpeed(0);
    setDuration(0);
    velocidadeAnimada.setValue(0);
    setFuelStats({ fuelConsumed: 0, avgConsumption: 0, fuelCost: 0, co2Emissions: 0 });
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  // Load selected car on screen focus
  useFocusEffect(
    useCallback(() => {
      const loadSelectedCar = async () => {
        try {
          const user = await getLoggedInUser();
          if (user?.selectedCarId) {
            const car = await getCarById(user.selectedCarId);
            if (car) {
              setSelectedCarId(car.id);
              setSelectedCarName(car.model);
              setFuelType(car.fuelType);
              console.log('✅ Car reloaded on focus:', car.model);
            } else {
              setSelectedCarId(undefined);
              setSelectedCarName('No Car Selected');
              console.log('⚠️ Car not found');
            }
          } else {
            setSelectedCarId(undefined);
            setSelectedCarName('No Car Selected');
            console.log('⚠️ No car selected in user');
          }
        } catch (error) {
          console.error('Error loading selected car:', error);
        }
      };
      loadSelectedCar();
    }, [])
  );

  useEffect(() => {
    // Only run on native platforms
    if (Platform.OS === 'web') {
      return;
    }

    // Get initial position
    tripManager.getCurrentLocation()
      .then((coords) => {
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      })
      .catch((error) => console.error('Initial position error:', error));

    return () => {
      tripManager.stopTracking();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Update fuel statistics when distance or events change
  useEffect(() => {
    if (distance > 0) {
      const ecoScore = getCurrentEcoScore();
      const stats = calculateFuelConsumption(distance, fuelType, ecoScore, aggressiveMarkers.length);
      setFuelStats(stats);
    }
  }, [distance, aggressiveMarkers, fuelType]);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate eco score in real-time
  const getCurrentEcoScore = (): number => {
    if (distance === 0) return 100;
    let score = 100;
    const eventsPerKm = aggressiveMarkers.length / distance;
    score -= Math.min(eventsPerKm * 20, 60);
    if (aggressiveMarkers.length === 0 && distance > 0) {
      score = Math.min(score + 10, 100);
    }
    return Math.max(0, Math.round(score));
  };

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackTitle}>🗺️ Mapa não disponível</Text>
          <Text style={styles.webFallbackText}>
            A funcionalidade de mapa e rastreamento GPS está disponível apenas nas versões Android e iOS.
          </Text>
          <Text style={styles.webFallbackSubtext}>
            Por favor, utilize a aplicação no seu dispositivo móvel para aceder a esta funcionalidade.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={true}
        mapType="standard"
        showsBuildings={true}
        showsIndoors={false}
        rotateEnabled={true}
        pitchEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        loadingEnabled={true}
        followsUserLocation={isTracking}
      >
        {/* Route polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor={Colors.light.tint}
            strokeWidth={4}
          />
        )}

        {/* Aggressive driving markers */}
        {aggressiveMarkers.map((marker, index) => (
          <Marker
            key={`aggressive-${index}`}
            coordinate={marker.coordinate}
            pinColor={marker.type === 'acceleration' ? "red" : "orange"}
            title={marker.type === 'acceleration' ? "Aceleração Brusca" : "Travagem Brusca"}
            description={`Diferença: ${Math.abs(marker.speedDiff)} km/h`}
          />
        ))}
      </MapView>

      {/* Center Map Button - Top Right before trip, Bottom Right during trip, Hidden after trip */}
      {route.length === 0 && !isTracking ? (
        // Before trip starts - Top Right
        <TouchableOpacity
          style={styles.centerMapButtonTop}
          onPress={async () => {
            try {
              const coords = await tripManager.getCurrentLocation();
              const newRegion = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              };
              setRegion(newRegion);
              if (mapRef.current && Platform.OS !== 'web') {
                mapRef.current.animateToRegion(newRegion, 500);
              }
            } catch (error) {
              showNotification('critical', 'Unable to get current location');
            }
          }}
        >
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      ) : isTracking ? (
        // During trip - Bottom Right
        <TouchableOpacity
          style={styles.centerMapButtonBottom}
          onPress={async () => {
            try {
              const coords = await tripManager.getCurrentLocation();
              const newRegion = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              };
              setRegion(newRegion);
              if (mapRef.current && Platform.OS !== 'web') {
                mapRef.current.animateToRegion(newRegion, 500);
              }
            } catch (error) {
              showNotification('critical', 'Unable to get current location');
            }
          }}
        >
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      ) : null}

      {/* Active Car Indicator - Top Left when not tracking, Bottom Left when tracking */}
      {!isTracking ? (
        // Clickable only when no trip data (before starting), non-clickable when trip completed
        route.length === 0 ? (
          <TouchableOpacity 
            style={styles.activeCarIndicatorTop}
            onPress={() => router.push('/mycars')}
            activeOpacity={0.7}
          >
            <Ionicons name="car-sport" size={18} color={selectedCarId ? Colors.light.tint : '#EF5350'} />
            <Text style={[styles.activeCarText, !selectedCarId && styles.activeCarTextWarning]}>
              {selectedCarName}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#9BA1A6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.activeCarIndicatorTop}>
            <Ionicons name="car-sport" size={18} color={selectedCarId ? Colors.light.tint : '#EF5350'} />
            <Text style={[styles.activeCarText, !selectedCarId && styles.activeCarTextWarning]}>
              {selectedCarName}
            </Text>
          </View>
        )
      ) : (
        <View style={styles.activeCarIndicatorBottom}>
          <Ionicons name="car-sport" size={18} color={selectedCarId ? Colors.light.tint : '#EF5350'} />
          <Text style={[styles.activeCarText, !selectedCarId && styles.activeCarTextWarning]}>
            {selectedCarName}
          </Text>
        </View>
      )}

      {/* Compact Dashboard - During Recording */}
      {isTracking && (
        <View style={styles.compactDashboard}>
          <View style={styles.compactRow}>
            {/* Speed Display */}
            <View style={styles.compactSpeedBox}>
              <Animated.Text style={styles.compactSpeedValue}>
                {velocidade}
              </Animated.Text>
              <Text style={styles.compactSpeedUnit}>km/h</Text>
            </View>
            
            <View style={styles.compactDivider} />
            
            {/* Stats Column */}
            <View style={styles.compactInfoColumn}>
              <View style={styles.compactStatRow}>
                <Text style={styles.compactStatLabel}>TIME</Text>
                <Text style={styles.compactStatValue}>{formatDuration(duration)}</Text>
              </View>
              <View style={styles.compactStatRow}>
                <Text style={styles.compactStatLabel}>DISTANCE</Text>
                <Text style={styles.compactStatValue}>{distance.toFixed(2)} km</Text>
              </View>
              {aggressiveMarkers.length > 0 && (
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>ALERTS</Text>
                  <Text style={styles.compactStatWarning}>{aggressiveMarkers.length}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.compactDivider} />
            
            {/* Stop Button */}
            <TouchableOpacity style={styles.compactStopButton} onPress={stopTracking}>
              <Ionicons name="stop" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full Dashboard - Before and After Recording */}
      {!isTracking && (
        <View style={styles.dashboard}>
          {/* Show stats if trip exists */}
          {route.length > 0 ? (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Trip Summary */}
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Trip Completed</Text>
              </View>

              {/* Main Speed Display */}
              <View style={styles.speedCard}>
                <View style={[styles.speedCircle, styles.speedCircleDark]}>
                  <Text style={styles.speedValue}>{tripManager.getTrip().velocidadeMedia}</Text>
                  <Text style={styles.speedUnit}>km/h avg</Text>
                </View>
              </View>

              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeStatsTab === 'trip' && styles.tabActive]}
                  onPress={() => setActiveStatsTab('trip')}
                >
                  <Text style={[styles.tabText, activeStatsTab === 'trip' && styles.tabTextActive]}>
                    Trip Stats
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeStatsTab === 'fuel' && styles.tabActive]}
                  onPress={() => setActiveStatsTab('fuel')}
                >
                  <Text style={[styles.tabText, activeStatsTab === 'fuel' && styles.tabTextActive]}>
                    Fuel Stats
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stats Content - Trip Stats Tab */}
              {activeStatsTab === 'trip' && (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>DISTANCE</Text>
                    <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
                    <Text style={styles.statUnit}>km</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>TIME</Text>
                    <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>MAX SPEED</Text>
                    <Text style={styles.statValue}>{maxSpeed}</Text>
                    <Text style={styles.statUnit}>km/h</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>ECO SCORE</Text>
                    <Text style={[styles.statValue, { 
                      color: getCurrentEcoScore() >= 80 ? '#4CAF50' : getCurrentEcoScore() >= 60 ? '#FF9800' : '#f44336'
                    }]}>
                      {getCurrentEcoScore()}
                    </Text>
                    <Text style={styles.statUnit}>/100</Text>
                  </View>

                  {/* Events Summary */}
                  {aggressiveMarkers.length > 0 && (
                    <View style={styles.eventsCardWide}>
                      <Text style={styles.eventsText}>
                        {aggressiveMarkers.length} harsh driving event{aggressiveMarkers.length !== 1 ? 's' : ''} detected
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Stats Content - Fuel Stats Tab */}
              {activeStatsTab === 'fuel' && (
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>CONSUMPTION</Text>
                    <Text style={styles.statValue}>
                      {fuelStats.avgConsumption.toFixed(2)}
                    </Text>
                    <Text style={styles.statUnit}>{getConsumptionUnit(fuelType)}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>TOTAL USED</Text>
                    <Text style={styles.statValue}>
                      {fuelStats.fuelConsumed.toFixed(2)}
                    </Text>
                    <Text style={styles.statUnit}>{getFuelUnit(fuelType)}</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>COST</Text>
                    <Text style={[styles.statValue, { color: '#FFB74D' }]}>
                      {fuelStats.fuelCost.toFixed(2)}
                    </Text>
                    <Text style={styles.statUnit}>EUR</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardTitle}>CO2</Text>
                    <Text style={[styles.statValue, { color: fuelType === 'electric' ? '#4CAF50' : '#EF5350' }]}>
                      {fuelStats.co2Emissions.toFixed(2)}
                    </Text>
                    <Text style={styles.statUnit}>kg</Text>
                  </View>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={async () => {
                  try {
                    const trip = tripManager.getTrip();
                    // Get logged in user
                    const user = await getLoggedInUser();
                    
                    // Add car and fuel data to trip
                    const tripWithFuel = {
                      ...trip,
                      carId: selectedCarId,
                      fuelType: fuelType,
                      fuelConsumed: fuelStats.fuelConsumed,
                      fuelCost: fuelStats.fuelCost,
                      co2Emissions: fuelStats.co2Emissions,
                      avgConsumption: fuelStats.avgConsumption
                    };
                    
                    // Save trip and auto-update goals
                    await savetrip(tripWithFuel, user?.id);
                    showNotification('success', 'Trip saved successfully!');
                    resetTrip();
                  } catch (error) {
                    showNotification('critical', 'Failed to save trip');
                  }
                }}>
                  <Text style={styles.buttonText}>Save Trip</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.resetButton} onPress={resetTrip}>
                  <Text style={styles.buttonText}>Discard</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <>
              {/* Initial State - No Trip */}
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Ready to start?</Text>
                <Text style={styles.emptyText}>
                  {selectedCarId 
                    ? 'Start a trip to track your route and calculate your Eco Score'
                    : 'Select a car before starting your first trip'}
                </Text>
              </View>
              
              {selectedCarId ? (
                <TouchableOpacity style={styles.startButton} onPress={startTracking}>
                  <Text style={styles.buttonText}>Start Trip</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.goToCarsButton} 
                  onPress={() => router.push('/mycars')}
                >
                  <Ionicons name="car-sport" size={20} color="white" />
                  <Text style={styles.buttonText}>Go to My Cars</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  // Center Map Button - Top Right (before trip)
  centerMapButtonTop: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  // Center Map Button - Bottom Right (during trip)
  centerMapButtonBottom: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  // Active Car Indicator - Top position when not tracking
  activeCarIndicatorTop: {
    position: 'absolute',
    top: 60,
    left: 15,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.3)',
  },
  // Active Car Indicator - Bottom position when tracking
  activeCarIndicatorBottom: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.3)',
  },
  activeCarText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  activeCarTextWarning: {
    color: '#EF5350',
  },
  // Compact Dashboard (During Recording)
  compactDashboard: {
    position: 'absolute',
    top: 60,
    right: 15,
    left: 15,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.3)',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactSpeedBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  compactSpeedValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.tint,
    lineHeight: 40,
  },
  compactSpeedUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA1A6',
    marginTop: -2,
  },
  compactDivider: {
    width: 1,
    height: 55,
    backgroundColor: 'rgba(92, 169, 144, 0.3)',
    marginHorizontal: 12,
  },
  compactInfoColumn: {
    flex: 1,
    gap: 8,
  },
  compactStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9BA1A6',
    letterSpacing: 0.8,
  },
  compactStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ECEDEE',
  },
  compactStatWarning: {
    fontSize: 14,
    fontWeight: '800',
    color: '#f44336',
  },
  compactStopButton: {
    backgroundColor: '#f44336',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 8,
  },
  // Full Dashboard (Before and After Recording)
  dashboard: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.3)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 169, 144, 0.2)',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECEDEE',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ECEDEE',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9BA1A6',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  speedCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  speedCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  speedCircleDark: {
    backgroundColor: 'rgba(92, 169, 144, 0.9)',
  },
  speedValue: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  speedUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: -5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.2)',
  },
  statCardTitle: {
    fontSize: 10,
    color: '#9BA1A6',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#9BA1A6',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECEDEE',
  },
  statUnit: {
    fontSize: 10,
    color: '#9BA1A6',
    fontWeight: '500',
    marginTop: 2,
  },
  // Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(44, 44, 46, 0.6)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9BA1A6',
  },
  tabTextActive: {
    color: 'white',
  },
  eventsCardWide: {
    width: '100%',
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginTop: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  eventsCard: {
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#f44336',
  },
  eventsText: {
    fontSize: 13,
    color: '#ff8a80',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  startButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  goToCarsButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(108, 117, 125, 0.8)',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 161, 166, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  webFallbackTitle: {
    fontSize: 32,
    marginBottom: 20,
  },
  webFallbackText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
    fontWeight: '600',
  },
  webFallbackSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    maxWidth: 400,
  },
});
