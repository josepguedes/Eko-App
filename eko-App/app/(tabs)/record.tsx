import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { TripManager, LocationCoords, AggressiveEvent } from '../../models/trip';
import savetrip from '../../models/trip';
import { Colors } from '../../constants/colors';

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

  const mapRef = useRef<any>(null);
  const tripManager = useRef(new TripManager()).current;
  const velocidadeAnimada = useRef(new Animated.Value(0)).current;
  const durationInterval = useRef<any>(null);

  const startTracking = () => {
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
        Alert.alert('Erro', 'Não foi possível obter a localização');
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
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

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
        showsMyLocationButton={true}
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
                <Text style={styles.compactStatLabel}>TEMPO</Text>
                <Text style={styles.compactStatValue}>{formatDuration(duration)}</Text>
              </View>
              <View style={styles.compactStatRow}>
                <Text style={styles.compactStatLabel}>DISTÂNCIA</Text>
                <Text style={styles.compactStatValue}>{distance.toFixed(2)} km</Text>
              </View>
              {aggressiveMarkers.length > 0 && (
                <View style={styles.compactStatRow}>
                  <Text style={styles.compactStatLabel}>ALERTAS</Text>
                  <Text style={styles.compactStatWarning}>{aggressiveMarkers.length}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.compactDivider} />
            
            {/* Stop Button */}
            <TouchableOpacity style={styles.compactStopButton} onPress={stopTracking}>
              <Text style={styles.compactStopIcon}>■</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full Dashboard - Before and After Recording */}
      {!isTracking && (
        <View style={styles.dashboard}>
          {/* Show stats if trip exists */}
          {route.length > 0 ? (
            <>
              {/* Trip Summary */}
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Viagem Concluída</Text>
              </View>

              {/* Main Speed Display */}
              <View style={styles.speedCard}>
                <View style={[styles.speedCircle, styles.speedCircleDark]}>
                  <Text style={styles.speedValue}>{tripManager.getTrip().velocidadeMedia}</Text>
                  <Text style={styles.speedUnit}>km/h médio</Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardTitle}>DISTÂNCIA</Text>
                  <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
                  <Text style={styles.statUnit}>km</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardTitle}>TEMPO</Text>
                  <Text style={styles.statValue}>{formatDuration(duration)}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardTitle}>MÁX. VEL.</Text>
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
              </View>

              {/* Events Summary */}
              {aggressiveMarkers.length > 0 && (
                <View style={styles.eventsCard}>
                  <Text style={styles.eventsText}>
                    {aggressiveMarkers.length} evento{aggressiveMarkers.length !== 1 ? 's' : ''} de condução brusca detectado{aggressiveMarkers.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={async () => {
                  try {
                    await savetrip(tripManager.getTrip());
                    Alert.alert('Sucesso', 'Viagem guardada com sucesso!');
                    resetTrip();
                  } catch (error) {
                    Alert.alert('Erro', 'Não foi possível guardar a viagem');
                  }
                }}>
                  <Text style={styles.buttonText}>Guardar Viagem</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.resetButton} onPress={resetTrip}>
                  <Text style={styles.buttonText}>Descartar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Initial State - No Trip */}
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Pronto para começar?</Text>
                <Text style={styles.emptyText}>
                  Inicie uma viagem para rastrear o seu percurso e calcular o Eco Score
                </Text>
              </View>
              
              <TouchableOpacity style={styles.startButton} onPress={startTracking}>
                <Text style={styles.buttonText}>Iniciar Viagem</Text>
              </TouchableOpacity>
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
  compactStopIcon: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
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
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(92, 169, 144, 0.3)',
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