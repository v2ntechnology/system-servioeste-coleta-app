# Especificação: Telas do app do motorista com dados fictícios

**Pasta da spec**: `specs/001-app-motorista-telas`

**Criada em**: 2026-11-19

**Situação**: Plano pronto

**Pedido**: "Front-end do app do motorista com dados fictícios, seguindo o protótipo em docs/: login, início da
jornada (veículo, motorista, coletor, data), rota do dia com paradas e situação, detalhe do cliente, coleta completa
(QR Code do cliente, resíduos do cliente, quantidades, outro resíduo, resumo, confirmação, assinatura com foto do
documento ou recusa, finalização imutável), coleta não realizada com motivo, comprovante na tela (pré-visualização das
2 vias e QR Code de verificação), histórico de coletas e situação da sincronização (funcionamento sem internet
simulado). Sem back-end; serve para a Servioeste validar o que o app tem, o que falta e o que sai."

## Contexto

Hoje a Servioeste registra as coletas no Eagle Track, uma ferramenta de terceiros (ver `docs/Minimundo — Aplicativo de
Coleta Servioeste.md`). O app próprio do motorista é a primeira parte do novo sistema. Antes de construir qualquer
servidor, a equipe quer ver o app inteiro funcionando no celular, com dados de exemplo, para decidir o que fica, o que
sai e o que falta (constituição, princípio VI). O fluxo segue o protótipo `docs/WhatsApp Image 2026-11-19 at 2.48.11
PM.jpeg`, e o comprovante segue `docs/WhatsApp Image 2026-11-19 at 2.48.12 PM.jpeg`. O visual é o da Servioeste
(princípio XI), não a marca "EcoColeta" do protótipo.

Esta spec cobre **só o app do motorista**, com dados fictícios. Ficam de fora o painel do escritório, o link do
cliente e o servidor.

## Histórias de usuário

### História 1 — Entrar e começar a jornada (P1)

O motorista abre o app e entra com seu usuário e senha. Na tela inicial ele vê uma saudação, o botão "Iniciar
jornada" e os atalhos para o histórico e as configurações. Ao iniciar a jornada, confere os dados do dia: veículo
(placa), motorista, coletor e data, já preenchidos a partir da rota liberada para ele. Depois confirma e vai para a
rota.

**Teste independente**: abrir o app, entrar com um usuário de exemplo, iniciar a jornada e chegar à rota do dia com os
dados conferidos.

**Cenários de aceitação**:
1. **Dado** um usuário de exemplo válido, **quando** o motorista entra, **então** vê a tela inicial com o nome dele.
2. **Dado** usuário ou senha errados, **quando** tenta entrar, **então** vê uma mensagem clara e continua na tela de
   entrada.
3. **Dado** uma rota liberada para hoje, **quando** toca em "Iniciar jornada", **então** vê veículo, motorista,
   coletor e data preenchidos e pode confirmar.
4. **Dado** que não há rota liberada para ele hoje, **quando** toca em "Iniciar jornada", **então** vê o aviso de que
   não há rota para o dia.
5. **Dado** uma jornada já iniciada, **quando** o motorista fecha e reabre o app, **então** volta direto para a rota do
   dia, sem perder nada.

### História 2 — Ver a rota do dia (P1)

O motorista vê a rota (código e região, ex.: "R03 — Zona Oeste"), a data, quantas paradas há e a lista de clientes
na ordem sugerida, numerados. Cada parada mostra a situação: pendente, em andamento, coletada, não coletada ou
marcada para revisão. Ao tocar numa parada, vê o detalhe do cliente: nome, código, CNPJ, endereço, periodicidade
(ex.: "Semanal, quarta-feira"), os tipos de resíduo do cliente e os MTRs ligados à parada. No detalhe ele escolhe
"Iniciar coleta" ou "Não foi possível coletar".

**Teste independente**: com a jornada iniciada, abrir a rota, ver as paradas com suas situações e abrir o detalhe de
um cliente.

**Cenários de aceitação**:
1. **Dado** uma rota com 5 paradas, **então** elas aparecem numeradas na ordem sugerida, cada uma com sua situação.
2. **Dado** uma parada já coletada, **quando** o motorista a abre, **então** vê a coleta feita (só leitura) e o
   comprovante, sem a opção de coletar de novo.
3. **Dado** uma parada pendente, **quando** o motorista a abre, **então** vê os dados do cliente e as duas opções.
4. **Dado** que todas as paradas foram resolvidas, **então** a rota mostra que está completa e oferece "Encerrar
   rota".
5. **Dado** que a próxima parada da ordem é a 2, **quando** o motorista abre a parada 4, **então** só pode iniciar a
   coleta dela depois de registrar o motivo da mudança de ordem; a parada 2 continua pendente.
6. **Dado** a rota, **então** a próxima parada da ordem aparece em destaque.

### História 3 — Fazer a coleta do começo ao fim (P1)

No cliente, o motorista segue o passo a passo:

1. lê o QR Code que o cliente mostra no próprio celular, gerado na hora pelo link do cliente, para provar que os
   dois estão juntos no local;
2. escolhe o tipo de resíduo (só aparecem os do cliente, cada um com sua unidade de medida);
3. informa a quantidade, com botões − e + ou digitando;
4. responde "Outro resíduo?" e repete os passos 2 e 3 quantas vezes precisar;
5. confere o resumo e pode editar ou remover um item;
6. confirma que, depois da assinatura, a coleta não poderá ser alterada;
7. pega a assinatura do cliente na tela, com o nome e a foto do documento de quem assinou, ou marca que o cliente
   recusou a assinatura;
8. finaliza.

A tela final confirma: registro bloqueado, comprovante gerado, 2 vias prontas para impressão, salvo no aparelho e a
situação da sincronização.

**Teste independente**: abrir uma parada pendente, fazer a coleta com dois resíduos e a assinatura, finalizar e ver a
parada como coletada, sem poder ser alterada.

**Cenários de aceitação**:
1. **Dado** o QR Code gerado agora pelo link do cliente certo, **quando** o motorista o lê, **então** segue para a
   escolha dos resíduos.
2. **Dado** o QR Code de outro cliente, **quando** o motorista o lê, **então** vê "Este QR Code é de outro cliente" e
   não avança.
3. **Dado** um QR Code vencido (gerado há mais tempo do que o permitido, ex.: print antigo), **quando** o motorista o
   lê, **então** vê "QR Code expirado: peça ao cliente para abrir o link de novo" e não avança.
4. **Dado** que o cliente não consegue mostrar o QR Code (sem celular, sem o link ou sem bateria), **quando** o
   motorista toca em "Cliente sem QR Code" e escreve a justificativa, **então** segue para os resíduos e a coleta fica
   marcada para revisão.
3. **Dado** um cliente com os resíduos Grupo A e Grupo E, **então** só esses dois aparecem para escolha.
4. **Dado** um resíduo medido em kg, **então** a quantidade aceita casas decimais (ex.: 12,80); **dado** um resíduo
   medido em contêineres (CN), **então** aceita só números inteiros.
5. **Dado** uma quantidade zero ou vazia, **quando** o motorista tenta adicionar o resíduo, **então** o app não deixa e
   explica o motivo.
6. **Dado** um resíduo já adicionado, **quando** o motorista escolhe o mesmo resíduo de novo, **então** o app oferece
   corrigir a quantidade em vez de duplicar o item.
7. **Dado** o resumo, **quando** o motorista toca em "Confirmar e assinar", **então** aparece o aviso de que depois não
   será possível alterar, com as opções "Cancelar" e "Continuar".
8. **Dado** a tela de assinatura, **quando** falta a assinatura, o nome ou a foto do documento, **então** o botão
   "Finalizar coleta" fica indisponível e o app diz o que falta.
9. **Dado** que o cliente recusou a assinatura, **quando** o motorista marca a recusa, **então** a assinatura e a foto
   do documento deixam de ser exigidas e a coleta finaliza com a recusa registrada.
10. **Dado** uma coleta finalizada, **então** não existe nenhum caminho no app para alterar ou apagar os resíduos, as
    quantidades ou a assinatura.
11. **Dado** que o motorista sai do app no meio da coleta (antes de finalizar), **quando** volta, **então** continua
    do ponto em que parou.

### História 4 — Registrar que não foi possível coletar (P1)

Quando não dá para coletar, o motorista toca em "Não foi possível coletar", escolhe o motivo (local fechado, sem
resíduo para coletar, cliente não autorizou a coleta, acesso impedido ou outro, com texto) e pode escrever uma
observação. O registro guarda automaticamente a data, a hora e a localização, e a parada fica como "não coletada".

**Teste independente**: abrir uma parada pendente, registrar "Local fechado" e ver a parada como não coletada, com o
motivo e a hora.

**Cenários de aceitação**:
1. **Dado** o motivo "Outro", **quando** o texto está vazio, **então** o app não deixa salvar.
2. **Dado** um registro salvo, **então** a parada mostra o motivo, a data e a hora, e não pode mais ser alterada.

### História 5 — Comprovante na tela (P1)

Depois de finalizar, o motorista vê a pré-visualização do comprovante como ele será impresso: 1ª via (cliente) e 2ª
via (empresa). O comprovante traz:

- dados da empresa;
- cliente (nome, código, CNPJ, endereço);
- data e hora da coleta;
- rota;
- placa;
- motorista e coletor(es);
- cada resíduo com quantidade, unidade, periodicidade e tipo;
- a declaração;
- a assinatura com nome e documento, ou a indicação de recusa;
- o número do comprovante e o QR Code de verificação.

O app também mostra a versão digital e para onde ela será enviada. Nesta fase, "Imprimir" e "Enviar" apenas simulam a
ação e avisam que são demonstração.

**Teste independente**: finalizar uma coleta e abrir as duas vias; reabrir o comprovante depois, pelo histórico.

**Cenários de aceitação**:
1. **Dado** uma coleta com dois resíduos, **então** o comprovante lista os dois com quantidade e unidade.
2. **Dado** uma coleta com recusa de assinatura, **então** o comprovante mostra "Cliente recusou a assinatura" no lugar
   da assinatura.
3. **Dado** qualquer comprovante, **então** ele tem um número único e um QR Code que leva a esse número.
4. **Dado** que o motorista toca em "Imprimir", **então** vê o aviso de impressão simulada (2 vias).

### História 6 — Sem internet e sincronização (P2)

O app funciona da mesma forma com ou sem conexão. Uma faixa sempre visível mostra a situação: "Tudo sincronizado",
"N coletas aguardando envio" ou "Sem conexão: as coletas ficam guardadas neste aparelho". Uma tela de sincronização
lista o que falta enviar. Ao voltar a conexão, o envio acontece sozinho e a faixa mostra o resultado. Nesta fase a
falta de conexão e o envio são simulados, e um menu de demonstração permite ligar e desligar a "conexão".

**Teste independente**: no menu de demonstração, desligar a conexão, fazer duas coletas, religar e ver as duas
saírem da fila.

**Cenários de aceitação**:
1. **Dado** sem conexão, **quando** o motorista finaliza uma coleta, **então** ela fica salva no aparelho e a faixa
   mostra 1 aguardando envio.
2. **Dado** coletas na fila, **quando** a conexão volta, **então** elas são enviadas sozinhas e a faixa mostra "Tudo
   sincronizado".
3. **Dado** coletas na fila, **quando** o app é fechado e aberto de novo, **então** elas continuam na fila.
4. **Dado** coletas na fila, **quando** o motorista tenta sair da conta, **então** o app avisa que há coletas não
   enviadas e não deixa sair até elas serem enviadas.

### História 7 — Provas da coleta e revisão (P2)

Cada coleta guarda as provas (QR Code lido, localização, data e hora, assinatura e documento). Se a coleta for
confirmada fora da área do cliente, ou com sinal de localização falsa, ela **não é bloqueada**: é finalizada e marcada
"para revisão do escritório", e o motorista vê esse aviso. Nesta fase, o menu de demonstração simula "fora da área" e
"localização falsa".

**Teste independente**: no menu de demonstração, ligar "fora da área", fazer uma coleta e ver a parada e o comprovante
marcados para revisão.

**Cenários de aceitação**:
1. **Dado** "fora da área" ligado, **quando** o motorista finaliza a coleta, **então** ela é salva e marcada para
   revisão, com o aviso na tela final e na rota.
2. **Dado** "localização falsa" ligado, **então** a coleta é marcada para revisão com esse motivo.
3. **Dado** uma coleta normal, **então** nenhuma marca de revisão aparece.

### História 8 — Histórico de coletas (P2)

Da tela inicial, o motorista abre o histórico das suas coletas e registros de não coleta, organizados por dia, com o
cliente, a hora, a situação (coletada, não coletada ou para revisão) e a sincronização. Ao tocar num item, vê o
detalhe (só leitura) e reabre o comprovante.

**Teste independente**: abrir o histórico e ver os dias anteriores dos dados de exemplo e as coletas de hoje.

**Cenários de aceitação**:
1. **Dado** coletas de dias anteriores nos dados de exemplo, **então** aparecem agrupadas por dia, da mais recente para
   a mais antiga.
2. **Dado** uma coleta do histórico, **quando** o motorista a abre, **então** não há opção de alterar.

### História 9 — Encerrar a rota e resumo do dia (P3)

Com todas as paradas resolvidas, o motorista encerra a rota e vê o resumo do dia: coletas feitas, paradas não
coletadas com o motivo de cada uma, e o total por tipo de resíduo. Depois de encerrada, a jornada termina e a tela
inicial volta a oferecer "Iniciar jornada", para o próximo dia.

**Teste independente**: resolver todas as paradas, encerrar e conferir os totais do resumo.

**Cenários de aceitação**:
1. **Dado** paradas ainda pendentes, **quando** o motorista tenta encerrar a rota, **então** o app diz quantas faltam e
   não encerra.
2. **Dado** duas coletas de Grupo A (10 kg e 12,8 kg), **então** o resumo mostra Grupo A: 22,8 kg.

### História 10 — Configurações e demonstração (P3)

Nas configurações, o motorista vê seus dados, troca o tema (claro ou escuro) e sai da conta. Enquanto o app usa dados
fictícios, um menu de demonstração permite:

- simular sem conexão, fora da área e localização falsa;
- mostrar ou ler um QR Code de exemplo (válido, de outro cliente ou vencido), no lugar do link do cliente, que ainda
  não existe;
- restaurar os dados de exemplo.

**Teste independente**: abrir as configurações, trocar o tema, usar "Restaurar dados de exemplo" e ver a rota voltar
ao início.

**Cenários de aceitação**:
1. **Dado** o menu de demonstração, **quando** o motorista toca em "Restaurar dados de exemplo", **então** a rota volta
   ao estado inicial e o histórico de hoje é limpo.
2. **Dado** o tema escuro escolhido, **quando** o app é reaberto, **então** continua no tema escuro.

## Casos-limite

- **QR Code (decidido em 2026-11-19):** o QR Code não fica impresso no local. Ele é **gerado na hora no celular do
  cliente**, pelo link que o cliente recebe, e muda com o tempo, de modo que um print antigo não serve. O app do
  motorista precisa conseguir conferir o QR Code mesmo sem internet. Se o cliente não puder mostrá-lo, o motorista
  segue com uma justificativa e a coleta é marcada para revisão (princípio VIII). Nesta fase o link do cliente não
  existe: o menu de demonstração mostra um QR Code de exemplo (válido, de outro cliente ou vencido).
- **Ordem das paradas (decidido em 2026-11-19):** o motorista segue a ordem da rota. Para atender outra parada antes
  da próxima, ele registra o motivo da mudança (trânsito, cliente pediu outro horário, acesso fechado no momento, outro
  com texto). A parada pulada continua pendente para depois, e a mudança fica registrada com data e hora. Assim, o
  aviso de "caminhão a caminho" vai sempre para o próximo cliente da ordem.
- O motorista toca "Voltar" no meio da coleta: os resíduos já informados não se perdem até ele cancelar a coleta de
  propósito, e o app pede confirmação antes de descartar.
- A permissão de câmera ou de localização é negada: o app explica para que serve e como liberar. Sem câmera, não há
  leitura de QR Code nem foto do documento. Sem localização, a coleta é registrada sem posição e marcada para
  revisão.
- Bateria ou app fechado de repente durante a coleta: ao reabrir, o rascunho da coleta continua lá.
- Quantidade muito acima do normal (ex.: 500 kg num cliente que gera 10 kg): o app pede uma confirmação extra antes de
  adicionar. O alerta para o escritório é de outra fase.
- Telas pequenas e uso com luva: nenhum botão importante menor do que o alvo de toque confortável, e nenhuma rolagem
  horizontal.

## Requisitos funcionais

- **FR-001**: O app MUST permitir entrar com usuário e senha de exemplo e mostrar erro claro em dados inválidos.
- **FR-002**: O app MUST manter a pessoa conectada e a jornada em andamento ao ser fechado e reaberto.
- **FR-003**: O app MUST mostrar a jornada do dia (veículo, motorista, coletor, data) vinda da rota liberada e pedir
  confirmação antes de abrir a rota.
- **FR-004**: O app MUST listar as paradas da rota na ordem sugerida, numeradas, com a situação de cada uma (pendente,
  em andamento, coletada, não coletada, para revisão).
- **FR-004a**: O app MUST permitir iniciar a coleta (ou a não coleta) só na próxima parada pendente da ordem; para
  atender outra, MUST exigir o motivo da mudança de ordem e registrá-lo com data e hora, mantendo a parada pulada
  pendente.
- **FR-005**: O app MUST mostrar o detalhe do cliente: nome, código, CNPJ, endereço, periodicidade, tipos de resíduo
  e MTRs ligados à parada.
- **FR-006**: O app MUST exigir, antes da escolha dos resíduos, a leitura do QR Code gerado na hora pelo link do
  cliente, recusando o de outro cliente e o vencido, e conferindo-o mesmo sem internet.
- **FR-006a**: O app MUST permitir seguir sem o QR Code só com justificativa escrita, e nesse caso MUST marcar a coleta
  para revisão.
- **FR-007**: O app MUST mostrar na coleta somente os tipos de resíduo vinculados àquele cliente, cada um com sua
  unidade de medida.
- **FR-008**: O app MUST aceitar quantidade decimal em unidades de peso e somente inteira em unidades de contagem, e
  recusar zero ou vazio.
- **FR-009**: O app MUST permitir mais de um resíduo por coleta e editar ou remover itens até o momento da
  confirmação.
- **FR-010**: O app MUST avisar, antes da assinatura, que a coleta não poderá ser alterada depois.
- **FR-011**: O app MUST exigir assinatura na tela, nome e foto do documento de quem assinou, **ou** o registro de
  que o cliente recusou a assinatura.
- **FR-012**: O app MUST tornar a coleta imutável ao finalizar: nenhum caminho altera ou apaga resíduos, quantidades,
  assinatura ou recusa.
- **FR-013**: O app MUST registrar automaticamente, em cada coleta e cada não coleta, a data, a hora e a localização.
- **FR-014**: O app MUST permitir registrar a não coleta com motivo de uma lista (com texto obrigatório para "Outro")
  e observação opcional.
- **FR-015**: O app MUST gerar para cada coleta um comprovante com número único e QR Code de verificação, e mostrá-lo
  na tela nas versões 1ª via (cliente), 2ª via (empresa) e digital.
- **FR-016**: O app MUST simular a impressão e o envio digital, deixando claro que é demonstração.
- **FR-017**: O app MUST guardar coletas e não coletas no aparelho antes de qualquer envio e mostrar sempre a
  situação da sincronização.
- **FR-018**: O app MUST enviar sozinho, ao voltar a conexão, o que estiver na fila, e manter a fila mesmo se o app
  for fechado.
- **FR-019**: O app MUST impedir a saída da conta enquanto houver coletas não enviadas, explicando o motivo.
- **FR-020**: O app MUST marcar para revisão, sem bloquear, a coleta confirmada fora da área do cliente ou com sinal
  de localização falsa, e mostrar essa marca ao motorista.
- **FR-021**: O app MUST guardar o rascunho da coleta em andamento e retomá-lo após o app ser fechado.
- **FR-022**: O app MUST mostrar o histórico das coletas e não coletas por dia, em modo só leitura, com acesso ao
  comprovante.
- **FR-023**: O app MUST permitir encerrar a rota só com todas as paradas resolvidas e mostrar o resumo do dia (feitas,
  não feitas com motivo, total por tipo de resíduo).
- **FR-024**: O app MUST oferecer, enquanto usar dados fictícios, um menu de demonstração (sem conexão, fora da área,
  localização falsa, QR Code de exemplo, restaurar dados).
- **FR-025**: O app MUST usar só dados fictícios (clientes, CNPJs, pessoas e placas inventados), e o menu de
  demonstração e os dados fictícios MUST NOT existir na versão de produção.
- **FR-026**: O app MUST seguir o visual da Servioeste (logo, fonte, cores, tema claro e escuro) e funcionar bem com uma
  mão, com alvos de toque grandes e sem rolagem horizontal.
- **FR-027**: O app MUST poder ser aberto pela equipe no próprio celular (lendo um QR Code) e no navegador do
  computador, sem instalar ferramentas pesadas de desenvolvimento.

## Entidades

- **Motorista / coletor**: pessoa da equipe (nome e função). O motorista entra no app; o coletor aparece na jornada e
  no comprovante.
- **Veículo**: placa e descrição.
- **Rota do dia**: código, região, data, motorista, coletor, veículo e lista ordenada de paradas. Situação: liberada,
  em andamento ou encerrada.
- **Parada**: um cliente na rota, com posição na ordem, situação e MTRs ligados.
- **Cliente**: nome, código, CNPJ, endereço, área no mapa (cerca virtual), periodicidade, contatos
  para envio do comprovante e tipos de resíduo vinculados.
- **Tipo de resíduo**: nome (ex.: Grupo A), classificação (ex.: Biológico) e unidade de medida (kg, CN…).
- **Coleta**: parada, itens (tipo de resíduo e quantidade), provas (QR Code lido, localização, data e hora),
  assinatura, nome e foto do documento ou a recusa, marca de revisão com motivo e situação da sincronização. É
  imutável depois de finalizada.
- **Não coleta**: parada, motivo, observação, data, hora e localização.
- **QR Code de presença**: código que muda com o tempo, gerado no celular do cliente para uma parada, com validade
  curta. Prova que o motorista e o cliente estiveram juntos.
- **Comprovante**: número único, coleta de origem, código de verificação e vias (cliente, empresa, digital).
- **MTR**: número e situação, apenas exibido (vem já emitido do Servioeste MTR).

## Critérios de sucesso

- **SC-001**: Uma pessoa da Servioeste, sem treinamento, faz uma coleta completa com dois resíduos e assinatura em até
  3 minutos na primeira tentativa.
- **SC-002**: Todas as 12 telas do protótipo têm equivalente no app, e qualquer diferença está listada para a
  validação.
- **SC-003**: Em 100% dos testes, nenhuma coleta finalizada pode ser alterada pelo app.
- **SC-004**: Em 100% dos testes sem conexão, nenhuma coleta se perde ao fechar e reabrir o app, e todas saem da fila
  quando a conexão volta.
- **SC-005**: A equipe consegue abrir o app no próprio celular em até 5 minutos, seguindo o roteiro de validação, sem
  instalar nada além de um aplicativo da loja.
- **SC-006**: Ao final da apresentação, a Servioeste tem uma lista do que fica, sai e falta, registrada no backlog.

## Fora do escopo

- Servidor, banco de dados e login de verdade (a fase do back-end decide o login próprio do app).
- Impressão real em impressora Bluetooth e envio real por e-mail ou WhatsApp (só simulados).
- Rastreio real da posição do caminhão, previsão de chegada e avisos ao cliente.
- Painel do escritório, link e portal do cliente, alertas de anomalia para o escritório.
- Coleta avulsa, foto dos resíduos, balança, checklist do veículo e abastecimento.

## Premissas

- Cada motorista tem no máximo uma rota liberada por dia.
- Os dados da jornada vêm da rota. O motorista confere, mas não troca veículo nem coletor no app; troca é feita pelo
  escritório (fase da web).
- Um comprovante por coleta, listando todos os resíduos dela.
- A data e a hora vêm do aparelho nesta fase. A proteção contra relógio alterado é da fase do back-end.
- A localização real do aparelho pode ser lida, mas a cerca virtual e a localização falsa são simuladas pelo menu de
  demonstração.
- Os dados fictícios incluem pelo menos uma rota com 5 paradas, clientes com tipos de resíduo diferentes (kg e CN) e
  alguns dias de histórico.

## Em aberto (com a Servioeste)

- Lista final dos motivos de não coleta.
- Texto exato da declaração do comprovante e dados da empresa que vão nele.
- Se o coletor também usa o app ou só aparece nos registros.
