// Tipos do aparelho (specs/001-app-motorista-telas/data-model.md).
// Identificadores em português sem acento. Datas em ISO 8601 com fuso.
// Na fase do back-end, estes tipos viram o contrato da API.

export type Funcao = "motorista" | "coletor";

export type Pessoa = {
  id: string;
  nome: string;
  funcao: Funcao;
  usuario?: string; // só motorista
  senha?: string; // só nos dados fictícios; o login real é da fase do back-end
};

export type Veiculo = { id: string; placa: string; descricao: string };

/** KG e L aceitam decimal (2 casas); CN e UN só inteiro. */
export type Unidade = "KG" | "CN" | "L" | "UN";

export type TipoResiduo = {
  id: string;
  nome: string;
  classificacao: string;
  unidade: Unidade;
};

export type Endereco = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export type Ponto = { lat: number; lng: number };

export type Cliente = {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string;
  endereco: Endereco;
  area: Ponto & { raioMetros: number };
  periodicidade: string;
  contatos: { email?: string; whatsapp?: string };
  residuos: string[]; // ids de TipoResiduo
  /** média por coleta, por tipo de resíduo; acima de 5× pede confirmação extra */
  quantidadeHabitual: Record<string, number>;
  /** só para os clientes da rota do dia (contracts/qr-presenca.md) */
  segredoQr: string;
};

export type SituacaoParada = "pendente" | "emAndamento" | "coletada" | "naoColetada";

export type Mtr = { numero: string; situacao: string };

export type Parada = {
  id: string;
  clienteId: string;
  ordem: number;
  situacao: SituacaoParada;
  mtrs: Mtr[];
  registroId?: string; // coleta ou não coleta que resolveu a parada
};

export type SituacaoRota = "liberada" | "emAndamento" | "encerrada";

export type Rota = {
  id: string;
  codigo: string;
  regiao: string;
  data: string; // AAAA-MM-DD (Brasília)
  motoristaId: string;
  coletorIds: string[];
  veiculoId: string;
  situacao: SituacaoRota;
  paradas: Parada[];
  jornadaIniciadaEm?: string;
  encerradaEm?: string;
};

export type MotivoMudancaDeOrdem = "transito" | "clientePediuOutroHorario" | "acessoFechadoNoMomento" | "outro";

export type MudancaDeOrdem = {
  id: string;
  rotaId: string;
  paradaPuladaId: string;
  paradaAtendidaId: string;
  motivo: MotivoMudancaDeOrdem;
  texto?: string; // obrigatório se motivo = "outro"
  em: string;
};

export type ItemColeta = { tipoResiduoId: string; quantidade: number };

export type ProvaQr =
  | { resultado: "valido"; codigo: string; lidoEm: string }
  | { resultado: "semQr"; justificativa: string; em: string };

export type Localizacao = { lat: number; lng: number; precisao: number | null; mocked: boolean; em: string };

/** Desenhada com o dedo (caminho SVG) ou digitada (o nome numa fonte manuscrita escolhida). */
export type FormaAssinatura = "desenhada" | "digitada";

export type Assinatura =
  | {
      tipo: "assinada";
      forma: FormaAssinatura;
      caminhoSvg?: string; // forma = "desenhada"
      fonte?: string; // forma = "digitada" (id de src/tema/fontesAssinatura.ts)
      nome: string;
      fotoDocumentoUri: string;
    }
  | { tipo: "recusada"; nome?: string };

export type MotivoRevisao = "semQr" | "foraDaArea" | "localizacaoFalsa" | "semLocalizacao";

export type SituacaoColeta = "rascunho" | "finalizada";

export type Coleta = {
  id: string;
  paradaId: string;
  rotaId: string;
  clienteId: string;
  situacao: SituacaoColeta;
  itens: ItemColeta[];
  prova: { qr?: ProvaQr; local: Localizacao | null };
  assinatura?: Assinatura;
  revisao: { motivo: MotivoRevisao }[];
  iniciadaEm: string;
  finalizadaEm?: string;
  comprovanteNumero?: string;
};

export type MotivoNaoColeta = "localFechado" | "semResiduo" | "clienteNaoAutorizou" | "acessoImpedido" | "outro";

export type NaoColeta = {
  id: string;
  paradaId: string;
  rotaId: string;
  clienteId: string;
  motivo: MotivoNaoColeta;
  texto?: string; // obrigatório se motivo = "outro"
  observacao?: string;
  local: Localizacao | null;
  em: string;
};

export type TipoItemFila = "coleta" | "naoColeta" | "mudancaDeOrdem" | "encerramento";

export type SituacaoItemFila = "aguardando" | "enviando" | "enviado" | "erro";

export type ItemDaFila = {
  id: string; // igual ao do registro (idempotente)
  tipo: TipoItemFila;
  dados: unknown; // cópia congelada do registro
  situacao: SituacaoItemFila;
  tentativas: number;
  ultimoErro?: string;
  criadoEm: string;
  enviadoEm?: string;
};

export const TEXTO_MOTIVO_NAO_COLETA: Record<MotivoNaoColeta, string> = {
  localFechado: "Local fechado",
  semResiduo: "Sem resíduo para coletar",
  clienteNaoAutorizou: "Cliente não autorizou a coleta",
  acessoImpedido: "Acesso impedido",
  outro: "Outro",
};

export const TEXTO_MOTIVO_MUDANCA: Record<MotivoMudancaDeOrdem, string> = {
  transito: "Trânsito",
  clientePediuOutroHorario: "Cliente pediu outro horário",
  acessoFechadoNoMomento: "Acesso fechado no momento",
  outro: "Outro",
};

export const TEXTO_MOTIVO_REVISAO: Record<MotivoRevisao, string> = {
  semQr: "Cliente sem QR Code",
  foraDaArea: "Confirmada fora da área do cliente",
  localizacaoFalsa: "Sinal de localização falsa",
  semLocalizacao: "Sem localização",
};

export const TEXTO_SITUACAO_PARADA: Record<SituacaoParada, string> = {
  pendente: "Pendente",
  emAndamento: "Em andamento",
  coletada: "Coletada",
  naoColetada: "Não coletada",
};
