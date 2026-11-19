# Atalhos do Servioeste Coleta App (app do motorista). Rode `make help` para ver todos.
# Portas: Expo 8081. A parte web (web 5178, API 8005, Postgres 5436) fica no repositório coleta-web.

APP := .

.DEFAULT_GOAL := help
.PHONY: help install-app app-mock app-web test-app lint-app typecheck-app check-no-mocks-app docs

help: ## lista os comandos
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-20s %s\n", $$1, $$2}'

# ------------------------------------------------------------------ app do motorista
install-app: ## instala as dependências do app do motorista
	cd $(APP) && npm install

app-mock: ## app com dados fictícios; mostra o QR Code para abrir no Expo Go (túnel, funciona no WSL)
	cd $(APP) && npm run start:mock

app-web: ## app com dados fictícios no navegador (http://localhost:8081)
	cd $(APP) && npm run web:mock

test-app: ## testes do app (Jest)
	cd $(APP) && npm test -- --silent

lint-app: ## ESLint + checagem de tipos do app
	cd $(APP) && npm run lint && npm run typecheck

typecheck-app: ## só a checagem de tipos (tsc)
	cd $(APP) && npm run typecheck

check-no-mocks-app: ## falha se o pacote de produção tiver dados fictícios ou o menu de demonstração
	./scripts/check-no-mocks-app.sh

# ------------------------------------------------------------------ documentação
docs: ## gera os PDFs da documentação (manual do cliente e documentação técnica)
	uv run scripts/gerar_pdf.py
