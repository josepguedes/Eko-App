import { View, Text, StyleSheet, Image} from 'react-native';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import InputCustom from '@/components/inputs';
import BotaoCustom from '@/components/buttons';
import CheckboxProps from '@/components/checkBox';
import { getAllUsers, loginUser } from '@/models/users';


export default function Login() {
    const router = useRouter();
    const [selecionado, setSelecionado] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        // // console.log('=== INÍCIO DO LOGIN ===');
        setErrorMessage('');

        // Validação de campos vazios
        if (!email.trim() || !password.trim()) {
            // // console.log('Erro: Campos vazios');
            setErrorMessage('Por favor, preencha todos os campos');
            return;
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            // // console.log('Erro: Email inválido');
            setErrorMessage('Por favor, insira um email válido');
            return;
        }

        try {
            // Buscar todos os utilizadores
            // console.log('A buscar utilizadores...');
            const users = await getAllUsers();
            // console.log('Número de utilizadores encontrados:', users.length);
            // console.log('Lista de utilizadores:', users);
            
            // Procurar utilizador com o email fornecido
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            // console.log('Utilizador encontrado:', user);

            if (!user) {
                // console.log('Erro: Utilizador não encontrado');
                setErrorMessage('Utilizador não encontrado. Verifique o email ou registe-se.');
                return;
            }

            // Fazer login do utilizador
            // console.log('A fazer login do utilizador:', user.id);
            await loginUser(user.id);

            // Se o checkbox estiver ativo, guardar credenciais
            if (selecionado) {
                // console.log('Credenciais guardadas');
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
        <View style={styles.container}>
            <Image
                source={require('../assets/images/Logo - Eco-Driving.png')}
                style={{ width: 258, height: 258, marginBottom: 20 }}
            />
            <Text style={{ fontSize: 32, marginBottom: 20 }}>Login</Text>
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
                Don't Have an Account?<Link href="/register" style={styles.link}> Click here</Link>
            </Text>
            <BotaoCustom
                titulo="Login"
                onPress={handleLogin}
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