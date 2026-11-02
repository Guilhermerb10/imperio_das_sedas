import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import Home from '../telas/Home';
import Estoque from '../telas/Estoque';
import Movimentacoes from '../telas/Movimentacoes';
import Historico from '../telas/Historico';
import CadastroProduto from '../telas/CadastroProduto';
import Funcionarios from '../telas/Funcionarios';

import { cores } from '../estilo/style';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MenuPrincipal({ usuario, onSair }) {
  const ehFuncionario = usuario.perfil === 'funcionario';

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
      {ehFuncionario ? (
        <>
          <Tab.Screen
            name="Estoque"
          >
            {(props) => <Estoque {...props} usuario={usuario} onSair={onSair} />}
          </Tab.Screen>

          <Tab.Screen
            name="Movimentacoes"
            options={{ tabBarLabel: 'Movimentações' }}
          >
            {(props) => <Movimentacoes {...props} usuario={usuario} onSair={onSair} />}
          </Tab.Screen>
        </>
      ) : (
        <>
          <Tab.Screen
            name="Inicio"
            options={{ tabBarLabel: 'Início' }}
          >
            {(props) => <Home {...props} onSair={onSair} />}
          </Tab.Screen>

          <Tab.Screen
            name="Estoque"
          >
            {(props) => <Estoque {...props} usuario={usuario} onSair={onSair} />}
          </Tab.Screen>

          <Tab.Screen
            name="Movimentacoes"
            options={{ tabBarLabel: 'Movimentações' }}
          >
            {(props) => <Movimentacoes {...props} usuario={usuario} onSair={onSair} />}
          </Tab.Screen>

          <Tab.Screen
            name="Historico"
            component={Historico}
            options={{ tabBarLabel: 'Histórico' }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

export default function NavegacaoPrincipal({ usuario, onSair }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MenuPrincipal"
      >
        {(props) => <MenuPrincipal {...props} usuario={usuario} onSair={onSair} />}
      </Stack.Screen>

      <Stack.Screen name="CadastroProduto">
        {(props) => <CadastroProduto {...props} usuario={usuario} />}
      </Stack.Screen>

      {usuario.perfil !== 'funcionario' ? (
        <>
          <Stack.Screen
            name="Funcionarios"
            component={Funcionarios}
          />
        </>
      ) : null}
    </Stack.Navigator>
  );
}
