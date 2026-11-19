// Repositório local: a fonte de verdade das telas (local-first, research.md D2 e D3).
// Telas → hooks de src/features → este repositório. Toda escrita relevante entra na fila de sincronização.
// Não importa dados fictícios: o layout raiz carrega os dados de exemplo quando o modo demonstração está ligado.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CHAVES, VERSAO_DADOS } from "@/dados/chaves";
import type {
  Assinatura,
  Cliente,
  Coleta,
  ItemColeta,
  ItemDaFila,
  Localizacao,
  MotivoMudancaDeOrdem,
  MotivoNaoColeta,
  MotivoRevisao,
  MudancaDeOrdem,
  NaoColeta,
  Pessoa,
  ProvaQr,
  Rota,
  TipoItemFila,
  TipoResiduo,
  Veiculo,
} from "@/dados/tipos";
import { novoId } from "@/lib/id";
import { comItem, errosParaFinalizar, garantirRascunho, semItem } from "@/regras/coleta";
import { chaveSequencia, numeroComprovante } from "@/regras/comprovante";
import { podeIniciar, validarMotivoMudanca } from "@/regras/ordem";

export type DadosBanco = {
  versao: number;
  pessoas: Pessoa[];
  veiculos: Veiculo[];
  tiposResiduo: TipoResiduo[];
  clientes: Cliente[];
  rotas: Rota[];
  coletas: Record<string, Coleta>;
  naoColetas: Record<string, NaoColeta>;
  mudancas: MudancaDeOrdem[];
  fila: ItemDaFila[];
  /** próxima sequência do comprovante por veículo e dia */
  sequencias: Record<string, number>;
};

type Acoes = {
  carregar: (dados: DadosBanco) => void;
  iniciarJornada: (rotaId: string) => void;
  registrarMudancaDeOrdem: (m: {
    rotaId: string;
    paradaPuladaId: string;
    paradaAtendidaId: string;
    motivo: MotivoMudancaDeOrdem;
    texto?: string;
  }) => void;
  iniciarColeta: (rotaId: string, paradaId: string) => string;
  registrarQr: (coletaId: string, prova: ProvaQr) => void;
  salvarItem: (coletaId: string, item: ItemColeta) => void;
  removerItem: (coletaId: string, tipoResiduoId: string) => void;
  cancelarColeta: (coletaId: string) => void;
  finalizarColeta: (
    coletaId: string,
    assinatura: Assinatura,
    local: Localizacao | null,
    revisao?: MotivoRevisao[],
  ) => string;
  registrarNaoColeta: (n: {
    rotaId: string;
    paradaId: string;
    motivo: MotivoNaoColeta;
    texto?: string;
    observacao?: string;
    local: Localizacao | null;
  }) => string;
  atualizarItemFila: (id: string, mudanca: Partial<ItemDaFila>) => void;
};

export type Banco = DadosBanco & Acoes;

export const BANCO_VAZIO: DadosBanco = {
  versao: VERSAO_DADOS,
  pessoas: [],
  veiculos: [],
  tiposResiduo: [],
  clientes: [],
  rotas: [],
  coletas: {},
  naoColetas: {},
  mudancas: [],
  fila: [],
  sequencias: {},
};

const agoraIso = () => new Date().toISOString();

function copia<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

function itemFila(tipo: TipoItemFila, id: string, dados: unknown): ItemDaFila {
  return { id, tipo, dados: copia(dados), situacao: "aguardando", tentativas: 0, criadoEm: agoraIso() };
}

function rotaOuErro(estado: DadosBanco, rotaId: string): Rota {
  const rota = estado.rotas.find((r) => r.id === rotaId);
  if (!rota) throw new Error("Rota não encontrada.");
  return rota;
}

function coletaOuErro(estado: DadosBanco, coletaId: string): Coleta {
  const coleta = estado.coletas[coletaId];
  if (!coleta) throw new Error("Coleta não encontrada.");
  return coleta;
}

function trocarParada(rotas: Rota[], rotaId: string, paradaId: string, mudanca: Partial<Rota["paradas"][number]>) {
  return rotas.map((r) =>
    r.id !== rotaId ? r : { ...r, paradas: r.paradas.map((p) => (p.id === paradaId ? { ...p, ...mudanca } : p)) },
  );
}

export const useBanco = create<Banco>()(
  persist(
    (set, get) => ({
      ...BANCO_VAZIO,

      carregar: (dados) => set(copia(dados)),

      iniciarJornada: (rotaId) => {
        const rota = rotaOuErro(get(), rotaId);
        if (rota.situacao !== "liberada") return;
        set({
          rotas: get().rotas.map((r) =>
            r.id === rotaId ? { ...r, situacao: "emAndamento", jornadaIniciadaEm: agoraIso() } : r,
          ),
        });
      },

      registrarMudancaDeOrdem: (m) => {
        const erro = validarMotivoMudanca(m.motivo, m.texto);
        if (erro) throw new Error(erro);
        const mudanca: MudancaDeOrdem = { id: novoId("mud"), ...m, texto: m.texto?.trim() || undefined, em: agoraIso() };
        set({
          mudancas: [...get().mudancas, mudanca],
          fila: [...get().fila, itemFila("mudancaDeOrdem", mudanca.id, mudanca)],
        });
      },

      iniciarColeta: (rotaId, paradaId) => {
        const estado = get();
        const rota = rotaOuErro(estado, rotaId);
        const parada = rota.paradas.find((p) => p.id === paradaId);
        if (parada?.situacao === "emAndamento" && parada.registroId && estado.coletas[parada.registroId]) {
          return parada.registroId;
        }
        const pode = podeIniciar(rota, paradaId);
        if (!pode.pode) throw new Error(pode.motivo);
        const exigiaMotivo = pode.exigeMotivo;
        if (exigiaMotivo) {
          const registrou = estado.mudancas.some((m) => m.rotaId === rotaId && m.paradaAtendidaId === paradaId);
          if (!registrou) throw new Error("Registre o motivo da mudança de ordem.");
        }
        const coleta: Coleta = {
          id: novoId("col"),
          paradaId,
          rotaId,
          clienteId: parada!.clienteId,
          situacao: "rascunho",
          itens: [],
          prova: { local: null },
          revisao: [],
          iniciadaEm: agoraIso(),
        };
        set({
          coletas: { ...estado.coletas, [coleta.id]: coleta },
          rotas: trocarParada(estado.rotas, rotaId, paradaId, { situacao: "emAndamento", registroId: coleta.id }),
        });
        return coleta.id;
      },

      registrarQr: (coletaId, prova) => {
        const coleta = coletaOuErro(get(), coletaId);
        garantirRascunho(coleta);
        const revisao = coleta.revisao.filter((r) => r.motivo !== "semQr");
        if (prova.resultado === "semQr") revisao.push({ motivo: "semQr" });
        set({ coletas: { ...get().coletas, [coletaId]: { ...coleta, prova: { ...coleta.prova, qr: prova }, revisao } } });
      },

      salvarItem: (coletaId, item) => {
        const estado = get();
        const coleta = coletaOuErro(estado, coletaId);
        const cliente = estado.clientes.find((c) => c.id === coleta.clienteId);
        if (!cliente) throw new Error("Cliente não encontrado.");
        set({ coletas: { ...estado.coletas, [coletaId]: { ...coleta, itens: comItem(coleta, cliente, item) } } });
      },

      removerItem: (coletaId, tipoResiduoId) => {
        const coleta = coletaOuErro(get(), coletaId);
        set({ coletas: { ...get().coletas, [coletaId]: { ...coleta, itens: semItem(coleta, tipoResiduoId) } } });
      },

      cancelarColeta: (coletaId) => {
        const estado = get();
        const coleta = coletaOuErro(estado, coletaId);
        garantirRascunho(coleta);
        const coletas = { ...estado.coletas };
        delete coletas[coletaId];
        set({
          coletas,
          rotas: trocarParada(estado.rotas, coleta.rotaId, coleta.paradaId, { situacao: "pendente", registroId: undefined }),
        });
      },

      finalizarColeta: (coletaId, assinatura, local, revisao = []) => {
        const estado = get();
        const coleta = coletaOuErro(estado, coletaId);
        const erros = errosParaFinalizar(coleta, assinatura);
        if (erros.length) throw new Error(erros.join(" "));
        const rota = rotaOuErro(estado, coleta.rotaId);
        const placa = estado.veiculos.find((v) => v.id === rota.veiculoId)?.placa ?? "SEMPLACA";
        const agora = agoraIso();
        const chave = chaveSequencia(agora, placa);
        const sequencia = (estado.sequencias[chave] ?? 0) + 1;
        const motivos = new Set([...coleta.revisao.map((r) => r.motivo), ...revisao]);
        const finalizada: Coleta = {
          ...coleta,
          situacao: "finalizada",
          assinatura: assinatura.tipo === "assinada" ? { ...assinatura, nome: assinatura.nome.trim() } : assinatura,
          prova: { ...coleta.prova, local },
          revisao: [...motivos].map((motivo) => ({ motivo })),
          finalizadaEm: agora,
          comprovanteNumero: numeroComprovante(agora, placa, sequencia),
        };
        set({
          coletas: { ...estado.coletas, [coletaId]: finalizada },
          sequencias: { ...estado.sequencias, [chave]: sequencia },
          rotas: trocarParada(estado.rotas, coleta.rotaId, coleta.paradaId, { situacao: "coletada" }),
          fila: [...estado.fila, itemFila("coleta", coletaId, finalizada)],
        });
        return finalizada.comprovanteNumero!;
      },

      registrarNaoColeta: (n) => {
        const estado = get();
        const rota = rotaOuErro(estado, n.rotaId);
        const parada = rota.paradas.find((p) => p.id === n.paradaId);
        if (!parada) throw new Error("Parada não encontrada.");
        if (parada.situacao === "coletada" || parada.situacao === "naoColetada") {
          throw new Error("Esta parada já foi resolvida.");
        }
        if (parada.situacao === "emAndamento") throw new Error("Cancele antes a coleta em andamento desta parada.");
        const pode = podeIniciar(rota, n.paradaId);
        if (!pode.pode) throw new Error(pode.motivo);
        if (pode.exigeMotivo && !estado.mudancas.some((m) => m.rotaId === n.rotaId && m.paradaAtendidaId === n.paradaId)) {
          throw new Error("Registre o motivo da mudança de ordem.");
        }
        if (n.motivo === "outro" && !n.texto?.trim()) throw new Error("Escreva o motivo.");
        const registro: NaoColeta = {
          id: novoId("nao"),
          paradaId: n.paradaId,
          rotaId: n.rotaId,
          clienteId: parada.clienteId,
          motivo: n.motivo,
          texto: n.texto?.trim() || undefined,
          observacao: n.observacao?.trim() || undefined,
          local: n.local,
          em: agoraIso(),
        };
        set({
          naoColetas: { ...estado.naoColetas, [registro.id]: registro },
          rotas: trocarParada(estado.rotas, n.rotaId, n.paradaId, { situacao: "naoColetada", registroId: registro.id }),
          fila: [...estado.fila, itemFila("naoColeta", registro.id, registro)],
        });
        return registro.id;
      },

      atualizarItemFila: (id, mudanca) =>
        set({ fila: get().fila.map((i) => (i.id === id ? { ...i, ...mudanca } : i)) }),
    }),
    {
      name: CHAVES.banco,
      version: VERSAO_DADOS,
      storage: createJSONStorage(() => AsyncStorage),
      // Formato antigo: descarta (os dados fictícios são recarregados pelo layout raiz).
      migrate: () => ({ ...BANCO_VAZIO }) as unknown as Banco,
      partialize: (estado) => {
        const { carregar, iniciarJornada, registrarMudancaDeOrdem, iniciarColeta, registrarQr, salvarItem, removerItem,
          cancelarColeta, finalizarColeta, registrarNaoColeta, atualizarItemFila, ...dados } = estado;
        return dados;
      },
    },
  ),
);

/** O banco está vazio (primeiro uso ou depois de restaurar)? */
export function bancoVazio(estado: DadosBanco): boolean {
  return estado.rotas.length === 0 && estado.pessoas.length === 0;
}
