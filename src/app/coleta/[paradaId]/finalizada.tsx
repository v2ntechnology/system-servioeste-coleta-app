import { Redirect, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { CircleCheck, Cloud, CloudOff, FileCheck, Lock, Printer, Smartphone, TriangleAlert } from "lucide-react-native";
import { useCallback } from "react";
import { BackHandler, View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { TEXTO_MOTIVO_REVISAO } from "@/dados/tipos";
import { useBanco } from "@/dados/repositorio";
import { useParada } from "@/features/rota/useRota";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

const voltarParaRota = () => router.dismissTo("/rota");

export default function ColetaFinalizada() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const { cores } = useTema();
  const detalhe = useParada(paradaId);
  const fila = useBanco((b) => b.fila);

  // O botão Voltar do Android leva para a rota, nunca de volta à assinatura.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        voltarParaRota();
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  const coleta = detalhe?.coleta;
  if (!detalhe || !coleta || coleta.situacao !== "finalizada") return <Redirect href="/rota" />;
  const envio = fila.find((i) => i.id === coleta.id);
  const enviado = envio?.situacao === "enviado";

  return (
    <Tela
      rodape={
        <>
          <Botao titulo="Ver comprovante" icone={FileCheck} aoTocar={() => router.push(`/comprovante/${coleta.id}`)} testID="botao-ver-comprovante" />
          <Botao titulo="Voltar para a rota" variante="secundario" aoTocar={voltarParaRota} testID="botao-voltar-rota" />
        </>
      }
    >
      <View style={{ alignItems: "center", gap: espaco.sm, marginVertical: espaco.lg }}>
        <CircleCheck size={64} color={cores.sucesso} />
        <Texto variante="titulo" style={{ textAlign: "center" }}>
          Coleta finalizada com sucesso!
        </Texto>
        <Texto suave>{detalhe.cliente.nome}</Texto>
      </View>

      {coleta.revisao.map((r) => (
        <Faixa key={r.motivo} tom="aviso" icone={TriangleAlert} titulo="Para revisão do escritório" texto={TEXTO_MOTIVO_REVISAO[r.motivo]} />
      ))}

      <ItemLista icone={Lock} titulo="Registro bloqueado" descricao="A coleta não pode mais ser alterada." />
      <ItemLista icone={FileCheck} titulo="Comprovante gerado" descricao={`Nº ${coleta.comprovanteNumero}`} />
      <ItemLista icone={Printer} titulo="2 vias prontas para impressão" descricao="Impressão simulada nesta fase (demonstração)." />
      <ItemLista icone={Smartphone} titulo="Dados salvos no dispositivo" descricao="Guardados mesmo sem internet." />
      <ItemLista
        icone={enviado ? Cloud : CloudOff}
        titulo={enviado ? "Enviado ao sistema" : "Aguardando envio ao sistema"}
        descricao={enviado ? "Sincronizado." : "Será enviado sozinho quando houver conexão."}
      />
    </Tela>
  );
}
