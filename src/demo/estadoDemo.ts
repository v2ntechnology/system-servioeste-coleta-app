// Opções do menu de demonstração, guardadas no aparelho (coleta-demo).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHAVES } from "@/dados/chaves";

export type EstadoDemo = {
  conectado: boolean;
  foraDaArea: boolean;
  localizacaoFalsa: boolean;
  recusarProximo: boolean;
  definir: (mudanca: Partial<Omit<EstadoDemo, "definir">>) => void;
};

export const useEstadoDemo = create<EstadoDemo>()(
  persist(
    (set) => ({
      conectado: true,
      foraDaArea: false,
      localizacaoFalsa: false,
      recusarProximo: false,
      definir: (mudanca) => set(mudanca),
    }),
    { name: CHAVES.demo, storage: createJSONStorage(() => AsyncStorage) },
  ),
);
