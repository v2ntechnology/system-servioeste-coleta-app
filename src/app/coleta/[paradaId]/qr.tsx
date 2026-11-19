import { Redirect, router, useLocalSearchParams } from "expo-router";
import { CircleX, QrCode } from "lucide-react-native";
import { useState } from "react";

import { LeitorQr } from "@/components/LeitorQr";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Faixa } from "@/components/ui/Faixa";
import { Passos } from "@/components/ui/Passos";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { acoesColeta, useColetaEmCurso } from "@/features/coleta/useColeta";
import { extensoesDemo } from "@/lib/extensoesDemo";
import { conferirQr, MENSAGEM_QR, type ResultadoQr } from "@/regras/qr";

export default function LerQr() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const curso = useColetaEmCurso(paradaId);
  const clientes = useBanco((b) => b.clientes);
  const [resultado, setResultado] = useState<Exclude<ResultadoQr, "valido"> | null>(null);
  const [semQr, setSemQr] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [erroJustificativa, setErroJustificativa] = useState<string | null>(null);

  if (!curso) return <Redirect href={`/parada/${paradaId}`} />;
  const { coleta, cliente, rota } = curso;
  const PainelQr = extensoesDemo.PainelQr;

  const aoLer = (texto: string) => {
    // Segredos só dos clientes da rota do dia (contracts/qr-presenca.md).
    const daRota = new Set(rota.paradas.map((p) => p.clienteId));
    const segredos = Object.fromEntries(clientes.filter((c) => daRota.has(c.id)).map((c) => [c.id, c.segredoQr]));
    const r = conferirQr(texto, cliente.id, segredos);
    if (r !== "valido") {
      setResultado(r);
      return;
    }
    acoesColeta.registrarQr(coleta.id, { resultado: "valido", codigo: texto, lidoEm: new Date().toISOString() });
    router.replace(`/coleta/${paradaId}/residuos`);
  };

  const seguirSemQr = () => {
    if (!justificativa.trim()) {
      setErroJustificativa("Escreva por que o cliente não mostrou o QR Code.");
      return;
    }
    acoesColeta.registrarQr(coleta.id, { resultado: "semQr", justificativa: justificativa.trim(), em: new Date().toISOString() });
    setSemQr(false);
    router.replace(`/coleta/${paradaId}/residuos`);
  };

  return (
    <Tela rodape={<Botao titulo="Cliente sem QR Code" variante="secundario" aoTocar={() => setSemQr(true)} testID="botao-sem-qr" />}>
      <Passos atual={0} />
      <Texto variante="subtitulo">{cliente.nome}</Texto>
      <Texto suave>
        Peça ao cliente para abrir o link da Servioeste no celular e aponte a câmera para o QR Code que aparece na tela.
      </Texto>
      <LeitorQr aoLer={aoLer} pausado={semQr} />
      {resultado ? (
        <Faixa tom="perigo" icone={CircleX} texto={MENSAGEM_QR[resultado]} />
      ) : (
        <Faixa icone={QrCode} texto="O QR Code muda a cada minuto. Um print antigo não é aceito." />
      )}
      {PainelQr ? <PainelQr clienteId={cliente.id} aoLer={aoLer} /> : null}

      <Aviso
        visivel={semQr}
        titulo="Seguir sem o QR Code?"
        texto="A coleta será registrada e marcada para revisão do escritório."
        tom="aviso"
        confirmar="Seguir"
        aoCancelar={() => setSemQr(false)}
        aoConfirmar={seguirSemQr}
      >
        <CampoTexto
          rotulo="Justificativa"
          placeholder="Ex.: cliente sem celular no momento"
          value={justificativa}
          onChangeText={(t) => {
            setJustificativa(t);
            setErroJustificativa(null);
          }}
          erro={erroJustificativa}
          multiline
          testID="campo-justificativa"
        />
      </Aviso>
    </Tela>
  );
}
