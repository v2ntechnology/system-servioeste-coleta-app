import { lerQuantidade, validarQuantidade } from "@/regras/quantidade";

describe("lerQuantidade", () => {
  it("lê vírgula e ponto decimais", () => {
    expect(lerQuantidade("12,80")).toBe(12.8);
    expect(lerQuantidade("12.8")).toBe(12.8);
    expect(lerQuantidade(" 3 ")).toBe(3);
  });
  it("vazio e texto inválido viram null", () => {
    expect(lerQuantidade("")).toBeNull();
    expect(lerQuantidade("abc")).toBeNull();
    expect(lerQuantidade("1,2,3")).toBeNull();
  });
});

describe("validarQuantidade", () => {
  it("KG e L aceitam decimal com até 2 casas", () => {
    expect(validarQuantidade(12.8, "KG")).toEqual({ ok: true, valor: 12.8, acimaDoHabitual: false });
    expect(validarQuantidade(1.25, "L").ok).toBe(true);
    expect(validarQuantidade(1.255, "KG").ok).toBe(false);
  });
  it("CN e UN só aceitam inteiro", () => {
    expect(validarQuantidade(2, "CN").ok).toBe(true);
    expect(validarQuantidade(2.5, "CN").ok).toBe(false);
    expect(validarQuantidade(1.5, "UN").ok).toBe(false);
  });
  it("recusa zero e vazio", () => {
    expect(validarQuantidade(0, "KG").ok).toBe(false);
    expect(validarQuantidade(null, "KG").ok).toBe(false);
  });
  it("acima de 5× o habitual pede confirmação", () => {
    expect(validarQuantidade(51, "KG", 10)).toMatchObject({ ok: true, acimaDoHabitual: true });
    expect(validarQuantidade(50, "KG", 10)).toMatchObject({ ok: true, acimaDoHabitual: false });
  });
});
