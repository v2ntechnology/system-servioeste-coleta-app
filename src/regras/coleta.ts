// Regras da coleta (princípios VII e VIII).
// Coleta finalizada não muda: toda alteração passa por `garantirRascunho`.

import type { Assinatura, Cliente, Coleta, ItemColeta } from "@/dados/tipos";

export class ColetaFinalizadaError extends Error {
  constructor() {
    super("Coleta finalizada não pode ser alterada.");
    this.name = "ColetaFinalizadaError";
  }
}

export function garantirRascunho(coleta: Coleta): void {
  if (coleta.situacao === "finalizada") throw new ColetaFinalizadaError();
}

/** Acrescenta ou corrige o item (sem tipo repetido). O tipo precisa ser do cliente. */
export function comItem(coleta: Coleta, cliente: Cliente, item: ItemColeta): ItemColeta[] {
  garantirRascunho(coleta);
  if (!cliente.residuos.includes(item.tipoResiduoId)) {
    throw new Error("Este resíduo não está vinculado ao cliente.");
  }
  const existe = coleta.itens.some((i) => i.tipoResiduoId === item.tipoResiduoId);
  return existe
    ? coleta.itens.map((i) => (i.tipoResiduoId === item.tipoResiduoId ? item : i))
    : [...coleta.itens, item];
}

export function semItem(coleta: Coleta, tipoResiduoId: string): ItemColeta[] {
  garantirRascunho(coleta);
  return coleta.itens.filter((i) => i.tipoResiduoId !== tipoResiduoId);
}

/** O que falta para a assinatura ficar completa (vazio = completa). */
export function faltasDaAssinatura(
  a: Partial<{ forma: "desenhada" | "digitada"; caminhoSvg: string; fonte: string; nome: string; fotoDocumentoUri: string }>,
): string[] {
  const faltas: string[] = [];
  const forma = a.forma ?? "desenhada";
  if (forma === "desenhada" && !a.caminhoSvg) faltas.push("a assinatura");
  if (forma === "digitada" && !a.fonte) faltas.push("o estilo da assinatura");
  if (!a.nome?.trim()) faltas.push(forma === "digitada" ? "o nome para a assinatura" : "o nome de quem assinou");
  if (!a.fotoDocumentoUri) faltas.push("a foto do documento");
  return faltas;
}

/** Pode finalizar? Itens ≥ 1, QR lido (ou justificado) e assinatura completa ou recusa. */
export function errosParaFinalizar(coleta: Coleta, assinatura: Assinatura | undefined): string[] {
  if (coleta.situacao === "finalizada") return ["Esta coleta já foi finalizada."];
  const erros: string[] = [];
  if (coleta.itens.length < 1) erros.push("Adicione pelo menos um resíduo.");
  if (!coleta.prova.qr) erros.push("Leia o QR Code do cliente.");
  if (!assinatura) {
    erros.push("Colete a assinatura ou registre a recusa.");
  } else if (assinatura.tipo === "assinada") {
    const faltas = faltasDaAssinatura(assinatura);
    if (faltas.length) erros.push(`Falta ${faltas.join(", ")}.`);
  }
  return erros;
}
