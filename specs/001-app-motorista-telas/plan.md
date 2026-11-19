# Plano: Telas do app do motorista com dados fictícios

**Spec**: [spec.md](spec.md) | **Data**: 2026-11-19 | **Pasta**: `specs/001-app-motorista-telas`

## Resumo

O app do motorista é feito inteiro, com dados fictícios, em `system-servioeste-coleta-app/`: Expo SDK 58, Expo
Router e TypeScript, rodando no **Expo Go** (celular) e no navegador. A arquitetura já é a final, **local-first**:

- as telas usam hooks;
- os hooks usam um repositório guardado no aparelho;
- toda escrita entra numa fila de sincronização com um transporte simulado.

Na fase do back-end, só o transporte e a carga da rota mudam. O QR Code de presença é um código que muda a cada
minuto, conferido sem internet (D4). A impressão e o envio são simulados.

## Contexto técnico

- **Linguagem:** TypeScript (strict), React Native via Expo SDK 58, Node 24+ e npm.
- **Dependências principais:** todas instaladas com `npx expo install` e todas presentes no Expo Go.
  - Navegação: `expo-router`.
  - Dispositivo: `expo-camera`, `expo-image-picker`, `expo-location`, `expo-secure-store`, `expo-font`.
  - Estado e armazenamento: `zustand`, `@react-native-async-storage/async-storage`.
  - Desenho e gestos: `react-native-svg`, `react-native-gesture-handler`.
  - Interface: `react-native-qrcode-svg`, `lucide-react-native`, `@expo-google-fonts/rubik`.
  - Criptografia: `@noble/hashes`.
- **Armazenamento:** AsyncStorage (chaves com o prefixo `coleta-`) e SecureStore para a sessão. Ver D3.
- **Testes:** `jest-expo` + `@testing-library/react-native`. Lint com `npx expo lint`.
- **Plataforma:** Android e iOS pelo Expo Go, e navegador pelo `expo start --web`.
- **Tipo de projeto:** app móvel (cliente local-first, sem servidor nesta fase).
- **Metas:**
  - cada tela responde ao toque sem espera perceptível;
  - uma coleta completa leva no máximo 3 minutos (SC-001);
  - o app abre direto na rota em até 2 s.
- **Restrições:**
  - funciona 100% sem conexão;
  - só módulos do Expo Go;
  - nada de Android Studio nem de SDK local;
  - textos em português;
  - fuso de Brasília.
- **Escopo:** 19 rotas (`contracts/telas.md`) e cerca de 15 componentes base. Os dados fictícios têm 1 rota de 5
  paradas, 6 clientes e 10 dias de histórico.

## Verificação da constituição

| Princípio | Como esta spec cumpre |
| --- | --- |
| I Português | Textos, mensagens, comentários e docs em português; identificadores em português sem acento, como nos outros projetos; datas em `America/Sao_Paulo`. |
| II Documentação | O plano lista o que muda em `docs/`; os pontos em aberto da spec continuam em aberto. |
| III Segurança (INEGOCIÁVEL) | Só dados fictícios; nenhum `.env` com segredo (só `EXPO_PUBLIC_MOCK`); sessão no SecureStore. Ponto em aberto: o armazenamento local criptografado para dados reais (ver Complexidade). |
| IV Pronto é verificado | Testes das regras puras (QR, cerca, quantidade, comprovante, ordem, totais, imutabilidade) e dos fluxos principais; `quickstart.md` escrito antes. |
| V Tecnologia que funciona 100% | Expo SDK 58 e só módulos do Expo Go; npm em vez de pnpm; StyleSheet em vez de NativeWind (D9, D11). |
| VI Front-end primeiro | A spec inteira. Telas → hooks → repositório; `src/demo` isolado por ESLint; `check-no-mocks-app` no pacote exportado. |
| VII Coleta finalizada não muda (INEGOCIÁVEL) | `finalizar` congela o registro; o repositório recusa qualquer gravação numa coleta `finalizada`, com teste; as telas de leitura não têm ações de edição. |
| VIII Provas | O QR de presença, a localização, a data e a hora e a assinatura ou a recusa ficam na coleta. Fora da área, GPS falso, sem QR e sem localização viram `revisao[]`, sem bloquear. |
| IX Sem internet | Fila persistida, envio automático, faixa sempre visível, saída bloqueada com fila pendente. |
| X Cliente só vê o que é dele | Não se aplica ao app. O QR de presença carrega só o id do cliente, sem outros dados. |
| XI Visual | Tokens do Estoque, Rubik, lucide, alvos de 48–56 dp, botão principal no pé, sem barra de rolagem; a marca EcoColeta não é usada. |

**Resultado:** aprovado. A pendência do III está justificada em Complexidade e não afeta esta fase, que usa só dados
fictícios.

## Estrutura

### Documentação

```text
specs/001-app-motorista-telas/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/ (telas.md, qr-presenca.md, sincronizacao.md)
├── checklists/requirements.md
└── tasks.md            (próximo passo: /speckit-tasks)
```

### Código

```text
system-servioeste-coleta-app/
├── app/                      Rotas do Expo Router (contracts/telas.md)
│   ├── _layout.tsx           Fontes, tema, gestos, proteção de sessão
│   ├── entrar.tsx · index.tsx · jornada.tsx · rota.tsx · encerrar.tsx
│   ├── parada/[id].tsx · nao-coleta/[paradaId].tsx · comprovante/[coletaId].tsx
│   ├── coleta/[paradaId]/    qr · residuos · quantidade/[tipoId] · outro · resumo · assinatura · finalizada
│   ├── historico/            index · [id]
│   └── sincronizacao.tsx · configuracoes.tsx
├── src/
│   ├── tema/                 tokens.ts (do Estoque), useTema.ts
│   ├── components/ui/        Botao, Cartao, Selo, Faixa, CampoTexto, Quantidade, Passos, Lista, Aviso, Tela
│   ├── components/           Assinatura, LeitorQr, Comprovante, FaixaSincronizacao
│   ├── features/<área>/      hooks por área: sessao, jornada, rota, coleta, naoColeta, historico, sincronizacao
│   ├── dados/                tipos.ts, repositorio.ts (stores Zustand persistidos), chaves.ts
│   ├── regras/               qr.ts, cerca.ts, quantidade.ts, comprovante.ts, ordem.ts, totais.ts (puras e testadas)
│   ├── sincronizacao/        fila.ts, transporte.ts (interface), transporteDemo.ts
│   ├── dispositivo/          localizacao.ts, camera.ts (permissões e substitutos no navegador)
│   └── demo/                 dados.ts (fictícios), MenuDemo.tsx, geradorQr.ts — só com EXPO_PUBLIC_MOCK=true
├── tests/                    regras/*.test.ts, fluxos/*.test.tsx
├── app.json · package.json · tsconfig.json · eslint.config.js · .env.example
```

Na raiz entram o `Makefile` (`install-app`, `app-mock`, `app-web`, `test-app`, `lint-app`, `check-no-mocks-app`) e
o `scripts/check-no-mocks-app.sh`.

**Atualização (2026-11-19):** o app virou um repositório próprio (`system-servioeste-coleta-app`), com `docs/`, `specs/`, `.specify/`, `scripts/` e `Makefile` na raiz dele; as telas ficam em `src/app/` (padrão do SDK 58). A web terá o seu repositório.

**Decisão de estrutura:** um projeto Expo isolado em `system-servioeste-coleta-app/`, sem código compartilhado com
`system-servioeste-coleta-web/`, que vai para outro repositório. Os tipos de `src/dados/tipos.ts` serão copiados
para a web quando ela começar.

## Decisões

As decisões estão detalhadas em [research.md](research.md):

- D1 Expo SDK 58 + Router no Expo Go;
- D2 local-first com fila;
- D3 Zustand + AsyncStorage;
- D4 QR de presença conferido sem internet;
- D5 câmera;
- D6 assinatura própria em SVG;
- D7 comprovante;
- D8 localização e cerca;
- D9 visual com tokens;
- D10 dados fictícios fora da produção;
- D11 testes e npm;
- D12 túnel no WSL e datas.

## O que muda em `docs/`

- `docs/documentacao/usuario/`:
  - `01-visao-geral.md` (o que é o app e que ainda é demonstração);
  - `02-jornada-e-rota.md`;
  - `03-coleta.md` (QR, resíduos, assinatura, recusa, não coleta);
  - `04-sem-internet.md`;
  - `05-duvidas.md`.
- `docs/documentacao/tecnico/`:
  - `10-arquitetura-app.md` (local-first, pastas, contratos);
  - `11-desenvolvimento.md` (comandos, Expo Go, túnel no WSL, testes);
  - `12-dados-ficticios-e-demonstracao.md`.
- `README.md` e `CLAUDE.md`: comandos do app e estrutura.
- `docs/backlog.md` e `docs/changelog.md`: pela rotina `/encerrar-dia`.

## Complexidade

| Ponto | Por que é preciso | Por que a alternativa mais simples foi descartada |
| --- | --- | --- |
| Armazenamento local não criptografado (AsyncStorage) nesta fase | Funciona no Expo Go e no navegador, que são o requisito da fase (FR-027) | O SQLite criptografado exige um *development build*. **Antes de qualquer dado real**, uma spec do back-end troca o repositório por armazenamento criptografado. |
| Segredo do QR de presença no aparelho | Conferir o QR sem internet (princípio IX) | A conferência online falha sem sinal. A mitigação (segredo por rota e por dia, apagado ao encerrar) entra com o back-end. |
| Assinatura em componente próprio | Precisa rodar no Expo Go e no navegador | As bibliotecas prontas dependem de WebView ou Skia, que não rodam bem no navegador. |
