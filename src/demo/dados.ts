// Dados fictícios (princípios III e VI): nomes, CNPJs, endereços e placas inventados.
// Datas relativas a hoje; semente fixa para o histórico ser sempre o mesmo.

import type { DadosBanco } from "@/dados/repositorio";
import { VERSAO_DADOS } from "@/dados/chaves";
import type { Cliente, Coleta, NaoColeta, Pessoa, Rota, TipoResiduo, Veiculo } from "@/dados/tipos";
import { diaIso } from "@/lib/formato";
import { chaveSequencia, numeroComprovante } from "@/regras/comprovante";

export const MARCADOR_DEMO = "MARCADOR_DEMO_SERVIOESTE";

const pessoas: Pessoa[] = [
  { id: "pes_alan", nome: "Alan Sterce", funcao: "motorista", usuario: "alan", senha: "1234" },
  { id: "pes_douglas", nome: "Douglas Silva", funcao: "coletor" },
];

const veiculos: Veiculo[] = [{ id: "vei_rdu", placa: "RDU8D06", descricao: "Caminhão baú refrigerado" }];

const tiposResiduo: TipoResiduo[] = [
  { id: "res_a", nome: "Grupo A", classificacao: "Biológico", unidade: "KG" },
  { id: "res_b", nome: "Grupo B", classificacao: "Químico", unidade: "KG" },
  { id: "res_d", nome: "Grupo D", classificacao: "Comum", unidade: "KG" },
  { id: "res_e", nome: "Grupo E", classificacao: "Perfurocortante", unidade: "CN" },
];

const clientes: Cliente[] = [
  {
    id: "cli_saolucas",
    codigo: "001258",
    nome: "Hospital São Lucas",
    cnpj: "98765432000110",
    endereco: { logradouro: "Rua das Acácias", numero: "120", bairro: "Bangu", cidade: "Rio de Janeiro", uf: "RJ", cep: "21820050" },
    area: { lat: -22.8753, lng: -43.4652, raioMetros: 150 },
    periodicidade: "Semanal (quarta-feira)",
    contatos: { email: "coleta@saolucas.exemplo", whatsapp: "(21) 90000-0001" },
    residuos: ["res_a", "res_e"],
    quantidadeHabitual: { res_a: 12, res_e: 2 },
    segredoQr: "demo-saolucas-7f3a",
  },
  {
    id: "cli_vidamais",
    codigo: "001311",
    nome: "Clínica Vida Mais",
    cnpj: "11222333000144",
    endereco: { logradouro: "Av. Santa Cruz", numero: "4500", bairro: "Realengo", cidade: "Rio de Janeiro", uf: "RJ", cep: "21710231" },
    area: { lat: -22.8811, lng: -43.4302, raioMetros: 150 },
    periodicidade: "Semanal (quarta-feira)",
    contatos: { email: "adm@vidamais.exemplo" },
    residuos: ["res_a", "res_b"],
    quantidadeHabitual: { res_a: 6, res_b: 1.5 },
    segredoQr: "demo-vidamais-19c2",
  },
  {
    id: "cli_labsantos",
    codigo: "001402",
    nome: "Laboratório Santos",
    cnpj: "22333444000155",
    endereco: { logradouro: "Rua Francisco Real", numero: "880", bairro: "Padre Miguel", cidade: "Rio de Janeiro", uf: "RJ", cep: "21715000" },
    area: { lat: -22.8775, lng: -43.4471, raioMetros: 150 },
    periodicidade: "Quinzenal (quarta-feira)",
    contatos: { whatsapp: "(21) 90000-0003" },
    residuos: ["res_a", "res_b", "res_e"],
    quantidadeHabitual: { res_a: 4, res_b: 2, res_e: 1 },
    segredoQr: "demo-labsantos-a81d",
  },
  {
    id: "cli_unidadebangu",
    codigo: "001477",
    nome: "Unidade Bangu",
    cnpj: "33444555000166",
    endereco: { logradouro: "Rua Fonseca", numero: "240", bairro: "Bangu", cidade: "Rio de Janeiro", uf: "RJ", cep: "21820005" },
    area: { lat: -22.8712, lng: -43.4655, raioMetros: 150 },
    periodicidade: "Semanal (quarta-feira)",
    contatos: { email: "unidade@bangu.exemplo", whatsapp: "(21) 90000-0004" },
    residuos: ["res_a", "res_d"],
    quantidadeHabitual: { res_a: 9, res_d: 15 },
    segredoQr: "demo-unidadebangu-4be0",
  },
  {
    id: "cli_postooeste",
    codigo: "001503",
    nome: "Posto Saúde Oeste",
    cnpj: "44555666000177",
    endereco: { logradouro: "Estrada do Engenho", numero: "35", bairro: "Senador Camará", cidade: "Rio de Janeiro", uf: "RJ", cep: "21833000" },
    area: { lat: -22.8708, lng: -43.4931, raioMetros: 150 },
    periodicidade: "Semanal (quarta-feira)",
    contatos: { email: "posto@oeste.exemplo" },
    residuos: ["res_a", "res_e"],
    quantidadeHabitual: { res_a: 3, res_e: 1 },
    segredoQr: "demo-postooeste-c55e",
  },
  {
    id: "cli_odontosorriso",
    codigo: "001544",
    nome: "Odonto Sorriso",
    cnpj: "55666777000188",
    endereco: { logradouro: "Rua Silva Cardoso", numero: "77", bairro: "Bangu", cidade: "Rio de Janeiro", uf: "RJ", cep: "21810030" },
    area: { lat: -22.8789, lng: -43.4598, raioMetros: 150 },
    periodicidade: "Mensal (primeira quarta-feira)",
    contatos: { email: "contato@sorriso.exemplo" },
    residuos: ["res_a", "res_e"],
    quantidadeHabitual: { res_a: 1, res_e: 1 },
    segredoQr: "demo-odontosorriso-0d9b",
  },
];

/** Gerador pseudoaleatório com semente (mulberry32): o histórico é sempre igual. */
function sorteio(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASSINATURA_EXEMPLO = "M10 60 C 30 10, 50 10, 60 50 S 90 90, 110 40 S 150 20, 170 55";

function rotaDoDia(id: string, data: string, ordem: string[], situacao: Rota["situacao"]): Rota {
  return {
    id,
    codigo: "R03",
    regiao: "Zona Oeste",
    data,
    motoristaId: "pes_alan",
    coletorIds: ["pes_douglas"],
    veiculoId: "vei_rdu",
    situacao,
    paradas: ordem.map((clienteId, i) => ({
      id: `${id}_p${i + 1}`,
      clienteId,
      ordem: i + 1,
      situacao: "pendente",
      mtrs: [{ numero: `MTR-${data.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`, situacao: "Emitido" }],
    })),
  };
}

export function gerarDadosFicticios(agora: Date = new Date()): DadosBanco {
  const hoje = diaIso(agora);
  const rotas: Rota[] = [
    rotaDoDia("rota_hoje", hoje, ["cli_saolucas", "cli_vidamais", "cli_labsantos", "cli_unidadebangu", "cli_postooeste"], "liberada"),
  ];
  const coletas: Record<string, Coleta> = {};
  const naoColetas: Record<string, NaoColeta> = {};
  const sequencias: Record<string, number> = {};
  const aleatorio = sorteio(20261119);

  // 10 dias de histórico (sem domingos), do mais antigo para o mais recente.
  const dias: Date[] = [];
  for (let d = 1; dias.length < 10 && d < 20; d++) {
    const dia = new Date(agora.getTime() - d * 86_400_000);
    if (dia.getUTCDay() !== 0) dias.push(dia);
  }
  dias.reverse().forEach((dia, n) => {
    const data = diaIso(dia);
    const ordem = [...clientes].sort(() => aleatorio() - 0.5).slice(0, 4).map((c) => c.id);
    const rota = rotaDoDia(`rota_h${n}`, data, ordem, "encerrada");
    rota.paradas = rota.paradas.map((parada, i) => {
      const momento = new Date(dia);
      momento.setUTCHours(11 + i, Math.floor(aleatorio() * 50), 0, 0);
      const em = momento.toISOString();
      const cliente = clientes.find((c) => c.id === parada.clienteId)!;
      if (aleatorio() < 0.12) {
        const id = `nao_h${n}_${i}`;
        naoColetas[id] = { id, paradaId: parada.id, rotaId: rota.id, clienteId: cliente.id, motivo: "localFechado", local: { ...cliente.area, precisao: 12, mocked: false, em }, em };
        return { ...parada, situacao: "naoColetada", registroId: id };
      }
      const chave = chaveSequencia(em, "RDU8D06");
      sequencias[chave] = (sequencias[chave] ?? 0) + 1;
      const id = `col_h${n}_${i}`;
      coletas[id] = {
        id,
        paradaId: parada.id,
        rotaId: rota.id,
        clienteId: cliente.id,
        situacao: "finalizada",
        itens: cliente.residuos.slice(0, 2).map((tipoResiduoId) => {
          const tipo = tiposResiduo.find((t) => t.id === tipoResiduoId)!;
          const base = cliente.quantidadeHabitual[tipoResiduoId] ?? 1;
          const quantidade = tipo.unidade === "KG" ? Math.round(base * (0.7 + aleatorio() * 0.6) * 100) / 100 : Math.max(1, Math.round(base));
          return { tipoResiduoId, quantidade };
        }),
        prova: {
          qr: { resultado: "valido", codigo: `SVC1.${cliente.id}.0.HISTORICO`, lidoEm: em },
          local: { ...cliente.area, precisao: 10, mocked: false, em },
        },
        assinatura: { tipo: "assinada", caminhoSvg: ASSINATURA_EXEMPLO, nome: "Responsável do cliente", fotoDocumentoUri: "demo://documento" },
        revisao: [],
        iniciadaEm: em,
        finalizadaEm: em,
        comprovanteNumero: numeroComprovante(em, "RDU8D06", sequencias[chave]),
      };
      return { ...parada, situacao: "coletada", registroId: id };
    });
    rota.jornadaIniciadaEm = rota.paradas.length ? coletas[rota.paradas[0].registroId!]?.iniciadaEm : undefined;
    rota.encerradaEm = rota.jornadaIniciadaEm;
    rotas.push(rota);
  });

  return {
    versao: VERSAO_DADOS,
    pessoas,
    veiculos,
    tiposResiduo,
    clientes,
    rotas,
    coletas,
    naoColetas,
    mudancas: [],
    fila: [],
    sequencias,
  };
}
