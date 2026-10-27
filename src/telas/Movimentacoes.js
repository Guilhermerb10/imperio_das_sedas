import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { cores } from '../estilo/style';
import { mostrarAlerta } from '../util/alerta';
import {
  listarProdutos, 
  registrarEntrada,
  registrarSaida,
} from '../banco/BancoDados';

export default function Movimentacoes() {
  const [tipo, setTipo] = useState('Entrada');
  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mostrarMotivos, setMostrarMotivos] = useState(false);
  const [mostrarProdutos, setMostrarProdutos] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const motivos =
    tipo === 'Entrada'
      ? ['Recebimento', 'Devolução', 'Ajuste', 'Outro']
      : ['Venda', 'Perda', 'Ajuste', 'Outro'];

  const carregarListaProdutos = useCallback(async () => {
    try {
      const lista = await listarProdutos();
      setProdutos(lista);
      setProduto((atual) => {
        if (!atual) return null;
        const correspondente = lista.find((p) => p.id === atual.id);
        return correspondente || null;
      });
    } catch (erro) {
      console.error('Erro ao carregar produtos para movimentações:', erro);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarListaProdutos();
    }, [carregarListaProdutos])
  );

  function alterarTipo(novoTipo) {
    setTipo(novoTipo);
    setMotivo('');
    setMostrarMotivos(false);
  }

  function limparCampos() {
    setProduto(null);
    setQuantidade('');
    setMotivo('');
    setObservacoes('');
    setMostrarMotivos(false);
    setMostrarProdutos(false);
  }

  async function validarERegistrar() {
    if (!produto) {
      mostrarAlerta('Atenção', 'Selecione um produto.');
      return;
    }

    if (!/^[1-9]\d*$/.test(quantidade)) {
      mostrarAlerta(
        'Atenção',
        'Informe uma quantidade inteira maior que zero.'
      );
      return;
    }

    if (!motivo) {
      mostrarAlerta('Atenção', 'Selecione um motivo.');
      return;
    }

    const qtdNumerica = parseInt(quantidade, 10);

    if (tipo === 'Saída' && qtdNumerica > produto.quantidade) {
      mostrarAlerta(
        'Estoque insuficiente',
        `A quantidade solicitada (${qtdNumerica} un.) é maior que o estoque atual (${produto.quantidade} un.). Por favor, confirme para tentar novamente.`,
        [
          {
            text: 'Confirmar',
            onPress: () => {
              carregarListaProdutos();
            },
          },
        ]
      );
      return;
    }

    setSalvando(true);

    try {
      if (tipo === 'Entrada') {
        await registrarEntrada(
          produto.id,
          qtdNumerica,
          motivo,
          observacoes.trim()
        );
      } else {
        await registrarSaida(
          produto.id,
          qtdNumerica,
          motivo,
          observacoes.trim()
        );
      }

      mostrarAlerta(
        'Sucesso',
        `${tipo} de ${qtdNumerica} un. de "${produto.nome}" registrada com sucesso!`,
        [{ text: 'Confirmar' }]
      );

      limparCampos();
      await carregarListaProdutos();
    } catch (erro) {
      console.error('Erro ao registrar movimentação:', erro);
      const isEstoqueInsuficiente =
        erro && erro.message && erro.message.toLowerCase().includes('estoque insuficiente');

      if (isEstoqueInsuficiente) {
        mostrarAlerta(
          'Estoque insuficiente',
          'A quantidade solicitada não está disponível no estoque atual. Por favor, confirme para tentar novamente.',
          [
            {
              text: 'Confirmar',
              onPress: () => {
                carregarListaProdutos();
              },
            },
          ]
        );
      } else {
        mostrarAlerta(
          'Erro',
          erro.message || 'Falha ao registrar a movimentação no banco de dados.',
          [{ text: 'Confirmar' }]
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.nomeLoja}>IMPÉRIO DAS SEDAS</Text>
        <Text style={styles.titulo}>Movimentações</Text>
        <Text style={styles.subtitulo}>
          Registre entradas e saídas do estoque
        </Text>

        <View style={styles.linha}>
          {['Entrada', 'Saída'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.botaoTipo,
                tipo === item && styles.botaoTipoAtivo,
              ]}
              onPress={() => alterarTipo(item)}
            >
              <Ionicons
                name={
                  item === 'Entrada'
                    ? 'arrow-down-outline'
                    : 'arrow-up-outline'
                }
                size={23}
                color={
                  tipo === item
                    ? cores.fundo
                    : cores.textoSecundario
                }
              />

              <Text
                style={[
                  styles.textoTipo,
                  tipo === item && styles.textoTipoAtivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Produto *</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => {
            if (produtos.length === 0) {
              mostrarAlerta(
                'Nenhum produto',
                'Ainda não existem produtos cadastrados no estoque.'
              );
              return;
            }
            setMostrarProdutos(!mostrarProdutos);
            setMostrarMotivos(false);
          }}
        >
          <Text
            style={produto ? styles.texto : styles.placeholder}
          >
            {produto ? produto.nome : 'Selecione um produto'}
          </Text>

          <Ionicons
            name={mostrarProdutos ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={cores.dourado}
          />
        </TouchableOpacity>

        {mostrarProdutos && (
          <View style={styles.lista}>
            {produtos.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.opcao}
                onPress={() => {
                  setProduto(item);
                  setMostrarProdutos(false);
                }}
              >
                <View style={styles.linhaProdutoOpcao}>
                  <Text style={styles.texto}>{item.nome}</Text>
                  <Text style={styles.saldoTexto}>
                    {item.quantidade} un. disponíveis
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tipo === 'Saída' && produto && (
          <Text style={styles.infoEstoque}>
            Disponível para saída: {produto.quantidade} unidades
          </Text>
        )}

        <Text style={styles.label}>Quantidade *</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={cores.textoSecundario}
          keyboardType="number-pad"
          value={quantidade}
          onChangeText={setQuantidade}
        />

        <Text style={styles.label}>Motivo *</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => {
            setMostrarMotivos(!mostrarMotivos);
            setMostrarProdutos(false);
          }}
        >
          <Text
            style={motivo ? styles.texto : styles.placeholder}
          >
            {motivo || 'Selecione o motivo'}
          </Text>

          <Ionicons
            name={mostrarMotivos ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={cores.dourado}
          />
        </TouchableOpacity>

        {mostrarMotivos && (
          <View style={styles.lista}>
            {motivos.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.opcao}
                onPress={() => {
                  setMotivo(item);
                  setMostrarMotivos(false);
                }}
              >
                <Text style={styles.texto}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textoLongo]}
          placeholder="Informações adicionais da movimentação..."
          placeholderTextColor={cores.textoSecundario}
          multiline
          textAlignVertical="top"
          value={observacoes}
          onChangeText={setObservacoes}
        />

        <TouchableOpacity
          style={[styles.botaoRegistrar, salvando && { opacity: 0.7 }]}
          onPress={validarERegistrar}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color={cores.fundo} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={cores.fundo}
              />
              <Text style={styles.textoBotao}>
                Registrar {tipo.toLowerCase()}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.obrigatorios}>* Campos obrigatórios</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 180,
    flexGrow: 1,
  },

  nomeLoja: {
    color: cores.dourado,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },

  titulo: {
    color: cores.branco,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },

  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginTop: 5,
    marginBottom: 28,
  },

  linha: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  botaoTipo: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },

  botaoTipoAtivo: {
    backgroundColor: cores.dourado,
  },

  textoTipo: {
    color: cores.textoSecundario,
    fontWeight: 'bold',
  },

  textoTipoAtivo: {
    color: cores.fundo,
  },

  label: {
    color: cores.branco,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 9,
  },

  seletor: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  input: {
    backgroundColor: cores.cartao,
    color: cores.branco,
    borderRadius: 12,
    paddingHorizontal: 15,
    minHeight: 52,
    fontSize: 15,
  },

  placeholder: {
    color: cores.textoSecundario,
    fontSize: 15,
  },

  texto: {
    color: cores.branco,
    fontSize: 15,
  },

  lista: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
  },

  opcao: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  linhaProdutoOpcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  saldoTexto: {
    color: cores.dourado,
    fontSize: 12,
  },

  infoEstoque: {
    color: cores.dourado,
    fontSize: 13,
    marginTop: 8,
  },

  textoLongo: {
    height: 100,
    paddingTop: 15,
  },

  botaoRegistrar: {
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

  obrigatorios: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 15,
  },
});
