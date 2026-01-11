import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLoggedInUser } from '@/models/users';
import { getUserCars, Car, getCarById } from '@/models/cars';
import { useRouter } from 'expo-router';


interface DropdownProps {
    titulo?: string;
}

export default function Dropdown() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [car, setCar] = useState<Car | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadUserCar();
    }, []);

    const loadUserCar = async () => {
        try {
            setLoading(true);
            const user = await getLoggedInUser();
            if (user) {
                const cars = await getUserCars(user.id);
                
                // If user has a selected car, use it
                if (user.selectedCarId && cars.length > 0) {
                    const selectedCar = cars.find(c => c.id === user.selectedCarId);
                    setCar(selectedCar || (cars.length > 0 ? cars[0] : null));
                } else {
                    // Otherwise, use the first car
                    setCar(cars.length > 0 ? cars[0] : null);
                }
            }
        } catch (error) {
            console.error('Error loading user car:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayText = loading 
        ? 'Loading...' 
        : car 
            ? `Connected to ${car.model}`
            : 'No car connected';

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => router.push('/mycars')}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="car-outline" size={24} color="#fff" />
                    )}
                    <Text style={styles.text}>{displayText}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.5)',
        borderRadius: 12,
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    text: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        minHeight: 20,
    },
});
