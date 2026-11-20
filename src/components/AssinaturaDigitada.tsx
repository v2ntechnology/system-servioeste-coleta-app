// Assinatura digitada: o nome aparece em cada fonte manuscrita e a pessoa escolhe a que prefere.
import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { FONTES_ASSINATURA, fonteAssinatura } from "@/tema/fontesAssinatura";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

/** O nome escrito na fonte escolhida, sempre em tinta preta sobre papel branco (como no comprovante). */
export function TextoAssinatura({ nome, fonte, escala = 1 }: { nome: string; fonte?: string; escala?: number }) {
  const f = fonteAssinatura(fonte);
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      style={{ fontFamily: f.familia, fontSize: f.tamanho * escala, color: "#0a0a0a", textAlign: "center", paddingHorizontal: 8 }}
    >
      {nome}
    </Text>
  );
}

type Props = { nome: string; fonte: string | undefined; aoEscolher: (id: string) => void; desabilitado?: boolean };

export function AssinaturaDigitada({ nome, fonte, aoEscolher, desabilitado }: Props) {
  const { cores } = useTema();
  const texto = nome.trim();

  if (!texto) {
    return (
      <View style={[estilos.vazio, { borderColor: cores.borda, backgroundColor: "#ffffff" }]}>
        <Texto variante="pequeno" cor="#71717a">
          Digite o nome abaixo para ver a assinatura
        </Texto>
      </View>
    );
  }

  return (
    <View style={{ gap: espaco.sm, opacity: desabilitado ? 0.4 : 1 }} accessibilityRole="radiogroup" accessibilityLabel="Estilo da assinatura">
      {FONTES_ASSINATURA.map((f) => {
        const escolhida = fonte === f.id;
        return (
          <Pressable
            key={f.id}
            disabled={desabilitado}
            accessibilityRole="radio"
            accessibilityState={{ selected: escolhida }}
            accessibilityLabel={`Assinatura no estilo ${f.nome}`}
            onPress={() => aoEscolher(f.id)}
            style={[
              estilos.opcao,
              { borderColor: escolhida ? cores.marca : cores.borda, borderWidth: escolhida ? 2 : 1 },
            ]}
            testID={`fonte-${f.id}`}
          >
            <View style={estilos.cabecalho}>
              <Texto variante="pequeno" cor="#71717a">
                {f.nome}
              </Texto>
              {escolhida ? <Check size={18} color={cores.marca} /> : null}
            </View>
            <TextoAssinatura nome={texto} fonte={f.id} />
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  vazio: { height: 120, borderWidth: 1, borderRadius: raio.grande, alignItems: "center", justifyContent: "center", borderStyle: "dashed" },
  opcao: { backgroundColor: "#ffffff", borderRadius: raio.grande, paddingVertical: espaco.sm, paddingHorizontal: espaco.md, minHeight: 88 },
  cabecalho: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 20 },
});
