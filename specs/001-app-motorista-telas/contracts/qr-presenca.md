# Contrato do QR Code de presença

Este é o acordo entre quem **gera** o QR Code (o link do cliente, que será feito na web; nesta fase, o menu de
demonstração) e quem **confere** (o app do motorista, sem internet). A decisão está em `research.md` D4.

## Formato

```text
SVC1.<idCliente>.<janela>.<assinatura>
```

- `SVC1`: versão do formato.
- `idCliente`: o `Cliente.id`, sem pontos.
- `janela`: `floor(epochSegundos / 60)` em decimal, ou seja, o código muda a cada minuto.
- `assinatura`: os primeiros 10 bytes de `HMAC-SHA256(segredoDoCliente, "<idCliente>.<janela>")`, em base32
  (RFC 4648, maiúsculas e sem `=`), o que dá 16 caracteres.

## Conferência (`src/regras/qr.ts`, função `conferirQr(texto, clienteEsperado, segredos, agora)`)

1. Formato inválido ou outra versão: `invalido`.
2. `idCliente` diferente do cliente da parada, mas presente na rota: `outroCliente`. Ausente da rota: `invalido`.
3. Assinatura diferente da calculada para `janela`: `invalido`.
4. `janela` fora de `[atual − 1, atual]`: `expirado`. Uma janela futura (relógio adiantado) também é `expirado`.
5. Nos outros casos: `valido`.

Na comparação da assinatura use uma comparação de tempo constante.

## Testes obrigatórios

- O código da janela atual e o da anterior são `valido`; o de 2 janelas atrás é `expirado`.
- O código de outro cliente da rota é `outroCliente`.
- Um código com um caractere trocado na assinatura é `invalido`.
- Um texto qualquer (por exemplo, a URL de um site) é `invalido`.
