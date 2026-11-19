import { Redirect, router, useLocalSearchParams } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useColetaEmCurso } from "@/features/coleta/useColeta";
import { quantidade } from "@/lib/formato";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export default function OutroResiduo() {
  const { paradaId, tipoId } = useLocalSearchParams<{ paradaId: string; tipoId?: string }>();
  const { cores } = useTema();
  const curso = useColetaEmCurso(paradaId);
  if (!curso) return <Redirect href={`/parada/${paradaId}`} />;
  const item = curso.coleta.itens.find((i) => i.tipoResiduoId === tipoId) ?? curso.coleta.itens.at(-1);
  const tipo = curso.residuos.find((t) => t.id === item?.tipoResiduoId);
  const faltam = curso.residuos.filter((t) => !curso.coleta.itens.some((i) => i.tipoResiduoId === t.id)).length;

  return (
    <Tela
      rodape={
        <>
          {faltam > 0 ? (
            <Botao titulo="Sim, adicionar outro" aoTocar={() => router.dismissTo(`/coleta/${paradaId}/residuos`)} testID="botao-outro-sim" />
          ) : null}
          <Botao
            titulo={faltam > 0 ? "Não, ver resumo" : "Ver resumo"}
            variante={faltam > 0 ? "secundario" : "principal"}
            aoTocar={() => router.replace(`/coleta/${paradaId}/resumo`)}
            testID="botao-outro-nao"
          />
        </>
      }
    >
      <View style={{ alignItems: "center", gap: espaco.md, marginVertical: espaco.xl }}>
        <CircleCheck size={56} color={cores.sucesso} />
        <Texto variante="subtitulo">Resíduo adicionado!</Texto>
      </View>
      {item && tipo ? (
        <Cartao>
          <Texto variante="titulo" style={{ textAlign: "center" }}>
            {tipo.nome} · {quantidade(item.quantidade)} {tipo.unidade}
          </Texto>
        </Cartao>
      ) : null}
      <Texto suave style={{ textAlign: "center" }}>
        {faltam > 0 ? "Deseja adicionar outro tipo de resíduo?" : "Todos os resíduos deste cliente já foram informados."}
      </Texto>
    </Tela>
  );
}
