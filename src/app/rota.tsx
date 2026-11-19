import { Redirect, router } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { useJornada } from "@/features/jornada/useJornada";
import { seloDaParada, useClientes } from "@/features/rota/useRota";
import { data } from "@/lib/formato";
import { paradasEmAberto, proximaParada } from "@/regras/ordem";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export default function RotaDoDia() {
  const { cores } = useTema();
  const jornada = useJornada();
  const clientes = useClientes();
  const coletas = useBanco((b) => b.coletas);
  if (!jornada) return <Redirect href="/" />;
  const { rota } = jornada;
  if (rota.situacao === "liberada") return <Redirect href="/jornada" />;
  const proxima = proximaParada(rota);
  const emAberto = paradasEmAberto(rota);
  const paradas = [...rota.paradas].sort((a, b) => a.ordem - b.ordem);

  return (
    <Tela>
      <View style={{ gap: 2 }}>
        <Texto variante="titulo">
          {rota.codigo} · {rota.regiao}
        </Texto>
        <Texto suave>
          {data(rota.data + "T12:00:00-03:00")} · {rota.paradas.length} paradas · {emAberto} em aberto
        </Texto>
      </View>

      {emAberto === 0 ? (
        <Faixa icone={CircleCheck} tom="sucesso" titulo="Rota completa" texto="Todas as paradas foram resolvidas." />
      ) : null}

      {paradas.map((parada) => {
        const cliente = clientes[parada.clienteId];
        const selo = seloDaParada(parada, parada.registroId ? coletas[parada.registroId] : undefined);
        const eProxima = proxima?.id === parada.id;
        const resolvida = parada.situacao === "coletada" || parada.situacao === "naoColetada";
        return (
          <Cartao
            key={parada.id}
            destaque={eProxima || parada.situacao === "emAndamento"}
            aoTocar={() => router.push(`/parada/${parada.id}`)}
            rotulo={`Parada ${parada.ordem}, ${cliente?.nome}, ${selo.texto}`}
            testID={`parada-${parada.ordem}`}
          >
            <View style={estilos.linha}>
              <View
                style={[
                  estilos.numero,
                  { backgroundColor: resolvida ? cores.suave : cores.primario, borderColor: cores.borda },
                ]}
              >
                <Texto variante="subtitulo" cor={resolvida ? cores.textoSuave : cores.textoPrimario}>
                  {parada.ordem}
                </Texto>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Texto variante="subtitulo" style={{ fontSize: 16 }}>
                  {cliente?.nome ?? "Cliente"}
                </Texto>
                <Texto variante="pequeno" suave>
                  {cliente?.endereco.bairro} · {cliente?.endereco.logradouro}, {cliente?.endereco.numero}
                </Texto>
                <View style={{ flexDirection: "row", gap: espaco.sm, flexWrap: "wrap" }}>
                  <Selo texto={selo.texto} tom={selo.tom} />
                  {eProxima ? <Selo texto="Próxima" tom="andamento" /> : null}
                </View>
              </View>
            </View>
          </Cartao>
        );
      })}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: "row", gap: espaco.md, alignItems: "center" },
  numero: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
