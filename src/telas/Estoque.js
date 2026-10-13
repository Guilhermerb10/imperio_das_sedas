
import React, { useState } from 'react';
import {View, Text, TextInput, ScrollView,
TouchableOpacity, StyleSheet,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../estilo/style';

export default function Estoque({ navigation }) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todos');

  // Lista vazia até a integração com SQLite
  const [produtos] = useState([]);

  const filtros = ['Todos', 'Estoque baixo', 'Esgotados'];

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca = produto.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    if (!correspondeBusca) return false;

    if (filtro === 'Estoque baixo') {
      return produto.quantidade > 0 &&
        produto.quantidade <= produto.estoqueMinimo;
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
        {/* CABEÇALHO */}
        <Text style={styles.nomeLoja}>
          IMPÉRIO DAS SEDAS
        </Text>

        <Text style={styles.titulo}>Estoque</Text>

        <Text style={styles.subtitulo}>
          Gerencie seus produtos
        </Text>

        {/* CAMPO DE BUSCA */}
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

        {/* FILTROS */}
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

        {/* LISTA DE PRODUTOS */}
        {produtosFiltrados.length === 0 ? (
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
          produtosFiltrados.map((produto) => (
            <View key={produto.id} style={styles.cartaoProduto}>
              <Text style={styles.nomeProduto}>
                {produto.nome}
              </Text>

              <Text style={styles.quantidadeProduto}>
                Quantidade: {produto.quantidade}
              </Text>
            </View>
          ))
        )}

        {/* BOTÃO ADICIONAR */}
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => navigation.navigate('CadastroProduto')}
        >
          <Ionicons
            name="add"
            size={24}
            color={cores.fundo}
          />

          <Text style={styles.textoBotao}>
            Adicionar produto
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

  nomeProduto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
  },

  quantidadeProduto: {
    color: cores.textoSecundario,
    marginTop: 8,
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