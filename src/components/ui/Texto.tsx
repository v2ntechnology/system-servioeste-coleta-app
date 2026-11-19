import { Text, type TextProps } from "react-native";

import { fonte } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Variante = "titulo" | "subtitulo" | "corpo" | "rotulo" | "pequeno" | "numero";

const ESTILOS: Record<Variante, { fontSize: number; fontFamily: string; lineHeight: number }> = {
  titulo: { fontSize: 24, fontFamily: fonte.forte, lineHeight: 30 },
  subtitulo: { fontSize: 18, fontFamily: fonte.media, lineHeight: 24 },
  corpo: { fontSize: 16, fontFamily: fonte.regular, lineHeight: 22 },
  rotulo: { fontSize: 13, fontFamily: fonte.media, lineHeight: 18 },
  pequeno: { fontSize: 13, fontFamily: fonte.regular, lineHeight: 18 },
  numero: { fontSize: 40, fontFamily: fonte.forte, lineHeight: 46 },
};

export function Texto({
  variante = "corpo",
  suave,
  cor,
  style,
  ...props
}: TextProps & { variante?: Variante; suave?: boolean; cor?: string }) {
  const { cores } = useTema();
  return (
    <Text
      {...props}
      style={[ESTILOS[variante], { color: cor ?? (suave ? cores.textoSuave : cores.texto) }, style]}
    />
  );
}
