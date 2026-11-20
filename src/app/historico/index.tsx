import { router } from "expo-router";
import { Ban, CircleCheck, CloudOff, TriangleAlert } from "lucide-react-native";
import { View } from "react-native";

import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { TEXTO_MOTIVO_NAO_COLETA } from "@/dados/tipos";
import { useHistorico, type RegistroHistorico } from "@/features/historico/useHistorico";
import { useClientes } from "@/features/rota/useRota";
import { data, diaDaSemana, diaIso, hora } from "@/lib/formato";
import { espaco } from "@/tema/tokens";

function selo(r: RegistroHistorico) {
  if (r.tipo === "naoColeta") return <Selo texto="Não coletada" tom="perigo" />;
  if (r.coleta.revisao.length) return <Selo texto="Para revisão" tom="aviso" />;
  return <Selo texto="Coletada" tom="sucesso" />;
}

export default function Historico() {
  const dias = useHistorico();
  const clientes = useClientes();
  const hoje = diaIso(new Date());

  return (
    <Tela>
      {dias.length === 0 ? <Faixa texto="Nenhuma coleta registrada ainda." /> : null}
      {dias.map((dia) => {
        const quando = dia.data + "T12:00:00-03:00";
        return (
          <View key={dia.data} style={{ gap: espaco.sm, marginBottom: espaco.md }}>
            <View>
              <Texto variante="subtitulo">{dia.data === hoje ? "Hoje" : `${diaDaSemana(quando)}, ${data(quando)}`}</Texto>
              <Texto variante="pequeno" suave>
                {dia.rota} · {dia.registros.length} {dia.registros.length === 1 ? "registro" : "registros"}
              </Texto>
            </View>
            {dia.registros.map((r) => {
              const cliente = clientes[r.clienteId];
              const detalhe =
                r.tipo === "coleta"
                  ? `${hora(r.em)} · comprovante ${r.coleta.comprovanteNumero ?? "—"}`
                  : `${hora(r.em)} · ${r.naoColeta.motivo === "outro" ? (r.naoColeta.texto ?? "Outro") : TEXTO_MOTIVO_NAO_COLETA[r.naoColeta.motivo]}`;
              return (
                <ItemLista
                  key={r.id}
                  icone={r.tipo === "naoColeta" ? Ban : r.coleta.revisao.length ? TriangleAlert : CircleCheck}
                  titulo={cliente?.nome ?? "Cliente"}
                  descricao={r.enviado ? detalhe : `${detalhe} · aguardando envio`}
                  direita={
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      {selo(r)}
                      {!r.enviado ? <CloudOff size={14} color="#d97706" /> : null}
                    </View>
                  }
                  aoTocar={() => router.push(`/parada/${r.paradaId}`)}
                  testID={`historico-${r.id}`}
                />
              );
            })}
          </View>
        );
      })}
    </Tela>
  );
}
