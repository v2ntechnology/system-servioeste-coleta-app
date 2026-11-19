import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props = {
  children: ReactNode;
  aoTocar?: () => void;
  destaque?: boolean;
  style?: ViewStyle;
  testID?: string;
  rotulo?: string;
};

export function Cartao({ children, aoTocar, destaque, style, testID, rotulo }: Props) {
  const { cores } = useTema();
  const base = [
    estilos.cartao,
    { backgroundColor: cores.cartao, borderColor: destaque ? cores.marca : cores.borda, borderWidth: destaque ? 2 : 1 },
    style,
  ];
  if (!aoTocar) return <View style={base} testID={testID}>{children}</View>;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={aoTocar}
      style={({ pressed }) => [...base, { opacity: pressed ? 0.8 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderRadius: raio.grande, padding: espaco.lg, gap: espaco.sm, minHeight: 48 },
});
