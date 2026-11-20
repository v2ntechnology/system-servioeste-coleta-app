# 1. Visão geral

## O que é o Servioeste Coleta

O **Servioeste Coleta** é o aplicativo de celular do motorista. Nele o motorista vê a **rota do dia**, registra cada
**coleta de resíduos** no cliente e entrega o **comprovante**. Ele substitui o Eagle Track e foi feito sob medida para
a forma de trabalhar da Servioeste.

Cada coleta junta as provas de que foi feita de verdade, no lugar e na hora certos: o QR Code mostrado pelo cliente,
a localização do celular, a data e a hora, e a assinatura de quem recebeu.

> **Fase atual: demonstração.** As telas já funcionam, mas com **dados de exemplo** (clientes, pessoas, placas e
> números inventados). Nada é enviado de verdade: a impressão, o envio do comprovante e a sincronização são
> simulados. Os dados reais entram quando a Servioeste aprovar as telas e o servidor estiver pronto.

## Quem usa

| Quem | O que faz no app |
| --- | --- |
| Motorista | Entra com usuário e senha, confere a jornada, segue a rota e registra as coletas. |
| Coletor | Aparece na jornada e no comprovante. |
| Cliente | Mostra o QR Code do link da Servioeste no celular dele e assina a coleta na tela do motorista. |

O painel do escritório (cadastro de clientes, montagem das rotas, mapa dos caminhões) é outra parte do sistema, que
vem depois.

## O dia de trabalho em resumo

1. **Entrar** no app e tocar em **Iniciar jornada**.
2. Conferir o **veículo, o motorista, o coletor e a data** e tocar em **Iniciar rota**.
3. Seguir as **paradas na ordem**. Em cada uma: **Iniciar coleta** (ou **Não foi possível coletar**).
4. No fim do dia, **Encerrar rota** e conferir o resumo.

## Para quem vai testar

- Instale o **Expo Go** pela loja do celular e leia o QR Code que a equipe de desenvolvimento passar.
- Entre com o usuário **alan** e a senha **1234**.
- Em **Configurações → Demonstração** dá para simular falta de internet, coleta fora da área do cliente e
  localização falsa, e para **restaurar os dados de exemplo** e recomeçar.
