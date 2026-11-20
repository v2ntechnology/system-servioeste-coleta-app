# 10. Arquitetura do app do motorista

Expo SDK 58 (React Native 0.88, React 19, TypeScript 6), com **Expo Router** e o **React Compiler** ligados. Roda no
**Expo Go** e no navegador; nesta fase só usa módulos que já vêm no Expo Go.

## Local-first

```text
telas (src/app)  →  hooks (src/features/<área>)  →  repositório local (src/dados/repositorio.ts)
                                                          │  toda escrita relevante
                                                          ▼
                                             fila (src/sincronizacao/fila.ts)  →  Transporte
```

- O **repositório** é um store Zustand persistido no AsyncStorage (chave `coleta-banco`, com `VERSAO_DADOS` em
  `src/dados/chaves.ts`). Ele é a fonte de verdade das telas, com ou sem internet.
- Coleta finalizada, não coleta, mudança de ordem e encerramento entram na **fila** (`ItemDaFila`, com o id do
  registro, o que torna o envio idempotente).
- O **transporte** (`src/sincronizacao/transporte.ts`) é uma interface: `enviar`, `conectado` e `observarConexao`.
  Nesta fase o layout instala o simulado (`src/demo/transporteDemo.ts`). Na fase do back-end ele passa a chamar a
  API, sem mudar as telas. O contrato está em `specs/001-app-motorista-telas/contracts/sincronizacao.md`.
- O `useMotorSincronizacao` (montado no layout) envia ao abrir, quando a conexão volta e a cada 30 s.

## Regras puras (`src/regras/`, todas com testes)

| Arquivo | Regra |
| --- | --- |
| `qr.ts` | QR Code de presença: `SVC1.<idCliente>.<janela>.<assinatura>`, HMAC-SHA256 por minuto; aceita a janela atual e a anterior; conferido sem internet (`contracts/qr-presenca.md`). |
| `ordem.ts` | Próxima parada, quem pode iniciar, motivo obrigatório para mudar a ordem. |
| `quantidade.ts` | KG e L com até 2 casas; CN e UN inteiros; zero e vazio recusados; alerta acima de 5× o habitual. |
| `coleta.ts` | Itens só do cliente, sem repetir; assinatura completa (desenhada ou digitada) ou recusa; `garantirRascunho` impede alterar coleta finalizada. |
| `cerca.ts` | Distância (haversine), área do cliente, motivos de revisão (fora da área, GPS falso, sem localização). |
| `comprovante.ts` | Número `AAAAMMDD-<placa>-<seq>`, URL de verificação, declaração. |
| `totais.ts` | Resumo do dia e quando a rota pode ser encerrada. |

## Telas

O mapa das telas e do protótipo está em `specs/001-app-motorista-telas/contracts/telas.md`. A navegação da coleta:
`qr → residuos → quantidade → outro → residuos | resumo → assinatura → finalizada`. A `finalizada` volta para a
rota (`router.dismissTo("/rota")`), inclusive pelo botão Voltar do Android.

## Visual

Os tokens de cor do Estoque ficam em `src/tema/tokens.ts`, com tema claro e escuro (`useTema`, chave `coleta-tema`).
A fonte é a Rubik, os ícones são do `lucide-react-native` e os componentes base ficam em `src/components/ui/`. O logo
e o símbolo são os do Hub e do Estoque (`src/tema/logo.ts`). As fontes manuscritas da assinatura digitada estão em
`src/tema/fontesAssinatura.ts`.

## Pontos para a fase do back-end

- Trocar o AsyncStorage por armazenamento local **criptografado** antes de qualquer dado real (constituição III).
- Segredo do QR por rota e por dia, apagado ao encerrar.
- Login próprio do app (o contrato do Hub não se aplica ao celular).
- Impressão Bluetooth por *development build* (EAS Build).
