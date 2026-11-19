import { Redirect, router } from "expo-router";
import { Calendar, Truck, User, Users } from "lucide-react-native";

import { Botao } from "@/components/ui/Botao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { iniciarJornada, useJornada } from "@/features/jornada/useJornada";
import { data, diaDaSemana } from "@/lib/formato";

export default function DadosDaJornada() {
  const jornada = useJornada();
  if (!jornada) return <Redirect href="/" />;
  const { rota, veiculo, motorista, coletores } = jornada;

  const iniciar = () => {
    iniciarJornada(rota.id);
    router.replace("/rota");
  };

  return (
    <Tela rodape={<Botao titulo="Iniciar rota" aoTocar={iniciar} testID="botao-iniciar-rota" />}>
      <Texto suave>Confira os dados do dia antes de sair.</Texto>
      <ItemLista icone={Truck} titulo={veiculo?.placa ?? "—"} descricao={`Veículo · ${veiculo?.descricao ?? ""}`} />
      <ItemLista icone={User} titulo={motorista?.nome ?? "—"} descricao="Motorista" />
      <ItemLista icone={Users} titulo={coletores.map((c) => c.nome).join(", ") || "—"} descricao="Coletor(es)" />
      <ItemLista icone={Calendar} titulo={data(rota.data + "T12:00:00-03:00")} descricao={`Data · ${diaDaSemana(rota.data + "T12:00:00-03:00")}`} />
      <Faixa texto="Os dados vêm da rota liberada pelo escritório. Se algo estiver errado, avise o escritório antes de iniciar." />
    </Tela>
  );
}
