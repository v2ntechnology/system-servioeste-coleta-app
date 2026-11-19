// Envio da fila (contracts/sincronizacao.md): FIFO, idempotente pelo id, `recusado` não trava os seguintes.

import type { ItemDaFila } from "@/dados/tipos";
import { useBanco } from "@/dados/repositorio";
import { transporte } from "@/sincronizacao/transporte";

let enviando = false;

export function pendentes(fila: ItemDaFila[]): ItemDaFila[] {
  return fila.filter((i) => i.situacao !== "enviado");
}

/** Envia o que estiver aguardando (e, se `comErros`, também os que deram erro). */
export async function processarFila(comErros = false): Promise<void> {
  if (enviando) return;
  enviando = true;
  try {
    const t = transporte();
    const alvo = useBanco
      .getState()
      .fila.filter((i) => i.situacao === "aguardando" || (comErros && i.situacao === "erro"))
      .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
    for (const item of alvo) {
      if (!t.conectado()) break;
      const { atualizarItemFila } = useBanco.getState();
      atualizarItemFila(item.id, { situacao: "enviando" });
      const resposta = await t.enviar({ id: item.id, tipo: item.tipo, dados: item.dados });
      const tentativas = item.tentativas + 1;
      if (resposta.ok) {
        atualizarItemFila(item.id, { situacao: "enviado", enviadoEm: resposta.recebidoEm, tentativas, ultimoErro: undefined });
      } else if (resposta.motivo === "semConexao") {
        atualizarItemFila(item.id, { situacao: "aguardando", tentativas, ultimoErro: resposta.mensagem });
        break;
      } else {
        atualizarItemFila(item.id, { situacao: "erro", tentativas, ultimoErro: resposta.mensagem });
      }
    }
  } finally {
    enviando = false;
  }
}
