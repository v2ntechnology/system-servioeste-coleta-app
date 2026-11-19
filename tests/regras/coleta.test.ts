import type { Cliente, Coleta } from "@/dados/tipos";
import { ColetaFinalizadaError, comItem, errosParaFinalizar, garantirRascunho, semItem } from "@/regras/coleta";

const cliente = { id: "c1", residuos: ["grupoA", "grupoE"] } as unknown as Cliente;

function coleta(parcial: Partial<Coleta> = {}): Coleta {
  return {
    id: "col1",
    paradaId: "p1",
    rotaId: "r",
    clienteId: "c1",
    situacao: "rascunho",
    itens: [],
    prova: { qr: { resultado: "valido", codigo: "x", lidoEm: "2026-11-19T12:00:00Z" }, local: null },
    revisao: [],
    iniciadaEm: "2026-11-19T12:00:00Z",
    ...parcial,
  };
}

const assinada = { tipo: "assinada", caminhoSvg: "M0 0 L1 1", nome: "Alex", fotoDocumentoUri: "file://doc.jpg" } as const;

describe("itens da coleta", () => {
  it("acrescenta e corrige sem repetir o tipo", () => {
    const c = coleta({ itens: [{ tipoResiduoId: "grupoA", quantidade: 10 }] });
    expect(comItem(c, cliente, { tipoResiduoId: "grupoA", quantidade: 12.8 })).toEqual([
      { tipoResiduoId: "grupoA", quantidade: 12.8 },
    ]);
    expect(comItem(c, cliente, { tipoResiduoId: "grupoE", quantidade: 2 })).toHaveLength(2);
  });

  it("recusa resíduo que não é do cliente", () => {
    expect(() => comItem(coleta(), cliente, { tipoResiduoId: "grupoB", quantidade: 1 })).toThrow();
  });

  it("remove item", () => {
    expect(semItem(coleta({ itens: [{ tipoResiduoId: "grupoA", quantidade: 1 }] }), "grupoA")).toEqual([]);
  });
});

describe("finalizar", () => {
  const comItens = coleta({ itens: [{ tipoResiduoId: "grupoA", quantidade: 1 }] });

  it("exige pelo menos um resíduo", () => {
    expect(errosParaFinalizar(coleta(), assinada)).toContain("Adicione pelo menos um resíduo.");
  });

  it("exige assinatura completa ou recusa", () => {
    expect(errosParaFinalizar(comItens, undefined)).toHaveLength(1);
    expect(errosParaFinalizar(comItens, { ...assinada, fotoDocumentoUri: "" })[0]).toMatch(/foto do documento/);
    expect(errosParaFinalizar(comItens, { ...assinada, nome: " " })[0]).toMatch(/nome/);
    expect(errosParaFinalizar(comItens, assinada)).toEqual([]);
    expect(errosParaFinalizar(comItens, { tipo: "recusada" })).toEqual([]);
  });

  it("exige o QR lido ou justificado", () => {
    expect(errosParaFinalizar(coleta({ ...comItens, prova: { local: null } }), assinada)).toContain(
      "Leia o QR Code do cliente.",
    );
  });
});

describe("coleta finalizada não muda (princípio VII)", () => {
  const finalizada = coleta({ situacao: "finalizada", itens: [{ tipoResiduoId: "grupoA", quantidade: 1 }] });

  it("recusa qualquer alteração", () => {
    expect(() => garantirRascunho(finalizada)).toThrow(ColetaFinalizadaError);
    expect(() => comItem(finalizada, cliente, { tipoResiduoId: "grupoE", quantidade: 1 })).toThrow(ColetaFinalizadaError);
    expect(() => semItem(finalizada, "grupoA")).toThrow(ColetaFinalizadaError);
    expect(errosParaFinalizar(finalizada, assinada)).toEqual(["Esta coleta já foi finalizada."]);
  });
});
