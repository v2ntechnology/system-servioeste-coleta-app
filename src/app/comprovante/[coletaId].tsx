import { Redirect, useLocalSearchParams } from "expo-router";
import { Mail, Printer } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Comprovante, NOME_VIA, type Via } from "@/components/Comprovante";
import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import { useClientes, useTiposResiduo } from "@/features/rota/useRota";
import { alvo, espaco, raio } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

const VIAS: Via[] = ["cliente", "empresa", "digital"];
const ROTULO_ABA: Record<Via, string> = { cliente: "1ª via", empresa: "2ª via", digital: "Digital" };

export default function TelaComprovante() {
  const { coletaId } = useLocalSearchParams<{ coletaId: string }>();
  const { cores } = useTema();
  const coleta = useBanco((b) => b.coletas[coletaId]);
  const rotas = useBanco((b) => b.rotas);
  const pessoas = useBanco((b) => b.pessoas);
  const veiculos = useBanco((b) => b.veiculos);
  const clientes = useClientes();
  const tipos = useTiposResiduo();
  const [via, setVia] = useState<Via>("cliente");
  const [aviso, setAviso] = useState<"imprimir" | "enviar" | null>(null);

  const rota = rotas.find((r) => r.id === coleta?.rotaId);
  const cliente = coleta ? clientes[coleta.clienteId] : undefined;
  if (!coleta || coleta.situacao !== "finalizada" || !rota || !cliente) return <Redirect href="/rota" />;

  const contatos = [cliente.contatos.email, cliente.contatos.whatsapp && `WhatsApp ${cliente.contatos.whatsapp}`].filter(Boolean);

  return (
    <Tela
      rodape={
        <View style={{ flexDirection: "row", gap: espaco.sm }}>
          <Botao titulo="Imprimir" icone={Printer} aoTocar={() => setAviso("imprimir")} style={{ flex: 1 }} testID="botao-imprimir" />
          <Botao titulo="Enviar" icone={Mail} variante="secundario" aoTocar={() => setAviso("enviar")} style={{ flex: 1 }} />
        </View>
      }
    >
      <View style={{ flexDirection: "row", gap: espaco.xs, backgroundColor: cores.suave, padding: 4, borderRadius: raio.grande }} accessibilityRole="tablist">
        {VIAS.map((v) => (
          <Pressable
            key={v}
            accessibilityRole="tab"
            accessibilityState={{ selected: via === v }}
            onPress={() => setVia(v)}
            style={{
              flex: 1,
              minHeight: alvo.minimo,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: raio.medio,
              backgroundColor: via === v ? cores.cartao : "transparent",
              borderWidth: via === v ? 1 : 0,
              borderColor: cores.marca,
            }}
            testID={`aba-${v}`}
          >
            <Texto variante="rotulo">{ROTULO_ABA[v]}</Texto>
          </Pressable>
        ))}
      </View>

      {via === "digital" ? (
        <Cartao>
          <Texto variante="rotulo">Envio digital</Texto>
          <Texto variante="pequeno" suave>
            {contatos.length ? `Será enviado para: ${contatos.join(" · ")}` : "O cliente não tem e-mail nem WhatsApp cadastrado."}
          </Texto>
        </Cartao>
      ) : null}

      <Comprovante
        via={via}
        coleta={coleta}
        cliente={cliente}
        rota={rota}
        veiculo={veiculos.find((v) => v.id === rota.veiculoId)}
        motorista={pessoas.find((p) => p.id === rota.motoristaId)}
        coletores={pessoas.filter((p) => rota.coletorIds.includes(p.id))}
        tipos={tipos}
      />

      <Aviso
        visivel={aviso !== null}
        icone={aviso === "imprimir" ? Printer : Mail}
        titulo={aviso === "imprimir" ? "Impressão simulada" : "Envio simulado"}
        texto={
          aviso === "imprimir"
            ? `Nesta fase de demonstração, a impressão das 2 vias (${NOME_VIA.cliente} e ${NOME_VIA.empresa}) é só simulada. A impressora Bluetooth entra numa próxima etapa.`
            : "Nesta fase de demonstração, o envio por e-mail e WhatsApp é só simulado."
        }
        confirmar="Entendi"
        cancelar={null}
        aoCancelar={() => setAviso(null)}
        aoConfirmar={() => setAviso(null)}
      />
    </Tela>
  );
}
