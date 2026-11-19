import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { alvo, espaco, fonte, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Variante = "principal" | "secundario" | "perigo" | "fantasma";

type Props = {
  titulo: string;
  aoTocar: () => void;
  variante?: Variante;
  icone?: LucideIcon;
  desabilitado?: boolean;
  carregando?: boolean;
  compacto?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Botao({ titulo, aoTocar, variante = "principal", icone: Icone, desabilitado, carregando, compacto, style, testID }: Props) {
  const { cores } = useTema();
  const fundo = {
    principal: cores.primario,
    secundario: cores.suave,
    perigo: cores.perigo,
    fantasma: "transparent",
  }[variante];
  const texto = {
    principal: cores.textoPrimario,
    secundario: cores.texto,
    perigo: "#ffffff",
    fantasma: cores.texto,
  }[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inativo }}
      accessibilityLabel={titulo}
      onPress={inativo ? undefined : aoTocar}
      style={({ pressed }) => [
        estilos.base,
        {
          minHeight: compacto ? alvo.minimo : alvo.principal,
          backgroundColor: fundo,
          borderColor: variante === "fantasma" ? cores.borda : fundo,
          opacity: inativo ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={texto} />
      ) : (
        <View style={estilos.conteudo}>
          {Icone ? <Icone size={20} color={texto} /> : null}
          <Texto variante="subtitulo" cor={texto} style={{ fontFamily: fonte.media, fontSize: compacto ? 15 : 17 }}>
            {titulo}
          </Texto>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: raio.grande,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: espaco.lg,
  },
  conteudo: { flexDirection: "row", alignItems: "center", gap: espaco.sm },
});
