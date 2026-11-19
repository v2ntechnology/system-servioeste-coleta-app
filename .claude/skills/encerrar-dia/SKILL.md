---
name: encerrar-dia
description: Encerra o dia de trabalho no Servioeste Coleta — atualiza changelog, backlog, tarefas da spec e documentação, gera os PDFs (manual e técnico), confere testes e segurança e prepara o commit. Use quando o desenvolvedor disser que vai parar, encerrar o dia, finalizar a sessão ou pedir para atualizar o PDF da documentação.
---

# Encerrar o dia

Siga em ordem. Escreva tudo em português, com acentuação correta.

1. **Levantar o que mudou no dia**: `git log --since=midnight --format='%h %an %s'`, `git status` e `git diff --stat`.
   Considere também o que foi feito nesta conversa e ainda não foi commitado.
2. **`docs/changelog.md`**: acrescente (ou complete) a entrada do dia no topo, `## AAAA-MM-DD`, com as subseções
   `### Adicionado`, `### Alterado` e `### Removido` (omita as vazias). Descreva o efeito para quem lê, não o arquivo.
3. **`docs/backlog.md`**: marque o que foi concluído (`- [x]`), acrescente o que surgiu e ajuste as etapas. Mantenha o
   formato `## Etapa N — Nome` + `- [ ] item`, que a área do dev (`/dev`) lê.
4. **Spec ativa** (`.specify/feature.json` → `specs/NNN-*/`): marque `[X]` em `tasks.md` nas tarefas concluídas
   (a aba Implementação do `/dev` lê esse arquivo) e registre decisões novas em `research.md`. Se a spec terminou, mude
   a **Situação** do `spec.md`.
5. **Capítulos afetados** — confira no código antes de escrever; nunca descreva como pronto o que ainda é
   demonstração (dados simulados) ou só existe na API:
   - `docs/documentacao/usuario/` (vai para o **manual do cliente**, a Servioeste): mudou algo que quem usa vê ou faz
     (tela, botão, regra, papel, mensagem)? Atualize em linguagem simples, sem termos técnicos.
   - `docs/documentacao/tecnico/` (só **dev**): arquitetura, pastas, rotas da API, comandos, testes, dados simulados,
     variáveis de ambiente, decisões.
   - `README.md` e `.env.example`: comandos, variáveis ou estrutura mudaram?
   - Constituição (`.specify/memory/constitution.md`): só se uma regra mudou (relatório de sincronização + versão).
   - Capítulo novo = arquivo novo com prefixo numérico na pasta certa (`0x` usuário, `1x` técnico).
6. **Gerar os PDFs**: `make docs` (ou `uv run scripts/gerar_pdf.py`), que gera `docs/pdf/coleta-manual.pdf` e
   `docs/pdf/coleta-documentacao-tecnica.pdf`. Se falhar, mostre o erro.
7. **Conferir**, se houve mudança de código: `make test` e `make lint` verdes. Se falhar, mostre o erro em vez de seguir.
8. **Conferir segurança**: `git status`; nenhum `.env`, segredo, dado real de cliente (CNPJ, endereço, contato), assinatura,
   foto de documento, comprovante real ou dado pessoal real em arquivo versionado (nem nos
   PDFs nem nos dados simulados).
9. **Resumir** ao desenvolvedor o que entrou no changelog e nos capítulos e perguntar se pode commitar e enviar
   (`git push origin main`). Ao commitar, use `docs: atualiza a documentação do dia` (ou prefixo mais adequado),
   **sem** `Co-Authored-By` nem menção a IA: a autoria é só de quem trabalha no projeto.
