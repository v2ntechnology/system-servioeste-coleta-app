# Contrato de sincronização (transporte)

Este contrato é o que a fila do aparelho espera do servidor. Nesta fase o transporte é simulado
(`src/sincronizacao/transporteDemo.ts`); na fase do back-end, ele vira a API real, com o mesmo formato.

## Interface

```ts
interface Transporte {
  enviar(item: { id: string; tipo: "coleta" | "naoColeta" | "mudancaDeOrdem" | "encerramento"; dados: unknown }):
    Promise<{ ok: true; recebidoEm: string } | { ok: false; motivo: "semConexao" | "recusado"; mensagem: string }>;
}
```

- **Idempotência:** o `id` do item é o id do registro, e reenviar o mesmo `id` responde `ok: true`, sem duplicar.
  Isso garante que uma queda de conexão no meio do envio não cria coletas em dobro.
- **Ordem:** os itens saem na ordem em que foram criados (FIFO). Um item com `recusado` não trava os seguintes; ele
  fica com `erro`, visível na tela de sincronização.
- **Quando tentar enviar:** ao criar um item, quando a conexão volta, a cada 30 s enquanto houver itens aguardando e
  quando o motorista toca em "Tentar agora".

## Transporte de demonstração

- Com a "conexão" desligada no menu de demonstração, responde `semConexao`.
- Com a conexão ligada, responde `ok` depois de ~600 ms por item, para que a tela mostre o "enviando".
- O menu de demonstração tem a opção "Recusar o próximo envio", que testa o estado de erro.
