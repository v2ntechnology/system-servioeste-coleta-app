# Servioeste Coleta · App do motorista

App de celular em que o motorista vê a rota do dia e registra cada coleta de resíduos, com QR Code do cliente,
resíduos e quantidades, assinatura e comprovante. Substitui o Eagle Track. A parte web (cadastros, rotas, painel do
escritório e link do cliente) fica no repositório
[`system-servioeste-coleta-web`](https://github.com/v2ntechnology/system-servioeste-coleta-web).

**Fase atual:** telas do app com dados fictícios (spec 001), para a Servioeste validar o que fica, o que sai e o que
falta. Ainda não há servidor: impressão, envio e sincronização são simulados.

- Minimundo e protótipo das telas: [`docs/`](docs/)
- Backlog e histórico: [`docs/backlog.md`](docs/backlog.md), [`docs/changelog.md`](docs/changelog.md)
- Especificações (Spec Kit): [`specs/`](specs/) · constituição: [`.specify/memory/constitution.md`](.specify/memory/constitution.md)

## Estrutura

```text
src/app/          Telas (Expo Router)
src/components/   Componentes (ui/ com os básicos no visual da Servioeste)
src/features/     Hooks de cada área (sessão, jornada, rota, coleta)
src/dados/        Tipos e armazenamento no aparelho (local-first)
src/regras/       Regras puras e testadas (QR Code, quantidade, ordem, coleta, comprovante)
src/sincronizacao/ Fila de envio
src/demo/         Dados fictícios e menu de demonstração (fora do pacote de produção)
tests/            Testes (Jest)
docs/ · specs/    Documentação e especificações
```

## Desenvolvimento

Pré-requisitos: Node 24+ e npm. **Não precisa de Android Studio**: no celular basta o app **Expo Go**, da loja.

```bash
make install-app       # dependências
make app-mock          # mostra um QR Code: leia com o Expo Go (Android) ou a câmera (iPhone)
make app-web           # o mesmo app no navegador, em http://localhost:8081
make test-app          # testes
make lint-app          # ESLint e checagem de tipos
make check-no-mocks-app  # confere que o pacote de produção não tem dados fictícios
```

Usuário de demonstração: `alan`, senha `1234`. Em Configurações → Demonstração dá para simular sem conexão e
restaurar os dados de exemplo. Na leitura do QR Code, os botões de demonstração simulam o QR que o cliente mostraria.

## Commits

`<prefixo em inglês>: <descrição em português>` (ex.: `feat: cria a tela da rota do dia`), sem coautor de IA.
