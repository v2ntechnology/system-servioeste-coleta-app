// Envio da fila (contracts/sincronizacao.md): FIFO, idempotente pelo id, `recusado` não trava os seguintes.

import { useEffect } from "react";

import type { ItemDaFila } from "@/dados/tipos";
import { useBanco } from "@/dados/repositorio";
import { transporte } from "@/sincronizacao/transporte";

/** Intervalo das tentativas automáticas enquanto houver itens aguardando. */
export const INTERVALO_ENVIO_MS = 30_000;

let enviando = false;

export function pendentes(fila: ItemDaFila[]): ItemDaFila[] {
  return fila.filter((i) => i.situacao !== "enviado");
}

function alvos(comErros: boolean): ItemDaFila[] {
  // "enviando" fora de um envio em curso = o app fechou no meio; o item volta a ser enviado (idempotente).
  return useBanco
    .getState()
    .fila.filter((i) => i.situacao === "aguardando" || i.situacao === "enviando" || (comErros && i.situacao === "erro"))
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
}

/** Envia o que estiver aguardando (e, se `comErros`, também os que deram erro). */
export async function processarFila(comErros = false): Promise<void> {
  if (enviando) return;
  enviando = true;
  try {
    const t = transporte();
    let lote = alvos(comErros);
    while (lote.length && t.conectado()) {
      let parar = false;
      for (const item of lote) {
        if (!t.conectado()) {
          parar = true;
          break;
        }
        const { atualizarItemFila } = useBanco.getState();
        atualizarItemFila(item.id, { situacao: "enviando" });
        const resposta = await t.enviar({ id: item.id, tipo: item.tipo, dados: item.dados });
        const tentativas = item.tentativas + 1;
        if (resposta.ok) {
          atualizarItemFila(item.id, { situacao: "enviado", enviadoEm: resposta.recebidoEm, tentativas, ultimoErro: undefined });
        } else if (resposta.motivo === "semConexao") {
          atualizarItemFila(item.id, { situacao: "aguardando", tentativas, ultimoErro: resposta.mensagem });
          parar = true;
          break;
        } else {
          atualizarItemFila(item.id, { situacao: "erro", tentativas, ultimoErro: resposta.mensagem });
        }
      }
      if (parar) break;
      // Itens criados durante o envio saem na mesma rodada; os com erro só com "Tentar agora".
      lote = alvos(false);
    }
  } finally {
    enviando = false;
    // Sem conexão, nada fica marcado como "enviando".
    for (const i of useBanco.getState().fila) {
      if (i.situacao === "enviando") useBanco.getState().atualizarItemFila(i.id, { situacao: "aguardando" });
    }
  }
}

/** Liga o envio automático: ao abrir o app, quando a conexão volta e a cada 30 s. Montado no layout raiz. */
export function useMotorSincronizacao(): void {
  useEffect(() => {
    void processarFila();
    const parar = transporte().observarConexao(() => {
      if (transporte().conectado()) void processarFila();
    });
    const intervalo = setInterval(() => void processarFila(), INTERVALO_ENVIO_MS);
    return () => {
      parar();
      clearInterval(intervalo);
    };
  }, []);
}
