import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHAVES } from "@/dados/chaves";
import { claro, escuro, type Cores } from "@/tema/tokens";

export type EscolhaTema = "claro" | "escuro" | "sistema";

type EstadoTema = {
  escolha: EscolhaTema;
  escolher: (escolha: EscolhaTema) => void;
};

export const usePreferenciaTema = create<EstadoTema>()(
  persist(
    (set) => ({
      escolha: "sistema",
      escolher: (escolha) => set({ escolha }),
    }),
    { name: CHAVES.tema, storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function useTema(): { cores: Cores; escuro: boolean } {
  const sistema = useColorScheme();
  const escolha = usePreferenciaTema((e) => e.escolha);
  const eEscuro = escolha === "sistema" ? sistema === "dark" : escolha === "escuro";
  return { cores: eEscuro ? escuro : claro, escuro: eEscuro };
}
