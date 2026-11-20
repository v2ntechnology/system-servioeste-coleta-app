# Modelo de dados: spec 001

Estes são os tipos do aparelho, em `src/dados/tipos.ts`. Os identificadores ficam em português sem acento. Datas e
horas são strings ISO 8601 com fuso. Na fase do back-end, os mesmos tipos viram o contrato da API.

## Pessoa
| Campo | Tipo | Regra |
| --- | --- | --- |
| id | string | |
| nome | string | |
| funcao | `"motorista" \| "coletor"` | só o motorista entra no app |
| usuario | string | login (só motorista) |

## Veiculo
`id`, `placa` (ex.: `RDU8D06`), `descricao`.

## TipoResiduo
| Campo | Tipo | Regra |
| --- | --- | --- |
| id | string | |
| nome | string | ex.: "Grupo A" |
| classificacao | string | ex.: "Biológico" |
| unidade | `"KG" \| "CN" \| "L" \| "UN"` | KG e L aceitam decimal (2 casas); CN e UN só inteiro |

## Cliente
`id`, `codigo` (ex.: `001258`), `nome`, `cnpj`, `endereco` {logradouro, numero, bairro, cidade, uf, cep},
`area` {lat, lng, raioMetros = 150}, `periodicidade` (texto, ex.: "Semanal (quarta-feira)"),
`contatos` {email?, whatsapp?}, `residuos`: `TipoResiduo["id"][]`, `quantidadeHabitual` (média por tipo de resíduo; acima de 5× pede confirmação extra), `segredoQr` (só para a rota do dia, ver
`contracts/qr-presenca.md`).

## Rota
| Campo | Tipo | Regra |
| --- | --- | --- |
| id, codigo, regiao, data | string | ex.: `R03`, "Zona Oeste" |
| motoristaId, coletorIds, veiculoId | string | vêm do escritório, só leitura no app |
| situacao | `"liberada" \| "emAndamento" \| "encerrada"` | |
| paradas | Parada[] | ordenadas por `ordem` |
| jornadaIniciadaEm, encerradaEm | string? | |

## Parada
| Campo | Tipo | Regra |
| --- | --- | --- |
| id, clienteId | string | |
| ordem | number | 1..n |
| situacao | `"pendente" \| "emAndamento" \| "coletada" \| "naoColetada"` | ver transições |
| mtrs | {numero, situacao}[] | só exibição |
| registroId | string? | coleta ou não coleta que resolveu a parada |

**Próxima parada** = a pendente de menor `ordem`. Iniciar outra exige uma `MudancaDeOrdem`.

## MudancaDeOrdem
`id`, `rotaId`, `paradaPuladaId`, `paradaAtendidaId`, `motivo` (`"transito" | "clientePediuOutroHorario" |
"acessoFechadoNoMomento" | "outro"`), `texto` (obrigatório se `outro`), `em`. Entra na fila de sincronização.

## Coleta
| Campo | Tipo | Regra |
| --- | --- | --- |
| id, paradaId, rotaId, clienteId | string | |
| situacao | `"rascunho" \| "finalizada"` | **finalizada é imutável** |
| itens | {tipoResiduoId, quantidade}[] | ≥ 1; sem tipo repetido; tipo ∈ `cliente.residuos` |
| prova.qr | {resultado: `"valido"`, codigo, lidoEm} \| {resultado: `"semQr"`, justificativa} | |
| prova.local | {lat, lng, precisao, mocked} \| null | lida ao finalizar |
| assinatura | {tipo: `"assinada"`, forma: `"desenhada" \| "digitada"`, caminhoSvg? (desenhada), fonte? (digitada), nome, fotoDocumentoUri} \| {tipo: `"recusada"`, nome?} | |
| revisao | {motivo: `"semQr" \| "foraDaArea" \| "localizacaoFalsa" \| "semLocalizacao"`}[] | vazio = sem revisão |
| iniciadaEm, finalizadaEm | string | |
| comprovanteNumero | string | gerado ao finalizar |

**Validação:** `finalizar` só aceita `itens.length ≥ 1`, o QR lido ou justificado, e a assinatura completa (traço ou estilo escolhido + nome + foto) **ou** a recusa.

## NaoColeta
`id`, `paradaId`, `rotaId`, `motivo` (`"localFechado" | "semResiduo" | "clienteNaoAutorizou" | "acessoImpedido" |
"outro"`), `texto` (obrigatório se `outro`), `observacao?`, `local`, `em`. Imutável ao salvar.

## Comprovante
Derivado da coleta (não é guardado à parte): `numero`, os dados do cliente, da rota, do veículo, das pessoas, dos
itens e da assinatura, e `urlVerificacao`.

## ItemDaFila
| Campo | Tipo | Regra |
| --- | --- | --- |
| id | string | igual ao do registro (idempotente) |
| tipo | `"coleta" \| "naoColeta" \| "mudancaDeOrdem" \| "encerramento"` | |
| dados | objeto | cópia congelada do registro |
| situacao | `"aguardando" \| "enviando" \| "enviado" \| "erro"` | |
| tentativas, ultimoErro, criadoEm, enviadoEm | | |

## Transições

```text
Parada:  pendente ──iniciar coleta──▶ emAndamento ──finalizar──▶ coletada
         pendente ──não foi possível─▶ naoColetada
         emAndamento ──cancelar coleta (com confirmação)──▶ pendente
Coleta:  rascunho ──finalizar──▶ finalizada   (sem volta)
Rota:    liberada ──iniciar jornada──▶ emAndamento ──encerrar (0 pendentes)──▶ encerrada
Fila:    aguardando ──▶ enviando ──▶ enviado
                         └──▶ erro ──(nova tentativa)──▶ aguardando
```

Sair da conta só é permitido com 0 itens da fila diferentes de `enviado`.
