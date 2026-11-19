import { Biohazard, FlaskConical, Package, Recycle, Syringe, type LucideIcon } from "lucide-react-native";

import type { TipoResiduo } from "@/dados/tipos";

/** Ícone por classificação do resíduo. */
export function iconeResiduo(tipo: TipoResiduo): LucideIcon {
  const c = tipo.classificacao.toLowerCase();
  if (c.includes("biol")) return Biohazard;
  if (c.includes("quím") || c.includes("quim")) return FlaskConical;
  if (c.includes("perfuro")) return Syringe;
  if (c.includes("comum") || c.includes("recicl")) return Recycle;
  return Package;
}
