import * as React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotaoCustom from "../buttons";
import { getLastTrip, Viagem } from "@/models/trip";
import { getLoggedInUser } from "@/models/users";
import { useFocusEffect } from "@react-navigation/native";

export default function MyLastTrip() {
    const [lastTrip, setLastTrip] = React.useState<Viagem | null>(null);
    const [loading, setLoading] = React.useState(true);

    const loadLastTrip = async () => {
        try {
            const user = await getLoggedInUser();
            if (user) {
                const trip = await getLastTrip(user.id);
                setLastTrip(trip);
            }
        } catch (error) {
            console.error('Error loading last trip:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadLastTrip();
    }, []);

    // Reload when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadLastTrip();
        }, [])
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <ActivityIndicator size="large" color="#5ca990" />
                </View>
            </View>
        );
    }

    if (!lastTrip) {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="car" size={20} color="#BAFFED" />
                        </View>
                        <Text style={styles.title}>My Last Trip</Text>
                    </View>
                    <View style={styles.emptyState}>
                        <Ionicons name="car-outline" size={48} color="#666" />
                        <Text style={styles.emptyText}>No trips recorded yet</Text>
                        <Text style={styles.emptySubtext}>Start a trip to see your statistics</Text>
                    </View>
                </View>
            </View>
        );
    }

    const currentValue = lastTrip.ecoScore;
    const maxValue = 5;
    const progressPercentage = Math.min(100, (currentValue / maxValue) * 100);

    // Rotation logic for each half
    const rightRotation = progressPercentage <= 50
        ? (progressPercentage / 50) * 180
        : 180;

    const leftRotation = progressPercentage > 50
        ? ((progressPercentage - 50) / 50) * 180
        : 0;

    // Calculate fuel consumption and savings (mock calculation)
    const fuelConsumed = (lastTrip.distanciaKm * 0.065).toFixed(1); // ~6.5L/100km average
    const fuelSaved = (lastTrip.distanciaKm * 0.01 * (lastTrip.ecoScore / 5)).toFixed(1);
    
    // Format duration
    const hours = Math.floor(lastTrip.duration / 3600);
    const minutes = Math.floor((lastTrip.duration % 3600) / 60);
    const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="car" size={20} color="#BAFFED" />
                    </View>
                    <Text style={styles.title}>My Last Trip</Text>
                </View>

                {/* Circular Progress Chart */}
                <View style={styles.chartContainer}>
                    {/* Background Circle */}
                    <View style={styles.circleBackground} />

                    {/* Progress Circle Logic */}
                    <View style={styles.progressCircleContainer}>
                        {/* Right Half */}
                        <View style={styles.halfCircleContainer}>
                            <View style={[
                                styles.halfCircle,
                                {
                                    backgroundColor: '#D6D6D6',
                                    transform: [
                                        { translateX: 40 },
                                        { rotate: `${rightRotation}deg` },
                                        { translateX: -40 }
                                    ]
                                }
                            ]} />
                        </View>

                        {/* Left Half */}
                        <View style={[styles.halfCircleContainer, { transform: [{ rotate: '180deg' }] }]}>
                            <View style={[
                                styles.halfCircle,
                                {
                                    backgroundColor: '#D6D6D6',
                                    transform: [
                                        { translateX: 40 },
                                        { rotate: `${leftRotation}deg` },
                                        { translateX: -40 }
                                    ]
                                }
                            ]} />
                        </View>
                    </View>

                    {/* Inner Hole (to make it a ring) */}
                    <View style={styles.innerCircle} />

                    {/* Center Value */}
                    <Text style={styles.centerText}>{currentValue.toFixed(1)}</Text>

                    {/* Divider Lines */}
                    <View style={styles.horizontalLineLeft} />
                    <View style={styles.horizontalLineRight} />
                    <View style={styles.verticalLineTop} />
                    <View style={styles.verticalLineBottom} />

                    {/* Stats Labels */}
                    <Text style={styles.statTopLeft}>Gas Spent{'\n'}{fuelConsumed}L</Text>
                    <Text style={styles.statTopRight}>Lasted{'\n'}{durationText}</Text>
                    <Text style={styles.statBottomLeft}>Saved {fuelSaved}L{'\n'}of gas</Text>
                    <Text style={styles.statBottomRight}>Drove{'\n'}{lastTrip.distanciaKm.toFixed(1)}Km</Text>
                </View>

                {/* Button */}
                <BotaoCustom
                    titulo="View Trip Details"
                    navegarPara="/stats"
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
    },
    card: {
        width: "100%",
        backgroundColor: "rgba(26, 26, 26, 0.85)",
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: "rgba(214, 214, 214, 0.2)",
        padding: 28,
        gap: 28,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(186, 255, 237, 0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#F5F5F5",
    },
    chartContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        width: 318,
        position: "relative",
    },
    circleBackground: {
        position: "absolute",
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 16,
        borderColor: "#36856D",
    },
    progressCircleContainer: {
        width: 160,
        height: 160,
        flexDirection: 'row',
    },
    halfCircleContainer: {
        width: 80,
        height: 160,
        overflow: 'hidden',
    },
    halfCircle: {
        width: 80,
        height: 160,
        borderTopLeftRadius: 80,
        borderBottomLeftRadius: 80,
    },
    innerCircle: {
        position: "absolute",
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: "#2A3A35",
    },
    centerText: {
        position: "absolute",
        fontSize: 48,
        fontWeight: "700",
        color: "#F5F5F5",
    },
    horizontalLineLeft: {
        position: "absolute",
        left: 20,
        width: 60,
        height: 1.5,
        backgroundColor: "#BAFFED",
    },
    horizontalLineRight: {
        position: "absolute",
        right: 20,
        width: 60,
        height: 1.5,
        backgroundColor: "#BAFFED",
    },
    verticalLineTop: {
        position: "absolute",
        top: 10,
        width: 1.5,
        height: 60,
        backgroundColor: "#BAFFED",
    },
    verticalLineBottom: {
        position: "absolute",
        bottom: 10,
        width: 1.5,
        height: 60,
        backgroundColor: "#BAFFED",
    },
    statTopLeft: { 
        position: "absolute", 
        left: 0, 
        top: 60, 
        fontSize: 13, 
        color: "#F5F5F5",
        fontWeight: "500",
        flexWrap: "wrap",
        maxWidth: 80,
    },
    statTopRight: { 
        position: "absolute", 
        right: 0, 
        top: 60, 
        fontSize: 13, 
        color: "#F5F5F5", 
        textAlign: "right",
        fontWeight: "500",
        flexWrap: "wrap",
        maxWidth: 80,
    },
    statBottomLeft: { 
        position: "absolute", 
        left: 0, 
        bottom: 60, 
        fontSize: 13, 
        color: "#F5F5F5",
        fontWeight: "500",
        flexWrap: "wrap",
        maxWidth: 80,
    },
    statBottomRight: { 
        position: "absolute", 
        right: 0, 
        bottom: 60, 
        fontSize: 13, 
        color: "#F5F5F5", 
        textAlign: "right",
        fontWeight: "500",
        flexWrap: "wrap",
        maxWidth: 80,
    },
    button: {
        alignSelf: "center",
        marginTop: 8,
        width: "80%",
        height: 60,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#f5f5f5',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
});