import { View, Text, StyleSheet, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import InputCustom from '@/components/inputs';
import BotaoCustom from '@/components/buttons';
import CheckboxProps from '@/components/checkBox';
import { registerUser, loginUser } from '@/models/users';
import { initializeAppData } from '@/models/initialization';

export default function Register() {
    const router = useRouter();
    const [selecionado, setSelecionado] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize app data when component mounts
    useEffect(() => {
        initializeAppData().catch(error => {
            console.error('Failed to initialize app data:', error);
        });
    }, []);

    const handleRegister = async () => {
        console.log('=== INÍCIO DO REGISTO ===');
        setErrorMessage('');

        try {
            // Registar o utilizador usando a função do modelo
            const newUser = await registerUser(user, email, password);
            console.log('Utilizador registado:', newUser);

            // Fazer login automático do utilizador
            await loginUser(newUser.id);

            // Se o checkbox estiver ativo, guardar credenciais
            if (selecionado) {
                console.log('Credenciais guardadas');
            }

            console.log('Registo bem-sucedido! A redirecionar...');
            router.replace('/login');
        } catch (error) {
            // Captura todos os erros lançados pelo modelo
            console.error('Erro:', error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Erro ao registar. Tente novamente.');
            }
        }
    };

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
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
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
                onPress={handleRegister}
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
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#ff0000',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        width: 258,
    },
});