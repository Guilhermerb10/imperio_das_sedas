import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../estilo/style';

export default function CartaoIndicador({ titulo, valor, icone }) {
  return (
    <View style={styles.cartao}>
      <Ionicons
        name={icone}
        size={24}
        color={cores.dourado}
      />

      <Text style={styles.valor}>{valor}</Text>

      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minHeight: 135,
    justifyContent: 'space-between',
  },

  valor: {
    color: cores.branco,
    fontSize: 28,
    fontWeight: 'bold',
  },

  titulo: {
    color: cores.textoSecundario,
    fontSize: 12,
  },
});
