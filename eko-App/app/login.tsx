import { View, Text, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputCustom from '@/components/inputs';
import BotaoCustom from '@/components/buttons';
import CheckboxProps from '@/components/checkBox';
import { authenticateUser, loginUser } from '@/models/users';
import { initializeAppData } from '@/models/initialization';


export default function Login() {
    const router = useRouter();
    const [selecionado, setSelecionado] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize app data when component mounts
    useEffect(() => {
        initializeAppData().catch(error => {
            console.error('Failed to initialize app data:', error);
        });
    }, []);

    const handleLogin = async () => {
        setErrorMessage('');

        try {
            // Authenticate user with email and password
            const user = await authenticateUser(email, password);
            
            // If authentication successful, log the user in
            await loginUser(user.id);

            // If the checkbox is active, save credentials
            if (selecionado) {
                // TODO: Implement credential saving if needed
                console.log('Credenciais guardadas');
            }

            // Verificar se a password está correta
            if (user.password !== password) {
                // console.log('Erro: Password incorreta');
                setErrorMessage('Password incorreta. Tente novamente.');
                return;
            }

            // console.log('Login bem-sucedido! A redirecionar...');
            // Redirecionar para a área autenticada
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Erro ao fazer login. Tente novamente.');
            }
        }
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/Logo - Eco-Driving.png')}
                            style={styles.logo}
                        />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        <View style={styles.inputsContainer}>
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
                        </View>

                        {errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.checkboxContainer}>
                            <CheckboxProps
                                label="Save Credentials?"
                                selecionado={selecionado}
                                onPress={() => setSelecionado(!selecionado)}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <BotaoCustom
                                titulo="Login"
                                onPress={handleLogin}
                                variante="primario"
                            />
                        </View>

                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>
                                Don't have an account?{' '}
                                <Link href="/register" style={styles.link}>Sign up</Link>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e0d',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 180,
        height: 180,
    },
    formContainer: {
        backgroundColor: 'rgba(26, 26, 26, 0.85)',
        borderRadius: 24,
        borderWidth: 0.5,
        borderColor: 'rgba(214, 214, 214, 0.2)',
        padding: 28,
        gap: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#f5f5f5',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputsContainer: {
        gap: 4,
        marginBottom: 8,
    },
    errorContainer: {
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(231, 76, 60, 0.3)',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    checkboxContainer: {
        marginVertical: 8,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    registerContainer: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(214, 214, 214, 0.2)',
    },
    registerText: {
        fontSize: 15,
        color: '#999',
    },
    link: {
        color: '#5ca990',
        fontWeight: '700',
    },
});