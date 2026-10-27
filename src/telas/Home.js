import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { cores } from '../estilo/style';
import CartaoIndicador from '../componentes/CartaoIndicador';
import { obterIndicadores } from '../banco/BancoDados';

export default function Home({ navigation }) {
  const [indicadores, setIndicadores] = useState({
    totalProdutos: 0,
    estoqueBaixo: 0,
    entradasMes: 0,
    saidasMes: 0,
  });

  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      async function carregarDados() {
        try {
          const dados = await obterIndicadores();
          if (!cancelado) {
            setIndicadores({
              totalProdutos: dados.totalProdutos,
              estoqueBaixo: dados.estoqueBaixo,
              entradasMes: dados.entradasMes,
              saidasMes: dados.saidasMes,
            });
            setProdutosEstoqueBaixo(dados.produtosEstoqueBaixo || []);
          }
        } catch (erro) {
          console.error('Erro ao carregar indicadores:', erro);
        } finally {
          if (!cancelado) setCarregando(false);
        }
      }

      carregarDados();

      return () => {
        cancelado = true;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
      >
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.nomeLoja}>IMPÉRIO DAS SEDAS</Text>
            <Text style={styles.titulo}>Visão geral</Text>
            <Text style={styles.subtitulo}>Acompanhe seu estoque</Text>
          </View>

          <View style={styles.iconeCabecalho}>
            <Ionicons
              name="storefront-outline"
              size={26}
              color={cores.dourado}
            />
          </View>
        </View>

        <View style={styles.linha}>
          <CartaoIndicador
            titulo="Produtos cadastrados"
            valor={carregando ? '...' : indicadores.totalProdutos}
            icone="cube-outline"
          />

          <CartaoIndicador
            titulo="Estoque baixo"
            valor={carregando ? '...' : indicadores.estoqueBaixo}
            icone={indicadores.estoqueBaixo > 0 ? 'warning' : 'warning-outline'}
            alerta={indicadores.estoqueBaixo > 0}
          />
        </View>

        <View style={styles.linha}>
          <CartaoIndicador
            titulo="Entradas no mês"
            valor={carregando ? '...' : indicadores.entradasMes}
            icone="arrow-down-outline"
          />

          <CartaoIndicador
            titulo="Saídas no mês"
            valor={carregando ? '...' : indicadores.saidasMes}
            icone="arrow-up-outline"
          />
        </View>

        <View style={styles.secao}>
          <View style={styles.cabecalhoSecao}>
            <Text style={styles.tituloSecao}>Estoque baixo</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Estoque')}
            >
              <Text style={styles.link}>Ver todos →</Text>
            </TouchableOpacity>
          </View>

          {carregando ? (
            <ActivityIndicator size="small" color={cores.dourado} style={{ marginVertical: 20 }} />
          ) : produtosEstoqueBaixo.length === 0 ? (
            <View style={styles.estadoVazio}>
              <Ionicons
                name="checkmark-circle-outline"
                size={38}
                color={cores.sucesso}
              />

              <Text style={styles.textoVazio}>
                Nenhum produto com estoque crítico
              </Text>

              <Text style={styles.descricaoVazio}>
                Os produtos com estoque baixo ou igual ao limite mínimo aparecerão aqui.
              </Text>
            </View>
          ) : (
            produtosEstoqueBaixo.map((produto) => (
              <View key={produto.id} style={styles.itemEstoqueBaixo}>
                <View style={styles.itemInfo}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={cores.erro}
                  />
                  <Text style={styles.textoProduto}>{produto.nome}</Text>
                </View>
                <Text style={styles.quantidadeBaixa}>
                  {produto.quantidade} / {produto.estoqueMinimo} un.
                </Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('CadastroProduto')}
        >
          <Ionicons
            name="add"
            size={24}
            color={cores.fundo}
          />

          <Text style={styles.textoBotao}>Cadastrar produto</Text>
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

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
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
  },

  iconeCabecalho: {
    backgroundColor: cores.cartao,
    padding: 14,
    borderRadius: 14,
  },

  linha: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  secao: {
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
  },

  cabecalhoSecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tituloSecao: {
    color: cores.branco,
    fontSize: 17,
    fontWeight: 'bold',
  },

  link: {
    color: cores.dourado,
    fontSize: 13,
  },

  estadoVazio: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },

  textoVazio: {
    color: cores.branco,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  descricaoVazio: {
    color: cores.textoSecundario,
    fontSize: 13,
    textAlign: 'center',
  },

  itemEstoqueBaixo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },

  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  textoProduto: {
    color: cores.branco,
    fontSize: 14,
    flex: 1,
  },

  quantidadeBaixa: {
    color: cores.erro,
    fontSize: 13,
    fontWeight: 'bold',
  },

  botao: {
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

