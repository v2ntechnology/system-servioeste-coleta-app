import { router } from "expo-router";
import { CloudOff, Play, Route, Settings } from "lucide-react-native";
import { View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { useJornada } from "@/features/jornada/useJornada";
import { useMotorista } from "@/features/sessao/useSessao";
import { data, diaDaSemana, primeiroNome } from "@/lib/formato";
import { paradasEmAberto } from "@/regras/ordem";
import { pendentes } from "@/sincronizacao/fila";
import { espaco } from "@/tema/tokens";

export default function Inicio() {
  const motorista = useMotorista();
  const jornada = useJornada();
  const naFila = useBanco((b) => pendentes(b.fila).length);
  const rota = jornada?.rota;

  const botao = !rota ? null : rota.situacao === "liberada" ? (
    <Botao titulo="Iniciar jornada" icone={Play} aoTocar={() => router.push("/jornada")} testID="botao-iniciar-jornada" />
  ) : rota.situacao === "emAndamento" ? (
    <Botao titulo="Continuar rota" icone={Route} aoTocar={() => router.push("/rota")} testID="botao-continuar-rota" />
  ) : null;

  return (
    <Tela rodape={botao}>
      <View style={{ gap: espaco.xs, marginBottom: espaco.sm }}>
        <Texto variante="titulo">Olá, {primeiroNome(motorista?.nome ?? "")}!</Texto>
        <Texto suave>
          Bom trabalho hoje · {diaDaSemana(new Date())}, {data(new Date())}
        </Texto>
      </View>

      {rota ? (
        <Cartao>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Texto variante="subtitulo">
              {rota.codigo} · {rota.regiao}
            </Texto>
            <Selo
              texto={{ liberada: "Liberada", emAndamento: "Em andamento", encerrada: "Encerrada" }[rota.situacao]}
              tom={rota.situacao === "emAndamento" ? "andamento" : rota.situacao === "encerrada" ? "sucesso" : "neutro"}
            />
          </View>
          <Texto suave>
            {rota.paradas.length} paradas · {paradasEmAberto(rota)} em aberto · {jornada?.veiculo?.placa}
          </Texto>
        </Cartao>
      ) : (
        <Faixa
          titulo="Não há rota liberada para hoje"
          texto="Quando o escritório liberar a sua rota, ela aparece aqui."
        />
      )}

      {naFila > 0 ? (
        <Faixa
          icone={CloudOff}
          tom="aviso"
          texto={`${naFila} ${naFila === 1 ? "registro aguardando" : "registros aguardando"} envio. Eles estão guardados neste aparelho.`}
        />
      ) : null}

      <ItemLista titulo="Configurações" descricao="Tema, conta e demonstração" icone={Settings} aoTocar={() => router.push("/configuracoes")} />
    </Tela>
  );
}
