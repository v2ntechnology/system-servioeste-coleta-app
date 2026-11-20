// Resumo do dia ao encerrar a rota: coletas feitas, não feitas com o motivo e o total por tipo de resíduo.

import type { Coleta, NaoColeta, Rota, TipoResiduo } from "@/dados/tipos";
import { TEXTO_MOTIVO_NAO_COLETA } from "@/dados/tipos";
import { arredondar } from "@/regras/quantidade";

export type ResumoDoDia = {
  feitas: number;
  paraRevisao: number;
  naoFeitas: { paradaId: string; clienteId: string; motivo: string }[];
  totais: { tipoResiduoId: string; nome: string; unidade: TipoResiduo["unidade"]; total: number }[];
  emAberto: number;
};

export function resumoDoDia(
  rota: Rota,
  coletas: Record<string, Coleta>,
  naoColetas: Record<string, NaoColeta>,
  tipos: Record<string, TipoResiduo>,
): ResumoDoDia {
  let feitas = 0;
  let paraRevisao = 0;
  let emAberto = 0;
  const naoFeitas: ResumoDoDia["naoFeitas"] = [];
  const somas = new Map<string, number>();

  for (const parada of [...rota.paradas].sort((a, b) => a.ordem - b.ordem)) {
    if (parada.situacao === "pendente" || parada.situacao === "emAndamento") {
      emAberto++;
      continue;
    }
    if (parada.situacao === "naoColetada") {
      const n = parada.registroId ? naoColetas[parada.registroId] : undefined;
      naoFeitas.push({
        paradaId: parada.id,
        clienteId: parada.clienteId,
        motivo: n ? (n.motivo === "outro" ? (n.texto ?? "Outro") : TEXTO_MOTIVO_NAO_COLETA[n.motivo]) : "—",
      });
      continue;
    }
    const c = parada.registroId ? coletas[parada.registroId] : undefined;
    if (!c || c.situacao !== "finalizada") continue;
    feitas++;
    if (c.revisao.length) paraRevisao++;
    for (const item of c.itens) somas.set(item.tipoResiduoId, (somas.get(item.tipoResiduoId) ?? 0) + item.quantidade);
  }

  const totais = [...somas.entries()]
    .map(([tipoResiduoId, total]) => ({
      tipoResiduoId,
      nome: tipos[tipoResiduoId]?.nome ?? tipoResiduoId,
      unidade: tipos[tipoResiduoId]?.unidade ?? "KG",
      total: arredondar(total),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  return { feitas, paraRevisao, naoFeitas, totais, emAberto };
}

/** Pode encerrar a rota? Só com todas as paradas resolvidas. */
export function erroParaEncerrar(rota: Rota, emAberto: number): string | null {
  if (rota.situacao === "encerrada") return "Esta rota já foi encerrada.";
  if (rota.situacao !== "emAndamento") return "A jornada ainda não foi iniciada.";
  if (emAberto > 0) return `Ainda ${emAberto === 1 ? "falta 1 parada" : `faltam ${emAberto} paradas`} para resolver.`;
  return null;
}
