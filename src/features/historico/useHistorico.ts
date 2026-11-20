// Histórico do motorista: coletas finalizadas e não coletas, agrupadas por dia (mais recente primeiro).
import { useMemo } from "react";

import { useBanco } from "@/dados/repositorio";
import type { Coleta, NaoColeta } from "@/dados/tipos";
import { useSessao } from "@/features/sessao/useSessao";

export type RegistroHistorico =
  | { tipo: "coleta"; id: string; paradaId: string; clienteId: string; em: string; coleta: Coleta; enviado: boolean }
  | { tipo: "naoColeta"; id: string; paradaId: string; clienteId: string; em: string; naoColeta: NaoColeta; enviado: boolean };

export type DiaHistorico = { data: string; rota: string; registros: RegistroHistorico[] };

export function useHistorico(): DiaHistorico[] {
  const motoristaId = useSessao((s) => s.motoristaId);
  const rotas = useBanco((b) => b.rotas);
  const coletas = useBanco((b) => b.coletas);
  const naoColetas = useBanco((b) => b.naoColetas);
  const fila = useBanco((b) => b.fila);

  return useMemo(() => {
    // Item que nunca passou pela fila (histórico dos dados de exemplo) conta como enviado.
    const naFila = new Map(fila.map((i) => [i.id, i.situacao]));
    const enviado = (id: string) => (naFila.get(id) ?? "enviado") === "enviado";
    return rotas
      .filter((r) => r.motoristaId === motoristaId)
      .sort((a, b) => b.data.localeCompare(a.data))
      .map((rota) => {
        const registros: RegistroHistorico[] = [];
        for (const p of rota.paradas) {
          if (!p.registroId) continue;
          const c = coletas[p.registroId];
          const n = naoColetas[p.registroId];
          if (c?.situacao === "finalizada") {
            registros.push({ tipo: "coleta", id: c.id, paradaId: p.id, clienteId: p.clienteId, em: c.finalizadaEm ?? c.iniciadaEm, coleta: c, enviado: enviado(c.id) });
          } else if (n) {
            registros.push({ tipo: "naoColeta", id: n.id, paradaId: p.id, clienteId: p.clienteId, em: n.em, naoColeta: n, enviado: enviado(n.id) });
          }
        }
        registros.sort((a, b) => b.em.localeCompare(a.em));
        return { data: rota.data, rota: `${rota.codigo} · ${rota.regiao}`, registros };
      })
      .filter((d) => d.registros.length > 0);
  }, [motoristaId, rotas, coletas, naoColetas, fila]);
}
