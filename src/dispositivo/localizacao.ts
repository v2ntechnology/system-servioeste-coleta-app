// Localização no momento do registro (FR-013). Sem permissão ou sem sinal, devolve null.
// O modo demonstração troca o provedor: a posição vem da área do cliente e os interruptores simulam
// "fora da área" e "localização falsa" (research.md D8).

import * as Location from "expo-location";

import type { Cliente, Localizacao } from "@/dados/tipos";

const TEMPO_LIMITE_MS = 10_000;

function converter(p: Location.LocationObject): Localizacao {
  return {
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    precisao: p.coords.accuracy ?? null,
    mocked: p.mocked === true,
    em: new Date(p.timestamp).toISOString(),
  };
}

async function lerDoAparelho(): Promise<Localizacao | null> {
  try {
    const permissao = await Location.requestForegroundPermissionsAsync();
    if (permissao.status !== "granted") return null;
    const atual = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), TEMPO_LIMITE_MS)),
    ]);
    if (atual) return converter(atual);
    const ultima = await Location.getLastKnownPositionAsync();
    return ultima ? converter(ultima) : null;
  } catch {
    return null;
  }
}

type Provedor = (cliente: Cliente) => Promise<Localizacao | null>;

let provedor: Provedor = () => lerDoAparelho();

export function definirProvedorLocalizacao(p: Provedor): void {
  provedor = p;
}

/** Posição do aparelho no cliente (ou a simulada, no modo demonstração). */
export function lerLocalizacao(cliente: Cliente): Promise<Localizacao | null> {
  return provedor(cliente);
}
