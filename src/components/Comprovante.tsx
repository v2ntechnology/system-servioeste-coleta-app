// Comprovante como será impresso na bobina térmica (modelo: docs/WhatsApp Image 2026-11-19 at 2.48.12 PM.jpeg).
// Sempre em papel branco e texto preto, nos dois temas. 58 mm simulados por uma largura fixa.
import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Svg, { Path } from "react-native-svg";

import { CAIXA_ASSINATURA } from "@/components/Assinatura";
import { TextoAssinatura } from "@/components/AssinaturaDigitada";
import { Logo } from "@/components/ui/Logo";
import { Texto } from "@/components/ui/Texto";
import type { Cliente, Coleta, Pessoa, Rota, TipoResiduo, Veiculo } from "@/dados/tipos";
import { TEXTO_MOTIVO_REVISAO } from "@/dados/tipos";
import { cep, cnpj, data, hora, quantidadeFixa } from "@/lib/formato";
import { DECLARACAO, EMPRESA, urlVerificacao } from "@/regras/comprovante";
import { UNIDADE_DECIMAL } from "@/regras/quantidade";
import { fonte } from "@/tema/tokens";

export type Via = "cliente" | "empresa" | "digital";

export const NOME_VIA: Record<Via, string> = {
  cliente: "1ª via · cliente",
  empresa: "2ª via · empresa",
  digital: "Digital (enviada ao cliente)",
};

type Props = {
  via: Via;
  coleta: Coleta;
  cliente: Cliente;
  rota: Rota;
  veiculo?: Veiculo;
  motorista?: Pessoa;
  coletores: Pessoa[];
  tipos: Record<string, TipoResiduo>;
};

const PRETO = "#0a0a0a";
const CINZA = "#52525b";

function T({ children, forte, pequeno, centro }: { children: React.ReactNode; forte?: boolean; pequeno?: boolean; centro?: boolean }) {
  return (
    <Texto
      cor={pequeno ? CINZA : PRETO}
      style={{ fontSize: pequeno ? 11 : 13, lineHeight: pequeno ? 15 : 18, fontFamily: forte ? fonte.forte : fonte.regular, textAlign: centro ? "center" : "left" }}
    >
      {children}
    </Texto>
  );
}

function Tracejado() {
  return <View style={estilos.tracejado} />;
}

export function Comprovante({ via, coleta, cliente, rota, veiculo, motorista, coletores, tipos }: Props) {
  const quando = coleta.finalizadaEm ?? coleta.iniciadaEm;
  const numero = coleta.comprovanteNumero ?? "—";
  const e = cliente.endereco;
  return (
    <View style={estilos.papel} accessibilityLabel={`Comprovante de coleta ${numero}, ${NOME_VIA[via]}`}>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Logo largura={200} />
        <T forte centro>{EMPRESA.nome}</T>
        {EMPRESA.linhas.map((l) => (
          <T key={l} pequeno centro>{l}</T>
        ))}
      </View>
      <Tracejado />
      <Texto cor={PRETO} style={{ fontFamily: fonte.forte, fontSize: 17, textAlign: "center" }}>
        COMPROVANTE DE COLETA
      </Texto>
      <T pequeno centro>{NOME_VIA[via].toUpperCase()}</T>
      <Tracejado />
      <T><T forte>Cliente: </T>{cliente.nome}</T>
      <T><T forte>Código: </T>{cliente.codigo}</T>
      <T><T forte>CNPJ: </T>{cnpj(cliente.cnpj)}</T>
      <T><T forte>Endereço: </T>{`${e.logradouro}, ${e.numero} · ${e.bairro} · ${e.cidade} - ${e.uf} · CEP ${cep(e.cep)}`}</T>
      <Tracejado />
      <View style={estilos.grade}>
        <View style={estilos.celula}><T pequeno>Data da coleta</T><T forte>{data(quando)}</T></View>
        <View style={estilos.celula}><T pequeno>Hora</T><T forte>{hora(quando)}</T></View>
        <View style={estilos.celula}><T pequeno>Rota</T><T forte>{`${rota.codigo} · ${rota.regiao}`}</T></View>
      </View>
      <View style={estilos.grade}>
        <View style={estilos.celula}><T pequeno>Veículo (placa)</T><T forte>{veiculo?.placa ?? "—"}</T></View>
        <View style={estilos.celula}><T pequeno>Motorista</T><T forte>{motorista?.nome ?? "—"}</T></View>
        <View style={estilos.celula}><T pequeno>Coletor(es)</T><T forte>{coletores.map((c) => c.nome).join(", ") || "—"}</T></View>
      </View>
      <Tracejado />
      <View style={estilos.cabecalhoItens}>
        <View style={{ flex: 2 }}><T pequeno>RESÍDUO</T></View>
        <View style={{ flex: 1 }}><T pequeno>QUANTIDADE</T></View>
        <View style={{ flex: 0.8 }}><T pequeno>UNIDADE</T></View>
      </View>
      {coleta.itens.map((item) => {
        const tipo = tipos[item.tipoResiduoId];
        return (
          <View key={item.tipoResiduoId} style={{ gap: 2 }}>
            <View style={estilos.cabecalhoItens}>
              <View style={{ flex: 2 }}><T forte>{tipo?.nome.toUpperCase() ?? item.tipoResiduoId}</T></View>
              <View style={{ flex: 1 }}><T forte>{tipo ? quantidadeFixa(item.quantidade, UNIDADE_DECIMAL[tipo.unidade] ? 2 : 0) : item.quantidade}</T></View>
              <View style={{ flex: 0.8 }}><T forte>{tipo?.unidade ?? ""}</T></View>
            </View>
            <T pequeno>{`Tipo: ${tipo?.classificacao ?? "—"} · Periodicidade: ${cliente.periodicidade}`}</T>
          </View>
        );
      })}
      <Tracejado />
      <T>{DECLARACAO}</T>
      <T pequeno>Assinatura do cliente:</T>
      {coleta.assinatura?.tipo === "assinada" && coleta.assinatura.forma === "digitada" ? (
        <View style={[estilos.assinatura, { justifyContent: "center" }]}>
          <TextoAssinatura nome={coleta.assinatura.nome} fonte={coleta.assinatura.fonte} escala={0.85} />
        </View>
      ) : coleta.assinatura?.tipo === "assinada" ? (
        <View style={estilos.assinatura}>
          <Svg width="100%" height="100%" viewBox={`0 0 ${CAIXA_ASSINATURA.largura} ${CAIXA_ASSINATURA.altura}`}>
            <Path d={coleta.assinatura.caminhoSvg ?? ""} stroke={PRETO} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      ) : (
        <View style={[estilos.assinatura, { alignItems: "center", justifyContent: "center" }]}>
          <T forte>Cliente recusou a assinatura</T>
        </View>
      )}
      <T><T forte>Nome: </T>{coleta.assinatura?.nome || "—"}</T>
      <T><T forte>Documento: </T>{coleta.assinatura?.tipo === "assinada" ? "foto registrada no app" : "—"}</T>
      {coleta.revisao.length ? (
        <>
          <Tracejado />
          <T forte>Para revisão do escritório</T>
          {coleta.revisao.map((r) => (
            <T key={r.motivo} pequeno>{`• ${TEXTO_MOTIVO_REVISAO[r.motivo]}`}</T>
          ))}
        </>
      ) : null}
      <Tracejado />
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <QRCode value={urlVerificacao(numero)} size={92} color={PRETO} backgroundColor="#ffffff" />
        <View style={{ flex: 1, gap: 4 }}>
          <T forte>{`Comprovante: ${numero}`}</T>
          <T pequeno>Verifique a autenticidade deste comprovante pelo QR Code.</T>
        </View>
      </View>
      <Tracejado />
      <T pequeno centro>Obrigado por contribuir com um mundo mais limpo!</T>
    </View>
  );
}

const estilos = StyleSheet.create({
  papel: { backgroundColor: "#ffffff", padding: 16, gap: 6, width: "100%", maxWidth: 340, alignSelf: "center", borderRadius: 4, borderWidth: 1, borderColor: "#e4e4e7" },
  tracejado: { borderBottomWidth: 1, borderStyle: "dashed", borderColor: "#a1a1aa", marginVertical: 4 },
  grade: { flexDirection: "row", gap: 8 },
  celula: { flex: 1, gap: 2 },
  cabecalhoItens: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  assinatura: { height: 80, borderBottomWidth: 1, borderColor: "#a1a1aa" },
});
