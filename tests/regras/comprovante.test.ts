import { numeroComprovante, urlVerificacao } from "@/regras/comprovante";

describe("comprovante", () => {
  it("número AAAAMMDD-placa-seq no dia de Brasília", () => {
    expect(numeroComprovante("2026-11-19T12:00:00Z", "rdu8d06", 1)).toBe("20261119-RDU8D06-001");
    // 01:30 UTC ainda é dia 18 em Brasília
    expect(numeroComprovante("2026-11-19T01:30:00Z", "RDU8D06", 12)).toBe("20261118-RDU8D06-012");
  });

  it("URL de verificação usa o domínio configurado", () => {
    expect(urlVerificacao("20261119-RDU8D06-001", "exemplo.test")).toBe(
      "https://exemplo.test/coleta/verificar/20261119-RDU8D06-001",
    );
  });
});
