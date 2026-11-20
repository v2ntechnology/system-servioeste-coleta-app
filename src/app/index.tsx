import { router } from "expo-router";
import { History, ListChecks, Play, Route, Settings } from "lucide-react-native";
import { View } from "react-native";

import { FaixaSincronizacao } from "@/components/FaixaSincronizacao";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Simbolo } from "@/components/ui/Logo";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useJornada } from "@/features/jornada/useJornada";
import { useMotorista } from "@/features/sessao/useSessao";
import { data, diaDaSemana, primeiroNome } from "@/lib/formato";
import { paradasEmAberto } from "@/regras/ordem";
import { espaco } from "@/tema/tokens";

export default function Inicio() {
  const motorista = useMotorista();
  const jornada = useJornada();
  const rota = jornada?.rota;

  const botao = !rota ? null : rota.situacao === "liberada" ? (
    <Botao titulo="Iniciar jornada" icone={Play} aoTocar={() => router.push("/jornada")} testID="botao-iniciar-jornada" />
  ) : rota.situacao === "emAndamento" ? (
    <Botao titulo="Continuar rota" icone={Route} aoTocar={() => router.push("/rota")} testID="botao-continuar-rota" />
  ) : (
    <Botao titulo="Ver resumo do dia" icone={ListChecks} variante="secundario" aoTocar={() => router.push("/encerrar")} />
  );

  return (
    <Tela rodape={botao} topo={<FaixaSincronizacao />}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md, marginBottom: espaco.sm }}>
        <Simbolo tamanho={40} />
        <View style={{ flex: 1, gap: espaco.xs }}>
          <Texto variante="titulo">Olá, {primeiroNome(motorista?.nome ?? "")}!</Texto>
          <Texto suave>
            Bom trabalho hoje · {diaDaSemana(new Date())}, {data(new Date())}
          </Texto>
        </View>
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

      {rota?.situacao === "encerrada" ? (
        <Faixa titulo="Rota de hoje encerrada" texto="Bom descanso! A próxima jornada aparece aqui quando o escritório liberar a rota." />
      ) : null}

      <ItemLista titulo="Histórico" descricao="Coletas e não coletas dos últimos dias" icone={History} aoTocar={() => router.push("/historico")} testID="atalho-historico" />
      <ItemLista titulo="Configurações" descricao="Tema, conta e demonstração" icone={Settings} aoTocar={() => router.push("/configuracoes")} />
    </Tela>
  );
}
