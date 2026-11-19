# Contrato das telas (Expo Router)

Rotas em `system-servioeste-coleta-app/app/`. A coluna "Protótipo" aponta a tela equivalente do protótipo
(`docs/WhatsApp Image 2026-11-19 at 2.48.11 PM.jpeg`, telas numeradas da esquerda para a direita e de cima para
baixo).

| Rota | Tela | História | Protótipo |
| --- | --- | --- | --- |
| `/entrar` | Entrar (usuário e senha) | 1 | 1 |
| `/` | Início: saudação, "Iniciar jornada" ou "Continuar rota", histórico, configurações, faixa de sincronização | 1 | 2 |
| `/jornada` | Dados da jornada: veículo, motorista, coletor, data → "Iniciar rota" | 1 | 3 |
| `/rota` | Rota do dia: paradas numeradas, situação, próxima em destaque, "Encerrar rota" | 2 | 4 |
| `/parada/[id]` | Detalhe do cliente; "Iniciar coleta" / "Não foi possível coletar"; mudança de ordem se não for a próxima | 2 | 5 |
| `/coleta/[paradaId]/qr` | Ler o QR Code do cliente; "Cliente sem QR Code" | 3 | — (novo) |
| `/coleta/[paradaId]/residuos` | Resíduos do cliente | 3 | 6 |
| `/coleta/[paradaId]/quantidade/[tipoId]` | Quantidade − / + com unidade → "Adicionar" | 3 | 7 |
| `/coleta/[paradaId]/outro` | "Resíduo adicionado. Deseja adicionar outro?" | 3 | 8 |
| `/coleta/[paradaId]/resumo` | Resumo com editar/remover → "Confirmar e assinar" (abre o aviso de imutabilidade) | 3 | 9, 10 |
| `/coleta/[paradaId]/assinatura` | Assinatura, nome, foto do documento, "Cliente recusou" → "Finalizar coleta" | 3 | 11 |
| `/coleta/[paradaId]/finalizada` | Finalizada: bloqueado, comprovante, vias, salvo no aparelho, sincronização, revisão | 3, 7 | 12 |
| `/nao-coleta/[paradaId]` | Motivo, texto, observação → "Registrar" | 4 | — (novo) |
| `/comprovante/[coletaId]` | 1ª via, 2ª via e digital; "Imprimir" e "Enviar" (simulados) | 5 | rodapé |
| `/sincronizacao` | Fila: aguardando, enviados, erros; "Tentar agora" | 6 | rodapé ("Estado da coleta") |
| `/historico` | Coletas e não coletas por dia | 8 | — (atalho da tela 2) |
| `/historico/[id]` | Detalhe só leitura | 8 | — |
| `/encerrar` | Resumo do dia → "Encerrar rota" | 9 | — (novo) |
| `/configuracoes` | Dados, tema, sair; seção "Demonstração" no modo fictício | 10 | — (atalho da tela 2) |

## Regras de navegação

- Sem sessão, qualquer rota leva para `/entrar`. Com a jornada em andamento, `/` mostra "Continuar rota".
- As rotas de `/coleta/[paradaId]/*` exigem a parada em `emAndamento`. Numa parada já resolvida, elas levam para
  `/historico/[registroId]`.
- Voltar a partir de `/coleta/.../assinatura` ou de antes mantém o rascunho. "Cancelar coleta" pede confirmação e
  devolve a parada a `pendente`.
- `/coleta/[paradaId]/finalizada` não volta para a assinatura: o botão Voltar do sistema leva para `/rota`.
- A faixa de sincronização aparece no topo de `/`, `/rota` e `/parada/[id]`.
