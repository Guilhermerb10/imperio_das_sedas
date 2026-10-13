import React, { useState } from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../estilo/style';
import CartaoIndicador from '../componentes/CartaoIndicador';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home({ navigation }) {
  // Estado inicial: estoque vazio
  const [indicadores] = useState({
    totalProdutos: 0,
    estoqueBaixo: 0,
    entradasMes: 0,
    saidasMes: 0,
  });

  const [produtosEstoqueBaixo] = useState([]);

  return (
    <SafeAreaView style ={styles.container} edges={['top']}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
    >

      {/* CABEÇALHO */}
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.nomeLoja}>
            IMPÉRIO DAS SEDAS
          </Text>

          <Text style={styles.titulo}>
            Visão geral
          </Text>

          <Text style={styles.subtitulo}>
            Acompanhe seu estoque
          </Text>
        </View>

        <View style={styles.iconeCabecalho}>
          <Ionicons
            name="storefront-outline"
            size={26}
            color={cores.dourado}
          />
        </View>
      </View>

      {/* INDICADORES */}
      <View style={styles.linha}>
        <CartaoIndicador
          titulo="Produtos cadastrados"
          valor={indicadores.totalProdutos}
          icone="cube-outline"
        />

        <CartaoIndicador
          titulo="Estoque baixo"
          valor={indicadores.estoqueBaixo}
          icone="warning-outline"
        />
      </View>

      <View style={styles.linha}>
        <CartaoIndicador
          titulo="Entradas no mês"
          valor={indicadores.entradasMes}
          icone="arrow-down-outline"
        />

        <CartaoIndicador
          titulo="Saídas no mês"
          valor={indicadores.saidasMes}
          icone="arrow-up-outline"
        />
      </View>

      {/* ESTOQUE BAIXO */}
      <View style={styles.secao}>
        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>
            Estoque baixo
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Estoque')}
          >
            <Text style={styles.link}>
              Ver todos →
            </Text>
          </TouchableOpacity>
        </View>

        {produtosEstoqueBaixo.length === 0 ? (
          <View style={styles.estadoVazio}>
            <Ionicons
              name="cube-outline"
              size={38}
              color={cores.dourado}
            />

            <Text style={styles.textoVazio}>
              Nenhum produto cadastrado
            </Text>

            <Text style={styles.descricaoVazio}>
              Os produtos com estoque baixo
              aparecerão aqui.
            </Text>
          </View>
        ) : (
          produtosEstoqueBaixo.map((produto) => (
            <Text
              key={produto.id}
              style={styles.textoProduto}
            >
              {produto.nome}
            </Text>
          ))
        )}
      </View>

      {/* BOTÃO CADASTRO */}
      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('CadastroProduto')}
      >
        <Ionicons
          name="add"
          size={24}
          color={cores.fundo}
        />

        <Text style={styles.textoBotao}>
          Cadastrar produto
        </Text>
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

  textoProduto: {
    color: cores.branco,
    fontSize: 14,
    marginTop: 12,
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
