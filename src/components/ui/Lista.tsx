// Linha de lista com ícone, textos e conteúdo à direita.
import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { alvo, espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props = {
  titulo: string;
  descricao?: string;
  icone?: LucideIcon;
  direita?: ReactNode;
  aoTocar?: () => void;
  selecionado?: boolean;
  testID?: string;
};

export function ItemLista({ titulo, descricao, icone: Icone, direita, aoTocar, selecionado, testID }: Props) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={!aoTocar}
      accessibilityRole={aoTocar ? "button" : undefined}
      accessibilityLabel={titulo}
      style={({ pressed }) => [
        estilos.item,
        {
          backgroundColor: cores.cartao,
          borderColor: selecionado ? cores.marca : cores.borda,
          borderWidth: selecionado ? 2 : 1,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {Icone ? (
        <View style={[estilos.icone, { backgroundColor: cores.suave }]}>
          <Icone size={22} color={selecionado ? cores.marca : cores.texto} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Texto variante="subtitulo" style={{ fontSize: 16 }}>
          {titulo}
        </Texto>
        {descricao ? (
          <Texto variante="pequeno" suave>
            {descricao}
          </Texto>
        ) : null}
      </View>
      {direita}
      {aoTocar && !direita ? <ChevronRight size={20} color={cores.textoSuave} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md,
    padding: espaco.md,
    borderRadius: raio.grande,
    minHeight: alvo.principal + 8,
  },
  icone: { width: 44, height: 44, borderRadius: raio.medio, alignItems: "center", justifyContent: "center" },
});
