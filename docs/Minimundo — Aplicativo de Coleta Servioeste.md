# Minimundo — Aplicativo de Coleta Servioeste

## O que é

O Aplicativo de Coleta da Servioeste é um sistema que organiza e comprova todas as coletas de resíduos feitas pela empresa. Ele substitui a ferramenta usada hoje (Eagle Track) por uma solução própria, feita sob medida para a forma de trabalhar da Servioeste.

O sistema tem três partes que conversam entre si:

- **O painel da empresa (no computador):** onde a equipe do escritório planeja as rotas, acompanha os caminhões e confere tudo o que foi coletado.
- **O aplicativo do motorista (no celular):** onde o motorista vê a rota do dia e registra cada coleta.
- **O link do cliente:** uma página simples que o cliente recebe para acompanhar a chegada do caminhão e ver seus comprovantes.

## Por que ele existe

Hoje a coleta depende de uma ferramenta de terceiros, que não oferece tudo o que a Servioeste precisa. Com um sistema próprio, a empresa ganha:

- Controle total sobre as rotas e os dados.
- Mais segurança de que cada coleta realmente aconteceu, no lugar e na hora certos.
- Uma experiência melhor para o cliente, que passa a saber quando o caminhão vai chegar e recebe tudo documentado.

## Quem usa

- **Equipe do escritório:** cadastra clientes, monta rotas, vincula os manifestos de transporte e acompanha o dia.
- **Motorista e coletor:** fazem as coletas e registram tudo pelo aplicativo.
- **Cliente:** acompanha a chegada do caminhão, assina a coleta, avalia o atendimento e consulta seus documentos.
- **Gestores:** acompanham resultados, atrasos e qualquer situação fora do normal.

## Como funciona um dia de coleta

### 1. Antes do dia: o planejamento

No painel, a equipe cadastra cada cliente com seu endereço, os tipos de resíduo que ele gera (por exemplo, resíduo hospitalar do Grupo A) e a frequência da coleta, como "toda quarta-feira".

Com isso, a equipe monta as **rotas fixas da semana**. A partir delas, o sistema gera a **rota de cada dia**, que pode ser ajustada quando necessário. Cada rota tem um motorista, um coletor e um caminhão definidos.

O sistema também organiza a **ordem das paradas** pelo melhor caminho, levando em conta o trânsito.

Por lei, o transporte de resíduos precisa de um documento chamado **MTR (Manifesto de Transporte de Resíduos)**. Esses documentos já são emitidos no sistema RookMTR. No painel, a equipe busca os MTRs já emitidos e os liga a cada parada da rota. Assim, o motorista sai com tudo pronto.

### 2. Saída: o cliente é avisado

Quando a rota do dia é liberada, cada cliente recebe um **link** por WhatsApp, por e-mail ou pelos dois, conforme os contatos cadastrados. Nesse link ele vê a previsão de chegada, por exemplo "entre 9h e 11h".

### 3. Na rua: acompanhamento ao vivo

Quando o motorista termina a coleta anterior, o link do próximo cliente passa a mostrar **quantos minutos faltam** para o caminhão chegar, além do nome do coletor e da placa do veículo. O cliente nunca vê onde estão os outros clientes; ele só vê a chegada do caminhão até ele.

No escritório, a equipe vê no mapa **todos os caminhões ao mesmo tempo** e quais coletas foram feitas, quais estão atrasadas e quais tiveram problema.

### 4. No cliente: a coleta

Ao chegar, o motorista segue um passo a passo simples no aplicativo:

1. **Escaneia o QR Code do cliente**, gerado na hora no celular do cliente pelo link que ele recebe, para confirmar que os dois estão juntos no lugar certo.
2. Escolhe os tipos de resíduo coletados. Aparecem apenas os tipos ligados àquele cliente.
3. Informa a quantidade de cada um.
4. Confere o resumo da coleta.
5. Pega a **assinatura do cliente** direto na tela do celular e registra a foto do documento de quem assinou. Se o cliente se recusar a assinar, isso também fica registrado.
6. Finaliza. A partir daí, a coleta não pode mais ser alterada.

O aplicativo imprime o **comprovante de coleta** (duas vias) e também o envia em formato digital. Cada comprovante tem um QR Code que qualquer pessoa pode usar para conferir se ele é verdadeiro.

Se não for possível coletar, por exemplo porque o local estava fechado, o motorista informa o motivo e o registro fica salvo com hora e local.

### 5. Depois da coleta: avaliação do cliente

Pelo mesmo link, o cliente confirma se a coleta foi feita e dá uma nota rápida para o atendimento. Isso ajuda a Servioeste a medir a qualidade do serviço.

### 6. Fim do dia: o relatório

Ao encerrar a rota, o sistema gera um **relatório do dia** com as coletas feitas, as que não foram feitas e o motivo de cada uma, e o total de resíduos por tipo.

## Como o sistema garante que a coleta é verdadeira

O aplicativo foi pensado para que não seja possível registrar uma coleta sem estar de fato no cliente. Cada coleta junta várias provas:

- **Cerca virtual:** cada cliente tem uma área no mapa. A coleta registra a localização do celular. Se ela for confirmada fora dessa área, fica marcada para revisão do escritório.
- **Proteção contra localização falsa:** o aplicativo identifica quando alguém tenta enganar o GPS do celular.
- **QR Code do cliente:** gerado na hora no celular do cliente e escaneado pelo motorista no local; um QR antigo não vale.
- **Assinatura e documento:** feitos na hora, dentro do aplicativo.
- **Data e hora** registradas automaticamente.

Se algo não bater, a equipe do escritório é avisada.

## Sem internet, sem problema

Muitas regiões não têm sinal bom. O aplicativo funciona **sem internet**: as coletas ficam guardadas com segurança no celular e são enviadas sozinhas assim que a conexão volta.

## Portal do cliente

Além do link de acompanhamento, cada cliente tem acesso a um **portal** com todo o histórico de coletas, comprovantes e MTRs para baixar quando quiser. Isso facilita muito a vida dele em fiscalizações ambientais.

## Alertas inteligentes

O sistema conhece o padrão de cada cliente. Se um cliente que costuma gerar 10 kg por semana aparecer com 50 kg, o sistema avisa a equipe para conferir.

## O que fica para depois

Algumas ideias já foram pensadas, mas não entram nesta primeira versão:

- **Coleta extra ou avulsa**, pedida pelo cliente fora da rota normal.
- **Foto dos resíduos** no momento da coleta.
- **Ligação com a balança**, que está sendo desenvolvida em outro sistema. No futuro, o peso poderá vir direto da balança, sem digitação.
- **Outros módulos para o motorista**, como checklist do veículo e abastecimento. A ideia é que este aplicativo cresça e vire o aplicativo completo do motorista da Servioeste.
