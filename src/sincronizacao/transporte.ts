// Transporte da fila (contracts/sincronizacao.md). Nesta fase o layout raiz instala o transporte de demonstração;
// sem ele, o padrão responde que ainda não há servidor e os itens ficam aguardando no aparelho.

import type { TipoItemFila } from "@/dados/tipos";

export type RespostaEnvio =
  | { ok: true; recebidoEm: string }
  | { ok: false; motivo: "semConexao" | "recusado"; mensagem: string };

export interface Transporte {
  enviar(item: { id: string; tipo: TipoItemFila; dados: unknown }): Promise<RespostaEnvio>;
  /** Há conexão agora? */
  conectado(): boolean;
}

const semServidor: Transporte = {
  conectado: () => false,
  enviar: async () => ({ ok: false, motivo: "semConexao", mensagem: "O servidor ainda não existe nesta fase." }),
};

let atual: Transporte = semServidor;

export function definirTransporte(transporte: Transporte): void {
  atual = transporte;
}

export function transporte(): Transporte {
  return atual;
}
