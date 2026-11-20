import { SvgXml } from "react-native-svg";

import { LOGO_SVG, SIMBOLO_SVG } from "@/tema/logo";

/** Logo da Servioeste, o mesmo do Hub e do Estoque (proporção 14644 × 2342). */
export function Logo({ largura = 220 }: { largura?: number }) {
  return <SvgXml xml={LOGO_SVG} width={largura} height={(largura * 2342.26) / 14644.36} accessibilityLabel="Servioeste" />;
}

/** Símbolo da Servioeste (o favicon do Hub e do Estoque), para espaços pequenos. */
export function Simbolo({ tamanho = 28 }: { tamanho?: number }) {
  return <SvgXml xml={SIMBOLO_SVG} width={tamanho} height={tamanho} accessibilityLabel="Servioeste" />;
}
