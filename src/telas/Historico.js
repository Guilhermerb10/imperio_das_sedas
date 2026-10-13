
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../estilo/style';

export default function Historico() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('Todas');

  // Lista vazia até a integração com SQLite
  const [movimentacoes] = useState([]);

  const filtros = ['Todas', 'Entradas', 'Saídas'];

  // Indicadores
  const total = movimentacoes.length;

  const totalEntradas = movimentacoes.filter(
    (item) => item.tipo === 'Entrada'
  ).length;

  const totalSaidas = movimentacoes.filter(
    (item) => item.tipo === 'Saída'
  ).length;

  // Pesquisa e filtros
  const movimentacoesFiltradas = movimentacoes.filter((item) => {
    const correspondeBusca = item.produtoNome
      .toLowerCase()
      .includes(busca.toLowerCase());

    if (!correspondeBusca) return false;

    if (filtro === 'Entradas') {
      return item.tipo === 'Entrada';
    }

    if (filtro === 'Saídas') {
      return item.tipo === 'Saída';
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <Text style={styles.nomeLoja}>
          IMPÉRIO DAS SEDAS
        </Text>

        <Text style={styles.titulo}>
          Histórico
        </Text>

        <Text style={styles.subtitulo}>
          Acompanhe as movimentações do estoque
        </Text>

        {/* INDICADORES */}
        <View style={styles.linha}>
          <View style={styles.cartao}>
            <Ionicons
              name="time-outline"
              size={23}
              color={cores.dourado}
            />
            <Text style={styles.valor}>{total}</Text>
            <Text style={styles.textoCartao}>Total</Text>
          </View>

          <View style={styles.cartao}>
            <Ionicons
              name="arrow-down-outline"
              size={23}
              color={cores.dourado}
            />
            <Text style={styles.valor}>{totalEntradas}</Text>
            <Text style={styles.textoCartao}>Entradas</Text>
          </View>

          <View style={styles.cartao}>
            <Ionicons
              name="arrow-up-outline"
              size={23}
              color={cores.dourado}
            />
            <Text style={styles.valor}>{totalSaidas}</Text>
            <Text style={styles.textoCartao}>Saídas</Text>
          </View>
        </View>

        {/* BUSCA */}
        <View style={styles.campoBusca}>
          <Ionicons
            name="search-outline"
            size={21}
            color={cores.textoSecundario}
          />

          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar produto..."
            placeholderTextColor={cores.textoSecundario}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* FILTROS */}
        <View style={styles.areaFiltros}>
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
        </View>

        {/* LISTAGEM */}
        {movimentacoesFiltradas.length === 0 ? (
          <View style={styles.estadoVazio}>
            <Ionicons
              name="time-outline"
              size={42}
              color={cores.dourado}
            />

            <Text style={styles.textoVazio}>
              {movimentacoes.length === 0
                ? 'Nenhuma movimentação registrada'
                : 'Nenhuma movimentação encontrada'}
            </Text>

            <Text style={styles.descricaoVazio}>
              {movimentacoes.length === 0
                ? 'As entradas e saídas de produtos aparecerão aqui.'
                : 'Tente alterar a busca ou os filtros.'}
            </Text>
          </View>
        ) : (
          movimentacoesFiltradas.map((item) => (
            <View
              key={item.id}
              style={styles.cartaoMovimentacao}
            >
              <View style={styles.cabecalhoMovimentacao}>
                <Text style={styles.nomeProduto}>
                  {item.produtoNome}
                </Text>

                <Text
                  style={[
                    styles.tipoMovimentacao,
                    {
                      color: item.tipo === 'Entrada'
                        ? cores.sucesso
                        : cores.erro,
                    },
                  ]}
                >
                  {item.tipo}
                </Text>
              </View>

              <Text style={styles.detalhes}>
                Quantidade: {item.quantidade}
              </Text>

              <Text style={styles.detalhes}>
                Motivo: {item.motivo}
              </Text>

              <Text style={styles.data}>
                {item.data}
              </Text>
            </View>
          ))
        )}
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
    paddingBottom: 100,
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
    gap: 10,
    marginBottom: 25,
  },

  cartao: {
    flex: 1,
    minWidth: 0,
    backgroundColor: cores.cartao,
    borderRadius: 14,
    padding: 14,
    minHeight: 115,
    justifyContent: 'space-between',
  },

  valor: {
    color: cores.branco,
    fontSize: 25,
    fontWeight: 'bold',
  },

  textoCartao: {
    color: cores.textoSecundario,
    fontSize: 12,
  },

  campoBusca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
  },

  inputBusca: {
    flex: 1,
    color: cores.branco,
    fontSize: 15,
    marginLeft: 10,
  },

  areaFiltros: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 24,
  },

  filtro: {
    backgroundColor: cores.cartao,
    borderRadius: 25,
    paddingHorizontal: 17,
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

  cartaoMovimentacao: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
  },

  cabecalhoMovimentacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  nomeProduto: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },

  tipoMovimentacao: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  detalhes: {
    color: cores.textoSecundario,
    fontSize: 13,
    marginTop: 8,
  },

  data: {
    color: cores.dourado,
    fontSize: 12,
    marginTop: 12,
  },
});