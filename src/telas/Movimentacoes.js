
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../estilo/style';

export default function Movimentacoes() {
  const [tipo, setTipo] = useState('Entrada');
  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [mostrarMotivos, setMostrarMotivos] = useState(false);

  // Sem produtos até a integração com SQLite
  const [produtos] = useState([]);

  const motivos = tipo === 'Entrada'
    ? ['Recebimento', 'Devolução', 'Ajuste', 'Outro']
    : ['Venda', 'Perda', 'Ajuste', 'Outro'];

  function alterarTipo(novoTipo) {
    setTipo(novoTipo);
    setMotivo('');
    setMostrarMotivos(false);
  }

  function validarMovimentacao() {
    if (!produto) {
      Alert.alert('Atenção', 'Selecione um produto.');
      return;
    }

    if (!/^[1-9]\d*$/.test(quantidade)) {
      Alert.alert(
        'Atenção',
        'Informe uma quantidade inteira maior que zero.'
      );
      return;
    }

    if (!motivo) {
      Alert.alert('Atenção', 'Selecione um motivo.');
      return;
    }

    if (
      tipo === 'Saída' &&
      Number(quantidade) > produto.quantidade
    ) {
      Alert.alert(
        'Estoque insuficiente',
        'A quantidade solicitada é maior que o estoque disponível.'
      );
      return;
    }

    Alert.alert(
      'Formulário validado',
      'A movimentação será registrada quando integrarmos o SQLite.'
    );
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
        {/* CABEÇALHO */}
        <Text style={styles.nomeLoja}>
          IMPÉRIO DAS SEDAS
        </Text>

        <Text style={styles.titulo}>
          Movimentações
        </Text>

        <Text style={styles.subtitulo}>
          Registre entradas e saídas do estoque
        </Text>

        {/* TIPO DE MOVIMENTAÇÃO */}
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

        {/* PRODUTO */}
        <Text style={styles.label}>Produto *</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => {
            if (produtos.length === 0) {
              Alert.alert(
                'Nenhum produto',
                'Ainda não existem produtos cadastrados.'
              );
            }
          }}
        >
          <Text style={styles.placeholder}>
            {produto
              ? produto.nome
              : 'Selecione um produto'}
          </Text>

          <Ionicons
            name="chevron-down"
            size={20}
            color={cores.dourado}
          />
        </TouchableOpacity>

        {tipo === 'Saída' && produto && (
          <Text style={styles.infoEstoque}>
            Disponível: {produto.quantidade} unidades
          </Text>
        )}

        {/* QUANTIDADE */}
        <Text style={styles.label}>Quantidade *</Text>

        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={cores.textoSecundario}
          keyboardType="number-pad"
          value={quantidade}
          onChangeText={setQuantidade}
        />

        {/* MOTIVO */}
        <Text style={styles.label}>Motivo *</Text>

        <TouchableOpacity
          style={styles.seletor}
          onPress={() => setMostrarMotivos(!mostrarMotivos)}
        >
          <Text
            style={
              motivo ? styles.texto : styles.placeholder
            }
          >
            {motivo || 'Selecione o motivo'}
          </Text>

          <Ionicons
            name={
              mostrarMotivos
                ? 'chevron-up'
                : 'chevron-down'
            }
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

        {/* OBSERVAÇÕES */}
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

        {/* REGISTRAR */}
        <TouchableOpacity
          style={styles.botaoRegistrar}
          onPress={validarMovimentacao}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={23}
            color={cores.fundo}
          />

          <Text style={styles.textoBotao}>
            Registrar {tipo.toLowerCase()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.obrigatorios}>
          * Campos obrigatórios
        </Text>
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