// T048: FIFO, idempotência, sem conexão mantém aguardando, recusado vira erro sem travar, nova tentativa com erros.
import { BANCO_VAZIO, useBanco } from "@/dados/repositorio";
import type { ItemDaFila, TipoItemFila } from "@/dados/tipos";
import { pendentes, processarFila } from "@/sincronizacao/fila";
import { definirTransporte, type RespostaEnvio, type Transporte } from "@/sincronizacao/transporte";

function item(id: string, criadoEm: string, situacao: ItemDaFila["situacao"] = "aguardando"): ItemDaFila {
  return { id, tipo: "coleta", dados: { id }, situacao, tentativas: 0, criadoEm };
}

function transporteFalso(responder: (id: string) => RespostaEnvio, conectado = { valor: true }) {
  const enviados: string[] = [];
  const t: Transporte = {
    conectado: () => conectado.valor,
    observarConexao: () => () => {},
    enviar: async (i: { id: string; tipo: TipoItemFila }) => {
      enviados.push(i.id);
      return responder(i.id);
    },
  };
  definirTransporte(t);
  return { enviados, conectado };
}

const ok = (): RespostaEnvio => ({ ok: true, recebidoEm: "2026-11-19T12:00:00Z" });

function situacoes() {
  return Object.fromEntries(useBanco.getState().fila.map((i) => [i.id, i.situacao]));
}

beforeEach(() => {
  useBanco.getState().carregar({
    ...BANCO_VAZIO,
    fila: [item("b", "2026-11-19T10:02:00Z"), item("a", "2026-11-19T10:01:00Z"), item("c", "2026-11-19T10:03:00Z")],
  });
});

it("envia na ordem em que os itens foram criados", async () => {
  const { enviados } = transporteFalso(ok);
  await processarFila();
  expect(enviados).toEqual(["a", "b", "c"]);
  expect(pendentes(useBanco.getState().fila)).toHaveLength(0);
});

it("sem conexão, nada é enviado e tudo continua aguardando", async () => {
  const { enviados } = transporteFalso(ok, { valor: false });
  await processarFila();
  expect(enviados).toEqual([]);
  expect(situacoes()).toEqual({ a: "aguardando", b: "aguardando", c: "aguardando" });
});

it("a conexão caindo no meio para o envio e mantém o restante aguardando", async () => {
  transporteFalso((id) => (id === "b" ? { ok: false, motivo: "semConexao", mensagem: "caiu" } : ok()));
  await processarFila();
  expect(situacoes()).toEqual({ a: "enviado", b: "aguardando", c: "aguardando" });
});

it("um item recusado vira erro e não trava os seguintes; 'Tentar agora' reenvia", async () => {
  let recusar = true;
  transporteFalso((id) => (id === "a" && recusar ? { ok: false, motivo: "recusado", mensagem: "recusado" } : ok()));
  await processarFila();
  expect(situacoes()).toEqual({ a: "erro", b: "enviado", c: "enviado" });

  recusar = false;
  await processarFila(); // o automático não repete os com erro
  expect(situacoes().a).toBe("erro");
  await processarFila(true); // "Tentar agora"
  expect(situacoes().a).toBe("enviado");
  expect(useBanco.getState().fila.find((i) => i.id === "a")?.tentativas).toBe(2);
});

it("um item que ficou 'enviando' (app fechado no meio) é enviado de novo", async () => {
  useBanco.getState().carregar({ ...BANCO_VAZIO, fila: [item("x", "2026-11-19T10:00:00Z", "enviando")] });
  const { enviados } = transporteFalso(ok);
  await processarFila();
  expect(enviados).toEqual(["x"]);
  expect(situacoes().x).toBe("enviado");
});
