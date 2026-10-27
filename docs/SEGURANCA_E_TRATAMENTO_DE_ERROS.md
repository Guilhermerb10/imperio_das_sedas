# Segurança e Tratamento de Erros

Este documento avalia os mecanismos de segurança, validações de entrada, proteção contra injeção de comandos, integridade referencial e o tratamento de exceções adotados no **Império das Sedas**.

---

## 1. Prevenção contra SQL Injection

Todas as consultas e comandos executados contra o SQLite em [`src/banco/BancoDados.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/banco/BancoDados.js) utilizam **Prepared Statements com consultas parametrizadas** (`?` placeholders).

### Exemplo Seguro Implementado:
```javascript
// CORRETO (Implementado no projeto):
await db.runAsync(
  'UPDATE produtos SET quantidade = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?;',
  [qtdPosterior, produtoId]
);
```

Nenhum dado fornecido pelo usuário (como nome, código ou termos de busca) é interpolado diretamente via *template literals* em comandos SQL, eliminando integralmente a superfície de ataque por injeção SQL no cliente.

---

## 2. Validação e Sanitização de Entradas

O sistema aplica validações defensivas nos formulários antes de submeter operações ao banco de dados:

1. **Higienização de Strings:** Aplicação de `.trim()` em campos textuais (`nome`, `codigo`, `categoria`, `observacoes`) para impedir o salvamento de entradas com apenas espaços em branco.
2. **Validação Estrita de Inteiros:** Expressão regular `/^\d+$/` e `/^[1-9]\d*$/` garante que quantidades e estoques mínimos sejam estritamente numéricos inteiros positivos, prevenindo valores negativos, caracteres especiais ou `NaN`.
3. **Formatação de Moeda:** A função `formatarMoeda` remove qualquer caractere não numérico (`/\D/g`) antes de computar o valor em centavos e convertê-lo para o padrão monetário brasileiro (`pt-BR`).

---

## 3. Integridade Referencial e Proteção de Dados

- **Chaves Estrangeiras:** O comando `PRAGMA foreign_keys = ON;` é ativado no momento da abertura do banco de dados.
- **Proteção contra Exclusão Acidental:**
  - O sistema impede a exclusão de qualquer produto que possua movimentações na tabela `movimentacoes`.
  - O sistema impede a exclusão de qualquer categoria que possua produtos associados na tabela `produtos`.
- **Atomicidade Transacional:** Operações combinadas (ex: deduzir estoque de um produto e criar um registro de saída) são executadas sob transações. Se a inserção da movimentação falhar, a dedução do saldo do produto sofre *rollback* automático, mantendo o banco 100% consistente.

---

## 4. Prevenção de Travamentos de Interface (Alert Resilience)

No ecossistema React Native, a exibição de caixas de diálogo nativas (`Alert.alert`) com listas de botões vazias (`[]`) no sistema operacional Android resulta na renderização de um modal sem botões e sem cancelamento externo, travando a interação do usuário.

Para eliminar esse risco:
- O módulo [`src/util/alerta.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/src/util/alerta.js) garante que qualquer chamada a `mostrarAlerta` que não defina botões explícitos receba automaticamente o botão padrão:
  ```javascript
  const listaBotoes = Array.isArray(botoes) && botoes.length > 0
    ? botoes
    : [{ text: 'Confirmar' }];
  ```
- No Android, é injetada a opção `{ cancelable: true }`, permitindo que toques fora da área do diálogo ou o botão de retorno do dispositivo fechem a notificação sem congelar a aplicação.

---

## 5. Análise de Riscos e Recomendações de Segurança

| Risco Identificado | Nível | Situação Atual | Recomendação Técnica |
| :--- | :---: | :--- | :--- |
| **Acesso Físico ao Banco de Dados** | Médio | O arquivo `imperio_das_sedas.db` é armazenado no sandbox local do app sem criptografia de disco. Dispositivos com *root* ou *jailbreak* podem ler o arquivo. | Em versões corporativas, integrar criptografia em nível de página usando SQLCipher (`expo-sqlite/sqlcipher`) ou encriptação AES de dados confidenciais. |
| **Ausência de Autenticação / PIN** | Baixo | Qualquer pessoa com posse do dispositivo desbloqueado pode acessar o app e alterar o estoque. | Implementar bloqueio por biometria (Face ID / Fingerprint) via módulo `expo-local-authentication`. |
| **Backup de Dados** | Médio | Se o usuário desinstalar o app ou trocar de aparelho, os dados do SQLite local serão perdidos. | Implementar funcionalidade de exportação/importação de backup em JSON ou arquivo `.db` via `expo-file-system` e `expo-sharing`. |

