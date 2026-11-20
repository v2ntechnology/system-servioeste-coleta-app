# 11. Desenvolvimento

## Pré-requisitos

Node 24+ e npm. **Não precisa de Android Studio nem de SDK**: no celular, o app **Expo Go** da loja.

## Comandos (na raiz do repositório)

| Comando | O que faz |
| --- | --- |
| `make install-app` | `npm install`. |
| `make app-mock` | Expo com dados fictícios e túnel ngrok; mostra o QR Code para o Expo Go. Funciona no WSL. |
| `make app-web` | O app no navegador, em http://localhost:8081. |
| `make test-app` | Testes (Jest). Teste isolado: `npx jest tests/regras/qr.test.ts -t "expirado"`. |
| `make lint-app` | `expo lint` + `tsc --noEmit`. |
| `make check-no-mocks-app` | Exporta o pacote web sem `EXPO_PUBLIC_MOCK` e falha se encontrar código de demonstração. |
| `make docs` | Gera os PDFs da documentação (`docs/pdf/`). |

## Celular pelo WSL

O celular não alcança o IP do WSL, por isso o `make app-mock` usa túnel. O túnel padrão do SDK 58 exige login numa
conta Expo; o projeto usa `--tunnel ngrok` (o `@expo/ngrok` é dependência de desenvolvimento). Sem terminal
interativo, o Expo não imprime o endereço `exp://`: ele está em `http://localhost:4040/api/tunnels`.

## Testes

- `jest-expo` + Testing Library 14, em que `render` e `fireEvent` são assíncronos (use `await`).
- `tests/regras/`: regras puras. `tests/fluxos/coleta.test.ts`: o fluxo inteiro no repositório (coleta, recusa,
  imutabilidade, revisão, ordem, não coleta, sessão, encerramento). `tests/fluxos/entrada.test.tsx`: as telas de
  verdade, da entrada à rota. `tests/sincronizacao/`: a fila.
- O `renderRouter` liga timers falsos: chame `jest.useRealTimers()` logo depois.
- O `lucide-react-native` é mapeado para a versão CommonJS; pacotes ESM novos entram no `transformIgnorePatterns`.

## Cuidados

- O React Compiler está ligado: nada de ler ou escrever `ref.current` durante a renderização (o lint acusa).
- Seletores Zustand devem devolver fatias estáveis do estado; derive com `useMemo`.
- A API do Expo muda a cada SDK: confira os tipos em `node_modules` antes de usar uma API de memória (`AGENTS.md`).
