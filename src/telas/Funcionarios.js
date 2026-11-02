import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { listarFuncionarios, removerFuncionario, salvarFuncionario } from '../banco/BancoDados';
import { cores } from '../estilo/style';

export default function Funcionarios({ navigation }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const carregar = useCallback(async () => {
    try {
      setFuncionarios(await listarFuncionarios());
    } catch (erro) {
      Alert.alert('Erro', erro?.message || 'Não foi possível carregar os funcionários.');
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function limparFormulario() {
    setIdEditando(null);
    setNome('');
    setUsuario('');
    setSenha('');
  }

  function editar(item) {
    setIdEditando(item.id);
    setNome(item.nome);
    setUsuario(item.usuario);
    setSenha('');
  }

  async function salvar() {
    try {
      await salvarFuncionario({ id: idEditando, nome, usuario, senha });
      limparFormulario();
      await carregar();
      Alert.alert('Pronto', 'Cadastro do funcionário salvo.');
    } catch (erro) {
      Alert.alert('Não foi possível salvar', erro?.message?.includes('UNIQUE')
        ? 'Este nome de usuário já está em uso.'
        : erro?.message || 'Confira os dados e tente novamente.');
    }
  }

  function confirmarRemocao(item) {
    Alert.alert(
      'Remover funcionário',
      `O acesso de ${item.nome} será desativado. O histórico continua salvo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removerFuncionario(item.id);
              if (idEditando === item.id) limparFormulario();
              await carregar();
            } catch (erro) {
              Alert.alert('Erro', erro?.message || 'Não foi possível remover o acesso.');
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={20} color={cores.dourado} />
        <Text style={styles.link}>Início</Text>
      </TouchableOpacity>
      <Text style={styles.titulo}>Funcionários</Text>
      <Text style={styles.subtitulo}>Adicione acessos e defina as senhas da equipe.</Text>

      <View style={styles.cartao}>
        <Text style={styles.tituloSecao}>{idEditando ? 'Editar funcionário' : 'Novo funcionário'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={cores.textoSecundario}
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Usuário para entrar"
          placeholderTextColor={cores.textoSecundario}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder={idEditando ? 'Nova senha (opcional)' : 'Senha'}
          placeholderTextColor={cores.textoSecundario}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.botao} onPress={salvar}>
          <Text style={styles.textoBotao}>{idEditando ? 'Salvar alterações' : 'Adicionar funcionário'}</Text>
        </TouchableOpacity>
        {idEditando ? (
          <TouchableOpacity style={styles.botaoSecundario} onPress={limparFormulario}>
            <Text style={styles.link}>Cancelar edição</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.tituloSecaoLista}>Acessos cadastrados</Text>
      {funcionarios.length === 0 ? (
        <Text style={styles.vazio}>Nenhum funcionário cadastrado.</Text>
      ) : funcionarios.map(item => (
        <View key={item.id} style={styles.item}>
          <View style={styles.dadosItem}>
            <Text style={styles.nomeItem}>{item.nome}</Text>
            <Text style={styles.usuarioItem}>Usuário: {item.usuario}</Text>
            {!item.ativo ? <Text style={styles.inativo}>Acesso desativado</Text> : null}
          </View>
          <TouchableOpacity style={styles.acao} onPress={() => editar(item)} accessibilityLabel={`Editar ${item.nome}`}>
            <Ionicons name="create-outline" size={22} color={cores.dourado} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.acao} onPress={() => confirmarRemocao(item)} accessibilityLabel={`Remover ${item.nome}`}>
            <Ionicons name="person-remove-outline" size={22} color={cores.erro} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingTop: 28, paddingBottom: 40 },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  titulo: { color: cores.branco, fontSize: 28, fontWeight: 'bold' },
  subtitulo: { color: cores.textoSecundario, fontSize: 14, marginTop: 6, marginBottom: 20 },
  cartao: { backgroundColor: cores.cartao, borderRadius: 14, padding: 16 },
  tituloSecao: { color: cores.branco, fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  input: { minHeight: 48, backgroundColor: cores.fundo, color: cores.branco, borderRadius: 9, borderWidth: 1, borderColor: cores.borda, paddingHorizontal: 12, marginTop: 10 },
  botao: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.dourado, borderRadius: 9, marginTop: 14 },
  textoBotao: { color: cores.fundo, fontWeight: 'bold' },
  botaoSecundario: { alignItems: 'center', paddingTop: 14 },
  link: { color: cores.dourado, fontSize: 14, fontWeight: '600' },
  tituloSecaoLista: { color: cores.branco, fontSize: 18, fontWeight: 'bold', marginTop: 28, marginBottom: 12 },
  vazio: { color: cores.textoSecundario, padding: 14, backgroundColor: cores.cartao, borderRadius: 10 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: cores.cartao, borderRadius: 12, padding: 14, marginBottom: 9 },
  dadosItem: { flex: 1 },
  nomeItem: { color: cores.branco, fontSize: 15, fontWeight: '600' },
  usuarioItem: { color: cores.textoSecundario, fontSize: 13, marginTop: 4 },
  inativo: { color: cores.erro, fontSize: 12, marginTop: 4 },
  acao: { padding: 8 },
});
