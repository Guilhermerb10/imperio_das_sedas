import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cadastrarAdministrador,
  entrarNoSistema,
  verificarAdministrador,
} from '../banco/BancoDados';
import { cores } from '../estilo/style';

export default function Login({ onEntrar }) {
  const [configurado, setConfigurado] = useState(null);
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    verificarAdministrador()
      .then(setConfigurado)
      .catch(() => setErro('Não foi possível verificar as contas cadastradas.'));
  }, []);

  async function enviar() {
    setErro('');
    if (!usuario.trim() || !senha.trim() || (!configurado && !nome.trim())) {
      setErro('Preencha todos os campos.');
      return;
    }

    setCarregando(true);
    try {
      if (configurado) {
        const conta = await entrarNoSistema(usuario, senha);
        if (!conta) {
          setErro('Usuário ou senha incorretos.');
          return;
        }
        onEntrar(conta);
      } else {
        const conta = await cadastrarAdministrador({ nome, usuario, senha });
        onEntrar({ ...conta, usuario: usuario.trim().toLowerCase() });
      }
    } catch (e) {
      setErro(e?.message?.includes('UNIQUE')
        ? 'Este nome de usuário já está em uso.'
        : e?.message || 'Não foi possível continuar.');
    } finally {
      setCarregando(false);
    }
  }

  if (configurado === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={cores.dourado} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cartao}>
        <View style={styles.icone}>
          <Ionicons name="storefront-outline" size={32} color={cores.dourado} />
        </View>
        <Text style={styles.nomeLoja}>IMPÉRIO DAS SEDAS</Text>
        <Text style={styles.titulo}>
          {configurado ? 'Acessar o estoque' : 'Configurar administrador'}
        </Text>
        <Text style={styles.subtitulo}>
          {configurado
            ? 'Entre com seu usuário e senha.'
            : 'Crie a conta que terá acesso completo ao aplicativo.'}
        </Text>

        {!configurado && (
          <TextInput
            style={styles.input}
            placeholder="Nome do administrador"
            placeholderTextColor={cores.textoSecundario}
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor={cores.textoSecundario}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={cores.textoSecundario}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
          onSubmitEditing={enviar}
          returnKeyType="done"
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={styles.botao}
          onPress={enviar}
          disabled={carregando}
        >
          {carregando
            ? <ActivityIndicator color={cores.fundo} />
            : <Text style={styles.textoBotao}>{configurado ? 'Entrar' : 'Criar administrador'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 22,
    backgroundColor: cores.fundo,
  },
  cartao: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    padding: 24,
    borderRadius: 18,
    backgroundColor: cores.cartao,
  },
  icone: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  nomeLoja: {
    color: cores.dourado,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  titulo: {
    color: cores.branco,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  input: {
    minHeight: 50,
    color: cores.branco,
    backgroundColor: cores.fundo,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  erro: {
    color: cores.erro,
    marginTop: 12,
    textAlign: 'center',
  },
  botao: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: cores.dourado,
    marginTop: 20,
  },
  textoBotao: {
    color: cores.fundo,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
