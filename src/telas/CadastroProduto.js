import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../estilo/style';
import SeletorCategoria from '../componentes/SeletorCategoria';
import { mostrarAlerta } from '../util/alerta';
import {
  cadastrarProduto,
  atualizarProduto,
  buscarProdutoPorId,
  listarCategorias,
} from '../banco/BancoDados';

function formatarMoeda(texto) {
  const numeros = texto.replace(/\D/g, '');
  const valor = Number(numeros || '0') / 100;
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function CadastroProduto({ navigation, route }) {
  const produtoId = route?.params?.produtoId || null;
  const editando = !!produtoId;

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [quantidade, setQuantidade] = useState('0');
  const [estoqueMinimo, setEstoqueMinimo] = useState('0');
  const [precoCusto, setPrecoCusto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const listaCategorias = await listarCategorias();
        setCategorias(listaCategorias.map((cat) => cat.nome));

        if (produtoId) {
          const produtoExistente = await buscarProdutoPorId(produtoId);
          if (produtoExistente) {
            setNome(produtoExistente.nome || '');
            setCodigo(produtoExistente.codigo || '');
            setCategoria(produtoExistente.categoria || '');
            setQuantidade(String(produtoExistente.quantidade ?? '0'));
            setEstoqueMinimo(String(produtoExistente.estoqueMinimo ?? '0'));
            setPrecoCusto(produtoExistente.precoCusto || '');
            setObservacoes(produtoExistente.observacoes || '');
          } else {
            mostrarAlerta('Erro', 'Produto não encontrado.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        mostrarAlerta('Erro', 'Falha ao carregar informações do produto.');
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDadosIniciais();
  }, [produtoId, navigation]);

  async function validarESalvar() {
    if (!nome.trim()) {
      mostrarAlerta('Atenção', 'Informe o nome do produto.');
      return;
    }

    if (!codigo.trim()) {
      mostrarAlerta('Atenção', 'Informe o código do produto.');
      return;
    }

    if (!categoria.trim()) {
      mostrarAlerta('Atenção', 'Selecione ou adicione uma categoria.');
      return;
    }

    if (!/^\d+$/.test(quantidade)) {
      mostrarAlerta('Atenção', 'Informe uma quantidade válida (somente números).');
      return;
    }

    if (!/^\d+$/.test(estoqueMinimo)) {
      mostrarAlerta('Atenção', 'Informe um estoque mínimo válido (somente números).');
      return;
    }

    if (precoCusto && !/^\d+$/.test(precoCusto.replace(/\D/g, ''))) {
      mostrarAlerta('Atenção', 'Informe um preço de custo válido.');
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        nome: nome.trim(),
        codigo: codigo.trim(),
        categoria: categoria.trim(),
        quantidade: parseInt(quantidade, 10) || 0,
        estoqueMinimo: parseInt(estoqueMinimo, 10) || 0,
        precoCusto,
        observacoes: observacoes.trim(),
      };

      if (editando) {
        await atualizarProduto(produtoId, dados);
        mostrarAlerta('Sucesso', 'Produto atualizado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await cadastrarProduto(dados);
        mostrarAlerta('Sucesso', 'Produto cadastrado com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      if (erro.message && erro.message.includes('UNIQUE')) {
        mostrarAlerta('Atenção', 'Já existe um produto cadastrado com este código.');
      } else {
        mostrarAlerta('Erro', erro.message || 'Ocorreu um erro ao salvar o produto.');
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoDados) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" color={cores.dourado} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.voltar}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={cores.dourado} />
            <Text style={styles.textoVoltar}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.titulo}>
            {editando ? 'Editar produto' : 'Cadastrar produto'}
          </Text>

          <Text style={styles.subtitulo}>
            {editando
              ? 'Atualize as informações do produto selecionado'
              : 'Preencha as informações do produto'}
          </Text>

          <Text style={styles.label}>Nome do produto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do produto"
            placeholderTextColor={cores.textoSecundario}
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Código do produto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o código"
            placeholderTextColor={cores.textoSecundario}
            value={codigo}
            onChangeText={setCodigo}
          />

          <SeletorCategoria
            categoria={categoria}
            setCategoria={setCategoria}
            categorias={categorias}
            setCategorias={setCategorias}
          />

          <View style={styles.linha}>
            <View style={styles.coluna}>
              <Text style={styles.label}>
                {editando ? 'Quantidade *' : 'Quantidade inicial *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={cores.textoSecundario}
                keyboardType="number-pad"
                value={quantidade}
                onChangeText={setQuantidade}
              />
            </View>

            <View style={styles.coluna}>
              <Text style={styles.label}>Estoque mínimo *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={cores.textoSecundario}
                keyboardType="number-pad"
                value={estoqueMinimo}
                onChangeText={setEstoqueMinimo}
              />
            </View>
          </View>

          <Text style={styles.label}>Preço de custo</Text>
          <TextInput
            style={styles.input}
            placeholder="R$ 0,00"
            placeholderTextColor={cores.textoSecundario}
            keyboardType="number-pad"
            value={precoCusto}
            onChangeText={(texto) => {
              setPrecoCusto(formatarMoeda(texto));
            }}
          />

          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textoLongo]}
            placeholder="Informações adicionais..."
            placeholderTextColor={cores.textoSecundario}
            multiline
            textAlignVertical="top"
            value={observacoes}
            onChangeText={setObservacoes}
          />

          <TouchableOpacity
            style={[styles.botaoSalvar, salvando && { opacity: 0.7 }]}
            onPress={validarESalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator size="small" color={cores.fundo} />
            ) : (
              <>
                <Ionicons name="save-outline" size={22} color={cores.fundo} />
                <Text style={styles.textoBotao}>
                  {editando ? 'Atualizar produto' : 'Salvar produto'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.observacao}>* Campos obrigatórios</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 25,
  },
  textoVoltar: {
    color: cores.dourado,
    fontSize: 15,
  },
  titulo: {
    color: cores.branco,
    fontSize: 27,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 25,
  },
  label: {
    color: cores.branco,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 9,
    marginTop: 15,
  },
  input: {
    backgroundColor: cores.cartao,
    color: cores.branco,
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 52,
    fontSize: 15,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
    minWidth: 0,
  },
  textoLongo: {
    height: 100,
    paddingTop: 15,
  },
  botaoSalvar: {
    backgroundColor: cores.dourado,
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  textoBotao: {
    color: cores.fundo,
    fontSize: 16,
    fontWeight: 'bold',
  },
  observacao: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 15,
  },
});
