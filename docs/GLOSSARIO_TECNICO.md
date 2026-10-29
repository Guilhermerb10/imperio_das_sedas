# Glossário Técnico

Este glossário reúne e explica em linguagem acessível os principais conceitos, termos técnicos, siglas e padrões de arquitetura utilizados no desenvolvimento do **Império das Sedas**.

---

### A
- **ACID (Atomicidade, Consistência, Isolamento e Durabilidade):** Conjunto de quatro propriedades fundamentais de transações em bancos de dados relacionais que garantem a integridade dos dados mesmo em caso de falhas ou erros durante a execução.
- **Alert Resilience:** Técnica arquitetural implementada no projeto para garantir que caixas de diálogo e popups do sistema nunca sejam exibidos sem opções de fechamento/confirmação, prevenindo o congelamento involuntário da interface no sistema Android.

### B
- **Bottom Tab Navigator:** Tipo de navegador do React Navigation que fixa uma barra horizontal na parte inferior da tela com botões e ícones para alternar instantaneamente entre as seções principais da aplicação.

### C
- **CNG (Continuous Native Generation):** Filosofia do Expo moderno em que as pastas nativas `android/` e `ios/` não são mantidas manualmente no repositório Git, sendo geradas sob demanda com base no arquivo `app.json` e nos plugins configurados.

### D
- **Dark Mode (Tema Escuro):** Padrão de design adotado no projeto com fundo em tom carvão (`#181818`) e superfícies contrastantes, reduzindo o cansaço visual e economizando energia em telas OLED/AMOLED.
- **DDL (Data Definition Language):** Subconjunto de comandos SQL responsáveis por definir ou modificar a estrutura do banco de dados (ex: `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`).
- **DML (Data Manipulation Language):** Comandos SQL responsáveis por consultar e manipular os dados armazenados nas tabelas (ex: `SELECT`, `INSERT`, `UPDATE`, `DELETE`).

### F
- **Foreign Key (Chave Estrangeira):** Restrição relacional que vincula o valor de uma coluna em uma tabela à chave primária de outra tabela (ex: `produtos.categoria_id` apontando para `categorias.id`), impedindo a criação de dados órfãos.

### M
- **Metro Bundler:** O empacotador de módulos JavaScript padrão utilizado pelo React Native e Expo, responsável por compilar arquivos, resolver dependências e carregar assets (imagens, fontes e WebAssembly).

### O
- **Offline-First:** Padrão arquitetural em que a aplicação é construída para funcionar com plenitude localmente sem depender de conectividade com a internet, armazenando todos os dados no próprio dispositivo.

### P
- **Prepared Statements (Consultas Parametrizadas):** Método de execução de comandos SQL onde a estrutura da query é separada dos dados através de marcadores de posição (`?`), eliminando completamente vulnerabilidades de injeção de SQL (*SQL Injection*).
- **PRAGMA:** Comandos especiais do SQLite que ajustam parâmetros de operação do motor relacional (ex: `PRAGMA foreign_keys = ON;`).

### S
- **Singleton:** Padrão de projeto (*Design Pattern*) criacional que garante que uma classe ou módulo possua apenas uma única instância ativa compartilhada por todo o ciclo de vida da aplicação (utilizado na conexão com o SQLite em `BancoDados.js`).
- **SKU (Stock Keeping Unit):** Código identificador alfanumérico único atribuído a cada produto para facilitar sua localização e controle no estoque (armazenado na coluna `produtos.codigo`).
- **SQLite:** Motor de banco de dados relacional SQL compacto, autocontido, sem servidor e de alta confiabilidade, amplamente utilizado em dispositivos móveis.

### U
- **useFocusEffect:** Hook especializado do React Navigation que é disparado sempre que uma tela ganha o foco do usuário na tela (ao alternar entre abas), ideal para disparar recarregamento de dados do banco.

### W
- **wa-sqlite:** Implementação do SQLite compilada para WebAssembly (WASM) que possibilita a execução do SQLite dentro de navegadores web modernos com persistência através de IndexedDB ou Origin-Private File System (OPFS).
- **WASM (WebAssembly):** Formato binário de instruções de baixo nível que permite a execução de linguagens como C e C++ em navegadores web com desempenho próximo ao código nativo.

