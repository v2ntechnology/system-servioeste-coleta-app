// Paradas da rota, detalhe de cada uma e mudança de ordem.
import { useMemo } from "react";

import { useBanco } from "@/dados/repositorio";
import type { Cliente, Coleta, MotivoMudancaDeOrdem, NaoColeta, Parada, Rota, TipoResiduo } from "@/dados/tipos";
import type { TomSelo } from "@/components/ui/Selo";
import { podeIniciar, proximaParada, type PodeIniciar } from "@/regras/ordem";

export type DetalheParada = {
  rota: Rota;
  parada: Parada;
  cliente: Cliente;
  residuos: TipoResiduo[];
  coleta?: Coleta;
  naoColeta?: NaoColeta;
  proxima?: Parada;
  pode: PodeIniciar;
  /** O motorista já registrou o motivo de atender esta parada fora da ordem? */
  mudancaRegistrada: boolean;
};

export function useClientes(): Record<string, Cliente> {
  const clientes = useBanco((b) => b.clientes);
  return useMemo(() => Object.fromEntries(clientes.map((c) => [c.id, c])), [clientes]);
}

export function useTiposResiduo(): Record<string, TipoResiduo> {
  const tipos = useBanco((b) => b.tiposResiduo);
  return useMemo(() => Object.fromEntries(tipos.map((t) => [t.id, t])), [tipos]);
}

/** Procura a parada em qualquer rota (hoje e histórico). */
export function useParada(paradaId: string | undefined): DetalheParada | null {
  const rotas = useBanco((b) => b.rotas);
  const coletas = useBanco((b) => b.coletas);
  const naoColetas = useBanco((b) => b.naoColetas);
  const mudancas = useBanco((b) => b.mudancas);
  const clientes = useClientes();
  const tipos = useTiposResiduo();

  return useMemo(() => {
    if (!paradaId) return null;
    const rota = rotas.find((r) => r.paradas.some((p) => p.id === paradaId));
    const parada = rota?.paradas.find((p) => p.id === paradaId);
    const cliente = parada ? clientes[parada.clienteId] : undefined;
    if (!rota || !parada || !cliente) return null;
    const registro = parada.registroId;
    return {
      rota,
      parada,
      cliente,
      residuos: cliente.residuos.map((id) => tipos[id]).filter(Boolean),
      coleta: registro ? coletas[registro] : undefined,
      naoColeta: registro ? naoColetas[registro] : undefined,
      proxima: proximaParada(rota),
      pode: podeIniciar(rota, paradaId),
      mudancaRegistrada: mudancas.some((m) => m.rotaId === rota.id && m.paradaAtendidaId === paradaId),
    };
  }, [paradaId, rotas, coletas, naoColetas, mudancas, clientes, tipos]);
}

export function registrarMudancaDeOrdem(
  rota: Rota,
  pulada: Parada,
  atendida: Parada,
  motivo: MotivoMudancaDeOrdem,
  texto?: string,
): void {
  useBanco.getState().registrarMudancaDeOrdem({
    rotaId: rota.id,
    paradaPuladaId: pulada.id,
    paradaAtendidaId: atendida.id,
    motivo,
    texto,
  });
}

/** Situação para mostrar no selo: revisão tem prioridade sobre "coletada". */
export function seloDaParada(parada: Parada, coleta?: Coleta): { texto: string; tom: TomSelo } {
  if (parada.situacao === "coletada" && coleta?.revisao.length) return { texto: "Para revisão", tom: "aviso" };
  switch (parada.situacao) {
    case "coletada":
      return { texto: "Coletada", tom: "sucesso" };
    case "naoColetada":
      return { texto: "Não coletada", tom: "perigo" };
    case "emAndamento":
      return { texto: "Em andamento", tom: "andamento" };
    default:
      return { texto: "Pendente", tom: "neutro" };
  }
}
