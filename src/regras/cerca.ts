// Cerca virtual e localização falsa (princípio VIII): nunca bloqueiam, só marcam a coleta para revisão.

import type { Cliente, Localizacao, MotivoRevisao, Ponto } from "@/dados/tipos";

const RAIO_TERRA_M = 6_371_000;

/** Distância em metros entre dois pontos (haversine). */
export function distanciaMetros(a: Ponto, b: Ponto): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function dentroDaArea(ponto: Ponto, area: Cliente["area"]): boolean {
  return distanciaMetros(ponto, area) <= area.raioMetros;
}

/** Motivos de revisão a partir da localização lida ao finalizar. */
export function motivosDaLocalizacao(local: Localizacao | null, cliente: Cliente): MotivoRevisao[] {
  if (!local) return ["semLocalizacao"];
  const motivos: MotivoRevisao[] = [];
  if (local.mocked) motivos.push("localizacaoFalsa");
  if (!dentroDaArea(local, cliente.area)) motivos.push("foraDaArea");
  return motivos;
}
