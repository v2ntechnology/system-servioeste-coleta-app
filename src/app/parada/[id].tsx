import { Redirect, router, useLocalSearchParams } from "expo-router";
import { Ban, FileText, Lock, Play, TriangleAlert, X } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

import { EscolhaMotivo } from "@/components/EscolhaMotivo";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { Linha } from "@/components/ui/Linha";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { TEXTO_MOTIVO_MUDANCA, TEXTO_MOTIVO_NAO_COLETA, TEXTO_MOTIVO_REVISAO, type MotivoMudancaDeOrdem } from "@/dados/tipos";
import { acoesColeta } from "@/features/coleta/useColeta";
import { registrarMudancaDeOrdem, seloDaParada, useParada, useTiposResiduo } from "@/features/rota/useRota";
import { cep, cnpj, data, hora, quantidade } from "@/lib/formato";
import { validarMotivoMudanca } from "@/regras/ordem";
import { espaco } from "@/tema/tokens";

type Acao = "coletar" | "naoColetar";

export default function DetalheDaParada() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detalhe = useParada(id);
  const tipos = useTiposResiduo();
  const [acaoPendente, setAcaoPendente] = useState<Acao | null>(null);
  const [motivo, setMotivo] = useState<MotivoMudancaDeOrdem>();
  const [texto, setTexto] = useState("");
  const [erroMotivo, setErroMotivo] = useState<string | null>(null);
  const [cancelar, setCancelar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!detalhe) return <Redirect href="/rota" />;
  const { rota, parada, cliente, residuos, coleta, naoColeta, pode, proxima, mudancaRegistrada } = detalhe;
  const selo = seloDaParada(parada, coleta);
  const e = cliente.endereco;

  const seguir = (acao: Acao) => {
    setErro(null);
    try {
      if (acao === "naoColetar") {
        router.push(`/nao-coleta/${parada.id}`);
        return;
      }
      acoesColeta.iniciar(rota.id, parada.id);
      router.push(`/coleta/${parada.id}/qr`);
    } catch (ex) {
      setErro((ex as Error).message);
    }
  };

  const pedir = (acao: Acao) => {
    if (pode.pode && pode.exigeMotivo && !mudancaRegistrada) {
      setAcaoPendente(acao);
      return;
    }
    seguir(acao);
  };

  const confirmarMudanca = () => {
    const problema = validarMotivoMudanca(motivo, texto);
    if (problema || !motivo || !pode.pode || !pode.exigeMotivo) {
      setErroMotivo(problema);
      return;
    }
    registrarMudancaDeOrdem(rota, pode.proxima, parada, motivo, texto);
    const acao = acaoPendente!;
    setAcaoPendente(null);
    seguir(acao);
  };

  const continuar = () => {
    if (!coleta) return;
    if (!coleta.prova.qr) router.push(`/coleta/${parada.id}/qr`);
    else if (coleta.itens.length === 0) router.push(`/coleta/${parada.id}/residuos`);
    else router.push(`/coleta/${parada.id}/resumo`);
  };

  const resolvida = parada.situacao === "coletada" || parada.situacao === "naoColetada";
  const emAndamento = parada.situacao === "emAndamento";

  let rodape = null;
  if (resolvida && coleta) {
    rodape = <Botao titulo="Ver comprovante" icone={FileText} aoTocar={() => router.push(`/comprovante/${coleta.id}`)} />;
  } else if (emAndamento) {
    rodape = (
      <>
        <Botao titulo="Continuar coleta" icone={Play} aoTocar={continuar} testID="botao-continuar-coleta" />
        <Botao titulo="Cancelar coleta" icone={X} variante="fantasma" aoTocar={() => setCancelar(true)} />
      </>
    );
  } else if (!resolvida && rota.situacao === "emAndamento") {
    rodape = (
      <>
        <Botao titulo="Iniciar coleta" icone={Play} aoTocar={() => pedir("coletar")} desabilitado={!pode.pode} testID="botao-iniciar-coleta" />
        <Botao
          titulo="Não foi possível coletar"
          icone={Ban}
          variante="secundario"
          aoTocar={() => pedir("naoColetar")}
          desabilitado={!pode.pode}
          testID="botao-nao-coletar"
        />
      </>
    );
  }

  return (
    <Tela rodape={rodape}>
      <View style={{ gap: espaco.xs }}>
        <Texto variante="pequeno" suave>
          Parada {parada.ordem} de {rota.paradas.length}
        </Texto>
        <Texto variante="titulo">{cliente.nome}</Texto>
        <Selo texto={selo.texto} tom={selo.tom} />
      </View>

      {!pode.pode && !resolvida ? <Faixa tom="aviso" icone={TriangleAlert} texto={pode.motivo} /> : null}
      {pode.pode && pode.exigeMotivo && !mudancaRegistrada ? (
        <Faixa
          tom="aviso"
          icone={TriangleAlert}
          titulo="Fora da ordem da rota"
          texto={`A próxima parada é a ${proxima?.ordem}. Para atender esta antes, você vai informar o motivo.`}
        />
      ) : null}
      {erro ? <Faixa tom="perigo" texto={erro} /> : null}

      <Cartao>
        <Linha rotulo="Código" valor={cliente.codigo} />
        <Linha rotulo="CNPJ" valor={cnpj(cliente.cnpj)} />
        <Linha rotulo="Endereço" valor={`${e.logradouro}, ${e.numero} · ${e.bairro} · ${e.cidade} - ${e.uf} · CEP ${cep(e.cep)}`} />
        <Linha rotulo="Periodicidade" valor={cliente.periodicidade} />
      </Cartao>

      <Cartao>
        <Texto variante="rotulo">Resíduos do cliente</Texto>
        {residuos.map((t) => (
          <Linha key={t.id} rotulo={t.nome} valor={`${t.classificacao} · ${t.unidade}`} />
        ))}
      </Cartao>

      <Cartao>
        <Texto variante="rotulo">MTRs desta parada</Texto>
        {parada.mtrs.length ? (
          parada.mtrs.map((m) => <Linha key={m.numero} rotulo={m.situacao} valor={m.numero} />)
        ) : (
          <Texto suave>Nenhum MTR ligado a esta parada.</Texto>
        )}
      </Cartao>

      {resolvida && coleta ? (
        <Cartao>
          <View style={{ flexDirection: "row", gap: espaco.sm, alignItems: "center" }}>
            <Lock size={18} color="#71717a" />
            <Texto variante="rotulo">Coleta finalizada · não pode ser alterada</Texto>
          </View>
          <Linha rotulo="Hora" valor={coleta.finalizadaEm ? `${data(coleta.finalizadaEm)} ${hora(coleta.finalizadaEm)}` : "—"} />
          {coleta.itens.map((i) => (
            <Linha key={i.tipoResiduoId} rotulo={tipos[i.tipoResiduoId]?.nome ?? ""} valor={`${quantidade(i.quantidade)} ${tipos[i.tipoResiduoId]?.unidade ?? ""}`} />
          ))}
          <Linha rotulo="Assinatura" valor={coleta.assinatura?.tipo === "recusada" ? "Cliente recusou a assinatura" : (coleta.assinatura?.nome ?? "—")} />
          <Linha rotulo="Comprovante" valor={coleta.comprovanteNumero ?? "—"} />
          {coleta.revisao.map((r) => (
            <Faixa key={r.motivo} tom="aviso" icone={TriangleAlert} titulo="Para revisão do escritório" texto={TEXTO_MOTIVO_REVISAO[r.motivo]} />
          ))}
        </Cartao>
      ) : null}

      {resolvida && naoColeta ? (
        <Cartao>
          <View style={{ flexDirection: "row", gap: espaco.sm, alignItems: "center" }}>
            <Lock size={18} color="#71717a" />
            <Texto variante="rotulo">Não coletada · registro bloqueado</Texto>
          </View>
          <Linha rotulo="Motivo" valor={naoColeta.motivo === "outro" ? (naoColeta.texto ?? "Outro") : TEXTO_MOTIVO_NAO_COLETA[naoColeta.motivo]} />
          {naoColeta.observacao ? <Linha rotulo="Observação" valor={naoColeta.observacao} /> : null}
          <Linha rotulo="Registrado" valor={`${data(naoColeta.em)} ${hora(naoColeta.em)}`} />
          <Linha rotulo="Local" valor={naoColeta.local ? `${naoColeta.local.lat.toFixed(5)}, ${naoColeta.local.lng.toFixed(5)}` : "Sem localização"} />
        </Cartao>
      ) : null}

      <Aviso
        visivel={acaoPendente !== null}
        titulo="Motivo da mudança de ordem"
        texto={`A próxima parada da rota é a ${proxima?.ordem}. Ela continua pendente para depois.`}
        confirmar="Continuar"
        aoCancelar={() => setAcaoPendente(null)}
        aoConfirmar={confirmarMudanca}
      >
        <EscolhaMotivo
          opcoes={TEXTO_MOTIVO_MUDANCA}
          valor={motivo}
          aoEscolher={(m) => {
            setMotivo(m);
            setErroMotivo(null);
          }}
          texto={texto}
          aoMudarTexto={setTexto}
          erroTexto={erroMotivo}
        />
      </Aviso>

      <Aviso
        visivel={cancelar}
        titulo="Cancelar esta coleta?"
        texto="Os resíduos informados até agora serão descartados e a parada volta a ficar pendente."
        tom="perigo"
        confirmar="Cancelar coleta"
        cancelar="Voltar"
        aoCancelar={() => setCancelar(false)}
        aoConfirmar={() => {
          if (coleta) acoesColeta.cancelar(coleta.id);
          setCancelar(false);
        }}
      />
    </Tela>
  );
}
