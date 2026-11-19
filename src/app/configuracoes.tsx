import { LogOut, User } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useMotorista, useSessao } from "@/features/sessao/useSessao";
import { extensoesDemo } from "@/lib/extensoesDemo";
import { alvo, espaco, raio } from "@/tema/tokens";
import { usePreferenciaTema, useTema, type EscolhaTema } from "@/tema/useTema";

const OPCOES_TEMA: { valor: EscolhaTema; rotulo: string }[] = [
  { valor: "claro", rotulo: "Claro" },
  { valor: "escuro", rotulo: "Escuro" },
  { valor: "sistema", rotulo: "Do celular" },
];

export default function Configuracoes() {
  const { cores } = useTema();
  const motorista = useMotorista();
  const sair = useSessao((s) => s.sair);
  const { escolha, escolher } = usePreferenciaTema();
  const [erro, setErro] = useState<string | null>(null);
  const MenuDemo = extensoesDemo.MenuDemo;

  return (
    <Tela>
      <ItemLista icone={User} titulo={motorista?.nome ?? "—"} descricao={`Motorista · usuário ${motorista?.usuario ?? ""}`} />

      <Cartao>
        <Texto variante="rotulo">Tema</Texto>
        <View style={{ flexDirection: "row", gap: espaco.xs, backgroundColor: cores.suave, padding: 4, borderRadius: raio.grande }}>
          {OPCOES_TEMA.map((o) => (
            <Pressable
              key={o.valor}
              accessibilityRole="radio"
              accessibilityState={{ selected: escolha === o.valor }}
              onPress={() => escolher(o.valor)}
              style={{
                flex: 1,
                minHeight: alvo.minimo,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: raio.medio,
                backgroundColor: escolha === o.valor ? cores.cartao : "transparent",
                borderWidth: escolha === o.valor ? 1 : 0,
                borderColor: cores.marca,
              }}
            >
              <Texto variante="rotulo">{o.rotulo}</Texto>
            </Pressable>
          ))}
        </View>
      </Cartao>

      {MenuDemo ? <MenuDemo /> : null}

      {erro ? <Faixa tom="perigo" texto={erro} /> : null}
      <Botao titulo="Sair da conta" icone={LogOut} variante="fantasma" aoTocar={() => setErro(sair())} testID="botao-sair" />
    </Tela>
  );
}
