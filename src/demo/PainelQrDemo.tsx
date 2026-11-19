// QR Codes de exemplo no lugar do link do cliente, que ainda não existe (contracts/qr-presenca.md).
// Simula a leitura (válido, de outro cliente ou vencido) e pode mostrar o QR para ler de outro aparelho.
import { useState } from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import type { PropsPainelQr } from "@/lib/extensoesDemo";
import { gerarQr, SEGUNDOS_POR_JANELA } from "@/regras/qr";
import { espaco } from "@/tema/tokens";

export function PainelQrDemo({ clienteId, aoLer }: PropsPainelQr) {
  const clientes = useBanco((b) => b.clientes);
  const [mostrar, setMostrar] = useState(false);
  const cliente = clientes.find((c) => c.id === clienteId);
  const outro = clientes.find((c) => c.id !== clienteId);
  if (!cliente) return null;

  const valido = () => gerarQr(cliente.id, cliente.segredoQr);
  const vencido = () => gerarQr(cliente.id, cliente.segredoQr, new Date(Date.now() - 3 * SEGUNDOS_POR_JANELA * 1000));

  return (
    <Cartao>
      <Texto variante="rotulo">Demonstração · QR Code do cliente</Texto>
      <Texto variante="pequeno" suave>
        O link do cliente ainda não existe. Use os botões para simular a leitura, ou mostre o QR válido para ler com a
        câmera de outro aparelho.
      </Texto>
      <View style={{ gap: espaco.sm }}>
        <Botao compacto variante="secundario" titulo="Ler QR válido" aoTocar={() => aoLer(valido())} testID="demo-qr-valido" />
        {outro ? (
          <Botao
            compacto
            variante="secundario"
            titulo="Ler QR de outro cliente"
            aoTocar={() => aoLer(gerarQr(outro.id, outro.segredoQr))}
            testID="demo-qr-outro"
          />
        ) : null}
        <Botao compacto variante="secundario" titulo="Ler QR vencido" aoTocar={() => aoLer(vencido())} testID="demo-qr-vencido" />
        <Botao compacto variante="fantasma" titulo={mostrar ? "Esconder QR válido" : "Mostrar QR válido"} aoTocar={() => setMostrar(!mostrar)} />
      </View>
      {mostrar ? (
        <View style={{ alignItems: "center", padding: espaco.md, backgroundColor: "#ffffff", borderRadius: 12 }}>
          <QRCode value={valido()} size={200} />
          <Texto variante="pequeno" cor="#0a0a0a" style={{ marginTop: espaco.sm }}>
            Muda a cada minuto
          </Texto>
        </View>
      ) : null}
    </Cartao>
  );
}
