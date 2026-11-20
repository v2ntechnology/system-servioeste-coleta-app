import { Redirect, router } from "expo-router";
import { Ban, CircleCheck, Flag, TriangleAlert } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";

import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { Linha } from "@/components/ui/Linha";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { useJornada } from "@/features/jornada/useJornada";
import { useClientes, useTiposResiduo } from "@/features/rota/useRota";
import { data, hora, quantidade } from "@/lib/formato";
import { processarFila } from "@/sincronizacao/fila";
import { erroParaEncerrar, resumoDoDia } from "@/regras/totais";
import { espaco } from "@/tema/tokens";

export default function EncerrarRota() {
  const jornada = useJornada();
  const coletas = useBanco((b) => b.coletas);
  const naoColetas = useBanco((b) => b.naoColetas);
  const clientes = useClientes();
  const tipos = useTiposResiduo();
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resumo = useMemo(
    () => (jornada ? resumoDoDia(jornada.rota, coletas, naoColetas, tipos) : null),
    [jornada, coletas, naoColetas, tipos],
  );
  if (!jornada || !resumo) return <Redirect href="/" />;
  const { rota } = jornada;
  const encerrada = rota.situacao === "encerrada";
  const impedimento = erroParaEncerrar(rota, resumo.emAberto);

  const encerrar = () => {
    setConfirmar(false);
    try {
      useBanco.getState().encerrarRota(rota.id);
      void processarFila();
      router.dismissTo("/");
    } catch (ex) {
      setErro((ex as Error).message);
    }
  };

  return (
    <Tela
      rodape={
        encerrada ? null : (
          <Botao titulo="Encerrar rota" icone={Flag} aoTocar={() => setConfirmar(true)} desabilitado={!!impedimento} testID="botao-encerrar" />
        )
      }
    >
      <View style={{ gap: 2 }}>
        <Texto variante="titulo">Resumo do dia</Texto>
        <Texto suave>
          {rota.codigo} · {rota.regiao} · {data(rota.data + "T12:00:00-03:00")}
          {rota.encerradaEm ? ` · encerrada às ${hora(rota.encerradaEm)}` : ""}
        </Texto>
      </View>

      {encerrada ? <Faixa icone={CircleCheck} tom="sucesso" titulo="Rota encerrada" texto="O resumo do dia foi registrado." /> : null}
      {!encerrada && impedimento ? <Faixa icone={TriangleAlert} tom="aviso" texto={impedimento} /> : null}
      {erro ? <Faixa tom="perigo" texto={erro} /> : null}

      <View style={{ flexDirection: "row", gap: espaco.sm }}>
        <Cartao style={{ flex: 1 }}>
          <Texto variante="pequeno" suave>Coletas feitas</Texto>
          <Texto variante="numero">{resumo.feitas}</Texto>
        </Cartao>
        <Cartao style={{ flex: 1 }}>
          <Texto variante="pequeno" suave>Não coletadas</Texto>
          <Texto variante="numero">{resumo.naoFeitas.length}</Texto>
        </Cartao>
      </View>
      {resumo.paraRevisao ? (
        <Faixa icone={TriangleAlert} tom="aviso" texto={`${resumo.paraRevisao} ${resumo.paraRevisao === 1 ? "coleta marcada" : "coletas marcadas"} para revisão do escritório.`} />
      ) : null}

      <Cartao>
        <Texto variante="rotulo">Total por tipo de resíduo</Texto>
        {resumo.totais.length ? (
          resumo.totais.map((t) => <Linha key={t.tipoResiduoId} rotulo={t.nome} valor={`${quantidade(t.total)} ${t.unidade}`} />)
        ) : (
          <Texto suave>Nenhum resíduo coletado.</Texto>
        )}
      </Cartao>

      {resumo.naoFeitas.length ? (
        <Cartao>
          <View style={{ flexDirection: "row", gap: espaco.sm, alignItems: "center" }}>
            <Ban size={16} color="#71717a" />
            <Texto variante="rotulo">Não coletadas e o motivo</Texto>
          </View>
          {resumo.naoFeitas.map((n) => (
            <Linha key={n.paradaId} rotulo={clientes[n.clienteId]?.nome ?? "Cliente"} valor={n.motivo} />
          ))}
        </Cartao>
      ) : null}

      <Aviso
        visivel={confirmar}
        icone={Flag}
        titulo="Encerrar a rota do dia?"
        texto="Depois de encerrada, a rota não recebe novas coletas. O resumo é enviado ao escritório."
        confirmar="Encerrar"
        aoCancelar={() => setConfirmar(false)}
        aoConfirmar={encerrar}
      />
    </Tela>
  );
}
