// Selo neutro com ponto colorido: a cor só indica a situação (princípio XI).
import { StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export type TomSelo = "neutro" | "sucesso" | "aviso" | "perigo" | "andamento";

export function Selo({ texto, tom = "neutro" }: { texto: string; tom?: TomSelo }) {
  const { cores } = useTema();
  const ponto = {
    neutro: cores.textoSuave,
    sucesso: cores.sucesso,
    aviso: cores.aviso,
    perigo: cores.perigo,
    andamento: cores.texto,
  }[tom];
  return (
    <View style={[estilos.selo, { backgroundColor: cores.suave, borderColor: cores.borda }]}>
      <View style={[estilos.ponto, { backgroundColor: ponto }]} />
      <Texto variante="rotulo">{texto}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  selo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.xs + 2,
    alignSelf: "flex-start",
    paddingHorizontal: espaco.sm + 2,
    paddingVertical: espaco.xs,
    borderRadius: raio.enorme,
    borderWidth: 1,
  },
  ponto: { width: 8, height: 8, borderRadius: 4 },
});
