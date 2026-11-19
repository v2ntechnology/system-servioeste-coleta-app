// Lista de motivos com seleção única (mudança de ordem, não coleta). "Outro" pede texto.
import { Check } from "lucide-react-native";
import { View } from "react-native";

import { CampoTexto } from "@/components/ui/CampoTexto";
import { ItemLista } from "@/components/ui/Lista";
import { espaco } from "@/tema/tokens";
import { useTema } from "@/tema/useTema";

type Props<M extends string> = {
  opcoes: Record<M, string>;
  valor: M | undefined;
  aoEscolher: (m: M) => void;
  texto: string;
  aoMudarTexto: (t: string) => void;
  erroTexto?: string | null;
};

export function EscolhaMotivo<M extends string>({ opcoes, valor, aoEscolher, texto, aoMudarTexto, erroTexto }: Props<M>) {
  const { cores } = useTema();
  return (
    <View style={{ gap: espaco.sm }} accessibilityRole="radiogroup">
      {(Object.keys(opcoes) as M[]).map((m) => (
        <ItemLista
          key={m}
          titulo={opcoes[m]}
          selecionado={valor === m}
          aoTocar={() => aoEscolher(m)}
          direita={valor === m ? <Check size={20} color={cores.marca} /> : <View />}
          testID={`motivo-${m}`}
        />
      ))}
      {valor === "outro" ? (
        <CampoTexto rotulo="Qual o motivo?" value={texto} onChangeText={aoMudarTexto} erro={erroTexto} testID="campo-motivo" />
      ) : null}
    </View>
  );
}
