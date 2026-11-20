// Faixa sempre visível no topo de Início, Rota e Parada: situação do envio dos registros (princípio IX).
import { router } from "expo-router";
import { ChevronRight, Cloud, CloudOff, RefreshCw, TriangleAlert } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { useConectado } from "@/sincronizacao/transporte";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export function useResumoSincronizacao() {
  const fila = useBanco((b) => b.fila);
  const conectado = useConectado();
  let aguardando = 0;
  let enviando = 0;
  let erros = 0;
  for (const i of fila) {
    if (i.situacao === "aguardando") aguardando++;
    else if (i.situacao === "enviando") enviando++;
    else if (i.situacao === "erro") erros++;
  }
  return { conectado, aguardando, enviando, erros, pendentes: aguardando + enviando + erros };
}

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

export function FaixaSincronizacao() {
  const { cores } = useTema();
  const { conectado, aguardando, enviando, erros, pendentes } = useResumoSincronizacao();

  let Icone = Cloud;
  let cor = cores.sucesso;
  let texto = "Tudo sincronizado";
  if (!conectado) {
    Icone = CloudOff;
    cor = cores.aviso;
    texto = pendentes
      ? `Sem conexão · ${plural(pendentes, "registro guardado", "registros guardados")} neste aparelho`
      : "Sem conexão: as coletas ficam guardadas neste aparelho";
  } else if (erros) {
    Icone = TriangleAlert;
    cor = cores.perigo;
    texto = `${plural(erros, "registro com erro", "registros com erro")} no envio`;
  } else if (enviando || aguardando) {
    Icone = RefreshCw;
    cor = cores.textoSuave;
    texto = enviando ? "Enviando…" : `${plural(aguardando, "registro aguardando", "registros aguardando")} envio`;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sincronização: ${texto}`}
      onPress={() => router.push("/sincronizacao")}
      style={[estilos.faixa, { backgroundColor: cores.suave, borderBottomColor: cores.borda }]}
      testID="faixa-sincronizacao"
    >
      <Icone size={16} color={cor} />
      <Texto variante="pequeno" style={{ flex: 1 }}>
        {texto}
      </Texto>
      <ChevronRight size={16} color={cores.textoSuave} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    paddingHorizontal: espaco.lg,
    minHeight: 40,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
