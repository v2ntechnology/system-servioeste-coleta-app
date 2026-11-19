import type { Rota } from "@/dados/tipos";
import { paradasEmAberto, podeIniciar, proximaParada, validarMotivoMudanca } from "@/regras/ordem";

function rota(situacoes: Rota["paradas"][number]["situacao"][]): Rota {
  return {
    id: "r",
    codigo: "R03",
    regiao: "Zona Oeste",
    data: "2026-11-19",
    motoristaId: "m",
    coletorIds: ["c"],
    veiculoId: "v",
    situacao: "emAndamento",
    paradas: situacoes.map((situacao, i) => ({ id: `p${i + 1}`, clienteId: `c${i + 1}`, ordem: i + 1, situacao, mtrs: [] })),
  };
}

describe("ordem das paradas", () => {
  it("a próxima é a pendente de menor ordem", () => {
    expect(proximaParada(rota(["coletada", "pendente", "pendente"]))?.id).toBe("p2");
    expect(proximaParada(rota(["coletada", "naoColetada"]))).toBeUndefined();
  });

  it("a próxima pode ser iniciada sem motivo", () => {
    expect(podeIniciar(rota(["pendente", "pendente"]), "p1")).toEqual({ pode: true, exigeMotivo: false });
  });

  it("atender outra parada exige motivo, e a pulada continua pendente", () => {
    const r = rota(["pendente", "pendente", "pendente"]);
    const resultado = podeIniciar(r, "p3");
    expect(resultado).toMatchObject({ pode: true, exigeMotivo: true });
    expect(r.paradas[0].situacao).toBe("pendente");
  });

  it("não deixa iniciar outra com uma coleta em andamento", () => {
    expect(podeIniciar(rota(["emAndamento", "pendente"]), "p2")).toMatchObject({ pode: false });
    expect(podeIniciar(rota(["emAndamento", "pendente"]), "p1")).toEqual({ pode: true, exigeMotivo: false });
  });

  it("não deixa iniciar uma parada resolvida nem com a jornada parada", () => {
    expect(podeIniciar(rota(["coletada"]), "p1")).toMatchObject({ pode: false });
    expect(podeIniciar({ ...rota(["pendente"]), situacao: "liberada" }, "p1")).toMatchObject({ pode: false });
  });

  it("motivo 'outro' exige texto", () => {
    expect(validarMotivoMudanca(undefined)).not.toBeNull();
    expect(validarMotivoMudanca("outro", "  ")).not.toBeNull();
    expect(validarMotivoMudanca("outro", "Cliente ligou")).toBeNull();
    expect(validarMotivoMudanca("transito")).toBeNull();
  });

  it("conta as paradas em aberto", () => {
    expect(paradasEmAberto(rota(["coletada", "emAndamento", "pendente", "naoColetada"]))).toBe(2);
  });
});
