// Confirmação em modal (ex.: "Após a assinatura, não será possível alterar").
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Texto } from "@/components/ui/Texto";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props = {
  visivel: boolean;
  titulo: string;
  texto?: string;
  icone?: LucideIcon;
  tom?: "neutro" | "aviso" | "perigo";
  confirmar: string;
  /** null = só o botão de confirmar (aviso informativo) */
  cancelar?: string | null;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  confirmarDesabilitado?: boolean;
  children?: ReactNode;
};

export function Aviso({
  visivel,
  titulo,
  texto,
  icone: Icone,
  tom = "neutro",
  confirmar,
  cancelar = "Cancelar",
  aoConfirmar,
  aoCancelar,
  confirmarDesabilitado,
  children,
}: Props) {
  const { cores } = useTema();
  const cor = { neutro: cores.texto, aviso: cores.aviso, perigo: cores.perigo }[tom];
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoCancelar}>
      <Pressable style={estilos.fundo} onPress={aoCancelar} accessibilityLabel="Fechar">
        <Pressable style={[estilos.caixa, { backgroundColor: cores.cartao, borderColor: cores.borda }]} onPress={() => {}}>
          {Icone ? (
            <View style={{ alignItems: "center" }}>
              <Icone size={40} color={cor} />
            </View>
          ) : null}
          <Texto variante="subtitulo" style={{ textAlign: Icone ? "center" : "left" }}>
            {titulo}
          </Texto>
          {texto ? (
            <Texto suave style={{ textAlign: Icone ? "center" : "left" }}>
              {texto}
            </Texto>
          ) : null}
          {children}
          <View style={estilos.botoes}>
            {cancelar !== null ? (
              <Botao titulo={cancelar} variante="secundario" aoTocar={aoCancelar} style={{ flex: 1 }} compacto />
            ) : null}
            <Botao
              titulo={confirmar}
              variante={tom === "perigo" ? "perigo" : "principal"}
              aoTocar={aoConfirmar}
              desabilitado={confirmarDesabilitado}
              style={{ flex: 1 }}
              compacto
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: espaco.xl },
  caixa: { borderRadius: raio.enorme, borderWidth: 1, padding: espaco.xl, gap: espaco.md, maxWidth: 480, width: "100%", alignSelf: "center" },
  botoes: { flexDirection: "row", gap: espaco.sm, marginTop: espaco.sm },
});
