
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { validarSenhaColaborador } from '../banco/AutorizacaoEstoque';
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
  const [itensSelecionados, setItensSelecionados] = useState([]);

  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [mostrarMotivos, setMostrarMotivos] = useState(false);
  const [mostrarProdutos, setMostrarProdutos] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [salvando, setSalvando] = useState(false);

  const [modalSenha, setModalSenha] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [validandoSenha, setValidandoSenha] = useState(false);

  const motivos = {
    Entrada: ['Recebimento', 'Devolução', 'Ajuste', 'Outro'],
    Saída: ['Venda', 'Perda', 'Ajuste', 'Outro'],
  };

  const carregarListaProdutos = useCallback(async () => {
    try {
      const lista = await listarProdutos();
      setProdutos(lista || []);

      setProduto(atual => {
        if (!atual) return null;
        return (lista || []).find(p => p.id === atual.id) || null;
      });

      setItensSelecionados(atual =>
        atual.map(item => {
          const atualizado = (lista || []).find(
            p => p.id === item.produto.id
          );

          return atualizado
            ? { ...item, produto: atualizado }
            : item;
        })
      );
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      mostrarAlerta('Erro', 'Não foi possível carregar os produtos.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarListaProdutos();
    }, [carregarListaProdutos])
  );

  function limparCampos() {
    setProduto(null);
    setItensSelecionados([]);
    setMotivo('');
    setObservacoes('');
    setMostrarMotivos(false);
    setMostrarProdutos(false);
    setSenhaDigitada('');
    setErroSenha('');
  }

  function alterarTipo(novoTipo) {
    if (salvando) return;

    setTipo(novoTipo);
    setProduto(null);
    setItensSelecionados([]);
    setMotivo('');
    setMostrarProdutos(false);
    setMostrarMotivos(false);
  }

  function adicionarProduto() {
    if (!produto) {
      mostrarAlerta('Atenção', 'Selecione um produto antes de adicionar.');
      return;
    }

    const jaSelecionado = itensSelecionados.some(
      item => item.produto.id === produto.id
    );

    if (jaSelecionado) {
      mostrarAlerta(
        'Produto já selecionado',
        'Esse produto já está na lista. Altere a quantidade no campo correspondente.'
      );
      return;
    }

    setItensSelecionados(atual => [
      ...atual,
      {
        produto,
        quantidade: '1',
      },
    ]);

    setProduto(null);
    setMostrarProdutos(false);
  }

  function alterarQuantidade(idProduto, valor) {
    // Permite digitar apenas números inteiros positivos ou deixar vazio
    if (valor !== '' && !/^\d+$/.test(valor)) return;

    setItensSelecionados(atual =>
      atual.map(item =>
        item.produto.id === idProduto
          ? { ...item, quantidade: valor }
          : item
      )
    );
  }

  function removerProduto(idProduto) {
    setItensSelecionados(atual =>
      atual.filter(item => item.produto.id !== idProduto)
    );
  }

  async function validarERegistrar(
    confirmada = false,
    colaborador = null
  ) {
    if (salvando) return;

    if (itensSelecionados.length === 0) {
      mostrarAlerta(
        'Atenção',
        'Selecione pelo menos um produto usando o botão +.'
      );
      return;
    }

    if (!motivo) {
      mostrarAlerta('Atenção', 'Selecione o motivo da movimentação.');
      return;
    }

    for (const item of itensSelecionados) {
      if (!/^[1-9]\d*$/.test(item.quantidade)) {
        mostrarAlerta(
          'Quantidade inválida',
          `Informe uma quantidade inteira válida para "${item.produto.nome}".`
        );
        return;
      }
    }

    if (tipo === 'Saída' && !confirmada) {
      setSenhaDigitada('');
      setErroSenha('');
      setModalSenha(true);
      return;
    }

    setSalvando(true);

    try {
      // Atualiza o estoque antes de validar e registrar a saída
      const listaAtualizada = await listarProdutos();

      if (tipo === 'Saída') {
        for (const item of itensSelecionados) {
          const produtoAtual = (listaAtualizada || []).find(
            p => p.id === item.produto.id
          );

          const quantidadeSolicitada = Number(item.quantidade);
          const estoqueDisponivel = Number(
            produtoAtual?.quantidade ?? 0
          );

          if (!produtoAtual) {
            throw new Error(
              `O produto "${item.produto.nome}" não foi encontrado.`
            );
          }

          if (quantidadeSolicitada > estoqueDisponivel) {
            throw new Error(
              `Estoque insuficiente para "${item.produto.nome}". ` +
              `Disponível: ${estoqueDisponivel} unidade(s).`
            );
          }
        }
      }

      // Registra cada produto com sua própria quantidade
      for (const item of itensSelecionados) {
        const quantidade = Number(item.quantidade);

        if (tipo === 'Entrada') {
          await registrarEntrada(
            item.produto.id,
            quantidade,
            motivo,
            observacoes.trim()
          );
        } else {
          await registrarSaida(
            item.produto.id,
            quantidade,
            motivo,
            observacoes.trim(),
            colaborador?.id,
            colaborador?.nome
          );
        }
      }

      setModalSenha(false);

      mostrarAlerta(
        'Sucesso',
        `Movimentação concluída! ${itensSelecionados.length} produto(s) registrado(s).`
      );

      limparCampos();
      await carregarListaProdutos();
    } catch (erro) {
      console.error('Erro ao registrar movimentação:', erro);

      mostrarAlerta(
        'Erro',
        erro?.message || 'Não foi possível registrar a movimentação.'
      );

      await carregarListaProdutos();
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarSenhaSaida() {
    if (!senhaDigitada.trim()) {
      setErroSenha('Informe a senha do colaborador.');
      return;
    }

    if (validandoSenha) return;

    setValidandoSenha(true);
    setErroSenha('');

    try {
      const colaborador = await validarSenhaColaborador(
        senhaDigitada.trim()
      );

      if (!colaborador) {
        setErroSenha('Senha inválida ou colaborador não autorizado.');
        return;
      }

      setModalSenha(false);
      await validarERegistrar(true, colaborador);
    } catch (erro) {
      console.error('Erro ao validar senha:', erro);
      setErroSenha(
        erro?.message || 'Não foi possível validar a senha.'
      );
    } finally {
      setValidandoSenha(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Movimentações de estoque</Text>

        <Text style={styles.subtitulo}>
          Registre entradas ou saídas de vários produtos.
        </Text>

        {/* Tipo da movimentação */}
        <Text style={styles.label}>Tipo de movimentação *</Text>

        <View style={styles.linhaTipos}>
          {['Entrada', 'Saída'].map(opcao => (
            <TouchableOpacity
              key={opcao}
              style={[
                styles.botaoTipo,
                tipo === opcao && styles.botaoTipoAtivo,
              ]}
              onPress={() => alterarTipo(opcao)}
              disabled={salvando}
            >
              <Ionicons
                name={opcao === 'Entrada' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={20}
                color={tipo === opcao ? cores.fundo : cores.dourado}
              />

              <Text
                style={[
                  styles.textoTipo,
                  tipo === opcao && styles.textoTipoAtivo,
                ]}
              >
                {opcao}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seleção de produtos */}
        <Text style={styles.label}>Produtos *</Text>

        <View style={styles.seletorMultiplo}>
          <TouchableOpacity
            style={styles.seletorProduto}
            onPress={() => {
              setMostrarProdutos(!mostrarProdutos);
              setMostrarMotivos(false);
            }}
            disabled={salvando}
          >
            <Text
              style={produto ? styles.texto : styles.placeholder}
              numberOfLines={1}
            >
              {produto ? produto.nome : 'Selecione um produto'}
            </Text>

            <Ionicons
              name={mostrarProdutos ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={cores.dourado}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoMais}
            onPress={adicionarProduto}
            disabled={salvando}
          >
            <Ionicons name="add" size={28} color={cores.fundo} />
          </TouchableOpacity>
        </View>

        {mostrarProdutos && (
          <View style={styles.lista}>
            {produtos.length === 0 ? (
              <Text style={styles.textoVazio}>
                Nenhum produto cadastrado.
              </Text>
            ) : (
              produtos.map(item => {
                const jaSelecionado = itensSelecionados.some(
                  selecionado => selecionado.produto.id === item.id
                );

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.opcao}
                    onPress={() => {
                      setProduto(item);
                      setMostrarProdutos(false);
                    }}
                  >
                    <View style={styles.linhaProdutoOpcao}>
                      <Text style={styles.texto}>
                        {item.nome}
                      </Text>

                      <Text style={styles.saldoTexto}>
                        {jaSelecionado
                          ? 'Já selecionado'
                          : `${item.quantidade ?? 0} un. disponíveis`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Lista de produtos e quantidades individuais */}
        {itensSelecionados.length > 0 && (
          <View style={styles.listaSelecionados}>
            <Text style={styles.tituloSelecionados}>
              Produtos selecionados ({itensSelecionados.length})
            </Text>

            {itensSelecionados.map(item => (
              <View
                key={item.produto.id}
                style={styles.itemSelecionado}
              >
                <View style={styles.dadosItemSelecionado}>
                  <Text style={styles.nomeProdutoSelecionado}>
                    {item.produto.nome}
                  </Text>

                  <Text style={styles.saldoTexto}>
                    Estoque atual: {item.produto.quantidade ?? 0} un.
                  </Text>

                  <Text style={styles.labelQuantidade}>
                    Quantidade para {tipo.toLowerCase()}
                  </Text>

                  <TextInput
                    style={styles.inputQuantidadeItem}
                    placeholder="Quantidade"
                    placeholderTextColor={cores.textoSecundario}
                    keyboardType="number-pad"
                    value={item.quantidade}
                    onChangeText={valor =>
                      alterarQuantidade(item.produto.id, valor)
                    }
                    editable={!salvando}
                  />
                </View>

                <TouchableOpacity
                  style={styles.botaoExcluirItem}
                  onPress={() => removerProduto(item.produto.id)}
                  disabled={salvando}
                >
                  <Ionicons
                    name="trash-outline"
                    size={23}
                    color="#ff6b6b"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Motivo */}
        <Text style={styles.label}>Motivo *</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => {
            setMostrarMotivos(!mostrarMotivos);
            setMostrarProdutos(false);
          }}
          disabled={salvando}
        >
          <Text style={motivo ? styles.texto : styles.placeholder}>
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
            {motivos[tipo].map(opcao => (
              <TouchableOpacity
                key={opcao}
                style={styles.opcao}
                onPress={() => {
                  setMotivo(opcao);
                  setMostrarMotivos(false);
                }}
              >
                <Text style={styles.texto}>{opcao}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Observações */}
        <Text style={styles.label}>Observações</Text>

        <TextInput
          style={styles.inputObservacoes}
          placeholder="Informações adicionais (opcional)"
          placeholderTextColor={cores.textoSecundario}
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!salvando}
        />

        {/* Registrar */}
        <TouchableOpacity
          style={[
            styles.botaoRegistrar,
            salvando && styles.botaoDesabilitado,
          ]}
          onPress={() => validarERegistrar(false)}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color={cores.fundo} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={cores.fundo}
              />

              <Text style={styles.textoBotaoRegistrar}>
                Registrar {tipo.toLowerCase()}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de autorização para saída */}
      <Modal
        visible={modalSenha}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!validandoSenha && !salvando) {
            setModalSenha(false);
            setSenhaDigitada('');
            setErroSenha('');
          }
        }}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <View style={styles.iconeModal}>
              <Ionicons
                name="lock-closed-outline"
                size={30}
                color={cores.dourado}
              />
            </View>

            <Text style={styles.tituloModal}>
              Autorizar saída
            </Text>

            <Text style={styles.textoModal}>
              Informe a senha de um colaborador autorizado para confirmar
              a saída dos produtos selecionados.
            </Text>

            <TextInput
              style={styles.inputSenha}
              placeholder="Senha do colaborador"
              placeholderTextColor={cores.textoSecundario}
              value={senhaDigitada}
              onChangeText={valor => {
                setSenhaDigitada(valor);
                setErroSenha('');
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!validandoSenha && !salvando}
              onSubmitEditing={confirmarSenhaSaida}
              returnKeyType="done"
            />

            {erroSenha ? (
              <Text style={styles.erroSenha}>{erroSenha}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.botaoConfirmarSenha}
              onPress={confirmarSenhaSaida}
              disabled={validandoSenha || salvando}
            >
              {validandoSenha || salvando ? (
                <ActivityIndicator color={cores.fundo} />
              ) : (
                <Text style={styles.textoBotaoRegistrar}>
                  Confirmar saída
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                if (validandoSenha || salvando) return;
                setModalSenha(false);
                setSenhaDigitada('');
                setErroSenha('');
              }}
              disabled={validandoSenha || salvando}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: cores.branco,
    marginBottom: 6,
  },

  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 14,
    marginBottom: 24,
  },

  label: {
    color: cores.branco,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },

  linhaTipos: {
    flexDirection: 'row',
    gap: 12,
  },

  botaoTipo: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },

  botaoTipoAtivo: {
    backgroundColor: cores.dourado,
    borderColor: cores.dourado,
  },

  textoTipo: {
    color: cores.branco,
    fontSize: 15,
    fontWeight: '600',
  },

  textoTipoAtivo: {
    color: cores.fundo,
  },

  seletorMultiplo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  seletorProduto: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  botaoMais: {
    width: 52,
    height: 52,
    backgroundColor: cores.dourado,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  seletor: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  texto: {
    color: cores.branco,
    fontSize: 14,
    flexShrink: 1,
  },

  placeholder: {
    color: cores.textoSecundario,
    fontSize: 14,
    flexShrink: 1,
  },

  lista: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.borda,
  },

  opcao: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  linhaProdutoOpcao: {
    gap: 5,
  },

  saldoTexto: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 4,
  },

  textoVazio: {
    color: cores.textoSecundario,
    padding: 15,
    fontSize: 14,
  },

  listaSelecionados: {
    marginTop: 18,
    padding: 12,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },

  tituloSelecionados: {
    color: cores.dourado,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  itemSelecionado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 8,
  },

  dadosItemSelecionado: {
    flex: 1,
    gap: 5,
  },

  nomeProdutoSelecionado: {
    color: cores.branco,
    fontSize: 15,
    fontWeight: '600',
  },

  labelQuantidade: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 5,
  },

  inputQuantidadeItem: {
    width: 125,
    minHeight: 44,
    backgroundColor: cores.fundo,
    color: cores.branco,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 12,
    fontSize: 15,
  },

  botaoExcluirItem: {
    padding: 10,
  },

  inputObservacoes: {
    minHeight: 100,
    backgroundColor: cores.cartao,
    color: cores.branco,
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: cores.borda,
  },

  botaoRegistrar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: cores.dourado,
    borderRadius: 12,
    marginTop: 28,
    paddingHorizontal: 16,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotaoRegistrar: {
    color: cores.fundo,
    fontSize: 15,
    fontWeight: 'bold',
  },

  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  conteudoModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: cores.cartao,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: cores.borda,
  },

  iconeModal: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  tituloModal: {
    color: cores.branco,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  textoModal: {
    color: cores.textoSecundario,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },

  inputSenha: {
    minHeight: 50,
    backgroundColor: cores.fundo,
    color: cores.branco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  erroSenha: {
    color: '#ff6b6b',
    fontSize: 13,
    marginTop: 10,
  },

  botaoConfirmarSenha: {
    minHeight: 50,
    backgroundColor: cores.dourado,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },

  botaoCancelar: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 4,
  },

  textoCancelar: {
    color: cores.textoSecundario,
    fontSize: 14,
    fontWeight: '600',
  },
});
