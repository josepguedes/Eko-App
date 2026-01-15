import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

interface BotaoProps {
    titulo: string;
    onPress?: () => void;
    navegarPara?: string;
    variante?: 'primario' | 'secundario';
    style?: ViewStyle;
    disabled?: boolean;
}

export default function BotaoCustom({ 
    titulo, 
    onPress, 
    navegarPara,
    variante = 'primario', 
    style,
    disabled = false
}: BotaoProps) {
    const router = useRouter();

    const handlePress = () => {
        if (disabled) return;
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
                disabled && styles.disabled,
                style
            ]}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
        >
                <Text style={[
                    styles.textoBase,
                    variante === 'primario' ? styles.textoPrimario : styles.textoSecundario,
                    disabled && styles.textoDisabled
                ]}>
                    {titulo}
                </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botaoBase: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
    },
    primario: {
        backgroundColor: '#5ca990',
    },
    secundario: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#5ca990',
    },
    textoBase: {
        fontSize: 16,
        fontWeight: '700',
    },
    textoPrimario: {
        color: '#FFFFFF',
    },
    textoSecundario: {
        color: '#5ca990',
    },
    disabled: {
        opacity: 0.5,
    },
    textoDisabled: {
        opacity: 0.7,
    },
});