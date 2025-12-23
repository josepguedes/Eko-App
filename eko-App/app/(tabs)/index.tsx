import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';


import ParallaxScrollView from '@/components/parallax-scroll-view';
import BotaoCustom from '@/components/buttons';

export default function HomeScreen() {
  return (

    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <BotaoCustom
        titulo="Login Page"
        onPress={() => console.log('Botão pressionado!')}
        variante="primario"
        navegarPara="login"
      />
      <BotaoCustom
        titulo="Register Page"
        onPress={() => console.log('Botão pressionado!')}
        variante="primario"
        navegarPara="register"
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
