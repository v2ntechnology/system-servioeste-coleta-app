import { cnpj, data, diaIso, hora, quantidade, quantidadeFixa } from "@/lib/formato";

describe("formato", () => {
  it("datas e horas no fuso de Brasília", () => {
    expect(data("2026-09-16T11:32:00Z")).toBe("16/09/2026");
    expect(hora("2026-09-16T11:32:00Z")).toBe("08:32");
    expect(diaIso("2026-09-17T02:00:00Z")).toBe("2026-09-16");
  });

  it("quantidades com vírgula", () => {
    expect(quantidade(12.8)).toBe("12,8");
    expect(quantidade(22.85)).toBe("22,85");
    expect(quantidadeFixa(12.8, 2)).toBe("12,80");
  });

  it("CNPJ com máscara", () => {
    expect(cnpj("98765432000110")).toBe("98.765.432/0001-10");
  });
});
