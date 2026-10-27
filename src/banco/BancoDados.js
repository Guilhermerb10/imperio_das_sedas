import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;
let initPromise = null;

async function executarTransacao(tarefa) {
  if (Platform.OS === 'web') {
    return await tarefa();
  }
  return await db.withTransactionAsync(tarefa);
}

export async function inicializarBancoDados() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync('imperio_das_sedas.db');

      await database.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS produtos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          codigo TEXT NOT NULL UNIQUE,
          categoria_id INTEGER REFERENCES categorias(id),
          quantidade INTEGER NOT NULL DEFAULT 0,
          estoque_minimo INTEGER NOT NULL DEFAULT 0,
          preco_custo TEXT DEFAULT '',
          observacoes TEXT DEFAULT '',
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
          atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS movimentacoes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          produto_id INTEGER NOT NULL REFERENCES produtos(id),
          tipo TEXT NOT NULL,
          quantidade INTEGER NOT NULL,
          quantidade_anterior INTEGER NOT NULL DEFAULT 0,
          quantidade_posterior INTEGER NOT NULL DEFAULT 0,
          motivo TEXT DEFAULT '',
          observacao TEXT DEFAULT '',
          data TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db = database;
      return db;
    } catch (erro) {
      db = null;
      console.error('Falha ao abrir SQLite:', erro);
      throw erro;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

export async function listarProdutos() {
  await inicializarBancoDados();

  const produtos = await db.getAllAsync(`
    SELECT
      p.id,
      p.nome,
      p.codigo,
      c.nome AS categoria,
      p.quantidade,
      p.estoque_minimo AS estoqueMinimo,
      p.preco_custo AS precoCusto,
      p.observacoes,
      p.categoria_id AS categoriaId
    FROM produtos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.nome;
  `);

  return produtos;
}

export async function buscarProdutoPorId(id) {
  await inicializarBancoDados();

  const produto = await db.getFirstAsync(`
    SELECT
      p.id,
      p.nome,
      p.codigo,
      c.nome AS categoria,
      p.quantidade,
      p.estoque_minimo AS estoqueMinimo,
      p.preco_custo AS precoCusto,
      p.observacoes,
      p.categoria_id AS categoriaId
    FROM produtos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?;
  `, [id]);

  return produto || null;
}

async function obterOuCriarCategoria(nomeCategoria) {
  if (!nomeCategoria || nomeCategoria.trim() === '') return null;

  const nomeTrimado = nomeCategoria.trim();

  const existente = await db.getFirstAsync(
    'SELECT id FROM categorias WHERE LOWER(nome) = LOWER(?);',
    [nomeTrimado]
  );

  if (existente) return existente.id;

  const resultado = await db.runAsync(
    'INSERT INTO categorias (nome) VALUES (?);',
    [nomeTrimado]
  );

  return resultado.lastInsertRowId;
}

export async function cadastrarProduto({ nome, codigo, categoria, quantidade, estoqueMinimo, precoCusto, observacoes }) {
  await inicializarBancoDados();

  const categoriaId = await obterOuCriarCategoria(categoria);

  const qtd = parseInt(quantidade, 10) || 0;
  const estMin = parseInt(estoqueMinimo, 10) || 0;

  let produtoId = null;

  await executarTransacao(async () => {
    const resultado = await db.runAsync(
      `INSERT INTO produtos (nome, codigo, categoria_id, quantidade, estoque_minimo, preco_custo, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [nome, codigo, categoriaId, qtd, estMin, precoCusto || '', observacoes || '']
    );

    produtoId = resultado.lastInsertRowId;

    if (qtd > 0) {
      await db.runAsync(
        `INSERT INTO movimentacoes (produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo)
         VALUES (?, 'Entrada', ?, 0, ?, 'Cadastro inicial');`,
        [produtoId, qtd, qtd]
      );
    }
  });

  return produtoId;
}

export async function atualizarProduto(id, { nome, codigo, categoria, quantidade, estoqueMinimo, precoCusto, observacoes }) {
  await inicializarBancoDados();

  const categoriaId = await obterOuCriarCategoria(categoria);

  const qtd = parseInt(quantidade, 10) || 0;
  const estMin = parseInt(estoqueMinimo, 10) || 0;

  let changes = 0;

  await executarTransacao(async () => {
    const resultado = await db.runAsync(
      `UPDATE produtos
       SET nome = ?, codigo = ?, categoria_id = ?, quantidade = ?, estoque_minimo = ?,
           preco_custo = ?, observacoes = ?, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [nome, codigo, categoriaId, qtd, estMin, precoCusto || '', observacoes || '', id]
    );

    changes = resultado.changes;
  });

  return changes;
}

export async function excluirProduto(id) {
  await inicializarBancoDados();

  const movimentacao = await db.getFirstAsync(
    'SELECT id FROM movimentacoes WHERE produto_id = ? LIMIT 1;',
    [id]
  );

  if (movimentacao) {
    throw new Error('Este produto possui movimentações registradas e não pode ser excluído.');
  }

  const resultado = await db.runAsync(
    'DELETE FROM produtos WHERE id = ?;',
    [id]
  );

  return resultado.changes;
}

export async function registrarEntrada(produtoId, quantidade, motivo, observacao) {
  await inicializarBancoDados();

  let movimentacaoId = null;

  await executarTransacao(async () => {
    const produto = await db.getFirstAsync(
      'SELECT quantidade FROM produtos WHERE id = ?;',
      [produtoId]
    );

    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    const qtdAnterior = produto.quantidade;
    const qtdEntrada = parseInt(quantidade, 10) || 0;
    const qtdPosterior = qtdAnterior + qtdEntrada;

    const resultado = await db.runAsync(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, observacao)
       VALUES (?, 'Entrada', ?, ?, ?, ?, ?);`,
      [produtoId, qtdEntrada, qtdAnterior, qtdPosterior, motivo || '', observacao || '']
    );

    movimentacaoId = resultado.lastInsertRowId;

    await db.runAsync(
      'UPDATE produtos SET quantidade = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?;',
      [qtdPosterior, produtoId]
    );
  });

  return movimentacaoId;
}

export async function registrarSaida(produtoId, quantidade, motivo, observacao) {
  await inicializarBancoDados();

  let movimentacaoId = null;

  await executarTransacao(async () => {
    const produto = await db.getFirstAsync(
      'SELECT quantidade FROM produtos WHERE id = ?;',
      [produtoId]
    );

    if (!produto) {
      throw new Error('Produto não encontrado.');
    }

    const qtdAnterior = produto.quantidade;
    const qtdSaida = parseInt(quantidade, 10) || 0;

    if (qtdSaida > qtdAnterior) {
      throw new Error('Estoque insuficiente.');
    }

    const qtdPosterior = qtdAnterior - qtdSaida;

    const resultado = await db.runAsync(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, observacao)
       VALUES (?, 'Saída', ?, ?, ?, ?, ?);`,
      [produtoId, qtdSaida, qtdAnterior, qtdPosterior, motivo || '', observacao || '']
    );

    movimentacaoId = resultado.lastInsertRowId;

    await db.runAsync(
      'UPDATE produtos SET quantidade = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?;',
      [qtdPosterior, produtoId]
    );
  });

  return movimentacaoId;
}

function formatarDataBrasileira(dataISO) {
  if (!dataISO) return '';

  try {
    const [dataParte, horaParte] = dataISO.split(' ');
    if (!dataParte) return dataISO;

    const [ano, mes, dia] = dataParte.split('-');
    const horaFormatada = horaParte ? horaParte.substring(0, 5) : '00:00';

    return `${dia}/${mes}/${ano} ${horaFormatada}`;
  } catch {
    return dataISO;
  }
}

export async function listarMovimentacoes(filtros = {}) {
  await inicializarBancoDados();

  let sql = `
    SELECT
      m.id,
      p.nome AS produtoNome,
      m.tipo,
      m.quantidade,
      m.quantidade_anterior AS quantidadeAnterior,
      m.quantidade_posterior AS quantidadePosterior,
      m.motivo,
      m.observacao,
      m.data
    FROM movimentacoes m
    INNER JOIN produtos p ON m.produto_id = p.id
  `;

  const condicoes = [];
  const params = [];

  if (filtros.tipo) {
    condicoes.push('m.tipo = ?');
    params.push(filtros.tipo);
  }

  if (filtros.busca) {
    condicoes.push('p.nome LIKE ?');
    params.push(`%${filtros.busca}%`);
  }

  if (condicoes.length > 0) {
    sql += ' WHERE ' + condicoes.join(' AND ');
  }

  sql += ' ORDER BY m.data DESC;';

  const movimentacoes = await db.getAllAsync(sql, params);

  return movimentacoes.map((mov) => ({
    ...mov,
    data: formatarDataBrasileira(mov.data),
  }));
}

export async function listarCategorias() {
  await inicializarBancoDados();

  const categorias = await db.getAllAsync(
    'SELECT id, nome FROM categorias ORDER BY nome;'
  );

  return categorias;
}

export async function cadastrarCategoria(nome) {
  await inicializarBancoDados();

  const nomeTrimado = nome.trim();

  await db.runAsync(
    'INSERT OR IGNORE INTO categorias (nome) VALUES (?);',
    [nomeTrimado]
  );

  const categoria = await db.getFirstAsync(
    'SELECT id FROM categorias WHERE nome = ?;',
    [nomeTrimado]
  );

  return categoria ? categoria.id : null;
}

export async function excluirCategoria(id) {
  await inicializarBancoDados();

  const produto = await db.getFirstAsync(
    'SELECT id FROM produtos WHERE categoria_id = ? LIMIT 1;',
    [id]
  );

  if (produto) {
    throw new Error('Esta categoria possui produtos associados e não pode ser excluída.');
  }

  const resultado = await db.runAsync(
    'DELETE FROM categorias WHERE id = ?;',
    [id]
  );

  return resultado.changes;
}

export async function obterIndicadores() {
  await inicializarBancoDados();

  const totalResult = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM produtos;'
  );
  const totalProdutos = totalResult ? totalResult.total : 0;

  const estoqueBaixoResult = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM produtos WHERE quantidade > 0 AND quantidade <= estoque_minimo;'
  );
  const estoqueBaixo = estoqueBaixoResult ? estoqueBaixoResult.total : 0;

  const agora = new Date();
  const mesAno = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

  const entradasResult = await db.getFirstAsync(
    "SELECT COUNT(*) AS total FROM movimentacoes WHERE tipo = 'Entrada' AND strftime('%Y-%m', data) = ?;",
    [mesAno]
  );
  const entradasMes = entradasResult ? entradasResult.total : 0;

  const saidasResult = await db.getFirstAsync(
    "SELECT COUNT(*) AS total FROM movimentacoes WHERE tipo = 'Saída' AND strftime('%Y-%m', data) = ?;",
    [mesAno]
  );
  const saidasMes = saidasResult ? saidasResult.total : 0;

  const produtosEstoqueBaixo = await db.getAllAsync(
    `SELECT id, nome, quantidade, estoque_minimo AS estoqueMinimo
     FROM produtos
     WHERE quantidade > 0 AND quantidade <= estoque_minimo
     ORDER BY quantidade ASC
     LIMIT 5;`
  );

  return {
    totalProdutos,
    estoqueBaixo,
    entradasMes,
    saidasMes,
    produtosEstoqueBaixo,
  };
}

export async function buscarProdutos(termo) {
  await inicializarBancoDados();

  const produtos = await db.getAllAsync(
    `SELECT
      p.id,
      p.nome,
      p.codigo,
      c.nome AS categoria,
      p.quantidade,
      p.estoque_minimo AS estoqueMinimo,
      p.preco_custo AS precoCusto,
      p.observacoes,
      p.categoria_id AS categoriaId
    FROM produtos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.nome LIKE ?
    ORDER BY p.nome;`,
    [`%${termo}%`]
  );

  return produtos;
}
