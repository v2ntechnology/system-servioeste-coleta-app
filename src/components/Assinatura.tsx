// Assinatura na tela (research.md D6): traço em SVG com PanResponder, funciona no Expo Go e no navegador.
// O valor é um caminho SVG normalizado para a caixa 300 × 150, usado também no comprovante.
import { Eraser } from "lucide-react-native";
import { useMemo, useState } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Botao } from "@/components/ui/Botao";
import { Texto } from "@/components/ui/Texto";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export const CAIXA_ASSINATURA = { largura: 300, altura: 150 };

type Props = { valor: string; aoMudar: (caminho: string) => void; desabilitado?: boolean };

export function Assinatura({ valor, aoMudar, desabilitado }: Props) {
  const { cores } = useTema();
  const [largura, setLargura] = useState(300);
  /** Traço em andamento (ainda não entregue ao `valor`). */
  const [atual, setAtual] = useState("");

  // Recriado quando o traço muda: os gestos sempre enxergam o valor, a escala e o traço atuais.
  // O responder segue a mesma View; recriá-lo no meio do gesto não interrompe o traço.
  const responder = useMemo(() => {
    const escala = CAIXA_ASSINATURA.largura / largura;
    const ponto = (x: number, y: number) => `${(x * escala).toFixed(1)} ${(y * escala).toFixed(1)}`;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => setAtual(`M${ponto(e.nativeEvent.locationX, e.nativeEvent.locationY)}`),
      onPanResponderMove: (e) => {
        const p = ponto(e.nativeEvent.locationX, e.nativeEvent.locationY);
        setAtual((a) => (a ? `${a} L${p}` : `M${p}`));
      },
      onPanResponderRelease: () => {
        if (atual.includes("L")) aoMudar(`${valor} ${atual}`.trim());
        setAtual("");
      },
    });
  }, [largura, valor, aoMudar, atual]);

  const aoMedir = (e: LayoutChangeEvent) => setLargura(e.nativeEvent.layout.width || 300);

  return (
    <View style={{ gap: espaco.sm }}>
      <View
        onLayout={aoMedir}
        pointerEvents={desabilitado ? "none" : "auto"}
        accessibilityLabel="Área para a assinatura do cliente"
        style={[
          estilos.area,
          { borderColor: cores.borda, backgroundColor: "#ffffff", height: largura / 2, opacity: desabilitado ? 0.4 : 1 },
        ]}
        {...responder.panHandlers}
      >
        <Svg pointerEvents="none" width="100%" height="100%" viewBox={`0 0 ${CAIXA_ASSINATURA.largura} ${CAIXA_ASSINATURA.altura}`}>
          <Path d={`${valor} ${atual}`.trim() || "M0 0"} stroke="#0a0a0a" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        {!valor && !atual ? (
          <View style={estilos.dica} pointerEvents="none">
            <Texto variante="pequeno" cor="#71717a">
              Assine aqui com o dedo
            </Texto>
          </View>
        ) : null}
      </View>
      <Botao titulo="Limpar" icone={Eraser} variante="fantasma" compacto aoTocar={() => aoMudar("")} desabilitado={!valor || desabilitado} />
    </View>
  );
}

const estilos = StyleSheet.create({
  area: { borderWidth: 1, borderRadius: raio.grande, overflow: "hidden" },
  dica: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
