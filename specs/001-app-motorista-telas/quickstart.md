# Roteiro de validação: spec 001

Os cenários abaixo valem tanto no celular (Expo Go) quanto no navegador, salvo quando indicado.

## Preparação

- **No computador:** Node 24 ou mais novo. Na raiz do projeto, rode `make install-app`.
- **No celular:** instale o **Expo Go** pela loja (Android ou iPhone). Nada mais é instalado.
- **Para abrir:**
  - `make app-mock`: aparece um QR Code no terminal. No Android, leia pelo Expo Go; no iPhone, pela câmera. O modo
    túnel funciona mesmo no WSL.
  - `make app-web`: abre no navegador em http://localhost:8081.
- **Usuário de exemplo:** `alan` / `1234`.
- **Para recomeçar do zero:** Configurações → Demonstração → "Restaurar dados de exemplo".

## A. Entrada e jornada (história 1)
1. Entre com uma senha errada: a mensagem aparece e você continua na tela de entrada.
2. Entre com `alan` / `1234`: a tela inicial mostra "Olá, Alan!".
3. Toque em "Iniciar jornada": aparecem o veículo RDU8D06, o motorista Alan Sterce, o coletor Douglas Silva e a data
   de hoje. Toque em "Iniciar rota".
4. Feche o app e abra de novo: ele volta para a rota.

## B. Rota e ordem (história 2)
1. A rota R03 mostra 5 paradas numeradas, com a 1 em destaque como próxima.
2. Abra a parada 3 e toque em "Iniciar coleta": o app pede o motivo da mudança de ordem. Escolha "Trânsito": a coleta
   da 3 começa e a 1 continua pendente.

## C. Coleta completa (história 3)
1. Na parada 1, toque em "Iniciar coleta". Em Configurações → Demonstração, mostre o **QR de outro cliente** e leia:
   aparece "Este QR Code é de outro cliente". Faça o mesmo com o **QR vencido**: aparece "QR Code expirado".
2. Leia o **QR válido**: só os resíduos do cliente aparecem (Grupo A em kg e Grupo E em CN).
3. Grupo A: tente adicionar 0 (o app recusa) e depois 12,80 kg. Em "Outro resíduo?", responda Sim: Grupo E, 2 CN
   (o app não aceita 2,5).
4. No resumo, altere o Grupo A para 13 kg. Toque em "Confirmar e assinar": aparece o aviso de que não será possível
   alterar. Toque em "Continuar".
5. Sem assinatura, o botão "Finalizar coleta" fica indisponível e diz o que falta. Assine, informe o nome e tire a
   foto do documento (no navegador, escolha uma imagem). Finalize.
6. A tela final mostra: registro bloqueado, comprovante gerado e salvo no aparelho. Na rota, a parada 1 aparece como
   coletada, e ao abri-la só há leitura.
7. Em outra parada, marque "Cliente recusou a assinatura": a coleta finaliza sem assinatura nem foto.
8. Em outra parada, comece a coleta, adicione um resíduo, feche o app e abra de novo: a coleta continua no resumo.

## D. Não coleta (história 4)
1. Na próxima parada, toque em "Não foi possível coletar" e escolha "Outro" sem texto: o app não deixa registrar.
   Escreva o texto e registre: a parada aparece como não coletada, com o motivo e a hora.

## E. Comprovante (história 5)
1. Abra o comprovante da parada 1: as abas 1ª via e 2ª via mostram os dois resíduos, a assinatura, o número no formato
   `AAAAMMDD-RDU8D06-001` e o QR Code. A coleta com recusa mostra "Cliente recusou a assinatura".
2. "Imprimir" mostra o aviso de impressão simulada das 2 vias.

## F. Sem internet (história 6)
1. Em Demonstração, desligue a conexão. Faça uma coleta: a faixa mostra "Sem conexão" e "1 aguardando envio".
2. Feche e abra o app: o item continua na fila. Tente sair da conta: o app não deixa e explica o motivo.
3. Religue a conexão: o item sai da fila sozinho, e a faixa mostra "Tudo sincronizado".
4. Ligue "Recusar o próximo envio" e faça uma coleta: o item aparece com erro na tela de sincronização, e "Tentar
   agora" envia.

## G. Provas e revisão (história 7)
1. Ligue "Fora da área" e faça uma coleta: a tela final, a rota e o comprovante mostram "Para revisão do escritório".
2. Ligue "Localização falsa": a coleta fica marcada com esse motivo.
3. Na leitura do QR, toque em "Cliente sem QR Code" e justifique: a coleta fica marcada para revisão.

## H. Histórico, encerramento e configurações (histórias 8 a 10)
1. O histórico mostra hoje e os dias anteriores, do mais recente para o mais antigo, e nada pode ser alterado.
2. Com paradas pendentes, "Encerrar rota" diz quantas faltam. Resolva todas e encerre: o resumo mostra as coletas
   feitas, as não feitas com o motivo e o total por resíduo.
3. Troque para o tema escuro, feche e abra o app: ele continua escuro.

## I. Qualidade
- `make test-app` e `make lint-app` terminam verdes.
- `make check-no-mocks-app` diz que não há dados fictícios nem menu de demonstração no pacote de produção.
