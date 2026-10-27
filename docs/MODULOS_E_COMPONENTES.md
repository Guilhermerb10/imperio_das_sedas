# Módulos e Componentes

Este documento apresenta a documentação detalhada de cada módulo, tela e componente de interface que compõe o aplicativo **Império das Sedas**, descrevendo seus parâmetros, estados locais, ciclos de vida e relacionamento com a camada de dados.

---

## 1. Telas da Aplicação (`src/telas/`)

### 1.1. `Home.js` (Visão Geral / Dashboard)

- **Arquivo:** [`src/telas/Home.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Home.js)
- **Finalidade:** Servir como o painel de controle principal do usuário, apresentando um panorama quantitativo do estoque e alertando proativamente sobre itens que atingiram ou caíram abaixo do estoque mínimo.
- **Props recebidas:**
  - `navigation` (objeto de navegação do React Navigation).
- **Estados internos (`useState`):**
  - `indicadores`: Objeto `{ totalProdutos: 0, estoqueBaixo: 0, entradasMes: 0, saidasMes: 0 }`.
  - `produtosEstoqueBaixo`: Array com até 5 produtos críticos retornados pelo banco.
  - `carregando`: Booleano para controle do spinner de carregamento inicial.
- **Ciclo de vida e sincronização:**
  - Utiliza `useFocusEffect` em conjunto com `useCallback`. Sempre que a aba se torna ativa no dispositivo, dispara `obterIndicadores()`. Implementa flag `cancelado` na cleanup function para evitar vazamento de memória e *state updates* em componentes desmontados.
- **Interações do usuário:**
  - Toque em "Ver todos →": Navega para a tela `Estoque`.
  - Toque em "Cadastrar produto": Navega via stack para a tela `CadastroProduto`.

```javascript
// Exemplo de integração do hook useFocusEffect em Home.js
useFocusEffect(
  useCallback(() => {
    let cancelado = false;
    async function carregarDados() {
      try {
        const dados = await obterIndicadores();
        if (!cancelado) {
          setIndicadores({
            totalProdutos: dados.totalProdutos,
            estoqueBaixo: dados.estoqueBaixo,
            entradasMes: dados.entradasMes,
            saidasMes: dados.saidasMes,
          });
          setProdutosEstoqueBaixo(dados.produtosEstoqueBaixo || []);
        }
      } catch (erro) {
        console.error('Erro ao carregar indicadores:', erro);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }
    carregarDados();
    return () => { cancelado = true; };
  }, [])
);
```

---

### 1.2. `Estoque.js` (Catálogo e Gestão de Produtos)

- **Arquivo:** [`src/telas/Estoque.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Estoque.js)
- **Finalidade:** Listar todos os itens cadastrados no inventário, permitindo pesquisa instantânea, filtragem por faixas de disponibilidade, edição de dados e exclusão de itens.
- **Estados internos:**
  - `busca`: String com o termo digitado no campo de busca.
  - `filtro`: String indicando o filtro selecionado (`'Todos'`, `'Estoque baixo'` ou `'Esgotados'`).
  - `produtos`: Array com a listagem completa vinda do SQLite.
  - `carregando`: Booleano de estado assíncrono.
- **Regras e Comportamentos:**
  - **Filtro em memória:** Combina busca por substring insensível a maiúsculas/minúsculas no nome do produto com as regras:
    - *Estoque baixo:* `produto.quantidade > 0 && produto.quantidade <= produto.estoqueMinimo`.
    - *Esgotados:* `produto.quantidade === 0`.
  - **Exclusão protegida (`confirmarExclusao`):** Dispara `mostrarAlerta` com botões 'Cancelar' e 'Excluir'. Ao confirmar, invoca `excluirProduto(id)`. Se o produto possuir movimentações na tabela `movimentacoes`, a Promise é rejeitada e o usuário é notificado de que a exclusão não é permitida por integridade referencial.

---

### 1.3. `CadastroProduto.js` (Formulário de Cadastro e Edição)

- **Arquivo:** [`src/telas/CadastroProduto.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/CadastroProduto.js)
- **Finalidade:** Fornecer interface completa para cadastro de novo produto ou atualização de dados de um produto pré-existente.
- **Detecção de modo:**
  - Inspeciona `route?.params?.produtoId`. Se presente, a tela opera em modo de **Edição** (`editando = true`); caso contrário, opera em modo de **Cadastro**.
- **Estados do formulário:**
  - `nome`: String (obrigatório).
  - `codigo`: String identificadora única (SKU) (obrigatório).
  - `categoria`: String com o nome da categoria selecionada (obrigatório).
  - `quantidade`: String numérica (obrigatório).
  - `estoqueMinimo`: String numérica (obrigatório).
  - `precoCusto`: String formatada em moeda brasileira via função `formatarMoeda`.
  - `observacoes`: String livre com texto multilinha.
  - `salvando`: Booleano para evitar múltiplos cliques no botão de submissão.
- **Validações implementadas:**
  - Preenchimento obrigatório e não vazio de `nome`, `codigo` e `categoria`.
  - Expressão regular `/^\d+$/` para garantir valores estritamente inteiros positivos em `quantidade` e `estoqueMinimo`.
  - Tratamento de erro específico para colisão de unicidade (`UNIQUE constraint failed: produtos.codigo`).

---

### 1.4. `Movimentacoes.js` (Registro de Entradas e Saídas)

- **Arquivo:** [`src/telas/Movimentacoes.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Movimentacoes.js)
- **Finalidade:** Interface operacional para dar baixa ou acrescentar itens ao inventário, associando motivo e observações opcionais para controle de auditoria.
- **Estados principais:**
  - `tipo`: `'Entrada'` ou `'Saída'`.
  - `produto`: Objeto do produto selecionado no dropdown ou `null`.
  - `quantidade`: String contendo o número de unidades a movimentar.
  - `motivo`: Motivo selecionado a partir de listas pré-definidas:
    - *Entrada:* `['Recebimento', 'Devolução', 'Ajuste', 'Outro']`.
    - *Saída:* `['Venda', 'Perda', 'Ajuste', 'Outro']`.
  - `mostrarProdutos` / `mostrarMotivos`: Booleanos para controle da exibição dos menus suspensos customizados.
- **Prevenção de Inconsistências:**
  - **Validação de Estoque Insuficiente:** Se `tipo === 'Saída'` e `qtdNumerica > produto.quantidade`, a operação é abortada antes do envio ao banco. É disparado um diálogo com o botão **"Confirmar"**, que recarrega a lista de produtos atualizada do SQLite e libera a tela para o usuário tentar novamente sem bloqueios de interface.

---

### 1.5. `Historico.js` (Auditoria de Movimentações)

- **Arquivo:** [`src/telas/Historico.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Historico.js)
- **Finalidade:** Exibir a trilha de auditoria completa de todas as movimentações do estoque em ordem cronológica decrescente.
- **Métricas do cabeçalho:**
  - `total`: Total geral de transações registradas.
  - `totalEntradas`: Contagem de registros do tipo `Entrada`.
  - `totalSaidas`: Contagem de registros do tipo `Saída`.
- **Exibição do item de histórico:**
  - Nome do produto e tag visual colorida (Verde para Entrada, Vermelho para Saída).
  - Quantidade movimentada e motivo.
  - **Saldo auditado:** Exibe o rastreio visual `Saldo: {anterior} → {posterior} un.`.
  - Data e hora formatadas no padrão nacional (`DD/MM/AAAA HH:mm`).

---

## 2. Componentes Reutilizáveis (`src/componentes/`)

### 2.1. `CartaoIndicador.js`

- **Arquivo:** [`src/componentes/CartaoIndicador.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/componentes/CartaoIndicador.js)
- **Props:**
  - `titulo` (String): Descrição da métrica (ex: "Produtos cadastrados").
  - `valor` (Number | String): Valor exibido em destaque (ex: `12` ou `'...'`).
  - `icone` (String): Nome do glifo da biblioteca `@expo/vector-icons/Ionicons` (ex: `'cube-outline'`).
- **Renderização:** Card com altura mínima de 135px, cantos arredondados (16px), fundo cinza escuro (`#292929`) e ícone no tom dourado (`#D5B56D`).

### 2.2. `SeletorCategoria.js`

- **Arquivo:** [`src/componentes/SeletorCategoria.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/componentes/SeletorCategoria.js)
- **Props:**
  - `categoria` (String): Nome da categoria atualmente selecionada.
  - `setCategoria` (Function): Setter de estado do componente pai.
  - `categorias` (Array<String>): Lista de nomes de categorias existentes.
  - `setCategorias` (Function): Setter para atualizar a lista local no formulário.
- **Funcionalidade de Adição Dinâmica:**
  - Apresenta o botão **"Nova categoria"**. Ao clicar, abre um formulário *inline* com `TextInput`.
  - Ao submeter, valida se a categoria já existe (verificação insensível a maiúsculas/minúsculas).
  - Se for inédita, invoca `cadastrarCategoria(nome)` em [`BancoDados.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/banco/BancoDados.js), insere o registro no SQLite, atualiza a lista e já define a nova categoria como a selecionada.

---

## 3. Módulos Utilitários e Estilização

### 3.1. `src/util/alerta.js`

- **Arquivo:** [`src/util/alerta.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/util/alerta.js)
- **Assinatura:** `mostrarAlerta(titulo, mensagem, botoes)`
- **Comportamento por plataforma:**
  - **Android / iOS:** Executa `Alert.alert(titulo, mensagem, listaBotoes, { cancelable: true })`. Garante que `listaBotoes` contenha no mínimo um botão `[{ text: 'Confirmar' }]` para impedir a renderização de diálogos sem botões no Android nativo.
  - **Web:** Utiliza `window.confirm` quando há mais de um botão (ações de confirmação de exclusão com opções 'Cancelar' e 'Excluir') e `window.alert` quando há um único botão, executando o respectivo callback `onPress`.

### 3.2. `src/estilo/style.js`

- **Arquivo:** [`src/estilo/style.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/estilo/style.js)
- **Tokens exportados:**
  - `cores.fundo`: `#181818` (Preto carvão profundo).
  - `cores.cartao`: `#292929` (Cinza escuro para superfícies elevadas).
  - `cores.dourado`: `#D5B56D` (Dourado acetinado para destaques e botões primários).
  - `cores.branco`: `#FFFFFF` (Texto principal e títulos).
  - `cores.textoSecundario`: `#AAAAAA` (Subtítulos, placeholders e metadados).
  - `cores.borda`: `#454545` (Divisórias e contornos sutis).
  - `cores.sucesso`: `#4CAF50` (Tags de entrada e ícones positivos).
  - `cores.erro`: `#E57373` (Tags de saída, botões de exclusão e alertas críticos).

