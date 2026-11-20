// Fluxo da coleta no repositório local (T042, T043): coleta completa, recusa, imutabilidade, não coleta e ordem.
import { useBanco } from "@/dados/repositorio";
import { gerarDadosFicticios } from "@/demo/dados";
import { acoesColeta, registrarNaoColeta } from "@/features/coleta/useColeta";
import { useSessao } from "@/features/sessao/useSessao";
import { gerarQr } from "@/regras/qr";

jest.mock("@/dispositivo/localizacao", () => ({
  lerLocalizacao: jest.fn(async () => ({ lat: -22.8753, lng: -43.4652, precisao: 8, mocked: false, em: new Date().toISOString() })),
}));

const assinada = { tipo: "assinada", forma: "desenhada", caminhoSvg: "M0 0 L10 10", nome: "Alex", fotoDocumentoUri: "file://doc.jpg" } as const;

function preparar() {
  useBanco.getState().carregar(gerarDadosFicticios());
  const rota = useBanco.getState().rotas.find((r) => r.id === "rota_hoje")!;
  useBanco.getState().iniciarJornada(rota.id);
  return useBanco.getState().rotas.find((r) => r.id === "rota_hoje")!;
}

function lerQrValido(coletaId: string, clienteId: string) {
  const cliente = useBanco.getState().clientes.find((c) => c.id === clienteId)!;
  acoesColeta.registrarQr(coletaId, { resultado: "valido", codigo: gerarQr(cliente.id, cliente.segredoQr), lidoEm: new Date().toISOString() });
}

function parada(id: string) {
  return useBanco.getState().rotas.find((r) => r.id === "rota_hoje")!.paradas.find((p) => p.id === id)!;
}

describe("coleta completa", () => {
  it("Grupo A 12,80 kg + Grupo E 2 CN com assinatura: parada coletada e comprovante gerado", async () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    expect(parada(p1.id).situacao).toBe("emAndamento");
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 12.8 });
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_e", quantidade: 2 });
    const numero = await acoesColeta.finalizar(id, assinada);

    const coleta = useBanco.getState().coletas[id];
    expect(coleta.situacao).toBe("finalizada");
    expect(coleta.itens).toHaveLength(2);
    expect(coleta.prova.local).not.toBeNull();
    expect(numero).toMatch(/^\d{8}-RDU8D06-\d{3}$/);
    expect(parada(p1.id).situacao).toBe("coletada");
    expect(useBanco.getState().fila.some((i) => i.id === id && i.tipo === "coleta")).toBe(true);
  });

  it("coleta finalizada não pode ser alterada pelo repositório", async () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 5 });
    await acoesColeta.finalizar(id, assinada);

    expect(() => acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 99 })).toThrow(/finalizada/);
    expect(() => acoesColeta.removerItem(id, "res_a")).toThrow(/finalizada/);
    expect(() => acoesColeta.cancelar(id)).toThrow(/finalizada/);
    expect(() => acoesColeta.registrarQr(id, { resultado: "semQr", justificativa: "x", em: "" })).toThrow(/finalizada/);
    await expect(acoesColeta.finalizar(id, assinada)).rejects.toThrow();
    expect(useBanco.getState().coletas[id].itens).toEqual([{ tipoResiduoId: "res_a", quantidade: 5 }]);
  });

  it("recusa da assinatura finaliza sem traço nem foto", async () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 1 });
    await acoesColeta.finalizar(id, { tipo: "recusada" });
    expect(useBanco.getState().coletas[id].assinatura).toEqual({ tipo: "recusada" });
  });

  it("sem QR Code, com justificativa, a coleta fica marcada para revisão", async () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    acoesColeta.registrarQr(id, { resultado: "semQr", justificativa: "Cliente sem celular", em: new Date().toISOString() });
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 1 });
    await acoesColeta.finalizar(id, assinada);
    expect(useBanco.getState().coletas[id].revisao).toEqual([{ motivo: "semQr" }]);
  });

  it("fora da área e com GPS falso a coleta é finalizada, mas marcada para revisão", async () => {
    const { lerLocalizacao } = jest.requireMock("@/dispositivo/localizacao") as { lerLocalizacao: jest.Mock };
    lerLocalizacao.mockResolvedValueOnce({ lat: -22.9, lng: -43.4652, precisao: 8, mocked: true, em: new Date().toISOString() });
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 1 });
    await acoesColeta.finalizar(id, assinada);
    const coleta = useBanco.getState().coletas[id];
    expect(coleta.situacao).toBe("finalizada");
    expect(coleta.revisao.map((r) => r.motivo).sort()).toEqual(["foraDaArea", "localizacaoFalsa"]);
  });

  it("sem localização a coleta fica marcada como sem localização", async () => {
    const { lerLocalizacao } = jest.requireMock("@/dispositivo/localizacao") as { lerLocalizacao: jest.Mock };
    lerLocalizacao.mockResolvedValueOnce(null);
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 1 });
    await acoesColeta.finalizar(id, assinada);
    expect(useBanco.getState().coletas[id].revisao).toEqual([{ motivo: "semLocalizacao" }]);
  });

  it("não deixa adicionar resíduo que não é do cliente nem finalizar sem itens", async () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    expect(() => acoesColeta.salvarItem(id, { tipoResiduoId: "res_d", quantidade: 1 })).toThrow();
    await expect(acoesColeta.finalizar(id, assinada)).rejects.toThrow(/pelo menos um resíduo/);
  });

  it("cancelar a coleta devolve a parada a pendente", () => {
    const rota = preparar();
    const p1 = rota.paradas[0];
    const id = acoesColeta.iniciar(rota.id, p1.id);
    acoesColeta.cancelar(id);
    expect(parada(p1.id).situacao).toBe("pendente");
    expect(useBanco.getState().coletas[id]).toBeUndefined();
  });
});

describe("ordem das paradas", () => {
  it("atender fora da ordem exige o motivo; a pulada continua pendente", () => {
    const rota = preparar();
    const [p1, , p3] = rota.paradas;
    expect(() => acoesColeta.iniciar(rota.id, p3.id)).toThrow(/mudança de ordem/);
    useBanco.getState().registrarMudancaDeOrdem({ rotaId: rota.id, paradaPuladaId: p1.id, paradaAtendidaId: p3.id, motivo: "transito" });
    acoesColeta.iniciar(rota.id, p3.id);
    expect(parada(p3.id).situacao).toBe("emAndamento");
    expect(parada(p1.id).situacao).toBe("pendente");
    expect(useBanco.getState().fila.some((i) => i.tipo === "mudancaDeOrdem")).toBe(true);
  });
});

describe("não coleta", () => {
  it("'Outro' sem texto não salva", async () => {
    const rota = preparar();
    await expect(registrarNaoColeta({ rotaId: rota.id, paradaId: rota.paradas[0].id, motivo: "outro", texto: " " })).rejects.toThrow(
      /Escreva o motivo/,
    );
    expect(parada(rota.paradas[0].id).situacao).toBe("pendente");
  });

  it("registro salvo deixa a parada não coletada, com motivo, hora e local", async () => {
    const rota = preparar();
    const id = await registrarNaoColeta({ rotaId: rota.id, paradaId: rota.paradas[0].id, motivo: "localFechado" });
    const registro = useBanco.getState().naoColetas[id];
    expect(parada(rota.paradas[0].id).situacao).toBe("naoColetada");
    expect(registro.motivo).toBe("localFechado");
    expect(registro.em).toBeTruthy();
    expect(registro.local).not.toBeNull();
    await expect(registrarNaoColeta({ rotaId: rota.id, paradaId: rota.paradas[0].id, motivo: "semResiduo" })).rejects.toThrow(
      /já foi resolvida/,
    );
  });
});

describe("sessão", () => {
  it("entra com os dados de exemplo e recusa senha errada", () => {
    preparar();
    expect(useSessao.getState().entrar("alan", "errada")).toBe("Usuário ou senha incorretos.");
    expect(useSessao.getState().entrar("ALAN", "1234")).toBeNull();
    expect(useSessao.getState().motoristaId).toBe("pes_alan");
  });

  it("não deixa sair com registros não enviados", async () => {
    const rota = preparar();
    useSessao.getState().entrar("alan", "1234");
    await registrarNaoColeta({ rotaId: rota.id, paradaId: rota.paradas[0].id, motivo: "localFechado" });
    expect(useSessao.getState().sair()).toMatch(/ainda não enviado/);
    expect(useSessao.getState().motoristaId).toBe("pes_alan");
  });
});

describe("encerrar a rota", () => {
  it("recusa com paradas em aberto e encerra quando todas estão resolvidas", async () => {
    const rota = preparar();
    expect(() => useBanco.getState().encerrarRota(rota.id)).toThrow(/faltam 5 paradas/);

    const [p1, ...outras] = rota.paradas;
    const id = acoesColeta.iniciar(rota.id, p1.id);
    lerQrValido(id, p1.clienteId);
    acoesColeta.salvarItem(id, { tipoResiduoId: "res_a", quantidade: 10 });
    await acoesColeta.finalizar(id, assinada);
    for (const p of outras) await registrarNaoColeta({ rotaId: rota.id, paradaId: p.id, motivo: "localFechado" });

    useBanco.getState().encerrarRota(rota.id);
    const encerrada = useBanco.getState().rotas.find((r) => r.id === rota.id)!;
    expect(encerrada.situacao).toBe("encerrada");
    expect(encerrada.encerradaEm).toBeTruthy();
    const item = useBanco.getState().fila.find((i) => i.tipo === "encerramento");
    expect(item?.dados).toMatchObject({ rotaId: rota.id, resumo: { feitas: 1, emAberto: 0 } });
    expect(() => useBanco.getState().encerrarRota(rota.id)).toThrow(/já foi encerrada/);
  });
});
