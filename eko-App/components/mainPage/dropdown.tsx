import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


interface DropdownProps {
    titulo: string;
}

export default function Dropdown() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    <Ionicons name="car-outline" size={24} color="#fff" />
                    <Text style={styles.text}>Connected to Audi Q5</Text>
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
