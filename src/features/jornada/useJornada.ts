// Jornada do dia: a rota liberada para o motorista hoje, com veículo, coletor(es) e data.
import { useMemo } from "react";

import { useBanco } from "@/dados/repositorio";
import type { Pessoa, Rota, Veiculo } from "@/dados/tipos";
import { useSessao } from "@/features/sessao/useSessao";
import { diaIso } from "@/lib/formato";

export type Jornada = {
  rota: Rota;
  motorista: Pessoa | undefined;
  coletores: Pessoa[];
  veiculo: Veiculo | undefined;
};

/** A rota de hoje do motorista da sessão (cada motorista tem no máximo uma por dia). */
export function useJornada(): Jornada | null {
  const motoristaId = useSessao((s) => s.motoristaId);
  const rotas = useBanco((b) => b.rotas);
  const pessoas = useBanco((b) => b.pessoas);
  const veiculos = useBanco((b) => b.veiculos);

  return useMemo(() => {
    const hoje = diaIso(new Date());
    const rota = rotas.find((r) => r.motoristaId === motoristaId && r.data === hoje);
    if (!rota) return null;
    return {
      rota,
      motorista: pessoas.find((p) => p.id === rota.motoristaId),
      coletores: pessoas.filter((p) => rota.coletorIds.includes(p.id)),
      veiculo: veiculos.find((v) => v.id === rota.veiculoId),
    };
  }, [motoristaId, rotas, pessoas, veiculos]);
}

export function iniciarJornada(rotaId: string): void {
  useBanco.getState().iniciarJornada(rotaId);
}
