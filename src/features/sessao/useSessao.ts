// Sessão do motorista. Nesta fase, o login confere os dados fictícios; o login próprio do app é da fase do back-end.
// A sessão fica no armazenamento protegido do aparelho (SecureStore; AsyncStorage no navegador).
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHAVES } from "@/dados/chaves";
import { useBanco } from "@/dados/repositorio";
import type { Pessoa } from "@/dados/tipos";
import { cofre } from "@/dispositivo/cofre";
import { pendentes } from "@/sincronizacao/fila";

type EstadoSessao = {
  motoristaId: string | null;
  /** Devolve a mensagem de erro, ou null se entrou. */
  entrar: (usuario: string, senha: string) => string | null;
  /** Devolve a mensagem de erro, ou null se saiu. */
  sair: () => string | null;
};

export const useSessao = create<EstadoSessao>()(
  persist(
    (set) => ({
      motoristaId: null,
      entrar: (usuario, senha) => {
        const u = usuario.trim().toLowerCase();
        if (!u || !senha) return "Informe o usuário e a senha.";
        const pessoa = useBanco
          .getState()
          .pessoas.find((p) => p.funcao === "motorista" && p.usuario?.toLowerCase() === u && p.senha === senha);
        if (!pessoa) return "Usuário ou senha incorretos.";
        set({ motoristaId: pessoa.id });
        return null;
      },
      sair: () => {
        const faltam = pendentes(useBanco.getState().fila).length;
        if (faltam > 0) {
          return `Há ${faltam} ${faltam === 1 ? "registro" : "registros"} ainda não ${faltam === 1 ? "enviado" : "enviados"}. Conecte-se à internet e aguarde o envio antes de sair.`;
        }
        set({ motoristaId: null });
        return null;
      },
    }),
    {
      name: CHAVES.sessao,
      storage: createJSONStorage(() => cofre),
      partialize: (e) => ({ motoristaId: e.motoristaId }),
    },
  ),
);

/** O motorista da sessão. */
export function useMotorista(): Pessoa | undefined {
  const id = useSessao((s) => s.motoristaId);
  const pessoas = useBanco((b) => b.pessoas);
  return pessoas.find((p) => p.id === id);
}
