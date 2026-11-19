// Par "rótulo: valor" para telas de detalhe.
import { StyleSheet, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { espaco } from "@/tema/tokens";

export function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Texto variante="pequeno" suave style={{ width: 110 }}>
        {rotulo}
      </Texto>
      <Texto style={{ flex: 1 }}>{valor}</Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: "row", gap: espaco.md, alignItems: "flex-start" },
});
