import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { alvo, espaco, fonte, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props = TextInputProps & { rotulo: string; erro?: string | null; ajuda?: string };

export function CampoTexto({ rotulo, erro, ajuda, style, multiline, ...props }: Props) {
  const { cores } = useTema();
  return (
    <View style={{ gap: espaco.xs }}>
      <Texto variante="rotulo">{rotulo}</Texto>
      <TextInput
        accessibilityLabel={rotulo}
        placeholderTextColor={cores.textoSuave}
        multiline={multiline}
        {...props}
        style={[
          estilos.campo,
          {
            color: cores.texto,
            backgroundColor: cores.cartao,
            borderColor: erro ? cores.perigo : cores.borda,
            minHeight: multiline ? 96 : alvo.principal,
            textAlignVertical: multiline ? "top" : "center",
          },
          style,
        ]}
      />
      {erro ? (
        <Texto variante="pequeno" cor={cores.perigo}>
          {erro}
        </Texto>
      ) : ajuda ? (
        <Texto variante="pequeno" suave>
          {ajuda}
        </Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: {
    borderWidth: 1,
    borderRadius: raio.grande,
    paddingHorizontal: espaco.lg,
    paddingVertical: espaco.md,
    fontSize: 17,
    fontFamily: fonte.regular,
  },
});
