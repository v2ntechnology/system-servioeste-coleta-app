import { SvgXml } from "react-native-svg";

import { LOGO_SVG } from "@/tema/logo";

/** Logo da Servioeste (proporção 14644 × 2342). */
export function Logo({ largura = 220 }: { largura?: number }) {
  return <SvgXml xml={LOGO_SVG} width={largura} height={(largura * 2342.26) / 14644.36} accessibilityLabel="Servioeste" />;
}
