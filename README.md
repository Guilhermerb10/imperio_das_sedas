# Império das Sedas — Sistema de Gestão e Controle de Estoque

> Aplicativo móvel e web para controle de estoque, catalogação de produtos, registro de movimentações (entradas/saídas) e auditoria de saldos em tempo real, desenvolvido em React Native com Expo e banco de dados SQLite persistente.

---

## 📌 Visão Geral

O **Império das Sedas** é uma solução voltada para o gerenciamento operacional de estoque no varejo de tecidos e artigos finos. O sistema foi projetado com abordagem *mobile-first* e compatibilidade multiplataforma (Android, iOS e Web), operando com persistência local e arquitetura *offline-first*.

### Principais Objetivos
- **Rastreabilidade total:** Registro detalhado de cada entrada e saída com histórico de saldo anterior e posterior.
- **Prevenção de rupturas:** Monitoramento contínuo de estoque mínimo com alertas visuais no painel principal e filtros dedicados.
- **Integridade de dados:** Transações atômicas no SQLite com chaves estrangeiras e integridade referencial estrita.
- **Usabilidade refinada:** Interface escura (*Dark Mode*) com paleta sofisticada em tons de ouro (#D5B56D) e grafite.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
| :--- | :--- | :--- |
| **React** | `19.2.3` | Biblioteca base para construção declarativa de interfaces |
| **React Native** | `0.86.3` | Framework para renderização nativa em dispositivos móveis |
| **Expo SDK** | `~57.0.30` | Plataforma e ecossistema de desenvolvimento e build |
| **expo-sqlite** | `~57.0.4` | Driver nativo e WebAssembly (wa-sqlite) para banco relacional SQLite |
| **@react-navigation** | `^7.x` | Gerenciamento de rotas com Stack e Bottom Tabs |
| **react-native-safe-area-context**| `~5.7.0` | Adaptação ergonômica a entalhes (notches) e barras de navegação |
| **@expo/vector-icons** | `^15.0.2` | Conjunto iconográfico unificado (família Ionicons) |
| **Metro Bundler** | — | Empacotador JavaScript com suporte a assets WebAssembly (`.wasm`) |

---

## 📱 Telas e Funcionalidades

1. **Início (Home):**
   - 4 Cartões de indicadores em tempo real: Total de produtos cadastrados, produtos em estoque baixo, entradas no mês e saídas no mês.
   - Listagem prioritária dos 5 produtos mais críticos com relação à cota mínima.
   - Acesso rápido para cadastro de novo produto.

2. **Estoque:**
   - Listagem completa dos produtos cadastrados com paginação vertical suave.
   - Filtros instantâneos: *Todos*, *Estoque baixo* e *Esgotados*.
   - Campo de busca textual por nome de produto.
   - Ações diretas em cada item: edição de dados e exclusão protegida.

3. **Cadastro / Edição de Produto:**
   - Formulário completo: Nome, Código identificador (SKU), Categoria dinâmica, Quantidade inicial, Estoque mínimo, Preço de custo formatado em moeda nacional e Observações.
   - Seletor de categorias dinâmico que permite cadastrar novas categorias diretamente na tela sem sair do fluxo.

4. **Movimentações:**
   - Lançamento de **Entrada** (recebimento, devolução, ajuste) ou **Saída** (venda, perda, ajuste).
   - Validação estrita de saldo disponível antes da efetivação de saídas.
   - Diálogo com botão de confirmação e recarregamento automático para evitar bloqueios operacionais.

5. **Histórico:**
   - Auditoria cronológica reversa de todas as transações realizadas no estoque.
   - Totalizadores gerais e por tipo de movimentação.
   - Visualização do saldo anterior, quantidade movimentada e saldo resultante.

---

## 📂 Índice da Documentação Técnica

A documentação completa do projeto está organizada no diretório [`docs/`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs):

- 🏛️ [**Arquitetura do Sistema**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/ARQUITETURA.md): Modelo em camadas, diagramas de arquitetura e decisões de engenharia.
- 📁 [**Estrutura do Projeto**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/ESTRUTURA_DO_PROJETO.md): Mapeamento pasta a pasta e arquivo a arquivo do código-fonte.
- 🧩 [**Módulos e Componentes**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/MODULOS_E_COMPONENTES.md): Documentação detalhada de telas, componentes visuais e utilitários.
- 🗄️ [**Banco de Dados SQLite**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/BANCO_DE_DADOS.md): Esquema das tabelas, chaves, integridade referencial e catálogo de funções.
- 🌐 [**APIs e Integrações**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/APIS_E_INTEGRACOES.md): Avaliação de conectividade, dependências externas e diretrizes para backend futuro.
- 🔄 [**Fluxos do Sistema**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/FLUXOS_DO_SISTEMA.md): Diagramas de sequência para cadastro, movimentações e cálculo de métricas.
- ⚙️ [**Instalação e Execução**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/INSTALACAO_E_EXECUCAO.md): Passo a passo para rodar no Android, iOS e Web.
- 🛡️ [**Segurança e Tratamento de Erros**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/SEGURANCA_E_TRATAMENTO_DE_ERROS.md): Validações, SQL sanitizado, atomicidade e prevenção de travamentos.
- 🧪 [**Testes e Manutenção**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/TESTES_E_MANUTENCAO.md): Estado atual de qualidade, rotinas de verificação e planejamento de testes.
- 📖 [**Glossário Técnico**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/GLOSSARIO_TECNICO.md): Definições de termos e conceitos arquiteturais usados no projeto.
- 💡 [**Melhorias Recomendadas**](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/docs/MELHORIAS_RECOMENDADAS.md): Plano de ação técnica classificado por prioridades (Alta, Média e Baixa).

---

## ⚡ Início Rápido

### Pré-requisitos
- Node.js (versão 18.x ou superior recomendada)
- Gerenciador de pacotes `npm` ou `bun`
- Dispositivo com Expo Go instalado ou emulador Android / simulador iOS / navegador web moderno

### Instalação
```bash
# Clone ou acesse o diretório do projeto
cd imperio_das_sedas

# Instale as dependências declaradas no package.json
npm install
```

### Execução
```bash
# Iniciar o servidor de desenvolvimento Expo
npm start

# Executar diretamente na Web
npm run web

# Executar diretamente no Android
npm run android
```

---

## 📄 Licença

Este projeto está distribuído sob a licença definida no arquivo [LICENSE](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/LICENSE).

