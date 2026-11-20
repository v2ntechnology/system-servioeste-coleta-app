// T055: Grupo A 10 kg + 12,8 kg = 22,8 kg; não coletas com motivo; encerramento recusado com paradas pendentes.
import type { Coleta, NaoColeta, Rota, TipoResiduo } from "@/dados/tipos";
import { erroParaEncerrar, resumoDoDia } from "@/regras/totais";

const tipos: Record<string, TipoResiduo> = {
  a: { id: "a", nome: "Grupo A", classificacao: "Biológico", unidade: "KG" },
  e: { id: "e", nome: "Grupo E", classificacao: "Perfurocortante", unidade: "CN" },
};

function coleta(id: string, itens: Coleta["itens"], revisao: Coleta["revisao"] = []): Coleta {
  return { id, paradaId: id, rotaId: "r", clienteId: "c", situacao: "finalizada", itens, prova: { local: null }, revisao, iniciadaEm: "" };
}

const rota: Rota = {
  id: "r",
  codigo: "R03",
  regiao: "Zona Oeste",
  data: "2026-11-19",
  motoristaId: "m",
  coletorIds: [],
  veiculoId: "v",
  situacao: "emAndamento",
  paradas: [
    { id: "p1", clienteId: "c1", ordem: 1, situacao: "coletada", mtrs: [], registroId: "c1" },
    { id: "p2", clienteId: "c2", ordem: 2, situacao: "coletada", mtrs: [], registroId: "c2" },
    { id: "p3", clienteId: "c3", ordem: 3, situacao: "naoColetada", mtrs: [], registroId: "n1" },
  ],
};

const coletas = {
  c1: coleta("c1", [{ tipoResiduoId: "a", quantidade: 10 }, { tipoResiduoId: "e", quantidade: 2 }]),
  c2: coleta("c2", [{ tipoResiduoId: "a", quantidade: 12.8 }], [{ motivo: "foraDaArea" }]),
};
const naoColetas: Record<string, NaoColeta> = {
  n1: { id: "n1", paradaId: "p3", rotaId: "r", clienteId: "c3", motivo: "localFechado", local: null, em: "" },
};

describe("resumo do dia", () => {
  it("soma por tipo de resíduo", () => {
    const r = resumoDoDia(rota, coletas, naoColetas, tipos);
    expect(r.totais).toEqual([
      { tipoResiduoId: "a", nome: "Grupo A", unidade: "KG", total: 22.8 },
      { tipoResiduoId: "e", nome: "Grupo E", unidade: "CN", total: 2 },
    ]);
    expect(r.feitas).toBe(2);
    expect(r.paraRevisao).toBe(1);
    expect(r.emAberto).toBe(0);
  });

  it("lista as não coletas com o motivo", () => {
    expect(resumoDoDia(rota, coletas, naoColetas, tipos).naoFeitas).toEqual([
      { paradaId: "p3", clienteId: "c3", motivo: "Local fechado" },
    ]);
  });

  it("não deixa encerrar com paradas pendentes", () => {
    const comPendente: Rota = { ...rota, paradas: [...rota.paradas, { id: "p4", clienteId: "c4", ordem: 4, situacao: "pendente", mtrs: [] }] };
    const r = resumoDoDia(comPendente, coletas, naoColetas, tipos);
    expect(r.emAberto).toBe(1);
    expect(erroParaEncerrar(comPendente, r.emAberto)).toBe("Ainda falta 1 parada para resolver.");
    expect(erroParaEncerrar(rota, 0)).toBeNull();
    expect(erroParaEncerrar({ ...rota, situacao: "encerrada" }, 0)).toMatch(/já foi encerrada/);
  });
});
