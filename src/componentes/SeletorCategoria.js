import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../estilo/style';
import { cadastrarCategoria } from '../banco/BancoDados';

export default function SeletorCategoria({
  categoria,
  setCategoria,
  categorias,
  setCategorias,
}) {
  const [aberto, setAberto] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [erro, setErro] = useState('');

  async function adicionarCategoria() {
    const nome = novaCategoria.trim();

    if (!nome) {
      setErro('Informe o nome da categoria.');
      return;
    }

    const existente = categorias.find(
      (item) => item.toLowerCase() === nome.toLowerCase()
    );

    if (existente) {
      setCategoria(existente);
      setNovaCategoria('');
      setErro('');
      setAdicionando(false);
      setAberto(false);
      return;
    }

    setSalvandoCategoria(true);
    try {
      await cadastrarCategoria(nome);
      setCategorias([...categorias, nome]);
      setCategoria(nome);
      setNovaCategoria('');
      setErro('');
      setAdicionando(false);
      setAberto(false);
    } catch (e) {
      console.error('Erro ao cadastrar categoria no SQLite:', e);
      setErro('Não foi possível salvar a categoria.');
    } finally {
      setSalvandoCategoria(false);
    }
  }

  return (
    <View>
      <Text style={styles.label}>Categoria *</Text>

      <TouchableOpacity
        style={styles.seletor}
        onPress={() => setAberto(!aberto)}
      >
        <Text
          style={
            categoria ? styles.texto : styles.placeholder
          }
        >
          {categoria || 'Selecione uma categoria'}
        </Text>

        <Ionicons
          name={aberto ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={cores.dourado}
        />
      </TouchableOpacity>

      {aberto && (
        <View style={styles.lista}>
          {categorias.length === 0 && (
            <Text style={styles.mensagem}>
              Nenhuma categoria cadastrada
            </Text>
          )}

          {categorias.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.opcao}
              onPress={() => {
                setCategoria(item);
                setAberto(false);
              }}
            >
              <Text style={styles.texto}>{item}</Text>
            </TouchableOpacity>
          ))}

          {!adicionando ? (
            <TouchableOpacity
              style={styles.botaoNova}
              onPress={() => setAdicionando(true)}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={cores.dourado}
              />

              <Text style={styles.textoNova}>
                Nova categoria
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.areaNova}>
              <TextInput
                style={styles.input}
                placeholder="Nome da categoria"
                placeholderTextColor={cores.textoSecundario}
                value={novaCategoria}
                onChangeText={(texto) => {
                  setNovaCategoria(texto);
                  setErro('');
                }}
              />

              {erro ? (
                <Text style={styles.erro}>{erro}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.botaoAdicionar, salvandoCategoria && { opacity: 0.7 }]}
                onPress={adicionarCategoria}
                disabled={salvandoCategoria}
              >
                {salvandoCategoria ? (
                  <ActivityIndicator size="small" color={cores.fundo} />
                ) : (
                  <Text style={styles.textoAdicionar}>
                    Adicionar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: cores.branco,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 9,
    marginTop: 15,
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
  texto: {
    color: cores.branco,
    fontSize: 15,
  },
  placeholder: {
    color: cores.textoSecundario,
    fontSize: 15,
  },
  lista: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    marginTop: 8,
    padding: 10,
  },
  mensagem: {
    color: cores.textoSecundario,
    textAlign: 'center',
    padding: 12,
  },
  opcao: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  botaoNova: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  textoNova: {
    color: cores.dourado,
    fontSize: 14,
    fontWeight: '500',
  },
  areaNova: {
    gap: 10,
    padding: 8,
  },
  input: {
    backgroundColor: cores.fundo,
    color: cores.branco,
    borderRadius: 8,
    padding: 12,
  },
  erro: {
    color: cores.erro,
    fontSize: 12,
  },
  botaoAdicionar: {
    backgroundColor: cores.dourado,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoAdicionar: {
    color: cores.fundo,
    fontWeight: 'bold',
  },
});