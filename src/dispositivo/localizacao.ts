// Localização no momento do registro (FR-013). Sem permissão ou sem sinal, devolve null.
// A cerca virtual e a revisão por GPS falso entram na história 7 (src/regras/cerca.ts).

import * as Location from "expo-location";

import type { Localizacao } from "@/dados/tipos";

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

export async function lerLocalizacao(): Promise<Localizacao | null> {
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
