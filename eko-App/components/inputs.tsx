import * as React from "react";
import { StyleSheet, View, Image, ImageSourcePropType, TextInput } from "react-native";

interface InputsProps {
    placeHolder: string;
    icon: ImageSourcePropType;
    value?: string; // Opcional: para controlar o texto
    onChangeText?: (text: string) => void; // Opcional: para capturar o que é escrito
    secureTextEntry?: boolean; // Opcional: para campos de senha
}

export default function InputCustom({
    placeHolder,
    icon,
    value,
    onChangeText,
    secureTextEntry = false
}: InputsProps) {
    return (
        <View style={styles.wrapper}> 
            <View style={styles.inputContainer}>
                <View style={styles.leftSection}>
                    {/* Renderiza o ícone que passares por caminho */}
                    <Image source={icon} style={styles.iconStyle} />
                    
                    {/* TextInput em vez de Text para permitir escrita */}
                    <TextInput 
                        style={styles.textInput}
                        placeholder={placeHolder}
                        placeholderTextColor="#666"
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={secureTextEntry}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 8,
    },
    inputContainer: {
        width: '100%',
        height: 52,
        borderStyle: "solid",
        borderColor: "rgba(214, 214, 214, 0.3)",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    iconStyle: {
        height: 20,
        width: 20,
        resizeMode: "contain"
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: "DMSans-Regular",
        color: "#f5f5f5",
    }
});