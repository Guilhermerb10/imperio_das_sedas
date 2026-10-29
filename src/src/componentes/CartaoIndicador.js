import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../estilo/style';

export default function CartaoIndicador({
  titulo,
  valor,
  icone,
  alerta = false,
  corValor,
  corIcone,
  tamanhoIcone,
}) {
  const iconeCor = corIcone || (alerta ? cores.erro : cores.dourado);
  const valorCor = corValor || (alerta ? cores.erro : cores.branco);
  const iconeTamanho = tamanhoIcone || (alerta ? 28 : 24);

  return (
    <View style={[styles.cartao, alerta && styles.cartaoAlerta]}>
      <View style={styles.blocoValor}>
        <View style={styles.areaIcone}>
          <Ionicons
            name={icone}
            size={iconeTamanho}
            color={iconeCor}
          />
        </View>

        <Text style={[styles.valor, { color: valorCor }]}>{valor}</Text>
      </View>

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

  cartaoAlerta: {
    borderWidth: 1,
    borderColor: 'rgba(229, 115, 115, 0.45)',
  },

  blocoValor: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },

  areaIcone: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
