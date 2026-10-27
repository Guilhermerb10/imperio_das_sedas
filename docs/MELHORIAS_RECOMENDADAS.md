# Melhorias Recomendadas

Este documento reúne uma análise técnica aprofundada realizada sobre a base de código do **Império das Sedas**, categorizando oportunidades de melhoria por prioridade de impacto na estabilidade, manutenibilidade e escalabilidade do sistema.

---

## 1. Prioridade Alta (Crítico / Riscos Relevantes)

### 1.1. Implementação de Testes Automatizados para a Camada de Dados
- **Diagnóstico:** As funções em [`src/banco/BancoDados.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/banco/BancoDados.js) concentram regras contábeis essenciais (dedução de saldo, bloqueio de estoque negativo, proteção de exclusão e criação de auditoria). Qualquer refatoração futura sem uma suíte de testes unitários automatizada pode introduzir regressões silenciosas no estoque.
- **Solução Recomendada:** Configurar `jest-expo` com um banco de dados SQLite em memória (`:memory:`) para cobrir todas as funções de transação (`registrarEntrada`, `registrarSaida`, `excluirProduto`).

### 1.2. Mecanismo de Backup e Exportação de Dados
- **Diagnóstico:** Como o sistema é estritamente local (*offline-first*), a desinstalação acidental do aplicativo, falhas de hardware ou a troca de dispositivo móvel pelo lojista acarretará a perda irreversível do inventário e do histórico de movimentações.
- **Solução Recomendada:** Criar uma funcionalidade na interface que exporte uma cópia de segurança em formato JSON ou o próprio arquivo `imperio_das_sedas.db` via módulos `expo-file-system` e `expo-sharing`, permitindo ao usuário enviar o arquivo por e-mail, salvar no Google Drive ou restaurá-lo em outro aparelho.

### 1.3. Paginação e Virtualização de Listas Grandes
- **Diagnóstico:** Atualmente, as funções `listarProdutos()` e `listarMovimentacoes()` realizam leitura integral de todos os registros (`SELECT *`) e os renderizam em listas simples (`ScrollView`). Em um estoque com milhares de itens ou após meses de uso com dezenas de milhares de movimentações, isso causará degradação de performance e consumo excessivo de memória RAM.
- **Solução Recomendada:**
  - Substituir `<ScrollView>` por `<FlatList>` nas telas [`Estoque.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Estoque.js) e [`Historico.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Historico.js).
  - Implementar paginação SQL com parâmetros `LIMIT` e `OFFSET` (ou paginação baseada em cursor/data).

---

## 2. Prioridade Média (Qualidade, Organização e Expansão)

### 2.1. Armazenamento Numérico do Preço de Custo (Centavos)
- **Diagnóstico:** No esquema atual, a coluna `preco_custo` da tabela `produtos` armazena a string textual já formatada (ex: `"R$ 150,00"`). Isso impede a realização de cálculos matemáticos no banco de dados (ex: `SUM(quantidade * preco_custo)` para apurar o valor patrimonial total do estoque).
- **Solução Recomendada:**
  - Alterar a coluna para `preco_custo_centavos INTEGER NOT NULL DEFAULT 0`.
  - Converter o valor numérico apenas no momento de exibição na interface (`Intl.NumberFormat`).
  - Habilitar métricas de valor financeiro investido no painel de indicadores da Home.

### 2.2. Migração Gradual para TypeScript (`.tsx` / `.ts`)
- **Diagnóstico:** O projeto já possui `typescript` e `@types/react` configurados no `package.json`, mas os arquivos ainda usam JavaScript puro (`.js`). A ausência de contratos de tipos aumenta o risco de passar propriedades incorretas ou acessar propriedades nulas em objetos complexos.
- **Solução Recomendada:** Renomear progressivamente os arquivos para `.ts`/`.tsx`, definindo interfaces formais para `Produto`, `Movimentacao`, `Categoria` e as rotas de navegação (`RootStackParamList`).

### 2.3. Leitor de Código de Barras e QR Code via Câmera
- **Diagnóstico:** A busca e seleção de produtos em estoque e movimentações é feita exclusivamente por digitação manual ou rolagem de dropdowns, o que é lento em ambientes de balcão de loja física com grande fluxo de clientes.
- **Solução Recomendada:** Integrar a biblioteca `expo-camera` para escanear etiquetas de código de barras (EAN-13 / Code-128) diretamente no campo de código (SKU) do produto.

---

## 3. Prioridade Baixa (Polimento, Usabilidade e Otimizações)

### 3.1. Feedback Háptico e Sonoro
- **Diagnóstico:** A confirmação de ações de sucesso e erros em dispositivos móveis se beneficia de respostas táteis sutis para melhorar a percepção de precisão pelo operador.
- **Solução Recomendada:** Integrar `expo-haptics` para emitir vibrações táteis (`Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`) ao concluir movimentações ou disparar avisos de estoque baixo.

### 3.2. Exportação de Relatórios em Planilha (CSV / Excel)
- **Diagnóstico:** Lojistas frequentemente necessitam repassar dados de fechamento de mês para contabilidade ou conferência fiscal externa.
- **Solução Recomendada:** Implementar um gerador de arquivo `.csv` a partir da tabela `movimentacoes` e do catálogo atual de produtos para download direto no dispositivo.

### 3.3. Bloqueio por Biometria
- **Diagnóstico:** Em dispositivos compartilhados por múltiplos funcionários na loja, pode ser desejável restringir a exclusão de produtos ou alterações críticas a usuários autorizados.
- **Solução Recomendada:** Adicionar autenticação biométrica via `expo-local-authentication` antes de permitir ações destrutivas.

