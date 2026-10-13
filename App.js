import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import NavegacaoPrincipal from './src/navegacao/NavegacaoPrincipal';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#181818"
      />
      <NavegacaoPrincipal />
    </NavigationContainer>
  );
}