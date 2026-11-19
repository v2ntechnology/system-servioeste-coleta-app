// Ordem das paradas (spec 001, decisão de 2026-11-19): o motorista segue a ordem da rota.
// Atender outra antes da próxima exige o motivo da mudança; a parada pulada continua pendente.

import type { MotivoMudancaDeOrdem, Parada, Rota } from "@/dados/tipos";

/** A parada em andamento, se houver (só pode haver uma por vez). */
export function paradaEmAndamento(rota: Rota): Parada | undefined {
  return rota.paradas.find((p) => p.situacao === "emAndamento");
}

/** A próxima da ordem: a pendente de menor `ordem`. */
export function proximaParada(rota: Rota): Parada | undefined {
  return [...rota.paradas].filter((p) => p.situacao === "pendente").sort((a, b) => a.ordem - b.ordem)[0];
}

export type PodeIniciar =
  | { pode: true; exigeMotivo: false }
  | { pode: true; exigeMotivo: true; proxima: Parada }
  | { pode: false; motivo: string };

/** Pode iniciar a coleta (ou registrar a não coleta) nesta parada? */
export function podeIniciar(rota: Rota, paradaId: string): PodeIniciar {
  if (rota.situacao !== "emAndamento") return { pode: false, motivo: "A jornada ainda não foi iniciada." };
  const parada = rota.paradas.find((p) => p.id === paradaId);
  if (!parada) return { pode: false, motivo: "Parada não encontrada nesta rota." };
  if (parada.situacao === "coletada" || parada.situacao === "naoColetada") {
    return { pode: false, motivo: "Esta parada já foi resolvida." };
  }
  const andamento = paradaEmAndamento(rota);
  if (andamento && andamento.id !== paradaId) {
    return { pode: false, motivo: `Termine ou cancele antes a coleta da parada ${andamento.ordem}.` };
  }
  if (parada.situacao === "emAndamento") return { pode: true, exigeMotivo: false };
  const proxima = proximaParada(rota);
  if (!proxima || proxima.id === paradaId) return { pode: true, exigeMotivo: false };
  return { pode: true, exigeMotivo: true, proxima };
}

/** Valida o motivo da mudança de ordem: texto obrigatório se "outro". */
export function validarMotivoMudanca(motivo: MotivoMudancaDeOrdem | undefined, texto?: string): string | null {
  if (!motivo) return "Escolha o motivo da mudança de ordem.";
  if (motivo === "outro" && !texto?.trim()) return "Escreva o motivo.";
  return null;
}

/** Quantas paradas ainda não foram resolvidas (pendentes ou em andamento). */
export function paradasEmAberto(rota: Rota): number {
  return rota.paradas.filter((p) => p.situacao === "pendente" || p.situacao === "emAndamento").length;
}
