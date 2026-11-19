// Menu de demonstração (só com EXPO_PUBLIC_MOCK=true; nunca no pacote de produção).
import { RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Switch, View } from "react-native";

import { Aviso } from "@/components/ui/Aviso";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Texto } from "@/components/ui/Texto";
import { restaurarDadosDemo } from "@/demo/preparar";
import { useEstadoDemo } from "@/demo/estadoDemo";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

function Interruptor({ rotulo, descricao, valor, aoMudar }: { rotulo: string; descricao: string; valor: boolean; aoMudar: (v: boolean) => void }) {
  const { cores } = useTema();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: espaco.md, minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <Texto>{rotulo}</Texto>
        <Texto variante="pequeno" suave>
          {descricao}
        </Texto>
      </View>
      <Switch
        accessibilityLabel={rotulo}
        value={valor}
        onValueChange={aoMudar}
        trackColor={{ true: cores.marca, false: cores.borda }}
      />
    </View>
  );
}

export function MenuDemo() {
  const demo = useEstadoDemo();
  const [confirmar, setConfirmar] = useState(false);
  return (
    <Cartao>
      <Texto variante="subtitulo">Demonstração</Texto>
      <Texto variante="pequeno" suave>
        Modo demonstração: os dados são fictícios, nada é enviado de verdade e a impressão é simulada.
      </Texto>
      <Interruptor
        rotulo="Conexão com a internet"
        descricao="Desligue para simular o trabalho sem sinal."
        valor={demo.conectado}
        aoMudar={(conectado) => demo.definir({ conectado })}
      />
      <Interruptor
        rotulo="Fora da área do cliente"
        descricao="A próxima coleta será confirmada fora da cerca virtual."
        valor={demo.foraDaArea}
        aoMudar={(foraDaArea) => demo.definir({ foraDaArea })}
      />
      <Interruptor
        rotulo="Localização falsa"
        descricao="Simula um aparelho com GPS falsificado."
        valor={demo.localizacaoFalsa}
        aoMudar={(localizacaoFalsa) => demo.definir({ localizacaoFalsa })}
      />
      <Interruptor
        rotulo="Recusar o próximo envio"
        descricao="Testa o erro na tela de sincronização."
        valor={demo.recusarProximo}
        aoMudar={(recusarProximo) => demo.definir({ recusarProximo })}
      />
      <Texto variante="pequeno" suave>
        Os QR Codes de exemplo aparecem na tela de leitura do QR Code, durante a coleta.
      </Texto>
      <Botao titulo="Restaurar dados de exemplo" icone={RotateCcw} variante="secundario" aoTocar={() => setConfirmar(true)} />
      <Aviso
        visivel={confirmar}
        titulo="Restaurar dados de exemplo?"
        texto="A rota volta ao início e as coletas de hoje são apagadas deste aparelho."
        tom="perigo"
        confirmar="Restaurar"
        aoCancelar={() => setConfirmar(false)}
        aoConfirmar={() => {
          setConfirmar(false);
          restaurarDadosDemo();
        }}
      />
    </Cartao>
  );
}
