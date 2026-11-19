// Leitor do QR Code do cliente (research.md D5). Pede a câmera na hora e explica para que serve.
import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera } from "lucide-react-native";
import { useRef } from "react";
import { Linking, StyleSheet, View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Texto } from "@/components/ui/Texto";
import { raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

/** Intervalo mínimo entre duas leituras (a câmera repete o mesmo código várias vezes por segundo). */
const INTERVALO_MS = 1500;

export function LeitorQr({ aoLer, pausado }: { aoLer: (texto: string) => void; pausado?: boolean }) {
  const { cores } = useTema();
  const [permissao, pedir] = useCameraPermissions();
  const ultima = useRef(0);

  if (!permissao) {
    return (
      <Cartao>
        <Texto suave>Preparando a câmera…</Texto>
      </Cartao>
    );
  }

  if (!permissao.granted) {
    return (
      <Cartao>
        <Texto variante="subtitulo">Câmera necessária</Texto>
        <Texto suave>
          A câmera é usada para ler o QR Code que o cliente mostra no celular dele, provando que a coleta foi feita no
          local.
        </Texto>
        {permissao.canAskAgain ? (
          <Botao titulo="Permitir a câmera" icone={Camera} aoTocar={() => void pedir()} />
        ) : (
          <>
            <Texto variante="pequeno" suave>
              A permissão foi negada. Libere a câmera para o app nas configurações do celular.
            </Texto>
            <Botao titulo="Abrir configurações" variante="secundario" aoTocar={() => void Linking.openSettings()} />
          </>
        )}
      </Cartao>
    );
  }

  return (
    <View style={[estilos.moldura, { borderColor: cores.borda }]}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          pausado
            ? undefined
            : ({ data }) => {
                const agora = Date.now();
                if (agora - ultima.current < INTERVALO_MS) return;
                ultima.current = agora;
                aoLer(data);
              }
        }
      />
      <View pointerEvents="none" style={[estilos.mira, { borderColor: cores.marca }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  moldura: { width: "100%", aspectRatio: 1, maxWidth: 360, alignSelf: "center", borderRadius: raio.enorme, overflow: "hidden", borderWidth: 1, backgroundColor: "#000" },
  mira: { position: "absolute", top: "18%", left: "18%", right: "18%", bottom: "18%", borderWidth: 3, borderRadius: raio.grande },
});
