// Moldura de toda tela: área segura, rolagem sem barra visível e botões principais fixos no pé (princípio XI).
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props = {
  children: ReactNode;
  /** Botões fixos no pé da tela, ao alcance do polegar. */
  rodape?: ReactNode;
  /** Conteúdo acima da rolagem (ex.: faixa de sincronização). */
  topo?: ReactNode;
  rolar?: boolean;
};

export function Tela({ children, rodape, topo, rolar = true }: Props) {
  const { cores } = useTema();
  const corpo = rolar ? (
    <ScrollView
      contentContainerStyle={estilos.conteudo}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[estilos.conteudo, { flex: 1 }]}>{children}</View>
  );

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[estilos.tela, { backgroundColor: cores.fundo }]}>
      <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {topo}
        {corpo}
        {rodape ? <View style={[estilos.rodape, { borderTopColor: cores.borda, backgroundColor: cores.fundo }]}>{rodape}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: espaco.lg, gap: espaco.md, maxWidth: 640, width: "100%", alignSelf: "center" },
  rodape: {
    padding: espaco.lg,
    gap: espaco.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
});
