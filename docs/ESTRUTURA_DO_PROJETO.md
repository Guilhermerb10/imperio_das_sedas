# Estrutura do Projeto

Este documento detalha a árvore de arquivos do projeto **Império das Sedas**, descrevendo a finalidade de cada diretório e arquivo, seus papéis no sistema e as relações de dependência existentes.

---

## 1. Visão Geral da Árvore de Diretórios

```
imperio_das_sedas/
├── assets/                          # Recursos gráficos (ícones, splash e favicons)
│   ├── android-icon-background.png
│   ├── android-icon-foreground.png
│   ├── android-icon-monochrome.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── docs/                            # Documentação técnica completa
│   ├── APIS_E_INTEGRACOES.md
│   ├── ARQUITETURA.md
│   ├── BANCO_DE_DADOS.md
│   ├── ESTRUTURA_DO_PROJETO.md
│   ├── FLUXOS_DO_SISTEMA.md
│   ├── GLOSSARIO_TECNICO.md
│   ├── INSTALACAO_E_EXECUCAO.md
│   ├── MELHORIAS_RECOMENDADAS.md
│   ├── MODULOS_E_COMPONENTES.md
│   ├── SEGURANCA_E_TRATAMENTO_DE_ERROS.md
│   └── TESTES_E_MANUTENCAO.md
├── src/                             # Código-fonte principal da aplicação
│   ├── banco/
│   │   └── BancoDados.js            # Camada centralizada de acesso ao SQLite
│   ├── componentes/
│   │   ├── CartaoIndicador.js       # Card reutilizável para métricas numéricas
│   │   └── SeletorCategoria.js      # Seletor dinâmico com criação inline de categorias
│   ├── estilo/
│   │   └── style.js                 # Paleta de cores e temas globais
│   ├── navegacao/
│   │   └── NavegacaoPrincipal.js    # Roteamento por Abas (Tab) e Pilha (Stack)
│   ├── telas/
│   │   ├── CadastroProduto.js       # Tela de criação e edição de produtos
│   │   ├── Estoque.js               # Catálogo de produtos com filtros e busca
│   │   ├── Historico.js             # Auditoria cronológica de movimentações
│   │   ├── Home.js                  # Painel de métricas e alertas de estoque baixo
│   │   └── Movimentacoes.js         # Registro de entradas e saídas de produtos
│   └── util/
│       └── alerta.js                # Utilitário unificado de diálogos para Web/Mobile
├── .gitignore                       # Arquivos e pastas ignorados pelo controle de versão
├── AGENTS.md                        # Diretrizes e regras para assistentes de IA
├── App.js                           # Componente raiz, controle de splash e provedor de navegação
├── app.json                         # Manifesto de configuração do Expo SDK
├── eslint.config.js                 # Configuração do linter ESLint (flat config v9)
├── index.js                         # Ponto de entrada registrado no runtime React Native
├── LICENSE                          # Termos de licença do software
├── metro.config.js                  # Configurações do empacotador Metro (suporte a .wasm)
├── package.json                     # Manifesto de dependências e scripts do Node.js
└── README.md                        # Documento de apresentação e guia rápido do projeto
```

---

## 2. Descrição Detalhada dos Arquivos Raiz

### [`App.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/App.js)
- **Responsabilidade:** Componente raiz da aplicação React Native.
- **Funções:**
  - Gerencia o estado de prontidão (`pronto`) e erro (`erro`) do banco de dados na inicialização.
  - Executa a promessa de abertura do banco de dados via `inicializarBancoDados()`.
  - Renderiza tela de *loading* com indicador animado ou tela de erro com opção "Tentar novamente".
  - Configura o tema escuro (`DarkTheme`) customizado com a paleta da marca e encapsula a aplicação em `<SafeAreaProvider>` e `<NavigationContainer>`.
- **Dependências internas:** [`src/banco/BancoDados.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/banco/BancoDados.js), [`src/navegacao/NavegacaoPrincipal.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/navegacao/NavegacaoPrincipal.js), [`src/estilo/style.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/estilo/style.js).

### [`index.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/index.js)
- **Responsabilidade:** Ponto de entrada de baixo nível exigido pelo runtime React Native / Expo (`registerRootComponent(App)`).
- **Dependências internas:** [`App.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/App.js).

### [`app.json`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/app.json)
- **Responsabilidade:** Manifesto de configuração do Expo.
- **Definições-chave:**
  - `name` e `slug`: `"imperio_das_sedas"`.
  - `orientation`: `"portrait"` (bloqueado em modo retrato).
  - Configurações de ícones adaptativos para Android e favicons para Web.
  - Plugins nativos registrados: `"expo-sqlite"` e `"expo-font"`.

### [`metro.config.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/metro.config.js)
- **Responsabilidade:** Customização do empacotador de assets Metro.
- **Relevância:** Adiciona a extensão `wasm` à lista `config.resolver.assetExts`, permitindo que o Expo Web carregue o arquivo de WebAssembly utilizado pelo driver `wa-sqlite`.

### [`eslint.config.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/eslint.config.js)
- **Responsabilidade:** Configuração do linter de código sob o padrão Flat Config do ESLint 9, integrando a regra base `eslint-config-expo/flat`.

### [`package.json`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/package.json)
- **Responsabilidade:** Declaração de scripts e dependências de produção e desenvolvimento.
- **Scripts:** `start`, `android`, `ios`, `web` e `lint`.

---

## 3. Diretório `src/` e seus Submódulos

### 3.1. `src/banco/`
- [`BancoDados.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/banco/BancoDados.js): O coração da persistência do sistema. Centraliza a conexão Singleton com o SQLite, a criação das tabelas `categorias`, `produtos` e `movimentacoes`, a formatação de datas brasileiras (`DD/MM/AAAA HH:mm`) e todas as consultas e comandos CRUD.

### 3.2. `src/componentes/`
- [`CartaoIndicador.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/componentes/CartaoIndicador.js): Componente puro de exibição. Recebe `titulo`, `valor` e `icone` (família Ionicons), formatando-os em um card moderno com bordas arredondadas e fundo escuro.
- [`SeletorCategoria.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/componentes/SeletorCategoria.js): Componente interativo de seleção de categoria em formato dropdown. Oferece a funcionalidade de adicionar uma nova categoria em tempo de execução via `cadastrarCategoria()`.

### 3.3. `src/estilo/`
- [`style.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/estilo/style.js): Dicionário de constantes de design tokens. Define cores para fundo (`#181818`), cartões (`#292929`), ouro (`#D5B56D`), texto primário (`#FFFFFF`), texto secundário (`#AAAAAA`), bordas (`#454545`), status de sucesso (`#4CAF50`) e erro (`#E57373`).

### 3.4. `src/navegacao/`
- [`NavegacaoPrincipal.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/navegacao/NavegacaoPrincipal.js): Orquestra as rotas da aplicação através da combinação de um Bottom Tab Navigator para o fluxo principal e um Native Stack Navigator para navegação modal/detalhada.

### 3.5. `src/telas/`
- [`Home.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Home.js): Painel gerencial inicial com métricas consolidadas e alertas imediatos de produtos abaixo do estoque mínimo.
- [`Estoque.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Estoque.js): Painel de listagem de produtos com busca reativa por nome, filtros de status (*Todos*, *Estoque baixo*, *Esgotados*) e atalhos para edição ou exclusão protegida.
- [`CadastroProduto.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/CadastroProduto.js): Formulário com dupla função (criação de novo item ou edição de item existente via parâmetro `produtoId`). Inclui máscara para valor monetário (`R$ 0,00`) e validações completas de obrigatoriedade.
- [`Movimentacoes.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Movimentacoes.js): Interface para registrar entradas e saídas no estoque. Impede retiradas sem saldo suficiente e gera auditoria com motivos predefinidos.
- [`Historico.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/telas/Historico.js): Tela de auditoria detalhada que apresenta cards de movimentações com saldo anterior e posterior, dados de data/hora formatada e filtros combinados de tipo e busca.

### 3.6. `src/util/`
- [`alerta.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/util/alerta.js): Módulo utilitário que harmoniza a exibição de caixas de diálogo entre navegadores web (`window.alert`, `window.confirm`) e dispositivos móveis (`Alert.alert`), garantindo a presença de botões de confirmação para prevenir travamentos de interface.

