import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ListChecks, TriangleAlert } from "lucide-react-native";

import { Botao } from "@/components/ui/Botao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Passos } from "@/components/ui/Passos";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useColetaEmCurso } from "@/features/coleta/useColeta";
import { quantidade } from "@/lib/formato";
import { iconeResiduo } from "@/lib/iconeResiduo";

export default function SelecionarResiduo() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const curso = useColetaEmCurso(paradaId);
  if (!curso) return <Redirect href={`/parada/${paradaId}`} />;
  const { coleta, cliente, residuos } = curso;
  if (!coleta.prova.qr) return <Redirect href={`/coleta/${paradaId}/qr`} />;

  return (
    <Tela
      rodape={
        coleta.itens.length ? (
          <Botao titulo="Ver resumo" icone={ListChecks} aoTocar={() => router.dismissTo(`/coleta/${paradaId}/resumo`)} testID="botao-ver-resumo" />
        ) : null
      }
    >
      <Passos atual={1} />
      <Texto variante="subtitulo">{cliente.nome}</Texto>
      {coleta.prova.qr.resultado === "semQr" ? (
        <Faixa tom="aviso" icone={TriangleAlert} texto="Sem QR Code: esta coleta será marcada para revisão do escritório." />
      ) : null}
      {residuos.map((tipo) => {
        const item = coleta.itens.find((i) => i.tipoResiduoId === tipo.id);
        return (
          <ItemLista
            key={tipo.id}
            icone={iconeResiduo(tipo)}
            titulo={tipo.nome}
            descricao={`${tipo.classificacao} · unidade ${tipo.unidade}`}
            selecionado={!!item}
            direita={item ? <Selo texto={`${quantidade(item.quantidade)} ${tipo.unidade}`} tom="sucesso" /> : undefined}
            aoTocar={() => router.push(`/coleta/${paradaId}/quantidade/${tipo.id}`)}
            testID={`residuo-${tipo.id}`}
          />
        );
      })}
      <Texto variante="pequeno" suave style={{ textAlign: "center" }}>
        Apenas os resíduos vinculados a este cliente são exibidos.
      </Texto>
    </Tela>
  );
}
