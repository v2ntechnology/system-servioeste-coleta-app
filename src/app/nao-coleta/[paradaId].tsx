import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Ban } from "lucide-react-native";
import { useState } from "react";

import { EscolhaMotivo } from "@/components/EscolhaMotivo";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Faixa } from "@/components/ui/Faixa";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { TEXTO_MOTIVO_NAO_COLETA, type MotivoNaoColeta } from "@/dados/tipos";
import { registrarNaoColeta } from "@/features/coleta/useColeta";
import { useParada } from "@/features/rota/useRota";

export default function NaoFoiPossivelColetar() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const detalhe = useParada(paradaId);
  const [motivo, setMotivo] = useState<MotivoNaoColeta>();
  const [texto, setTexto] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroTexto, setErroTexto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Depois de registrar, a parada deixa de ser pendente: não redireciona enquanto a navegação acontece.
  if (!detalhe || detalhe.parada.situacao !== "pendente") return salvando ? null : <Redirect href={`/parada/${paradaId}`} />;

  const registrar = async () => {
    if (!motivo) {
      setErro("Escolha o motivo.");
      return;
    }
    if (motivo === "outro" && !texto.trim()) {
      setErroTexto("Escreva o motivo.");
      return;
    }
    setSalvando(true);
    try {
      await registrarNaoColeta({ rotaId: detalhe.rota.id, paradaId: detalhe.parada.id, motivo, texto, observacao });
      router.dismissTo("/rota");
    } catch (ex) {
      setErro((ex as Error).message);
      setSalvando(false);
    }
  };

  return (
    <Tela
      rodape={<Botao titulo="Registrar" icone={Ban} aoTocar={() => void registrar()} carregando={salvando} testID="botao-registrar" />}
    >
      <Texto variante="subtitulo">{detalhe.cliente.nome}</Texto>
      <Texto suave>Por que não foi possível coletar? A data, a hora e o local ficam registrados.</Texto>
      <EscolhaMotivo
        opcoes={TEXTO_MOTIVO_NAO_COLETA}
        valor={motivo}
        aoEscolher={(m) => {
          setMotivo(m);
          setErro(null);
          setErroTexto(null);
        }}
        texto={texto}
        aoMudarTexto={(t) => {
          setTexto(t);
          setErroTexto(null);
        }}
        erroTexto={erroTexto}
      />
      <CampoTexto rotulo="Observação (opcional)" value={observacao} onChangeText={setObservacao} multiline testID="campo-observacao" />
      {erro ? <Faixa tom="perigo" texto={erro} /> : null}
    </Tela>
  );
}
