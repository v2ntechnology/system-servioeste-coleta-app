// T051: haversine; dentro e fora de raioMetros = 150; sem posição → semLocalizacao; mocked → localizacaoFalsa.
import type { Cliente } from "@/dados/tipos";
import { dentroDaArea, distanciaMetros, motivosDaLocalizacao } from "@/regras/cerca";

const area = { lat: -22.8753, lng: -43.4652, raioMetros: 150 };
const cliente = { id: "c", area } as unknown as Cliente;
const em = "2026-11-19T12:00:00Z";

describe("cerca virtual", () => {
  it("calcula a distância (1 grau de latitude ≈ 111 km)", () => {
    expect(distanciaMetros({ lat: 0, lng: 0 }, { lat: 1, lng: 0 })).toBeCloseTo(111_195, -2);
    expect(distanciaMetros(area, area)).toBe(0);
  });

  it("dentro e fora do raio de 150 m", () => {
    expect(dentroDaArea({ lat: area.lat + 0.001, lng: area.lng }, area)).toBe(true); // ~111 m
    expect(dentroDaArea({ lat: area.lat + 0.002, lng: area.lng }, area)).toBe(false); // ~222 m
  });

  it("motivos de revisão", () => {
    expect(motivosDaLocalizacao({ ...area, precisao: 10, mocked: false, em }, cliente)).toEqual([]);
    expect(motivosDaLocalizacao(null, cliente)).toEqual(["semLocalizacao"]);
    expect(motivosDaLocalizacao({ ...area, precisao: 10, mocked: true, em }, cliente)).toEqual(["localizacaoFalsa"]);
    expect(motivosDaLocalizacao({ lat: area.lat + 0.01, lng: area.lng, precisao: 10, mocked: false, em }, cliente)).toEqual([
      "foraDaArea",
    ]);
  });
});
