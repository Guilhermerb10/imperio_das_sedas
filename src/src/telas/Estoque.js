import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { cores } from '../estilo/style';
import { mostrarAlerta } from '../util/alerta';
import { listarProdutos, excluirProduto } from '../banco/BancoDados';

export default function Estoque({ navigation }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const filtros = ['Todos', 'Estoque baixo', 'Esgotados'];

  const carregarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await listarProdutos();
      setProdutos(lista);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      mostrarAlerta('Erro', 'Não foi possível carregar os produtos do banco.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarProdutos();
    }, [carregarProdutos])
  );

  function confirmarExclusao(produto) {
    mostrarAlerta(
      'Excluir produto',
      `Deseja realmente excluir "${produto.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(produto.id);
              mostrarAlerta('Sucesso', 'Produto excluído com sucesso.');
              carregarProdutos();
            } catch (erro) {
              mostrarAlerta('Não é possível excluir', erro.message);
            }
          },
        },
      ]
    );
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca = produto.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    if (!correspondeBusca) return false;

    if (filtro === 'Estoque baixo') {
      return (
        produto.quantidade > 0 &&
        produto.quantidade <= produto.estoqueMinimo
      );
    }

    if (filtro === 'Esgotados') {
      return produto.quantidade === 0;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.nomeLoja}>IMPÉRIO DAS SEDAS</Text>
        <Text style={styles.titulo}>Estoque</Text>
        <Text style={styles.subtitulo}>Gerencie seus produtos</Text>

        <View style={styles.campoBusca}>
          <Ionicons
            name="search-outline"
            size={22}
            color={cores.textoSecundario}
          />

          <TextInput
            style={styles.input}
            placeholder="Buscar produto..."
            placeholderTextColor={cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.areaFiltros}
          contentContainerStyle={styles.filtros}
        >
          {filtros.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filtro,
                filtro === item && styles.filtroAtivo,
              ]}
              onPress={() => setFiltro(item)}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  filtro === item && styles.textoFiltroAtivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color={cores.dourado}
            style={{ marginVertical: 40 }}
          />
        ) : produtosFiltrados.length === 0 ? (
          <View style={styles.estadoVazio}>
            <Ionicons
              name="cube-outline"
              size={42}
              color={cores.dourado}
            />

            <Text style={styles.textoVazio}>
              {produtos.length === 0
                ? 'Nenhum produto cadastrado'
                : 'Nenhum produto encontrado'}
            </Text>

            <Text style={styles.descricaoVazio}>
              {produtos.length === 0
                ? 'Os produtos cadastrados aparecerão aqui.'
                : 'Tente alterar a busca ou os filtros.'}
            </Text>
          </View>
        ) : (
          produtosFiltrados.map((produto) => {
            const isEsgotado = produto.quantidade === 0;
            const isBaixo =
              produto.quantidade > 0 &&
              produto.quantidade <= produto.estoqueMinimo;

            return (
              <View key={produto.id} style={styles.cartaoProduto}>
                <View style={styles.cabecalhoProduto}>
                  <View style={styles.infoPrincipal}>
                    <Text style={styles.nomeProduto}>{produto.nome}</Text>
                    {produto.categoria ? (
                      <View style={styles.tagCategoria}>
                        <Text style={styles.textoTagCategoria}>
                          {produto.categoria}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.botoesAcao}>
                    <TouchableOpacity
                      style={styles.botaoAcao}
                      onPress={() =>
                        navigation.navigate('CadastroProduto', {
                          produtoId: produto.id,
                        })
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={cores.dourado}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botaoAcao}
                      onPress={() => confirmarExclusao(produto)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={cores.erro}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.linhaInfo}>
                  <Text style={styles.quantidadeProduto}>
                    Quantidade: {produto.quantidade} un.
                  </Text>

                  {isEsgotado ? (
                    <Text style={[styles.badge, styles.badgeEsgotado]}>
                      Esgotado
                    </Text>
                  ) : isBaixo ? (
                    <Text style={[styles.badge, styles.badgeBaixo]}>
                      Estoque baixo (mín: {produto.estoqueMinimo})
                    </Text>
                  ) : (
                    <Text style={[styles.badge, styles.badgeNormal]}>
                      Em estoque
                    </Text>
                  )}
                </View>

                {produto.codigo ? (
                  <Text style={styles.codigoProduto}>
                    Código: {produto.codigo}
                  </Text>
                ) : null}

                {produto.precoCusto ? (
                  <Text style={styles.precoProduto}>
                    Custo: {produto.precoCusto}
                  </Text>
                ) : null}
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => navigation.navigate('CadastroProduto')}
        >
          <Ionicons
            name="add"
            size={24}
            color={cores.fundo}
          />

          <Text style={styles.textoBotao}>Adicionar produto</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 35,
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

  campoBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
  },

  input: {
    flex: 1,
    color: cores.branco,
    fontSize: 15,
    marginLeft: 10,
  },

  areaFiltros: {
    marginTop: 20,
    marginBottom: 24,
  },

  filtros: {
    gap: 10,
  },

  filtro: {
    backgroundColor: cores.cartao,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  filtroAtivo: {
    backgroundColor: cores.dourado,
  },

  textoFiltro: {
    color: cores.textoSecundario,
    fontSize: 13,
    fontWeight: '500',
  },

  textoFiltroAtivo: {
    color: cores.fundo,
    fontWeight: 'bold',
  },

  estadoVazio: {
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },

  textoVazio: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  descricaoVazio: {
    color: cores.textoSecundario,
    fontSize: 13,
    textAlign: 'center',
  },

  cartaoProduto: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },

  cabecalhoProduto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  infoPrincipal: {
    flex: 1,
    marginRight: 10,
  },

  nomeProduto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
  },

  tagCategoria: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(213, 181, 109, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },

  textoTagCategoria: {
    color: cores.dourado,
    fontSize: 11,
    fontWeight: '500',
  },

  botoesAcao: {
    flexDirection: 'row',
    gap: 6,
  },

  botaoAcao: {
    padding: 6,
  },

  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  quantidadeProduto: {
    color: cores.branco,
    fontSize: 14,
  },

  badge: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },

  badgeEsgotado: {
    backgroundColor: 'rgba(229, 115, 115, 0.2)',
    color: cores.erro,
  },

  badgeBaixo: {
    backgroundColor: 'rgba(229, 115, 115, 0.15)',
    color: cores.erro,
  },

  badgeNormal: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    color: cores.sucesso,
  },

  codigoProduto: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 8,
  },

  precoProduto: {
    color: cores.textoSecundario,
    fontSize: 12,
    marginTop: 4,
  },

  botaoAdicionar: {
    backgroundColor: cores.dourado,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
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
});
