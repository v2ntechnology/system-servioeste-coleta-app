# 12. Dados fictícios e demonstração

## Como o modo demonstração é ligado

- `EXPO_PUBLIC_MOCK=true` liga o modo (os comandos `make app-mock` e `make app-web` já definem a variável).
- **Só `src/app/_layout.tsx` importa `@/demo`.** Sem a variável, o `metro.config.js` troca `src/demo/index.ts` por
  `src/demo/vazio.ts` depois da resolução, e nada da demonstração entra no pacote. O `make check-no-mocks-app` confere
  isso no pacote exportado.
- As telas acessam o menu e o painel de QR de exemplo por `src/lib/extensoesDemo.ts`. O ESLint proíbe importar
  `@/demo` fora de `src/demo` e do layout.
- Mudou a variável? Reinicie o Expo com `--clear`, porque o Metro guarda cache.

## O que a demonstração instala

| Peça | Arquivo | Efeito |
| --- | --- | --- |
| Dados de exemplo | `src/demo/dados.ts` | Motorista Alan Sterce (`alan`/`1234`), coletor Douglas Silva, veículo RDU8D06, rota R03 de hoje com 5 paradas, 6 clientes inventados e 10 dias de histórico (semente fixa). |
| Transporte | `src/demo/transporteDemo.ts` | Responde `ok` em ~600 ms; sem conexão, `semConexao`; "recusar o próximo" testa o erro. |
| Localização | `src/demo/localizacaoDemo.ts` | A posição é a área do cliente (600 m fora com "fora da área"); "localização falsa" marca a leitura como falsificada. |
| QR de exemplo | `src/demo/PainelQrDemo.tsx` | Simula a leitura do QR válido, de outro cliente e vencido, e mostra o QR válido para ler de outro aparelho. |
| Menu | `src/demo/MenuDemo.tsx` | Em Configurações: conexão, fora da área, localização falsa, recusar o próximo envio e restaurar os dados. |

Num dia novo, sem nada pendente de envio, os dados de exemplo são recriados com a rota do dia.

## Regras dos dados fictícios

Nenhum dado real: nomes, CNPJs, endereços, contatos e placas são inventados (constituição III). O histórico de
exemplo usa uma assinatura desenhada genérica e `demo://documento` no lugar da foto.
