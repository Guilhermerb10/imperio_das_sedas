
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
      const database = await SQLite.openDatabaseAsync(
        'imperio_das_sedas.db'
      );

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
          atualizado_em TEXT DEFAULT CURRENT_TIMESTAMP,
          ativo INTEGER NOT NULL DEFAULT 1
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
          autorizador_id INTEGER,
          autorizador_nome TEXT DEFAULT '',
          data TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          usuario TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL,
          perfil TEXT NOT NULL DEFAULT 'funcionario',
          ativo INTEGER NOT NULL DEFAULT 1,
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS auditoria_produtos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          produto_id INTEGER,
          produto_nome TEXT NOT NULL,
          acao TEXT NOT NULL,
          detalhe TEXT DEFAULT '',
          usuario_id INTEGER,
          usuario_nome TEXT DEFAULT '',
          data TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const colunasProdutos = await database.getAllAsync(
        'PRAGMA table_info(produtos);'
      );

      if (!colunasProdutos.some(coluna => coluna.name === 'ativo')) {
        await database.execAsync(
          'ALTER TABLE produtos ADD COLUMN ativo INTEGER NOT NULL DEFAULT 1;'
        );
      }

     
      const colunas = await database.getAllAsync(
        'PRAGMA table_info(movimentacoes);'
      );

      const nomesColunas = colunas.map(coluna => coluna.name);

      if (!nomesColunas.includes('autorizador_id')) {
        await database.execAsync(
          'ALTER TABLE movimentacoes ADD COLUMN autorizador_id INTEGER;'
        );
      }

      if (!nomesColunas.includes('autorizador_nome')) {
        await database.execAsync(
          "ALTER TABLE movimentacoes ADD COLUMN autorizador_nome TEXT DEFAULT '';"
        );
      }

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

  return await db.getAllAsync(`
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
    WHERE p.ativo = 1
    ORDER BY p.nome;
  `);
}

export async function buscarProdutoPorId(id) {
  await inicializarBancoDados();

  const produto = await db.getFirstAsync(
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
    WHERE p.id = ? AND p.ativo = 1;`,
    [id]
  );

  return produto || null;
}

async function obterOuCriarCategoria(nomeCategoria) {
  if (!nomeCategoria || nomeCategoria.trim() === '') {
    return null;
  }

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

export async function cadastrarProduto({
  nome,
  codigo,
  categoria,
  quantidade,
  estoqueMinimo,
  precoCusto,
  observacoes,
  usuarioId = null,
  usuarioNome = ''
}) {
  await inicializarBancoDados();

  const codigoExistente = await db.getFirstAsync(
    'SELECT id FROM produtos WHERE codigo = ?;',
    [codigo.trim()]
  );

  if (codigoExistente) {
    throw new Error('Código já cadastrado');
  }

  const categoriaId = await obterOuCriarCategoria(categoria);
  const qtd = parseInt(quantidade, 10) || 0;
  const estMin = parseInt(estoqueMinimo, 10) || 0;

  let produtoId = null;

  await executarTransacao(async () => {
    const resultado = await db.runAsync(
      `INSERT INTO produtos (
        nome, codigo, categoria_id, quantidade,
        estoque_minimo, preco_custo, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        nome,
        codigo,
        categoriaId,
        qtd,
        estMin,
        precoCusto || '',
        observacoes || ''
      ]
    );

    produtoId = resultado.lastInsertRowId;

    await db.runAsync(
      `INSERT INTO auditoria_produtos (
        produto_id, produto_nome, acao, detalhe, usuario_id, usuario_nome
      ) VALUES (?, ?, 'Cadastro', 'Produto cadastrado', ?, ?);`,
      [produtoId, nome, usuarioId, usuarioNome || '']
    );

    if (qtd > 0) {
      await db.runAsync(
        `INSERT INTO movimentacoes (
          produto_id,
          tipo,
          quantidade,
          quantidade_anterior,
          quantidade_posterior,
          motivo,
          autorizador_id,
          autorizador_nome
        ) VALUES (?, 'Entrada', ?, 0, ?, 'Cadastro inicial', ?, ?);`,
        [produtoId, qtd, qtd, usuarioId, usuarioNome || '']
      );
    }
  });

  return produtoId;
}

export async function atualizarProduto(id, {
  nome,
  codigo,
  categoria,
  quantidade,
  estoqueMinimo,
  precoCusto,
  observacoes,
  usuarioId = null,
  usuarioNome = ''
}) {
  await inicializarBancoDados();

  const codigoExistente = await db.getFirstAsync(
    'SELECT id FROM produtos WHERE codigo = ? AND id != ?;',
    [codigo.trim(), id]
  );

  if (codigoExistente) {
    throw new Error('Código já cadastrado');
  }

  const categoriaId = await obterOuCriarCategoria(categoria);
  const qtd = parseInt(quantidade, 10) || 0;
  const estMin = parseInt(estoqueMinimo, 10) || 0;

  let changes = 0;

  await executarTransacao(async () => {
    const produtoAnterior = await db.getFirstAsync(
      'SELECT quantidade, estoque_minimo FROM produtos WHERE id = ? AND ativo = 1;',
      [id]
    );

    if (!produtoAnterior) {
      throw new Error('Produto não encontrado.');
    }

    const resultado = await db.runAsync(
      `UPDATE produtos
       SET nome = ?, codigo = ?, categoria_id = ?,
           quantidade = ?, estoque_minimo = ?,
           preco_custo = ?, observacoes = ?,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [
        nome,
        codigo,
        categoriaId,
        qtd,
        estMin,
        precoCusto || '',
        observacoes || '',
        id
      ]
    );

    changes = resultado.changes;

    if (changes > 0) {
      const detalhe =
        `Saldo: ${produtoAnterior.quantidade} → ${qtd}; ` +
        `estoque mínimo: ${produtoAnterior.estoque_minimo} → ${estMin}.`;

      await db.runAsync(
        `INSERT INTO auditoria_produtos (
          produto_id, produto_nome, acao, detalhe, usuario_id, usuario_nome
        ) VALUES (?, ?, 'Edição', ?, ?, ?);`,
        [id, nome, detalhe, usuarioId, usuarioNome || '']
      );
    }
  });

  return changes;
}

export async function excluirProduto(id, usuarioId = null, usuarioNome = '') {
  await inicializarBancoDados();

  const produto = await db.getFirstAsync(
    'SELECT nome, codigo FROM produtos WHERE id = ? AND ativo = 1;',
    [id]
  );

  if (!produto) return 0;

  let changes = 0;

  await executarTransacao(async () => {
    const resultado = await db.runAsync(
      'UPDATE produtos SET ativo = 0, atualizado_em = CURRENT_TIMESTAMP WHERE id = ? AND ativo = 1;',
      [id]
    );

    changes = resultado.changes;

    if (changes > 0) {
      await db.runAsync(
        `INSERT INTO auditoria_produtos (
          produto_id, produto_nome, acao, detalhe, usuario_id, usuario_nome
        ) VALUES (?, ?, 'Exclusão', 'Produto removido do estoque ativo', ?, ?);`,
        [id, produto.nome, usuarioId, usuarioNome || '']
      );
    }
  });

  return changes;
}

export async function registrarEntrada(
  produtoId,
  quantidade,
  motivo,
  observacao,
  usuarioId = null,
  usuarioNome = ''
) {
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

    if (qtdEntrada <= 0) {
      throw new Error('A quantidade de entrada deve ser maior que zero.');
    }

    const qtdPosterior = qtdAnterior + qtdEntrada;

    const resultado = await db.runAsync(
      `INSERT INTO movimentacoes (
        produto_id,
        tipo,
        quantidade,
        quantidade_anterior,
        quantidade_posterior,
        motivo,
        observacao,
        autorizador_id,
        autorizador_nome
      ) VALUES (?, 'Entrada', ?, ?, ?, ?, ?, ?, ?);`,
      [
        produtoId,
        qtdEntrada,
        qtdAnterior,
        qtdPosterior,
        motivo || '',
        observacao || '',
        usuarioId,
        usuarioNome || ''
      ]
    );

    movimentacaoId = resultado.lastInsertRowId;

    await db.runAsync(
      `UPDATE produtos
       SET quantidade = ?, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [qtdPosterior, produtoId]
    );
  });

  return movimentacaoId;
}

export async function registrarSaida(
  produtoId,
  quantidade,
  motivo,
  observacao,
  autorizadorId = null,
  autorizadorNome = ''
) {
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

    if (qtdSaida <= 0) {
      throw new Error('A quantidade de saída deve ser maior que zero.');
    }

    if (qtdSaida > qtdAnterior) {
      throw new Error('Estoque insuficiente.');
    }

    const qtdPosterior = qtdAnterior - qtdSaida;

    const resultado = await db.runAsync(
      `INSERT INTO movimentacoes (
        produto_id,
        tipo,
        quantidade,
        quantidade_anterior,
        quantidade_posterior,
        motivo,
        observacao,
        autorizador_id,
        autorizador_nome
      ) VALUES (?, 'Saída', ?, ?, ?, ?, ?, ?, ?);`,
      [
        produtoId,
        qtdSaida,
        qtdAnterior,
        qtdPosterior,
        motivo || '',
        observacao || '',
        autorizadorId,
        autorizadorNome || ''
      ]
    );

    movimentacaoId = resultado.lastInsertRowId;

    await db.runAsync(
      `UPDATE produtos
       SET quantidade = ?, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?;`,
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
    const horaFormatada = horaParte
      ? horaParte.substring(0, 5)
      : '00:00';

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
      m.autorizador_id AS autorizadorId,
      m.autorizador_nome AS autorizadorNome,
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
  const auditoria = filtros.tipo
    ? []
    : await db.getAllAsync(
      `SELECT
        -id AS id,
        produto_nome AS produtoNome,
        CASE acao
          WHEN 'Cadastro' THEN 'Cadastro de produto'
          WHEN 'Edição' THEN 'Edição de produto'
          ELSE 'Exclusão de produto'
        END AS tipo,
        0 AS quantidade,
        NULL AS quantidadeAnterior,
        NULL AS quantidadePosterior,
        acao AS motivo,
        detalhe AS observacao,
        usuario_id AS autorizadorId,
        usuario_nome AS autorizadorNome,
        data
       FROM auditoria_produtos
       ${filtros.busca ? 'WHERE produto_nome LIKE ?' : ''}
       ORDER BY data DESC;`,
      filtros.busca ? [`%${filtros.busca}%`] : []
    );

  const registros = [...movimentacoes, ...auditoria]
    .sort((a, b) => b.data.localeCompare(a.data));

  return registros.map(mov => ({
    ...mov,
    data: formatarDataBrasileira(mov.data)
  }));
}

export async function listarCategorias() {
  await inicializarBancoDados();

  return await db.getAllAsync(
    'SELECT id, nome FROM categorias ORDER BY nome;'
  );
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
    throw new Error(
      'Esta categoria possui produtos associados e não pode ser excluída.'
    );
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
    'SELECT COUNT(*) AS total FROM produtos WHERE ativo = 1;'
  );
  const totalProdutos = totalResult ? totalResult.total : 0;

  const estoqueBaixoResult = await db.getFirstAsync(
    `SELECT COUNT(*) AS total
     FROM produtos
     WHERE ativo = 1 AND quantidade > 0 AND quantidade <= estoque_minimo;`
  );
  const estoqueBaixo = estoqueBaixoResult
    ? estoqueBaixoResult.total
    : 0;

  const agora = new Date();
  const mesAno = `${agora.getFullYear()}-${String(
    agora.getMonth() + 1
  ).padStart(2, '0')}`;

  const entradasResult = await db.getFirstAsync(
    `SELECT COUNT(*) AS total
     FROM movimentacoes
     WHERE tipo = 'Entrada'
       AND strftime('%Y-%m', data) = ?;`,
    [mesAno]
  );
  const entradasMes = entradasResult ? entradasResult.total : 0;

  const saidasResult = await db.getFirstAsync(
    `SELECT COUNT(*) AS total
     FROM movimentacoes
     WHERE tipo = 'Saída'
       AND strftime('%Y-%m', data) = ?;`,
    [mesAno]
  );
  const saidasMes = saidasResult ? saidasResult.total : 0;

  const produtosEstoqueBaixo = await db.getAllAsync(
    `SELECT
      id,
      nome,
      quantidade,
      estoque_minimo AS estoqueMinimo
     FROM produtos
     WHERE ativo = 1 AND quantidade > 0 AND quantidade <= estoque_minimo
     ORDER BY quantidade ASC
     LIMIT 5;`
  );

  return {
    totalProdutos,
    estoqueBaixo,
    entradasMes,
    saidasMes,
    produtosEstoqueBaixo
  };
}

export async function buscarProdutos(termo) {
  await inicializarBancoDados();

  return await db.getAllAsync(
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
    WHERE p.ativo = 1 AND p.nome LIKE ?
    ORDER BY p.nome;`,
    [`%${termo}%`]
  );
}

export async function verificarAdministrador() {
  await inicializarBancoDados();

  const administrador = await db.getFirstAsync(
    "SELECT id FROM usuarios WHERE perfil = 'administrador' AND ativo = 1 LIMIT 1;"
  );

  return Boolean(administrador);
}

export async function cadastrarAdministrador({ nome, usuario, senha }) {
  await inicializarBancoDados();

  const existe = await verificarAdministrador();
  if (existe) throw new Error('O administrador já foi configurado.');

  const nomeLimpo = nome.trim();
  const usuarioLimpo = usuario.trim().toLowerCase();
  const senhaLimpa = senha.trim();

  if (!nomeLimpo || !usuarioLimpo || !senhaLimpa) {
    throw new Error('Preencha todos os campos.');
  }

  const resultado = await db.runAsync(
    "INSERT INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, 'administrador');",
    [nomeLimpo, usuarioLimpo, senhaLimpa]
  );

  return { id: resultado.lastInsertRowId, nome: nomeLimpo, perfil: 'administrador' };
}

export async function entrarNoSistema(usuario, senha) {
  await inicializarBancoDados();

  const registro = await db.getFirstAsync(
    'SELECT id, nome, usuario, senha, perfil FROM usuarios WHERE LOWER(usuario) = LOWER(?) AND ativo = 1;',
    [usuario.trim()]
  );

  if (!registro || registro.senha !== senha) return null;

  return {
    id: registro.id,
    nome: registro.nome,
    usuario: registro.usuario,
    perfil: registro.perfil,
  };
}

export async function validarSenhaFuncionario(id, senha) {
  await inicializarBancoDados();

  const colaborador = await db.getFirstAsync(
    "SELECT id, nome FROM usuarios WHERE id = ? AND senha = ? AND perfil = 'funcionario' AND ativo = 1;",
    [id, senha.trim()]
  );

  return colaborador || null;
}

export async function listarFuncionarios() {
  await inicializarBancoDados();

  return await db.getAllAsync(
    "SELECT id, nome, usuario, ativo FROM usuarios WHERE perfil = 'funcionario' ORDER BY nome;"
  );
}

export async function salvarFuncionario({ id, nome, usuario, senha }) {
  await inicializarBancoDados();

  const nomeLimpo = nome.trim();
  const usuarioLimpo = usuario.trim().toLowerCase();
  const senhaLimpa = senha.trim();

  if (!nomeLimpo || !usuarioLimpo || (!id && !senhaLimpa)) {
    throw new Error('Informe nome, usuário e senha.');
  }

  if (id) {
    if (senhaLimpa) {
      await db.runAsync(
        "UPDATE usuarios SET nome = ?, usuario = ?, senha = ?, ativo = 1 WHERE id = ? AND perfil = 'funcionario';",
        [nomeLimpo, usuarioLimpo, senhaLimpa, id]
      );
    } else {
      await db.runAsync(
        "UPDATE usuarios SET nome = ?, usuario = ?, ativo = 1 WHERE id = ? AND perfil = 'funcionario';",
        [nomeLimpo, usuarioLimpo, id]
      );
    }
    return id;
  }

  const resultado = await db.runAsync(
    "INSERT INTO usuarios (nome, usuario, senha, perfil) VALUES (?, ?, ?, 'funcionario');",
    [nomeLimpo, usuarioLimpo, senhaLimpa]
  );

  return resultado.lastInsertRowId;
}

export async function removerFuncionario(id) {
  await inicializarBancoDados();

  const resultado = await db.runAsync(
    "UPDATE usuarios SET ativo = 0 WHERE id = ? AND perfil = 'funcionario';",
    [id]
  );

  return resultado.changes;
}
