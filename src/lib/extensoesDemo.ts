// Ponto de encaixe do modo demonstração. O layout raiz registra aqui os componentes de src/demo quando
// EXPO_PUBLIC_MOCK=true; as telas só consultam este registro e nunca importam src/demo (princípio VI).

import type { ComponentType } from "react";

export type PropsPainelQr = { clienteId: string; aoLer: (texto: string) => void };

type Extensoes = {
  MenuDemo: ComponentType | null;
  PainelQr: ComponentType<PropsPainelQr> | null;
  restaurar: (() => void) | null;
};

export const extensoesDemo: Extensoes = { MenuDemo: null, PainelQr: null, restaurar: null };

export function registrarDemo(e: Partial<Extensoes>): void {
  Object.assign(extensoesDemo, e);
}

export const modoDemonstracao = process.env.EXPO_PUBLIC_MOCK === "true";
