import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Pencil, Plus, Trash2, TriangleAlert } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { Passos } from "@/components/ui/Passos";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { acoesColeta, useColetaEmCurso } from "@/features/coleta/useColeta";
import { useTiposResiduo } from "@/features/rota/useRota";
import { quantidade } from "@/lib/formato";
import { iconeResiduo } from "@/lib/iconeResiduo";
import { alvo, espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export default function Resumo() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const { cores } = useTema();
  const curso = useColetaEmCurso(paradaId);
  const tipos = useTiposResiduo();
  const [confirmar, setConfirmar] = useState(false);
  const [remover, setRemover] = useState<string | null>(null);
  if (!curso) return <Redirect href={`/parada/${paradaId}`} />;
  const { coleta, cliente, residuos } = curso;
  if (!coleta.prova.qr) return <Redirect href={`/coleta/${paradaId}/qr`} />;
  const faltam = residuos.some((t) => !coleta.itens.some((i) => i.tipoResiduoId === t.id));

  return (
    <Tela
      rodape={
        <Botao
          titulo="Confirmar e assinar"
          aoTocar={() => setConfirmar(true)}
          desabilitado={coleta.itens.length === 0}
          testID="botao-confirmar-assinar"
        />
      }
    >
      <Passos atual={2} />
      <Texto variante="subtitulo">{cliente.nome}</Texto>
      {coleta.prova.qr.resultado === "semQr" ? (
        <Faixa tom="aviso" icone={TriangleAlert} texto="Sem QR Code: esta coleta será marcada para revisão do escritório." />
      ) : null}
      {coleta.itens.length === 0 ? <Faixa texto="Nenhum resíduo informado ainda." /> : null}

      {coleta.itens.map((item) => {
        const tipo = tipos[item.tipoResiduoId];
        if (!tipo) return null;
        const Icone = iconeResiduo(tipo);
        return (
          <Cartao key={item.tipoResiduoId}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md }}>
              <Icone size={24} color={cores.texto} />
              <View style={{ flex: 1 }}>
                <Texto variante="subtitulo">{tipo.nome}</Texto>
                <Texto variante="pequeno" suave>
                  {tipo.classificacao}
                </Texto>
              </View>
              <Texto variante="subtitulo">
                {quantidade(item.quantidade)} {tipo.unidade}
              </Texto>
            </View>
            <View style={{ flexDirection: "row", gap: espaco.sm }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Editar ${tipo.nome}`}
                onPress={() => router.push(`/coleta/${paradaId}/quantidade/${tipo.id}?voltar=resumo`)}
                style={{ flexDirection: "row", gap: 6, alignItems: "center", minHeight: alvo.minimo, paddingRight: espaco.lg }}
              >
                <Pencil size={18} color={cores.texto} />
                <Texto variante="rotulo">Editar</Texto>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover ${tipo.nome}`}
                onPress={() => setRemover(tipo.id)}
                style={{ flexDirection: "row", gap: 6, alignItems: "center", minHeight: alvo.minimo }}
              >
                <Trash2 size={18} color={cores.perigo} />
                <Texto variante="rotulo" cor={cores.perigo}>
                  Remover
                </Texto>
              </Pressable>
            </View>
          </Cartao>
        );
      })}

      {faltam ? (
        <Botao
          titulo="Adicionar outro resíduo"
          icone={Plus}
          variante="fantasma"
          compacto
          aoTocar={() => router.dismissTo(`/coleta/${paradaId}/residuos`)}
        />
      ) : null}

      <Aviso
        visivel={confirmar}
        icone={TriangleAlert}
        tom="aviso"
        titulo="Confirmar e assinar esta coleta?"
        texto="Após a assinatura, não será possível alterar os resíduos e as quantidades."
        confirmar="Continuar"
        aoCancelar={() => setConfirmar(false)}
        aoConfirmar={() => {
          setConfirmar(false);
          router.push(`/coleta/${paradaId}/assinatura`);
        }}
      />
      <Aviso
        visivel={remover !== null}
        titulo="Remover este resíduo?"
        tom="perigo"
        confirmar="Remover"
        aoCancelar={() => setRemover(null)}
        aoConfirmar={() => {
          if (remover) acoesColeta.removerItem(coleta.id, remover);
          setRemover(null);
        }}
      />
    </Tela>
  );
}
