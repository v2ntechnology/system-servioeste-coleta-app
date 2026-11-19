// QR Code de presença (specs/001-app-motorista-telas/contracts/qr-presenca.md).
// Formato: SVC1.<idCliente>.<janela>.<assinatura>; janela = floor(epochSegundos / 60);
// assinatura = base32(primeiros 10 bytes de HMAC-SHA256(segredo, "<idCliente>.<janela>")).
// Conferido no aparelho, sem internet.

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

export const VERSAO_QR = "SVC1";
export const SEGUNDOS_POR_JANELA = 60;

export type ResultadoQr = "valido" | "outroCliente" | "expirado" | "invalido";

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32(bytes: Uint8Array): string {
  let bits = 0;
  let valor = 0;
  let saida = "";
  for (const byte of bytes) {
    valor = (valor << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      saida += ALFABETO[(valor >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) saida += ALFABETO[(valor << (5 - bits)) & 31];
  return saida;
}

export function janelaDe(agora: Date): number {
  return Math.floor(agora.getTime() / 1000 / SEGUNDOS_POR_JANELA);
}

export function assinar(idCliente: string, janela: number, segredo: string): string {
  const mac = hmac(sha256, utf8ToBytes(segredo), utf8ToBytes(`${idCliente}.${janela}`));
  return base32(mac.slice(0, 10));
}

/** Gera o texto do QR (usado pelo link do cliente e, nesta fase, pela demonstração). */
export function gerarQr(idCliente: string, segredo: string, agora: Date = new Date()): string {
  const janela = janelaDe(agora);
  return `${VERSAO_QR}.${idCliente}.${janela}.${assinar(idCliente, janela, segredo)}`;
}

/** Comparação em tempo constante. */
function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

/**
 * Confere o QR lido.
 * @param segredos segredo de cada cliente da rota do dia (id → segredo)
 */
export function conferirQr(
  texto: string,
  clienteEsperado: string,
  segredos: Record<string, string>,
  agora: Date = new Date(),
): ResultadoQr {
  const partes = texto.trim().split(".");
  if (partes.length !== 4 || partes[0] !== VERSAO_QR) return "invalido";
  const [, idCliente, janelaTexto, assinatura] = partes;
  if (!/^\d+$/.test(janelaTexto) || !idCliente) return "invalido";
  const segredo = segredos[idCliente];
  if (!segredo) return "invalido";
  const janela = Number(janelaTexto);
  if (!iguais(assinatura, assinar(idCliente, janela, segredo))) return "invalido";
  if (idCliente !== clienteEsperado) return "outroCliente";
  const atual = janelaDe(agora);
  if (janela < atual - 1 || janela > atual) return "expirado";
  return "valido";
}

export const MENSAGEM_QR: Record<Exclude<ResultadoQr, "valido">, string> = {
  outroCliente: "Este QR Code é de outro cliente.",
  expirado: "QR Code expirado: peça ao cliente para abrir o link de novo.",
  invalido: "QR Code inválido. Peça ao cliente para mostrar o QR Code do link da Servioeste.",
};
