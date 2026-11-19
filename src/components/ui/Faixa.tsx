// Faixa de aviso dentro da tela (neutra, com ícone colorido).
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export function Faixa({
  texto,
  icone: Icone,
  tom = "neutro",
  titulo,
}: {
  texto: string;
  icone?: LucideIcon;
  tom?: "neutro" | "sucesso" | "aviso" | "perigo";
  titulo?: string;
}) {
  const { cores } = useTema();
  const cor = { neutro: cores.textoSuave, sucesso: cores.sucesso, aviso: cores.aviso, perigo: cores.perigo }[tom];
  return (
    <View
      accessibilityRole="alert"
      style={[estilos.faixa, { backgroundColor: cores.suave, borderColor: tom === "neutro" ? cores.borda : cor }]}
    >
      {Icone ? <Icone size={20} color={cor} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {titulo ? <Texto variante="rotulo">{titulo}</Texto> : null}
        <Texto variante="pequeno">{texto}</Texto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.medio,
    borderWidth: 1,
  },
});
