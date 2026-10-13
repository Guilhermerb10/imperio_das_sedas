
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import Home from '../telas/Home';
import Estoque from '../telas/Estoque';
import Movimentacoes from '../telas/Movimentacoes';
import Historico from '../telas/Historico';
import CadastroProduto from '../telas/CadastroProduto';

import { cores } from '../estilo/style';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Menu inferior do aplicativo
function MenuPrincipal() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.dourado,
        tabBarInactiveTintColor: cores.textoSecundario,

        tabBarStyle: {
          backgroundColor: cores.fundo,
          borderTopColor: cores.borda,
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarIcon: ({ color, size, focused }) => {
          const icones = {
            Inicio: focused ? 'home' : 'home-outline',
            Estoque: focused ? 'cube' : 'cube-outline',
            Movimentacoes: 'swap-horizontal-outline',
            Historico: focused ? 'time' : 'time-outline',
          };

          return (
            <Ionicons
              name={icones[route.name]}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={Home}
        options={{ tabBarLabel: 'Início' }}
      />

      <Tab.Screen name="Estoque" component={Estoque} />

      <Tab.Screen
        name="Movimentacoes"
        component={Movimentacoes}
        options={{ tabBarLabel: 'Movimentações' }}
      />

      <Tab.Screen
        name="Historico"
        component={Historico}
        options={{ tabBarLabel: 'Histórico' }}
      />
    </Tab.Navigator>
  );
}

// Navegação entre o menu e as telas adicionais
export default function NavegacaoPrincipal() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MenuPrincipal"
        component={MenuPrincipal}
      />

      <Stack.Screen
        name="CadastroProduto"
        component={CadastroProduto}
      />
    </Stack.Navigator>
  );
}