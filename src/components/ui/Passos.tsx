// Indicador do passo da coleta (QR → resíduos → resumo → assinatura).
import { StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export const PASSOS_COLETA = ["QR Code", "Resíduos", "Resumo", "Assinatura"] as const;

export function Passos({ atual }: { atual: number }) {
  const { cores } = useTema();
  return (
    <View style={{ gap: espaco.xs }} accessibilityLabel={`Passo ${atual + 1} de ${PASSOS_COLETA.length}: ${PASSOS_COLETA[atual]}`}>
      <View style={estilos.linha}>
        {PASSOS_COLETA.map((p, i) => (
          <View key={p} style={[estilos.barra, { backgroundColor: i <= atual ? cores.marca : cores.borda }]} />
        ))}
      </View>
      <Texto variante="pequeno" suave>
        Passo {atual + 1} de {PASSOS_COLETA.length} · {PASSOS_COLETA[atual]}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: "row", gap: espaco.xs },
  barra: { flex: 1, height: 4, borderRadius: 2 },
});
