// Fontes manuscritas para a assinatura digitada (Google Fonts via @expo-google-fonts, rodam no Expo Go).
import { Allura_400Regular } from "@expo-google-fonts/allura";
import { DancingScript_500Medium } from "@expo-google-fonts/dancing-script";
import { GreatVibes_400Regular } from "@expo-google-fonts/great-vibes";
import { Sacramento_400Regular } from "@expo-google-fonts/sacramento";

export type FonteAssinatura = { id: string; nome: string; familia: string; tamanho: number };

export const FONTES_ASSINATURA: FonteAssinatura[] = [
  { id: "great-vibes", nome: "Clássica", familia: "GreatVibes_400Regular", tamanho: 40 },
  { id: "dancing-script", nome: "Moderna", familia: "DancingScript_500Medium", tamanho: 34 },
  { id: "allura", nome: "Elegante", familia: "Allura_400Regular", tamanho: 42 },
  { id: "sacramento", nome: "Leve", familia: "Sacramento_400Regular", tamanho: 42 },
];

/** Para o useFonts do layout raiz. */
export const ARQUIVOS_FONTES_ASSINATURA = {
  GreatVibes_400Regular,
  DancingScript_500Medium,
  Allura_400Regular,
  Sacramento_400Regular,
};

export function fonteAssinatura(id: string | undefined): FonteAssinatura {
  return FONTES_ASSINATURA.find((f) => f.id === id) ?? FONTES_ASSINATURA[0];
}
