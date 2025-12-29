import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

interface BotaoProps {
    titulo: string;
    onPress?: () => void;
    navegarPara?: string;
    variante?: 'primario' | 'secundario';
    style?: ViewStyle;
}

export default function BotaoCustom({ 
    titulo, 
    onPress, 
    navegarPara,
    variante = 'primario', 
    style 
}: BotaoProps) {
    const router = useRouter();

    const handlePress = () => {
        if (navegarPara) {
            router.push(navegarPara as any);
        } else if (onPress) {
            onPress();
        }
    };

    return (
        <TouchableOpacity 
            onPress={handlePress}
            style={[
                styles.botaoBase, 
                variante === 'primario' ? styles.primario : styles.secundario,
                style
            ]}
            activeOpacity={0.7}
        >
                <Text style={[
                    styles.textoBase,
                    variante === 'primario' ? styles.textoPrimario : styles.textoSecundario
                ]}>
                    {titulo}
                </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botaoBase: {
        width: 150,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    primario: {
        backgroundColor: '#FFFFFF',
    },
    secundario: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    textoBase: {
        fontSize: 16,
        fontWeight: '600',
    },
    textoPrimario: {
        color: '#000000',
    },
    textoSecundario: {
        color: '#FFFFFF',
    },
});