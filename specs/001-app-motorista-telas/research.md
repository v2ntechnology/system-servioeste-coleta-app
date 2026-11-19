# Pesquisa e decisões: spec 001

Versões consultadas no npm em 2026-11-19. O Expo SDK atual é o **58** (`expo@58`). Na implementação, instale os
módulos com `npx expo install`, que escolhe as versões compatíveis com o SDK. Não fixe versões à mão.

## D1 — Expo SDK 58 com Expo Router, rodando no Expo Go

- **Decisão:** projeto criado com `npx create-expo-app@latest` (TypeScript) em `system-servioeste-coleta-app/`.
  Navegação com **Expo Router**, baseada em arquivos, com rotas tipadas.
- **Por quê:** o Expo Go da loja roda só o SDK mais recente. Com o SDK 58, o usuário abre o app no celular lendo o QR
  Code do `expo start` e no navegador com `expo start --web`, sem Android Studio (pedido do usuário). O Expo Router
  funciona igual no celular e no navegador.
- **Regra da fase:** **só módulos que já vêm no Expo Go**. Todo módulo novo precisa constar na lista do Expo Go antes
  de entrar.
- **Alternativas:** React Navigation puro (mais configuração, sem ganho aqui); PWA (descartada: não detecta GPS falso
  nem imprime em Bluetooth).

## D2 — Arquitetura local-first: telas → hooks → repositório local → fila de sincronização

- **Decisão:** o app **é** local-first. As telas usam hooks de `src/features/<área>/`. Os hooks leem e gravam num
  repositório local (`src/dados/`), que é a fonte de verdade da interface. Toda escrita (coleta finalizada, não
  coleta, mudança de ordem) entra numa **fila** (`src/sincronizacao/`), enviada por um **transporte**. Nesta fase o
  transporte é simulado e responde "recebido" quando a "conexão" está ligada. Na fase do back-end, o transporte
  passa a chamar a API, e as telas não mudam.
- **Por quê:** é exatamente o comportamento final exigido (princípio IX). Simular só a rede, e não as telas, evita
  reescrever o fluxo depois.
- **Alternativas:** MSW como no Estoque. Ele simularia uma API, mas o app não lê da API durante a rota: lê do
  aparelho. No React Native o MSW exige polyfills, e o ganho seria pequeno. A ideia do Estoque continua valendo: o
  transporte simulado é a especificação do contrato de sincronização (`contracts/sincronizacao.md`).

## D3 — Estado e persistência: Zustand + AsyncStorage

- **Decisão:** um store **Zustand** por área (sessão, jornada e rota, coleta em rascunho, fila, demonstração), com o
  middleware `persist` gravando no **AsyncStorage**, que no navegador vira `localStorage`. As chaves têm o prefixo
  `coleta-` e há uma `VERSAO_DADOS` para descartar o formato antigo. O "token" de sessão fictício vai para o
  `expo-secure-store` no celular, com o AsyncStorage como substituto no navegador.
- **Por quê:** os dois funcionam no Expo Go e no navegador, sobrevivem ao fechamento do app (FR-002, FR-018, FR-021)
  e são simples.
- **Pendência para o back-end (princípio III):** o AsyncStorage não é criptografado. Com dados fictícios isso não é
  problema; com dados reais, a fila e os rascunhos vão para um banco local criptografado (por exemplo `expo-sqlite`
  com SQLCipher, que exige um *development build*). Isso fica registrado na seção de complexidade do plano.
- **Alternativas:** `expo-sqlite` já agora (suporte no navegador ainda limitado); MMKV (não está no Expo Go);
  TanStack Query (sem servidor para consultar nesta fase; entra quando houver leitura da API).

## D4 — QR Code de presença gerado no celular do cliente e conferido sem internet

- **Decisão:** usar um código no estilo TOTP.
  - **Conteúdo do QR:** `SVC1.<idCliente>.<janela>.<assinatura>`.
    - `janela` = minutos desde 1970 divididos por 1, ou seja, o código muda a cada minuto.
    - `assinatura` = HMAC-SHA256(`segredoDoCliente`, `idCliente.janela`), truncada em 16 caracteres base32.
  - **Quem gera:** o link do cliente, numa fase posterior. Nesta fase, o menu de demonstração.
  - **Quem confere:** o app do motorista, recalculando a assinatura com o segredo do cliente e aceitando a janela
    atual e a anterior (±1 min, para compensar relógios). O segredo chega ao aparelho junto com a rota, só para os
    clientes da rota do dia.
  - **Resultado da leitura:** `valido`, `outroCliente`, `expirado` ou `invalido` (`contracts/qr-presenca.md`).
  - **Implementação:** HMAC com `@noble/hashes`, que é JavaScript puro e roda no Expo Go e no navegador.
- **Por quê:** prova que motorista e cliente estão juntos agora (um print antigo vence em ~2 min) e funciona sem sinal.
- **Risco aceito:** quem extrair o segredo de um celular de motorista consegue gerar códigos daquele cliente. Por
  isso, na fase do back-end, os segredos passam a ser por rota e por dia, saem do aparelho com o encerramento e cada
  leitura fica registrada.
- **Alternativas:** QR fixo impresso (descartado pelo usuário); conferência online (não funciona sem sinal).

## D5 — Leitura de QR Code, câmera e foto do documento

- **Decisão:**
  - **Leitura:** `CameraView` do `expo-camera` com `barcodeScannerSettings: { barcodeTypes: ["qr"] }`.
  - **Foto do documento:** `expo-image-picker` (`launchCameraAsync`).
  - **No navegador:** a câmera pode não estar disponível. Nesse caso a tela oferece os QR Codes de exemplo do menu de
    demonstração e a escolha de uma imagem.
  - **Permissões:** cada tela que precisa de uma pede a permissão na hora e explica para que serve, se for negada.
- **Por quê:** ambos estão no Expo Go.

## D6 — Assinatura na tela

- **Decisão:** componente próprio, `components/Assinatura.tsx`, que desenha o traço com `react-native-svg` (um `Path`
  montado pelos toques) e `react-native-gesture-handler`. Ele tem os botões "Limpar" e "Pronto", e a assinatura é
  guardada como o caminho SVG. Uma imagem PNG fica para a impressão real.
- **Por quê:** funciona no Expo Go e no navegador.
- **Alternativas:** `react-native-signature-canvas` (depende de WebView e não roda no navegador); Skia (exige uma
  configuração extra no navegador).

## D7 — Comprovante e QR Code de verificação

- **Decisão:** a tela `comprovante/[id]` desenha o comprovante com a mesma estrutura do modelo da bobina (largura
  fixa de 58 mm, simulada na tela), com as abas "1ª via (cliente)", "2ª via (empresa)" e "Digital".
  - **QR de verificação:** `react-native-qrcode-svg`, apontando para `https://<domínio>/coleta/verificar/<numero>`.
    O domínio é um valor de configuração, e a página de verificação é da fase da web.
  - **Número do comprovante:** gerado no aparelho, sem precisar de rede, no formato `AAAAMMDD-<placa>-<seq>`
    (ex.: `20261119-RDU8D06-003`). É único por veículo e dia.
  - **"Imprimir" e "Enviar":** mostram um aviso de demonstração.
- **Por quê:** a impressão real exige um módulo Bluetooth fora do Expo Go, e entra depois por um *development build*
  gerado na nuvem (EAS Build).

## D8 — Localização, cerca virtual e GPS falso

- **Decisão:** ao finalizar a coleta ou a não coleta, a localização é lida com o `expo-location` (precisão
  equilibrada, tempo limite de 10 s; se falhar, a última posição conhecida).
  - **Cerca virtual:** `dentroDaArea(ponto, cliente)` calcula a distância (haversine) até o centro do cliente e a
    compara com o raio (padrão de 150 m).
  - **GPS falso:** usa o campo `mocked` do `expo-location` no Android.
  - **Na demonstração:** os interruptores "fora da área" e "localização falsa" substituem esses resultados, e no
    navegador a posição vem do cliente.
  - **Sem permissão ou sem posição:** a coleta é marcada para revisão com o motivo `semLocalizacao`.
- **Por quê:** o campo `mocked` é o sinal mais confiável disponível no Android. No iPhone falsificar exige ferramentas
  de desenvolvedor, e a detecção fica limitada (registrado como limitação).

## D9 — Visual: tokens do Estoque em StyleSheet, sem NativeWind

- **Decisão:** `src/tema/tokens.ts` copia os tokens claro e escuro do `index.css` do Estoque. `useTema()` lê o
  esquema escolhido (claro, escuro ou do sistema, na chave `coleta-tema`). Os componentes base ficam em
  `src/components/ui/`: Botao, Cartao, Selo, Faixa, CampoTexto, Quantidade, Passos, Lista.
  - **Fonte:** Rubik, com `@expo-google-fonts/rubik`.
  - **Ícones:** `lucide-react-native`, os mesmos do Estoque.
  - **Botão principal:** preto (branco no tema escuro).
  - **Verde #6ca33c:** só no que está selecionado e no sucesso.
  - **Alvos de toque:** no mínimo 48 dp; botões principais com 56 dp, de largura total, no pé da tela.
  - **Sem barra de rolagem:** `showsVerticalScrollIndicator={false}`.
- **Por quê:** o NativeWind acrescenta Babel, Metro e um passo de build que pode quebrar entre versões do SDK.
  StyleSheet com tokens funciona 100% e mantém as mesmas cores.

## D10 — Dados fictícios e menu de demonstração fora da produção

- **Decisão:** os dados de exemplo ficam em `src/demo/`:
  - 1 motorista, 1 coletor e 1 veículo;
  - a rota "R03 — Zona Oeste" com 5 paradas;
  - 6 clientes, com resíduos em kg e em CN;
  - 10 dias de histórico, com datas relativas a hoje.

  Todos os nomes, CNPJs e placas são inventados.
  - **Liga com:** `EXPO_PUBLIC_MOCK=true`.
  - **Menu de demonstração:** carregado por `require` dentro de `if (process.env.EXPO_PUBLIC_MOCK === "true")`.
  - **Telas:** nunca importam `src/demo`, regra conferida pelo ESLint com `no-restricted-imports`.
  - **Checagem:** `scripts/check-no-mocks.sh`, adaptado do Estoque, roda `npx expo export --platform web` sem a
    variável e procura marcadores do código de demonstração no pacote.
- **Por quê:** é o princípio VI. A checagem pelo pacote gerado não depende da remoção de código morto feita pelo
  Metro.

## D11 — Testes e lint

- **Decisão:**
  - **Testes:** `jest-expo` com `@testing-library/react-native`.
  - **Regras puras com teste**, em `src/regras/`:
    - conferência do QR;
    - cerca virtual;
    - quantidade (decimal em kg, inteiro em CN; zero e vazio recusados; vírgula decimal);
    - número do comprovante;
    - ordem das paradas;
    - totais do dia;
    - imutabilidade.
  - **Fluxos com teste:** login, coleta completa, recusa e não coleta.
  - **Lint:** `npx expo lint`.
  - **Comandos:** `make test-app` e `make lint-app`.
- **Gerenciador de pacotes:** **npm**, o padrão do Expo. O pnpm exige `node-linker=hoisted` e costuma falhar com o
  Metro; descartado pelo princípio V.

## D12 — Celular no WSL e datas

- **Decisão:**
  - **Celular no WSL:** `make app-mock` roda `npx expo start --tunnel`, porque o celular não alcança o IP do WSL. O
    Expo instala o `@expo/ngrok` na primeira vez. `make app-web` abre no navegador.
  - **Datas e horas:** mostradas com `Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })` e guardadas
    em ISO 8601 com fuso.
  - **Quantidades:** mostradas com vírgula decimal.
