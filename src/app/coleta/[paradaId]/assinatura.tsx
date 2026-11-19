import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Camera, CircleCheck } from "lucide-react-native";
import { useState } from "react";
import { Platform, Switch, View } from "react-native";

import { Assinatura } from "@/components/Assinatura";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Faixa } from "@/components/ui/Faixa";
import { Passos } from "@/components/ui/Passos";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import type { Assinatura as TipoAssinatura } from "@/dados/tipos";
import { acoesColeta, useColetaEmCurso } from "@/features/coleta/useColeta";
import { faltasDaAssinatura } from "@/regras/coleta";
import { espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export default function AssinaturaDoCliente() {
  const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
  const { cores } = useTema();
  const curso = useColetaEmCurso(paradaId);
  const [caminho, setCaminho] = useState("");
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [recusou, setRecusou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Depois de finalizar, a coleta deixa de ser rascunho: não redireciona enquanto a navegação acontece.
  if (!curso) return salvando ? null : <Redirect href={`/parada/${paradaId}`} />;
  const { coleta, cliente } = curso;

  const faltas = recusou ? [] : faltasDaAssinatura({ caminhoSvg: caminho, nome, fotoDocumentoUri: foto });

  const fotografar = async () => {
    setErro(null);
    if (Platform.OS !== "web") {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissao.granted) {
        setErro("Libere a câmera para fotografar o documento de quem assinou.");
        return;
      }
    }
    const r = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.5, allowsEditing: false });
    if (!r.canceled && r.assets[0]) setFoto(r.assets[0].uri);
  };

  const finalizar = async () => {
    const assinatura: TipoAssinatura = recusou
      ? { tipo: "recusada", nome: nome.trim() || undefined }
      : { tipo: "assinada", caminhoSvg: caminho, nome, fotoDocumentoUri: foto };
    setSalvando(true);
    try {
      await acoesColeta.finalizar(coleta.id, assinatura);
      router.replace(`/coleta/${paradaId}/finalizada`);
    } catch (ex) {
      setErro((ex as Error).message);
      setSalvando(false);
    }
  };

  return (
    <Tela
      rodape={
        <>
          {faltas.length ? (
            <Texto variante="pequeno" suave style={{ textAlign: "center" }}>
              Falta {faltas.join(", ")}.
            </Texto>
          ) : null}
          <Botao
            titulo="Finalizar coleta"
            icone={CircleCheck}
            aoTocar={() => void finalizar()}
            desabilitado={faltas.length > 0}
            carregando={salvando}
            testID="botao-finalizar"
          />
        </>
      }
    >
      <Passos atual={3} />
      <Texto variante="subtitulo">{cliente.nome}</Texto>
      <Texto suave>Peça ao responsável para assinar na tela.</Texto>

      <Assinatura valor={caminho} aoMudar={setCaminho} desabilitado={recusou} />

      <CampoTexto
        rotulo={recusou ? "Nome de quem recusou (opcional)" : "Nome de quem assinou"}
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
        testID="campo-nome"
      />

      {!recusou ? (
        <Cartao>
          <Texto variante="rotulo">Foto do documento de quem assinou</Texto>
          {foto ? (
            <Image
              source={{ uri: foto }}
              style={{ width: "100%", height: 160, borderRadius: raio.grande, backgroundColor: cores.suave }}
              contentFit="cover"
              accessibilityLabel="Foto do documento"
            />
          ) : (
            <Texto variante="pequeno" suave>
              RG, CNH ou crachá. A foto fica guardada junto com a coleta.
            </Texto>
          )}
          <Botao
            titulo={foto ? "Tirar outra foto" : "Fotografar documento"}
            icone={Camera}
            variante="secundario"
            compacto
            aoTocar={() => void fotografar()}
            testID="botao-foto"
          />
        </Cartao>
      ) : null}

      <Cartao>
        <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md, minHeight: 48 }}>
          <View style={{ flex: 1 }}>
            <Texto>Cliente recusou a assinatura</Texto>
            <Texto variante="pequeno" suave>
              A recusa fica registrada no comprovante.
            </Texto>
          </View>
          <Switch
            accessibilityLabel="Cliente recusou a assinatura"
            value={recusou}
            onValueChange={setRecusou}
            trackColor={{ true: cores.marca, false: cores.borda }}
            testID="interruptor-recusa"
          />
        </View>
      </Cartao>

      {erro ? <Faixa tom="perigo" texto={erro} /> : null}
    </Tela>
  );
}
