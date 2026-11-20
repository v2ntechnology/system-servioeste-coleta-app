# Backlog e plano de desenvolvimento

Legenda: [x] feito · [ ] a fazer. Itens marcados **Proposta** ainda não foram debatidos e podem mudar.

## Etapa 0 — Organização do projeto

- [x] Minimundo e protótipo das telas do app do motorista.
- [x] Regra de commit: prefixo em inglês, descrição em português, sem coautor de IA.
- [x] Tecnologia do app do motorista: React Native com Expo (Expo Go no celular, sem SDK local).
- [x] Um repositório para cada aplicação: `system-servioeste-coleta-app` (este) e `system-servioeste-coleta-web`.
- [x] Primeiro envio do app ao GitHub.
- [x] Spec Kit e constituição da Coleta.
- [x] Makefile, testes, lint e checagem de simulados no build.
- [x] Rotina `/encerrar-dia` e gerador de PDF (`make docs`).
- [x] Primeiros capítulos do manual e da documentação técnica.
- [ ] Área do desenvolvedor na parte web: visão geral, implementação, backlog, histórico, changelog e documentos.

## Etapa 1 — Front-end do app do motorista com dados fictícios (spec 001, antes de qualquer back-end)

- [x] Entrada, início e dados da jornada (veículo, motorista, coletor, data).
- [x] Rota do dia com paradas, situação e ordem obrigatória (mudança de ordem com motivo).
- [x] Coleta: QR Code do cliente (gerado na hora, conferido sem internet), resíduos do cliente, quantidades,
  resumo, assinatura com foto do documento ou recusa, finalização imutável.
- [x] Coleta sem QR Code com justificativa, marcada para revisão.
- [x] Coleta não realizada com o motivo, a hora e o local.
- [x] Comprovante na tela: 1ª via, 2ª via e digital, com QR Code de verificação (impressão e envio simulados).
- [x] Configurações: tema, sair da conta e menu de demonstração.
- [x] Sem internet: faixa de sincronização, tela da fila e envio automático.
- [x] Cerca virtual e detecção de localização falsa (marcam para revisão).
- [x] Histórico de coletas.
- [x] Encerrar a rota com o resumo do dia.
- [x] Manual do cliente e documentação técnica.
- [x] Assinatura digitada (o nome em estilos manuscritos) ou desenhada.
- [ ] Conferir no celular (Expo Go) seguindo o roteiro de validação e apresentar à Servioeste.
