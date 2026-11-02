# Instalação e Execução

Este guia fornece as instruções necessárias para preparar o ambiente de desenvolvimento, instalar dependências e executar o projeto **Império das Sedas** em diferentes plataformas (Android, iOS e Web).

---

## 1. Pré-requisitos de Ambiente

Antes de começar, certifique-se de ter instalado em sua máquina:

1. **Node.js:** Versão 18.x, 20.x ou superior (LTS recomendada).
   - Verifique com: `node -v`
2. **Gerenciador de Pacotes:** `npm` (incluso no Node.js) ou `bun`.
   - Verifique com: `npm -v`
3. **Git:** Para clonagem e controle de versão.
   - Verifique com: `git --version`
4. **Para execução móvel (uma das opções abaixo):**
   - **Dispositivo Físico:** Aplicativo **Expo Go** instalado via Google Play Store (Android) ou App Store (iOS).
   - **Emulador Android:** Android Studio configurado com Android Virtual Device (AVD) e variáveis `ANDROID_HOME`.
   - **Simulador iOS:** Xcode instalado (exclusivo para macOS).
5. **Para execução Web:**
   - Navegador moderno com suporte a WebAssembly e IndexedDB (Google Chrome, Microsoft Edge, Firefox, Safari).

---

## 2. Passo a Passo de Instalação

### Passo 1: Obter o código-fonte
```bash
git clone https://github.com/Guilhermerb10/imperio_das_sedas.git
cd imperio_das_sedas
git checkout banco-de-dados
```

### Passo 2: Instalar as dependências do projeto
Utilize o instalador padrão:
```bash
npm install
```

Caso deseje verificar a compatibilidade exata dos módulos com a versão do Expo SDK 57, você pode executar:
```bash
npx expo-doctor
```

---

## 3. Comandos de Execução

Os comandos reais definidos no arquivo [`package.json`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/package.json) são:

| Comando | Finalidade |
| :--- | :--- |
| `npm start` | Inicia o servidor Metro Bundler com o menu interativo do Expo CLI. |
| `npm run android` | Inicia o Metro e dispara a abertura direta no emulador Android conectado. |
| `npm run ios` | Inicia o Metro e dispara a abertura no simulador iOS (macOS). |
| `npm run web` | Compila o bundle para o navegador e abre em `http://localhost:8081`. |
| `npm run lint` | Executa a análise estática com o ESLint no padrão flat config. |

### Execução via Expo Go (Dispositivo Físico)
1. Execute `npm start`.
2. Um código QR será renderizado no terminal.
3. No Android: Abra o aplicativo **Expo Go** e selecione "Scan QR Code".
4. No iOS: Abra o aplicativo nativo de **Câmera** e aponte para o código QR para abrir no Expo Go.
5. Certifique-se de que o computador e o dispositivo móvel estão conectados à mesma rede Wi-Fi (ou utilize o modo túnel: `npx expo start --tunnel`).

---

## 4. Particularidades da Plataforma Web

O projeto está configurado para permitir testes instantâneos no navegador sem necessidade de emuladores pesados:

- O arquivo [`metro.config.js`](file:///d:/Downloads/imperio_das_sedas-main/imperio_das_sedas-main/metro.config.js) registra `.wasm` como asset estático:
  ```javascript
  const { getDefaultConfig } = require('expo/metro-config');
  const config = getDefaultConfig(__dirname);
  config.resolver.assetExts.push('wasm');
  module.exports = config;
  ```
- O driver `expo-sqlite` baixa e executa o binário `wa-sqlite.wasm` em um Web Worker dedicado, mantendo o banco relacional persistente no IndexedDB do navegador.

---

## 5. Resolução de Problemas Comuns (Troubleshooting)

### Erro: `Cannot find module 'wa-sqlite.wasm'` no navegador
- **Causa:** O servidor Metro foi iniciado sem a configuração de assets ou com cache antigo.
- **Solução:** Reinicie o servidor com limpeza forçada de cache:
  ```bash
  npx expo start -c --web
  ```

### Erro: Dispositivo físico não encontra o servidor Metro
- **Causa:** Firewall do sistema operacional bloqueando a porta 8081 ou redes Wi-Fi com isolamento de clientes (Client Isolation).
- **Solução:** Inicie o Expo em modo túnel (requer conexão com a internet):
  ```bash
  npx expo start --tunnel
  ```

### Erro de tipagem ou conflito de dependências
- **Solução:** Execute o utilitário de alinhamento do Expo:
  ```bash
  npx expo install --fix
  ```

