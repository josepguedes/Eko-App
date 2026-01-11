import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'

export default function IntroBox() {
    return (
        <View style={styles.container}>
            <View style={styles.overlay} />
            <View style={styles.contentContainer}>
                <View style={styles.rowContainer}>
                    <Image
                        source={require('../../assets/images/phoneCar.png')}>
                    </Image>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('../../assets/images/targetIcon.png')}>
                        </Image>
                    </View>
                    <View>
                        <Text style={styles.title}>Choose efficient</Text>
                        <Text style={styles.title}>paths with few</Text>
                        <Text style={styles.title}>stops.</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        height: 139,
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 8,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(214, 214, 214, 0.2)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 16,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 20,
        height: 20,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 24,
    },
})