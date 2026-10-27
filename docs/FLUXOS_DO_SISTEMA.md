# Fluxos do Sistema

Este documento descreve detalhadamente os principais fluxos operacionais do aplicativo **Império das Sedas**, mapeando o comportamento passo a passo desde o disparo da ação pelo usuário até a persistência no banco de dados.

---

## 1. Fluxo de Cadastro de Produto

O cadastro de produto contempla tanto a resolução dinâmica de categorias quanto a criação automática da movimentação de entrada inicial caso o saldo seja maior que zero:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant Tela as CadastroProduto.js
    participant Seletor as SeletorCategoria.js
    participant BD as BancoDados.js
    participant SQLite as SQLite Database

    Usuario->>Tela: Preenche Nome, Código (SKU), Estoque Mínimo, Preço
    Usuario->>Seletor: Seleciona ou cria nova Categoria
    Usuario->>Tela: Informa Quantidade inicial (ex: 50) e clica em "Salvar produto"
    Tela->>Tela: Valida campos obrigatórios e regex numérico
    Tela->>BD: cadastrarProduto(dados)
    BD->>BD: obterOuCriarCategoria(categoria)
    BD->>SQLite: INSERT INTO produtos (...)
    SQLite-->>BD: lastInsertRowId = produtoId
    alt Quantidade inicial > 0
        BD->>SQLite: INSERT INTO movimentacoes (produto_id, tipo='Entrada', qtd=50, motivo='Cadastro inicial')
    end
    BD-->>Tela: Retorna produtoId com sucesso
    Tela->>Usuario: Exibe alerta "Produto cadastrado com sucesso!" e retorna
```

---

## 2. Fluxo de Movimentação de Estoque (Saída de Mercadoria)

Este fluxo ilustra a proteção contra estoque negativo, a transação atômica e o mecanismo de confirmação amigável:

```mermaid
flowchart TD
    Inicio([Usuário na tela Movimentações]) --> SelecionaTipo[Seleciona aba 'Saída']
    SelecionaTipo --> SelecionaProd[Seleciona o produto no dropdown]
    SelecionaProd --> InformaQtd[Informa a quantidade desejada]
    InformaQtd --> SelecionaMotivo[Seleciona o motivo: Venda, Perda ou Ajuste]
    SelecionaMotivo --> ClicaRegistrar[Clica em 'Registrar saída']

    ClicaRegistrar --> ValidaQtd{Quantidade > 0?}
    ValidaQtd -- Não --> AlertaQtdInvalida[Alerta: 'Informe uma quantidade inteira maior que zero']
    ValidaQtd -- Sim --> ValidaSaldo{Qtd solicitada <= Saldo em estoque?}

    ValidaSaldo -- Não --> AlertaSaldoInsuficiente[Alerta: 'Estoque insuficiente'\nExibe botão Confirmar]
    AlertaSaldoInsuficiente --> ClicaConfirmar[Usuário clica em 'Confirmar']
    ClicaConfirmar --> RecarregaLista[Recarrega lista de produtos do SQLite\nLibera tela para nova tentativa]

    ValidaSaldo -- Sim --> IniciaTransacao[Inicia transação no SQLite]
    IniciaTransacao --> GravaMovimentacao["INSERT INTO movimentacoes\n(produto_id, 'Saída', qtd, saldo_ant, saldo_pos, motivo)"]
    GravaMovimentacao --> AtualizaSaldo["UPDATE produtos SET quantidade = saldo_pos"]
    AtualizaSaldo --> FechaTransacao[Finaliza transação com Sucesso]
    FechaTransacao --> LimpaForm[Limpa formulário e recarrega dados]
    LimpaForm --> AlertaSucesso[Alerta: 'Saída registrada com sucesso!']
```

---

## 3. Fluxo de Exclusão Protegida de Produto

O sistema implementa uma salvaguarda contra quebra de histórico contábil e referências órfãs:

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant Tela as Estoque.js
    participant BD as BancoDados.js
    participant SQLite as SQLite Database

    Usuario->>Tela: Clica no ícone de lixeira do produto
    Tela->>Usuario: Exibe alerta "Deseja realmente excluir [Nome]?" com opções Cancelar / Excluir
    Usuario->>Tela: Clica em "Excluir"
    Tela->>BD: excluirProduto(produtoId)
    BD->>SQLite: SELECT id FROM movimentacoes WHERE produto_id = ? LIMIT 1
    alt Possui movimentações registradas
        SQLite-->>BD: Retorna registro de movimentação
        BD-->>Tela: Lança Error("Este produto possui movimentações registradas...")
        Tela->>Usuario: Alerta: "Não é possível excluir: Este produto possui movimentações..."
    else Sem movimentações registradas
        SQLite-->>BD: Retorna vazio
        BD->>SQLite: DELETE FROM produtos WHERE id = ?
        SQLite-->>BD: Retorna changes = 1
        BD-->>Tela: Sucesso
        Tela->>Tela: carregarProdutos() (Atualiza catálogo)
        Tela->>Usuario: Alerta: "Produto excluído com sucesso."
    end
```

---

## 4. Fluxo de Cálculo de Indicadores do Dashboard (Home)

Toda vez que a tela principal ganha foco, a função `obterIndicadores()` computa estatísticas consolidadas em tempo real:

1. **Total de Produtos:** `SELECT COUNT(*) AS total FROM produtos;`
2. **Estoque Baixo:** `SELECT COUNT(*) AS total FROM produtos WHERE quantidade > 0 AND quantidade <= estoque_minimo;`
3. **Entradas no Mês:** `SELECT COUNT(*) FROM movimentacoes WHERE tipo = 'Entrada' AND strftime('%Y-%m', data) = 'AAAA-MM';`
4. **Saídas no Mês:** `SELECT COUNT(*) FROM movimentacoes WHERE tipo = 'Saída' AND strftime('%Y-%m', data) = 'AAAA-MM';`
5. **Top 5 Produtos Críticos:** Busca os 5 produtos com menor quantidade positiva dentro do limite mínimo para exibição na seção de alerta imediato.

