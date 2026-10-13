
import React, { useState } from 'react';
import {View,Text,TextInput,ScrollView,TouchableOpacity,StyleSheet,Alert,KeyboardAvoidingView,Platform,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { cores } from '../estilo/style';

import SeletorCategoria from '../componentes/SeletorCategoria';

function formatarMoeda(texto) {
    const numeros = texto.replace(/\D/g, '');

    const valor = Number(numeros || '0') / 100;

    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

export default function CadastroProduto({ navigation }) {
    const [nome, setNome] = useState('');
    const [codigo, setCodigo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [estoqueMinimo, setEstoqueMinimo] = useState('');
    const [precoCusto, setPrecoCusto] = useState('');
    const [observacoes, setObservacoes] = useState('');

    const [categorias, setCategorias] = useState([]);


function validarFormulario() {
  if (!nome.trim()) {
    Alert.alert('Atenção', 'Informe o nome do produto.');
    return;
  }

  if (!codigo.trim()) {
    Alert.alert('Atenção', 'Informe o código do produto.');
    return;
  }

  if (!categoria.trim()) {
    Alert.alert('Atenção', 'Selecione uma categoria.');
    return;
  }

  if (!/^\d+$/.test(quantidade)) {
    Alert.alert(
      'Atenção',
      'Informe uma quantidade inicial válida.'
    );
    return;
  }

  if (!/^\d+$/.test(estoqueMinimo)) {
    Alert.alert(
      'Atenção',
      'Informe um estoque mínimo válido.'
    );
    return;
  }

  if (
    precoCusto &&
    !/^\d+$/.test(precoCusto.replace(/\D/g, ''))
  ) {
    Alert.alert(
      'Atenção',
      'Informe um preço de custo válido.'
    );
    return;
  }

  Alert.alert(
    'Formulário validado',
    'As informações estão corretas. O salvamento será habilitado quando integrarmos o banco de dados.'
  );
}


    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* CABEÇALHO */}
                    <TouchableOpacity
                        style={styles.voltar}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={cores.dourado}
                        />
                        <Text style={styles.textoVoltar}>Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.titulo}>Cadastrar produto</Text>
                    <Text style={styles.subtitulo}>
                        Preencha as informações do produto
                    </Text>

                    {/* NOME */}
                    <Text style={styles.label}>Nome do produto *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite o nome do produto"
                        placeholderTextColor={cores.textoSecundario}
                        value={nome}
                        onChangeText={setNome}
                    />

                    {/* CÓDIGO */}
                    <Text style={styles.label}>Código do produto *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite o código"
                        placeholderTextColor={cores.textoSecundario}
                        value={codigo}
                        onChangeText={setCodigo}
                    />

                    {/* CATEGORIA */}
                    <SeletorCategoria
                        categoria={categoria}
                        setCategoria={setCategoria}
                        categorias={categorias}
                        setCategorias={setCategorias}
                    />

                    {/* QUANTIDADES */}
                    <View style={styles.linha}>
                        <View style={styles.coluna}>
                            <Text style={styles.label}>Quantidade inicial *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={cores.textoSecundario}
                                keyboardType="number-pad"
                                value={quantidade}
                                onChangeText={setQuantidade}
                            />
                        </View>

                        <View style={styles.coluna}>
                            <Text style={styles.label}>Estoque mínimo *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                placeholderTextColor={cores.textoSecundario}
                                keyboardType="number-pad"
                                value={estoqueMinimo}
                                onChangeText={setEstoqueMinimo}
                            />
                        </View>
                    </View>

                    {/* PREÇO */}
                    <Text style={styles.label}>Preço de custo</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="R$ 0,00"
                        placeholderTextColor={cores.textoSecundario}
                        keyboardType="number-pad"
                        value={precoCusto}
                        onChangeText={(texto) => {
                            setPrecoCusto(formatarMoeda(texto));
                        }}
                    />

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

                    {/* BOTÃO SALVAR */}
                    <TouchableOpacity
                        style={styles.botaoSalvar}
                        onPress={validarFormulario}
                    >
                        <Ionicons
                            name="save-outline"
                            size={22}
                            color={cores.fundo}
                        />
                        <Text style={styles.textoBotao}>Salvar produto</Text>
                    </TouchableOpacity>

                    <Text style={styles.observacao}>
                        * Campos obrigatórios
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
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
    voltar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 25,
    },
    textoVoltar: {
        color: cores.dourado,
        fontSize: 15,
    },
    titulo: {
        color: cores.branco,
        fontSize: 27,
        fontWeight: 'bold',
    },
    subtitulo: {
        color: cores.textoSecundario,
        fontSize: 14,
        marginTop: 6,
        marginBottom: 25,
    },
    label: {
        color: cores.branco,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 9,
        marginTop: 15,
    },
    input: {
        backgroundColor: cores.cartao,
        color: cores.branco,
        borderRadius: 12,
        paddingHorizontal: 15,
        minHeight: 52,
        fontSize: 15,
    },
    linha: {
        flexDirection: 'row',
        gap: 12,
    },
    coluna: {
        flex: 1,
        minWidth: 0,
    },
    textoLongo: {
        height: 100,
        paddingTop: 15,
    },
    botaoSalvar: {
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
    observacao: {
        color: cores.textoSecundario,
        fontSize: 12,
        marginTop: 15,
    },
});