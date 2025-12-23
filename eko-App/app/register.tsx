import { View, Text, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import InputCustom from '@/components/inputs';
import BotaoCustom from '@/components/buttons';
import CheckboxProps from '@/components/checkBox';

export default function Login() {
    const [selecionado, setSelecionado] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState('');

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/Logo - Eco-Driving.png')}
                style={{ width: 258, height: 258, marginBottom: 20 }}
            />
            <Text style={{ fontSize: 32, marginBottom: 20 }}>Register</Text>
            <InputCustom
                placeHolder="User"
                icon={require('../assets/images/User.png')}
                value={user}
                onChangeText={setUser}
            />
            <InputCustom
                placeHolder="Email"
                icon={require('../assets/images/Email.png')}
                value={email}
                onChangeText={setEmail}
            />
            <InputCustom
                placeHolder="Password"
                icon={require('../assets/images/Lock.png')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <View>
                <CheckboxProps
                    label="Save Credentials?"
                    selecionado={selecionado}
                    onPress={() => setSelecionado(!selecionado)}
                />
            </View>
            <Text style={{ color: 'black', marginTop: 10, marginBottom: 20 }}>
                Already have an account?<Link href="/login" style={styles.link}> Click here</Link>
            </Text>
            <BotaoCustom
                titulo="Register"
                onPress={() => console.log('Register pressed', { user, email, password })} // Log email and password
                variante="primario"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        color: '#007AFF',
        fontWeight: 'bold',
        textDecorationLine: 'underline', // Fixed typo here
    },
});