import * as React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BotaoCustom from "../buttons";


interface MyLastTripProps {
    current ?: number;
}

export default function MyLastTrip() {
    const currentValue = 3.6; // Testado com 5
    const maxValue = 5;
    const progressPercentage = Math.min(100, (currentValue / maxValue) * 100);

    // Lógica de rotação para cada metade
    const rightRotation = progressPercentage <= 50
        ? (progressPercentage / 50) * 180
        : 180;

    const leftRotation = progressPercentage > 50
        ? ((progressPercentage - 50) / 50) * 180
        : 0;

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
                    <Text style={styles.centerText}>{currentValue.toFixed(1).replace('.', ',')}</Text>

                    {/* Divider Lines */}
                    <View style={styles.horizontalLineLeft} />
                    <View style={styles.horizontalLineRight} />
                    <View style={styles.verticalLineTop} />
                    <View style={styles.verticalLineBottom} />

                    {/* Stats Labels */}
                    <Text style={styles.statTopLeft}>Gas Spent{'\n'}10.2L</Text>
                    <Text style={styles.statTopRight}>Lasted{'\n'}12 minutes</Text>
                    <Text style={styles.statBottomLeft}>Saved 0.2L{'\n'}of gas</Text>
                    <Text style={styles.statBottomRight}>Drove{'\n'}2.1Km</Text>
                </View>

                {/* Button */}
                
                    <BotaoCustom
                        titulo="View Trip Details"
                        navegarPara="/tripDetails"
                        style={styles.button}
                    />

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 8,
    },
    card: {
        width: "100%",
        maxWidth: 520,
        backgroundColor: "rgba(26, 26, 26, 0.85)",
        borderRadius: 20,
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
        backgroundColor: "#2A3A35", // Cor igual ao fundo do card
    },
    centerText: {
        position: "absolute",
        fontSize: 48,
        fontWeight: "700",
        color: "#F5F5F5",
    },
    // Linhas e Stats
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
    statTopLeft: { position: "absolute", left: 0, top: 60, fontSize: 13, color: "#F5F5F5" },
    statTopRight: { position: "absolute", right: 0, top: 60, fontSize: 13, color: "#F5F5F5", textAlign: "right" },
    statBottomLeft: { position: "absolute", left: 0, bottom: 60, fontSize: 13, color: "#F5F5F5" },
    statBottomRight: { position: "absolute", right: 0, bottom: 60, fontSize: 13, color: "#F5F5F5", textAlign: "right" },

    button: {
        alignSelf: "center",
        marginTop: 8,
        width: "80%",
        height: 60,
    },
});