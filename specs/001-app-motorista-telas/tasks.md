# Tarefas: Telas do app do motorista com dados fictícios

**Entrada**: `specs/001-app-motorista-telas/` (spec, plan, research, data-model, contracts, quickstart)

**Testes**: são obrigatórios pela constituição (princípio IV). As regras puras têm teste **antes** da implementação;
os fluxos principais têm teste de tela.

**Formato**: `- [ ] T000 [P?] [US?] descrição com caminho`. `[P]` = pode correr em paralelo (outro arquivo, sem
dependência pendente). `[USn]` = história n da spec. Os caminhos são relativos a `system-servioeste-coleta-app/`,
salvo quando indicado. A área do dev lê este arquivo por `## Fase`.

**Nota (2026-11-19):** os testes de fluxo T042 e T043 ficaram em `tests/fluxos/coleta.test.ts`, no nível do repositório
(coleta completa, recusa, imutabilidade, sem QR, ordem, não coleta e sessão). O teste com as telas de verdade cobre a
entrada e a jornada (`tests/fluxos/entrada.test.tsx`). As telas da coleta ainda não têm teste de tela.

**Nota (2026-11-19):** o modelo do Expo SDK 58 põe as rotas em `src/app/`, não em `app/`. Onde as tarefas dizem
`app/...`, leia `src/app/...`. Os testes ficam em `tests/` e usam o alias `@/` → `src/`.

## Fase 1 — Preparação do projeto

- [X] T001 Criar o projeto Expo SDK 58 com TypeScript em `system-servioeste-coleta-app/` (`npx create-expo-app@latest
  system-servioeste-coleta-app --template default`), remover o `.gitkeep` e as telas de exemplo do modelo, e definir
  `name: "Servioeste Coleta"`, `slug: "servioeste-coleta"`, `scheme: "servioeste-coleta"` e `userInterfaceStyle:
  "automatic"` em `app.json`
- [X] T002 Instalar as dependências com `npx expo install expo-router expo-camera expo-image-picker expo-location
  expo-secure-store expo-font @react-native-async-storage/async-storage react-native-svg
  react-native-gesture-handler` e `npm install zustand react-native-qrcode-svg lucide-react-native
  @expo-google-fonts/rubik @noble/hashes`; conferir com `npx expo-doctor` e registrar em `package.json` os scripts
  `start:mock`, `web:mock`, `test` e `lint`
- [X] T003 [P] Configurar o Jest (`jest-expo` + `@testing-library/react-native`) em `package.json` e
  `tests/setup.ts`, com um teste de fumaça em `tests/fumaca.test.ts`
- [X] T004 [P] Configurar o ESLint (`npx expo lint`) em `eslint.config.js`, com a regra `no-restricted-imports`
  proibindo `@/demo/*` fora de `src/demo/` e de `app/_layout.tsx`
- [X] T005 [P] Criar o `.env.example` com `EXPO_PUBLIC_MOCK=true`, o alias `@/` → `src/` em `tsconfig.json` e as
  permissões de câmera e localização (textos em português) em `app.json`
- [X] T006 [P] Acrescentar ao `Makefile` da raiz os alvos `install-app`, `app-mock` (`npx expo start --tunnel` com
  `EXPO_PUBLIC_MOCK=true`), `app-web`, `test-app`, `lint-app` e `check-no-mocks-app`
- [X] T007 [P] Criar `scripts/check-no-mocks-app.sh` na raiz: roda `npx expo export --platform web --output-dir
  dist` sem `EXPO_PUBLIC_MOCK` e falha se o pacote contiver os marcadores `MenuDemo`, `dadosFicticios` ou
  `transporteDemo`

## Fase 2 — Fundação (bloqueia todas as histórias)

- [X] T008 [P] Criar os tokens claro e escuro em `src/tema/tokens.ts`, copiados de
  `../system-servioeste-estoque/system-servioeste-estoque-front/src/index.css` (`--background`, `--foreground`,
  `--primary`, `--muted`, `--border`, `--destructive`, `--warning`, `--brand #6ca33c`, raio 12), e `useTema()` em
  `src/tema/useTema.ts` com a escolha claro/escuro/sistema persistida em `coleta-tema`
- [X] T009 [P] Criar os tipos em `src/dados/tipos.ts` exatamente como em `data-model.md`. Unidades `"KG" | "CN" | "L" |
  "UN"`. `Parada.situacao` = `"pendente" | "emAndamento" | "coletada" | "naoColetada"`. `Coleta.situacao` =
  `"rascunho" | "finalizada"`. Revisão = `"semQr" | "foraDaArea" | "localizacaoFalsa" | "semLocalizacao"`. Os motivos
  de não coleta e de mudança de ordem, e `ItemDaFila.situacao`, seguem `data-model.md`
- [X] T010 [P] Criar `src/dados/chaves.ts` com as chaves do armazenamento (prefixo `coleta-`) e `VERSAO_DADOS`
- [X] T011 [P] Criar os componentes base em `src/components/ui/`: `Tela.tsx` (área segura, sem barra de rolagem,
  botão principal fixo no pé), `Botao.tsx` (principal preto/branco, secundário, perigo; altura 56 dp), `Cartao.tsx`,
  `Selo.tsx` (ponto colorido + texto neutro), `Faixa.tsx`, `CampoTexto.tsx`, `Aviso.tsx` (confirmação modal),
  `Passos.tsx` e `Lista.tsx`, todos com cores só dos tokens e alvos de pelo menos 48 dp
- [X] T012 [P] Criar o formato de datas e números em `src/lib/formato.ts`: data e hora em `pt-BR` com `timeZone:
  "America/Sao_Paulo"`, quantidade com vírgula e CNPJ com máscara. Testes em `tests/lib/formato.test.ts`
- [X] T013 Criar os dados fictícios em `src/demo/dados.ts`:
  - o motorista Alan Sterce (`alan`/`1234`), o coletor Douglas Silva e o veículo RDU8D06;
  - a rota R03 — Zona Oeste de hoje, com 5 paradas;
  - 6 clientes inventados (Hospital São Lucas, Clínica Vida Mais, Laboratório Santos, Unidade Bangu, Posto Saúde
    Oeste e mais 1), com área, segredo de QR e resíduos;
  - os tipos de resíduo Grupo A (KG), Grupo B (KG), Grupo D (KG) e Grupo E (CN);
  - 10 dias de histórico, com datas relativas a hoje.
- [X] T014 Criar o repositório local em `src/dados/repositorio.ts`: stores Zustand com `persist` no AsyncStorage
  (sessão, rota do dia, rascunhos, registros, fila). Ele carrega os dados fictícios quando `EXPO_PUBLIC_MOCK=true` e
  é a única porta de leitura e gravação para os hooks
- [X] T015 Criar a fila em `src/sincronizacao/fila.ts`, a interface em `src/sincronizacao/transporte.ts` e o
  transporte simulado em `src/sincronizacao/transporteDemo.ts`, conforme `contracts/sincronizacao.md` (FIFO,
  idempotente pelo id, ~600 ms por item, `semConexao` e "recusar o próximo")
- [X] T016 Criar o estado da demonstração em `src/demo/estadoDemo.ts`: conexão, fora da área, localização falsa e
  recusar o próximo envio, persistidos em `coleta-demo`
- [X] T017 Criar o layout raiz em `app/_layout.tsx`: fonte Rubik, `GestureHandlerRootView`, tema, `Stack` com
  cabeçalho nos tokens, e o redirecionamento para `/entrar` sem sessão

**Ponto de controle:** o app abre no Expo Go e no navegador com o tema e a fonte certos.

## Fase 3 — História 1: entrar e começar a jornada (P1) 🎯 MVP

**Objetivo:** entrar, ver a tela inicial e confirmar a jornada. **Teste independente:** quickstart A.

- [X] T018 [P] [US1] Teste de fluxo em `tests/fluxos/entrada.test.tsx`: senha errada mostra o erro; `alan`/`1234`
  chega a "Olá, Alan!"; "Iniciar jornada" mostra o veículo, o motorista, o coletor e a data
- [X] T019 [US1] Criar o hook de sessão em `src/features/sessao/useSessao.ts` (entrar, sair, sessão no
  `expo-secure-store` e no AsyncStorage pelo navegador). Sair fica bloqueado se a fila tiver itens diferentes de
  `enviado`
- [X] T020 [US1] Criar a tela de entrada em `app/entrar.tsx` (logo Servioeste de `../docs/assets/logo-servioeste.svg`
  convertido, usuário, senha, "Entrar", mensagem de erro)
- [X] T021 [US1] Criar o hook de jornada em `src/features/jornada/useJornada.ts` (rota liberada de hoje ou nenhuma;
  iniciar marca a rota como `emAndamento` e grava `jornadaIniciadaEm`)
- [X] T022 [US1] Criar a tela inicial em `app/index.tsx`: saudação, "Iniciar jornada" ou "Continuar rota", atalhos
  para o histórico e as configurações, e o aviso de "Não há rota liberada para hoje"
- [X] T023 [US1] Criar a tela de jornada em `app/jornada.tsx`: veículo, motorista, coletor e data só para leitura,
  e "Iniciar rota"

## Fase 4 — História 2: rota do dia e ordem das paradas (P1)

**Objetivo:** ver as paradas, o detalhe do cliente e a ordem obrigatória. **Teste independente:** quickstart B.

- [X] T024 [P] [US2] Testes de `src/regras/ordem.ts` em `tests/regras/ordem.test.ts`: a próxima é a pendente de
  menor `ordem`; atender outra exige um motivo (`"transito" | "clientePediuOutroHorario" | "acessoFechadoNoMomento" |
  "outro"`, com `texto` obrigatório se `outro`); a parada pulada continua `pendente`
- [X] T025 [US2] Implementar `src/regras/ordem.ts` até os testes passarem
- [X] T026 [US2] Criar o hook da rota em `src/features/rota/useRota.ts` (paradas ordenadas, próxima, situação e
  registrar `MudancaDeOrdem` na fila)
- [X] T027 [US2] Criar a tela da rota em `app/rota.tsx`: código e região, data, contagem, lista numerada com `Selo`
  por situação, a próxima em destaque e "Encerrar rota" quando não houver pendentes
- [X] T028 [US2] Criar o detalhe da parada em `app/parada/[id].tsx`: nome, código, CNPJ, endereço, periodicidade,
  resíduos e MTRs; "Iniciar coleta" e "Não foi possível coletar"; a escolha do motivo de mudança de ordem quando
  não for a próxima; o modo só leitura quando já estiver resolvida

## Fase 5 — História 3: coleta do começo ao fim (P1)

**Objetivo:** fluxo completo até a coleta imutável. **Teste independente:** quickstart C.

- [X] T029 [P] [US3] Testes de `src/regras/qr.ts` em `tests/regras/qr.test.ts`, com os 4 casos obrigatórios de
  `contracts/qr-presenca.md` (janela atual e anterior `valido`, 2 atrás `expirado`, outro cliente `outroCliente`,
  assinatura alterada ou texto qualquer `invalido`)
- [X] T030 [P] [US3] Testes de `src/regras/quantidade.ts` em `tests/regras/quantidade.test.ts`: "KG e L aceitam
  decimal (2 casas); CN e UN só inteiro"; zero e vazio recusados; "12,80" lido como 12.8; acima de 5× a
  `quantidadeHabitual` pede confirmação
- [X] T031 [P] [US3] Testes de `src/regras/coleta.ts` em `tests/regras/coleta.test.ts`: `finalizar` exige "itens.length
  ≥ 1" e a assinatura completa (traço + nome + foto) **ou** a recusa; sem tipo repetido; tipo ∈ `cliente.residuos`;
  qualquer alteração de uma coleta `finalizada` lança erro
- [X] T032 [US3] Implementar `src/regras/qr.ts` (HMAC-SHA256 com `@noble/hashes`, base32 de 10 bytes, comparação
  em tempo constante), `src/regras/quantidade.ts` e `src/regras/coleta.ts` até os testes passarem
- [X] T033 [US3] Criar o hook da coleta em `src/features/coleta/useColeta.ts`: iniciar (parada → `emAndamento`),
  rascunho persistido (FR-021), adicionar/alterar/remover item, cancelar com confirmação (parada → `pendente`) e
  finalizar (congela, gera o comprovante, parada → `coletada`, entra na fila). O repositório recusa gravar numa
  coleta `finalizada`
- [X] T034 [P] [US3] Criar o leitor em `src/components/LeitorQr.tsx`: `CameraView` com
  `barcodeScannerSettings: { barcodeTypes: ["qr"] }`, o pedido de permissão com explicação e o substituto no
  navegador (lista de QR de exemplo no modo demonstração)
- [X] T035 [P] [US3] Criar a assinatura em `src/components/Assinatura.tsx`: traço em `react-native-svg` com
  `react-native-gesture-handler`, "Limpar" e o valor como caminho SVG
- [X] T036 [US3] Criar a tela do QR em `app/coleta/[paradaId]/qr.tsx`: mensagens "Este QR Code é de outro cliente",
  "QR Code expirado: peça ao cliente para abrir o link de novo" e "QR Code inválido"; "Cliente sem QR Code" com
  justificativa obrigatória, que acrescenta `revisao: semQr`
- [X] T037 [US3] Criar a tela de resíduos em `app/coleta/[paradaId]/residuos.tsx`, com só os resíduos do cliente e a
  unidade. Escolher um resíduo já adicionado abre a correção da quantidade
- [X] T038 [US3] Criar a tela de quantidade em `app/coleta/[paradaId]/quantidade/[tipoId].tsx` (− / +, teclado
  numérico, vírgula, erros claros, confirmação extra acima do habitual) e a tela "Outro resíduo?" em
  `app/coleta/[paradaId]/outro.tsx`
- [X] T039 [US3] Criar o resumo em `app/coleta/[paradaId]/resumo.tsx`: editar e remover itens; "Confirmar e assinar"
  abre o `Aviso` "Após a assinatura, não será possível alterar resíduos e quantidades" com "Cancelar" e "Continuar"
- [X] T040 [US3] Criar a tela de assinatura em `app/coleta/[paradaId]/assinatura.tsx`: assinatura, nome, foto do
  documento (`expo-image-picker` `launchCameraAsync`; no navegador, escolha de arquivo), "Cliente recusou a
  assinatura" e "Finalizar coleta" desabilitado dizendo o que falta
- [X] T041 [US3] Criar a tela final em `app/coleta/[paradaId]/finalizada.tsx`: registro bloqueado, comprovante
  gerado, 2 vias prontas, salvo no aparelho e situação da sincronização. Voltar leva para `/rota`
- [X] T042 [US3] Teste de fluxo em `tests/fluxos/coleta.test.tsx`: coleta com Grupo A 12,80 kg e Grupo E 2 CN,
  assinatura e finalização; a parada fica `coletada` e a tela da parada não oferece edição; a recusa finaliza sem
  assinatura

## Fase 6 — História 4: não coleta (P1)

**Objetivo:** registrar o motivo de não coletar. **Teste independente:** quickstart D.

- [X] T043 [P] [US4] Teste em `tests/fluxos/naoColeta.test.tsx`: "Outro" sem texto não salva; o registro salvo deixa
  a parada `naoColetada`, com o motivo e a hora
- [X] T044 [US4] Criar o hook em `src/features/naoColeta/useNaoColeta.ts` (motivo `"localFechado" | "semResiduo" |
  "clienteNaoAutorizou" | "acessoImpedido" | "outro"`, `texto` obrigatório se `outro`, a localização e a hora, item
  imutável que entra na fila) e a tela `app/nao-coleta/[paradaId].tsx`

## Fase 7 — História 5: comprovante na tela (P1)

**Objetivo:** pré-visualização das vias. **Teste independente:** quickstart E.

- [X] T045 [P] [US5] Testes de `src/regras/comprovante.ts` em `tests/regras/comprovante.test.ts`: o número
  `AAAAMMDD-<placa>-<seq>` é único por veículo e dia, com a sequência começando em 001; a URL de verificação usa o
  domínio configurado
- [X] T046 [US5] Implementar `src/regras/comprovante.ts` e o componente `src/components/Comprovante.tsx`, que segue o
  modelo `docs/WhatsApp Image 2026-11-19 at 2.48.12 PM.jpeg` com 58 mm simulados: empresa, cliente, data e hora,
  rota, placa, motorista, coletor(es), itens com unidade, periodicidade e tipo, declaração, assinatura ou "Cliente
  recusou a assinatura", número e QR (`react-native-qrcode-svg`), e "Para revisão do escritório" quando houver
- [X] T047 [US5] Criar a tela `app/comprovante/[coletaId].tsx`, com as abas 1ª via (cliente), 2ª via (empresa) e
  Digital (para onde vai: e-mail e WhatsApp do cliente), e "Imprimir" e "Enviar" mostrando o aviso de demonstração

## Fase 8 — História 6: sem internet e sincronização (P2)

**Objetivo:** fila visível e envio automático. **Teste independente:** quickstart F.

- [X] T048 [P] [US6] Testes da fila em `tests/sincronizacao/fila.test.ts`: FIFO, idempotência, `semConexao` mantém
  `aguardando`, `recusado` vira `erro` sem travar os seguintes, a fila sobrevive à recarga e a saída da conta fica
  bloqueada com itens pendentes
- [X] T049 [US6] Criar o hook `src/features/sincronizacao/useSincronizacao.ts` (tenta ao criar, quando a conexão
  volta, a cada 30 s e em "Tentar agora") e o componente `src/components/FaixaSincronizacao.tsx` ("Tudo
  sincronizado", "N aguardando envio", "Sem conexão: as coletas ficam guardadas neste aparelho"), usado em `/`,
  `/rota` e `/parada/[id]`
- [X] T050 [US6] Criar a tela `app/sincronizacao.tsx`, com aguardando, enviados de hoje, erros e "Tentar agora"

## Fase 9 — História 7: provas e revisão (P2)

**Objetivo:** marcar para revisão sem bloquear. **Teste independente:** quickstart G.

- [X] T051 [P] [US7] Testes de `src/regras/cerca.ts` em `tests/regras/cerca.test.ts`: haversine; dentro e fora de
  `raioMetros = 150`; sem posição → `semLocalizacao`; `mocked` → `localizacaoFalsa`
- [X] T052 [US7] Implementar `src/regras/cerca.ts` e `src/dispositivo/localizacao.ts` (`expo-location`, tempo limite
  de 10 s, última posição conhecida, substituições do estado da demonstração), e ligar ao `finalizar` da coleta e
  da não coleta para preencher `prova.local` e `revisao[]`
- [X] T053 [US7] Mostrar a marca "Para revisão do escritório", com o motivo, na tela final, na rota, no histórico e no
  comprovante

## Fase 10 — História 8: histórico (P2)

**Objetivo:** consultar coletas anteriores. **Teste independente:** quickstart H1.

- [X] T054 [US8] Criar o hook `src/features/historico/useHistorico.ts` (agrupado por dia, do mais recente para o mais
  antigo) e as telas `app/historico/index.tsx` e `app/historico/[id].tsx`, só para leitura e com o link para o
  comprovante

## Fase 11 — História 9: encerrar a rota (P3)

**Objetivo:** resumo do dia. **Teste independente:** quickstart H2.

- [X] T055 [P] [US9] Testes de `src/regras/totais.ts` em `tests/regras/totais.test.ts`: Grupo A 10 kg + 12,8 kg =
  22,8 kg; as não coletas aparecem com o motivo; o encerramento é recusado com paradas pendentes
- [X] T056 [US9] Implementar `src/regras/totais.ts` e a tela `app/encerrar.tsx` (resumo e "Encerrar rota" → rota
  `encerrada`, item `encerramento` na fila e volta para `/`)

## Fase 12 — História 10: configurações e demonstração (P3)

**Objetivo:** tema, saída da conta e menu de demonstração. **Teste independente:** quickstart H3 e os passos de
demonstração.

- [X] T057 [US10] Criar a tela `app/configuracoes.tsx`: dados do motorista, tema claro/escuro/sistema e "Sair" (com o
  bloqueio da fila pendente)
- [X] T058 [US10] Criar `src/demo/geradorQr.ts` (gera o QR válido, de outro cliente e vencido para o cliente da
  parada atual, seguindo `contracts/qr-presenca.md`) e `src/demo/MenuDemo.tsx`, com os interruptores de conexão,
  fora da área, localização falsa e recusar o próximo envio, a exibição dos QR de exemplo, "Restaurar dados de
  exemplo" e o aviso "Modo demonstração". Ele é carregado em `configuracoes.tsx` só com `EXPO_PUBLIC_MOCK === "true"`

## Fase 13 — Acabamento e validação

- [X] T059 [P] Escrever o manual do cliente em `docs/documentacao/usuario/` (`01-visao-geral.md`,
  `02-jornada-e-rota.md`, `03-coleta.md`, `04-sem-internet.md`, `05-duvidas.md`), em linguagem simples e dizendo que
  é demonstração
- [X] T060 [P] Escrever a documentação técnica em `docs/documentacao/tecnico/` (`10-arquitetura-app.md`,
  `11-desenvolvimento.md`, `12-dados-ficticios-e-demonstracao.md`) e atualizar o `README.md` e o `CLAUDE.md` com os
  comandos do app
- [ ] T061 Conferir no celular e no navegador: telas de 360 dp sem rolagem horizontal, alvos ≥ 48 dp, tema escuro
  legível e nenhuma barra de rolagem visível
- [X] T062 Rodar `make test-app`, `make lint-app` e `make check-no-mocks-app`, todos verdes
- [ ] T063 Seguir `quickstart.md` de A a I no Expo Go e anotar no `docs/backlog.md` as diferenças em relação ao
  protótipo (SC-002)
- [ ] T064 Apresentar à Servioeste e registrar no `docs/backlog.md` o que fica, o que sai e o que falta (SC-006)

## Dependências

- A Fase 1 vem antes da Fase 2, e a Fase 2 bloqueia todas as histórias.
- US1 vem antes de US2, e US2 antes de US3 e de US4 (precisa da rota e da parada). US3 vem antes de US5 (o comprovante
  vem da coleta).
- US6, US7 e US8 dependem de US3 e US4 (precisam de registros) e são independentes entre si.
- US9 depende de US3 e US4. US10 depende só da Fase 2, mas os QR de exemplo (T058) são necessários para validar a US3
  no celular. **Adiante a T058 logo depois da T036** se a validação for no aparelho.
- A Fase 13 vem por último.

## Paralelismo

- Fase 1: T003, T004, T005, T006 e T007 juntos, depois da T001 e da T002.
- Fase 2: T008, T009, T010, T011 e T012 juntos; depois T013 → T014 → T015 e T016; por fim a T017.
- US3: os testes T029, T030 e T031 e os componentes T034 e T035 juntos.
- US6, US7 e US8 podem ser feitas em paralelo depois da US4.

## Estratégia

1. **MVP**, Fases 1 a 7 (US1 a US5): entrar, rota, coleta completa, não coleta e comprovante. É o fluxo principal do
   protótipo, e já dá para mostrar no celular.
2. **Incremento 2** (US6 a US8): sem internet, revisão e histórico.
3. **Incremento 3** (US9 e US10): encerramento e configurações, com o menu de demonstração completo.
4. **Fase 13:** documentação, conferência e apresentação.

Ao fim de cada fase, rode `make test-app` e `make lint-app`, abra no Expo Go e marque as tarefas `[X]` aqui.
