import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NavegacaoPrincipal from './src/navegacao/NavegacaoPrincipal';
import { inicializarBancoDados } from './src/banco/BancoDados';
import { cores } from './src/estilo/style';

const temaNavegacao = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: cores.dourado,
    background: cores.fundo,
    card: cores.cartao,
    text: cores.branco,
    border: cores.borda,
  },
};

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState(null);

  async function iniciar() {
    setErro(null);
    try {
      await inicializarBancoDados();
      setPronto(true);
    } catch (e) {
      console.error('Erro ao inicializar banco de dados SQLite:', e);
      setErro(e?.message || 'Falha ao inicializar o banco de dados.');
    }
  }

  useEffect(() => {
    iniciar();
  }, []);

  return (
    <SafeAreaProvider style={styles.raiz}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={cores.fundo}
      />

      {erro ? (
        <View style={styles.centralizado}>
          <Text style={styles.tituloErro}>Erro ao iniciar banco</Text>
          <Text style={styles.textoErro}>{erro}</Text>
          <TouchableOpacity style={styles.botaoTentarNovamente} onPress={iniciar}>
            <Text style={styles.textoBotao}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : !pronto ? (
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" color={cores.dourado} />
          <Text style={styles.textoCarregando}>Carregando banco de dados...</Text>
        </View>
      ) : (
        <NavigationContainer theme={temaNavegacao}>
          <NavegacaoPrincipal />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  centralizado: {
    flex: 1,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  textoCarregando: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginTop: 16,
  },
  tituloErro: {
    color: cores.erro,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textoErro: {
    color: cores.textoSecundario,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  botaoTentarNovamente: {
    backgroundColor: cores.dourado,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: cores.fundo,
    fontWeight: 'bold',
  },
});
