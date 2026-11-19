<!--
Relatório de sincronização
- Versão: 1.0.0 → 1.0.1 (correção): app e web passam a ter um repositório cada.

Anterior
- Versão: 1.0.0 (primeira versão)
- Base: princípios I, II, III e V adaptados do núcleo do Hub (../System-servioeste-hub-web) e do Estoque. O contrato
  do Hub (núcleo IV) e a stack fixa (núcleo VI) não se aplicam: a Coleta escolhe a tecnologia que funcione 100%.
- Modelos em .specify/templates/: sem mudança necessária.
-->

# Constituição do Servioeste Coleta

Sistema que organiza e comprova as coletas de resíduos da Servioeste e substitui o Eagle Track. Tem duas aplicações,
cada uma no seu repositório:

- `system-servioeste-coleta-app` (este): o **app do motorista** (celular), a primeira a ser feita;
- `system-servioeste-coleta-web`: a **parte web**, com os cadastros, as rotas, o acompanhamento e a área do
  desenvolvedor.

## Princípios

### I. Português em tudo que a pessoa lê

Especificações, planos, tarefas, documentação, textos da interface, mensagens de erro e comentários são em português
do Brasil, com acentuação correta. Identificadores de código ficam em inglês. Datas mostradas à pessoa seguem o fuso
de Brasília.

**Por quê**: quem usa e quem mantém o sistema lê português.

### II. A documentação é a fonte oficial

`docs/` descreve como o produto é, e `specs/NNN-nome/` descreve cada mudança. Uma mudança de comportamento atualiza
`docs/` junto com o código. O `spec.md` diz **o quê e por quê**, sem tecnologia; a tecnologia fica no `plan.md`.
Decisões em aberto ficam marcadas como em aberto, nunca supostas. A fonte do produto é o minimundo
(`docs/Minimundo — Aplicativo de Coleta Servioeste.md`).

**Por quê**: o que não está escrito se perde entre um projeto e outro.

### III. Segurança e dados pessoais primeiro (INEGOCIÁVEL)

- Segredos só no `.env`, que nunca é versionado (só o `.env.example`). Nada sensível vai para o git ou o GitHub:
  senhas, URLs de banco, chaves, certificados e tokens.
- Dados de clientes (CNPJ, endereço, contatos), assinaturas, fotos de documentos e dados de motoristas e coletores
  são dados pessoais (LGPD). Simulados, testes, prints e documentação usam só dados fictícios.
- No celular, os dados guardados para uso sem internet ficam em armazenamento protegido do aparelho e saem dele assim
  que forem sincronizados.
- Toda ação sensível (finalizar coleta, registrar recusa, revisar alerta) é registrada com quem, quando e onde.

**Por quê**: as coletas têm valor legal e carregam dados de clientes e funcionários.

### IV. Pronto é verificado

- Toda regra tem teste automatizado, cobrindo o caminho feliz e os casos-limite da spec.
- Uma tarefa só é concluída com os testes e o lint verdes.
- Telas são validadas pelo `quickstart.md` da spec, com os cenários escritos antes da implementação.

**Por quê**: sem revisão de outra pessoa, o teste e o roteiro de validação são a revisão.

### V. Tecnologia que funciona 100%

A tecnologia é escolhida pelo que a Coleta precisa: funcionar sem internet, GPS com detecção de localização falsa,
câmera, assinatura e impressão Bluetooth. Ferramentas dos outros projetos da Servioeste só entram se servirem por
completo. Dependência nova, serviço novo ou camada nova só entra com justificativa no `plan.md`.

Decidido: o **app do motorista** é feito em **React Native com Expo + TypeScript**. O desenvolvimento não exige
Android Studio nem SDK na máquina: o app é visto no celular pelo Expo Go e no navegador. Um build nativo, quando for
preciso, é gerado na nuvem.

**Por quê**: o app do motorista precisa funcionar sempre, no caminhão e sem sinal; uma tecnologia que "quase" serve
falha justamente na rua.

### VI. Front-end primeiro, com dados fictícios

O front-end de cada aplicação é feito **inteiro primeiro**, com dados fictícios e sem back-end, e mostrado à
Servioeste para decidir o que fica, o que sai e o que falta. Só depois entram a API, o banco e as regras do servidor,
que substituem os simulados sem mudar as telas: as telas só falam com os hooks de dados, nunca com os simulados.
Simulados e área do desenvolvedor **nunca** chegam ao build de produção.

**Por quê**: validar o fluxo com quem vai usar antes de investir no back-end evita retrabalho.

### VII. Coleta finalizada não muda (INEGOCIÁVEL)

Depois que o motorista finaliza a coleta (com a assinatura ou o registro da recusa), nenhum dado dela pode ser
alterado nem apagado, nem no app nem na web. Correção é um registro novo, com autor, data e motivo, e o histórico
nunca se apaga.

**Por quê**: o comprovante tem valor de prova em fiscalizações ambientais.

### VIII. Toda coleta carrega suas provas

Cada coleta junta o QR Code do cliente lido no local, a localização do aparelho, a data e a hora automáticas, e a
assinatura com a foto do documento (ou a recusa). Uma coleta confirmada fora da cerca virtual ou com sinal de GPS
falso **é registrada e marcada para revisão** do escritório: não é bloqueada nem descartada. Na coleta só aparecem os
tipos de resíduo vinculados àquele cliente.

**Por quê**: o motorista não pode ficar impedido de trabalhar por um GPS ruim, mas o escritório precisa saber de
qualquer divergência.

### IX. Sem internet, sem perda

O app do motorista funciona sem conexão do começo ao fim da rota. Toda coleta é gravada primeiro no aparelho e
enviada sozinha quando a conexão volta. A tela sempre mostra o que ainda falta sincronizar. Nenhuma ação depende de
estar online para ser concluída.

**Por quê**: muitas regiões da rota não têm sinal.

### X. O cliente só vê o que é dele (INEGOCIÁVEL)

O link e o portal do cliente mostram só a coleta, a chegada do caminhão e os documentos daquele cliente. Nunca a
posição, o nome ou os dados de outros clientes da rota.

**Por quê**: a rota revela a carteira de clientes da Servioeste e a rotina de cada um.

### XI. Visual da Servioeste, pensado para o caminhão

O design e o layout vêm do Estoque (`../system-servioeste-estoque`): fonte Rubik, logo, tema claro e escuro, preto,
branco e cinzas, verde Servioeste (#6ca33c) para destaque, cores de situação só para indicar situação, cores só pelos
tokens do tema e nenhuma barra de rolagem visível. O protótipo em `docs/` é a referência do **fluxo** do app. A marca
"EcoColeta" do protótipo não é usada.

No app do motorista: alvos de toque grandes, poucos passos por tela, leitura fácil no sol e uso com uma mão.

**Por quê**: o motorista usa o app em pé, com pressa e muitas vezes de luva.

## Restrições

- Portas de desenvolvimento que não colidem com os outros projetos: **web 5178, API 8005, Postgres 5436**. O Expo usa
  a porta padrão dele (8081).
- Fora da primeira versão (só entra com spec própria): coleta avulsa, foto dos resíduos, integração com a balança,
  checklist do veículo e abastecimento.
- Os MTRs são emitidos no Servioeste MTR (`../system-servioesteMTR`, em produção). A Coleta só consulta MTRs já
  emitidos e os liga às paradas; ela nunca emite, cancela ou altera um MTR.

## Fluxo de trabalho

- Spec Kit: `/speckit-specify` → (`/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` → (`/speckit-analyze`) →
  `/speckit-implement`. Cada mudança relevante tem sua pasta em `specs/NNN-nome/`, numerada em sequência, sem branch
  por funcionalidade.
- O `tasks.md` segue o princípio VI: telas com dados fictícios → validação com a Servioeste → back-end com testes →
  integração e remoção dos simulados.
- Correção pequena e óbvia (texto, bug de uma linha) não precisa de spec, mas continua passando por testes e lint.
- Ao encerrar o dia, a rotina `/encerrar-dia` atualiza o changelog, o backlog, a documentação e os PDFs.
- Commits: `<prefixo em inglês>: <descrição em português>`, sem coautor de IA nem "Generated with". A autoria é só das
  pessoas do projeto. Commitar só quando o desenvolvedor pedir.

## Governança

Esta constituição vale acima de qualquer outro guia do projeto. Todo `plan.md` confere cada princípio na
"Verificação da constituição", e uma violação só entra justificada na seção de complexidade. Versão: MAIOR remove ou
redefine um princípio; MENOR acrescenta um princípio ou uma seção; CORREÇÃO só ajusta o texto.

**Versão**: 1.0.1 | **Ratificada**: 2026-11-19 | **Última alteração**: 2026-11-19
