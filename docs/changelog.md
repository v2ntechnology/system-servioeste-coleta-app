# Histórico de alterações

Registro diário do que foi adicionado, alterado e removido no projeto. A entrada mais recente fica no topo.

## 2026-11-19

### Adicionado

- Minimundo do Aplicativo de Coleta e protótipo das telas do app do motorista e do comprovante.
- Orientações do projeto, backlog e proteção contra envio de dados sensíveis ao GitHub.
- Spec Kit com a constituição da Coleta, rotina de encerramento do dia e geração dos PDFs.
- **App do motorista com dados fictícios** (spec 001, histórias 1 a 5): entrada, jornada, rota do dia com a ordem das
  paradas, coleta completa com QR Code do cliente, resíduos, quantidades, assinatura ou recusa e comprovante na tela,
  e registro de quando não foi possível coletar. Abre no celular pelo Expo Go e no navegador.
- Menu de demonstração com QR Codes de exemplo e restauração dos dados.
- Testes das regras (QR Code, quantidade, ordem, coleta, comprovante) e dos fluxos principais.

### Alterado

- O app do motorista e a parte web passam a ter um repositório cada no GitHub.
- Decisão: app do motorista em React Native com Expo, visto no celular pelo Expo Go, sem instalar o Android Studio.
- Decisão: primeiro todo o front-end com dados fictícios; o back-end vem depois da validação das telas.
