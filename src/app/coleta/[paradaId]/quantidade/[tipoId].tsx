import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Minus, Plus, TriangleAlert } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Faixa } from "@/components/ui/Faixa";
import { Passos } from "@/components/ui/Passos";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { acoesColeta, useColetaEmCurso } from "@/features/coleta/useColeta";
import { quantidade as fmtQuantidade } from "@/lib/formato";
import { arredondar, lerQuantidade, NOME_UNIDADE, passo, UNIDADE_DECIMAL, validarQuantidade } from "@/regras/quantidade";
import { alvo, espaco, fonte, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

export default function Quantidade() {
  const { paradaId, tipoId, voltar } = useLocalSearchParams<{ paradaId: string; tipoId: string; voltar?: string }>();
  const { cores } = useTema();
  const curso = useColetaEmCurso(paradaId);
  const existente = curso?.coleta.itens.find((i) => i.tipoResiduoId === tipoId);
  const [texto, setTexto] = useState(existente ? fmtQuantidade(existente.quantidade) : "");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarAlto, setConfirmarAlto] = useState(false);

  if (!curso) return <Redirect href={`/parada/${paradaId}`} />;
  const tipo = curso.residuos.find((t) => t.id === tipoId);
  if (!tipo) return <Redirect href={`/coleta/${paradaId}/residuos`} />;
  const habitual = curso.cliente.quantidadeHabitual[tipo.id];
  const decimal = UNIDADE_DECIMAL[tipo.unidade];

  const somar = (delta: number) => {
    const atual = lerQuantidade(texto) ?? 0;
    const novo = Math.max(0, arredondar(atual + delta));
    setTexto(novo === 0 ? "" : fmtQuantidade(novo));
    setErro(null);
  };

  const gravar = (valor: number) => {
    acoesColeta.salvarItem(curso.coleta.id, { tipoResiduoId: tipo.id, quantidade: valor });
    if (voltar === "resumo" || existente) router.dismissTo(`/coleta/${paradaId}/resumo`);
    else router.replace(`/coleta/${paradaId}/outro?tipoId=${tipo.id}`);
  };

  const adicionar = () => {
    const r = validarQuantidade(lerQuantidade(texto), tipo.unidade, habitual);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    if (r.acimaDoHabitual) {
      setConfirmarAlto(true);
      return;
    }
    gravar(r.valor);
  };

  return (
    <Tela rodape={<Botao titulo={existente ? "Salvar" : "Adicionar"} aoTocar={adicionar} testID="botao-adicionar" />}>
      <Passos atual={1} />
      <View style={{ gap: 2 }}>
        <Texto variante="titulo">{tipo.nome}</Texto>
        <Texto suave>
          {tipo.classificacao} · em {NOME_UNIDADE[tipo.unidade]}
        </Texto>
      </View>

      <View style={estilos.linha}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Diminuir"
          onPress={() => somar(-passo())}
          style={[estilos.botao, { backgroundColor: cores.suave, borderColor: cores.borda }]}
        >
          <Minus size={28} color={cores.texto} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <TextInput
            accessibilityLabel={`Quantidade em ${NOME_UNIDADE[tipo.unidade]}`}
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              setErro(null);
            }}
            keyboardType={decimal ? "decimal-pad" : "number-pad"}
            placeholder="0"
            placeholderTextColor={cores.textoSuave}
            style={[estilos.valor, { color: cores.texto, borderColor: erro ? cores.perigo : cores.borda }]}
            testID="campo-quantidade"
          />
          <Texto variante="subtitulo" suave>
            {tipo.unidade}
          </Texto>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar"
          onPress={() => somar(passo())}
          style={[estilos.botao, { backgroundColor: cores.primario, borderColor: cores.primario }]}
        >
          <Plus size={28} color={cores.textoPrimario} />
        </Pressable>
      </View>

      {erro ? <Faixa tom="perigo" texto={erro} /> : null}
      <Texto variante="pequeno" suave style={{ textAlign: "center" }}>
        {decimal ? "Pode usar vírgula, ex.: 12,80." : "Só números inteiros."}
        {habitual ? ` Média deste cliente: ${fmtQuantidade(habitual)} ${tipo.unidade}.` : ""}
      </Texto>

      <Aviso
        visivel={confirmarAlto}
        icone={TriangleAlert}
        tom="aviso"
        titulo="Quantidade muito acima do normal"
        texto={`Este cliente costuma gerar ${fmtQuantidade(habitual ?? 0)} ${tipo.unidade}. Confirme se ${texto} ${tipo.unidade} está correto.`}
        confirmar="Está correto"
        cancelar="Corrigir"
        aoCancelar={() => setConfirmarAlto(false)}
        aoConfirmar={() => {
          setConfirmarAlto(false);
          const v = lerQuantidade(texto);
          if (v !== null) gravar(arredondar(v));
        }}
      />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: "row", alignItems: "center", gap: espaco.md, marginVertical: espaco.xl },
  botao: { width: alvo.principal + 16, height: alvo.principal + 16, borderRadius: raio.enorme, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  valor: { fontFamily: fonte.forte, fontSize: 44, textAlign: "center", minWidth: 140, borderBottomWidth: 2, paddingVertical: espaco.sm },
});
