// Casos obrigatórios de contracts/qr-presenca.md.
import { assinar, conferirQr, gerarQr, janelaDe } from "@/regras/qr";

const segredos = { cli1: "segredo-um", cli2: "segredo-dois" };
const agora = new Date("2026-11-19T12:00:30Z");

function qrNaJanela(id: "cli1" | "cli2", janela: number) {
  return `SVC1.${id}.${janela}.${assinar(id, janela, segredos[id])}`;
}

describe("conferirQr", () => {
  const atual = janelaDe(agora);

  it("aceita a janela atual e a anterior", () => {
    expect(conferirQr(gerarQr("cli1", segredos.cli1, agora), "cli1", segredos, agora)).toBe("valido");
    expect(conferirQr(qrNaJanela("cli1", atual - 1), "cli1", segredos, agora)).toBe("valido");
  });

  it("recusa como expirado o de 2 janelas atrás e o de janela futura", () => {
    expect(conferirQr(qrNaJanela("cli1", atual - 2), "cli1", segredos, agora)).toBe("expirado");
    expect(conferirQr(qrNaJanela("cli1", atual + 1), "cli1", segredos, agora)).toBe("expirado");
  });

  it("identifica o QR de outro cliente da rota", () => {
    expect(conferirQr(gerarQr("cli2", segredos.cli2, agora), "cli1", segredos, agora)).toBe("outroCliente");
  });

  it("recusa a assinatura alterada e um texto qualquer", () => {
    const bom = gerarQr("cli1", segredos.cli1, agora);
    const ultimo = bom.at(-1) === "A" ? "B" : "A";
    expect(conferirQr(bom.slice(0, -1) + ultimo, "cli1", segredos, agora)).toBe("invalido");
    expect(conferirQr("https://exemplo.com.br", "cli1", segredos, agora)).toBe("invalido");
    expect(conferirQr("SVC1.desconhecido.1.AAAA", "cli1", segredos, agora)).toBe("invalido");
  });

  it("gera assinatura de 16 caracteres em base32", () => {
    expect(assinar("cli1", atual, segredos.cli1)).toMatch(/^[A-Z2-7]{16}$/);
  });
});
