// Quantidade de um resíduo: KG e L aceitam decimal (2 casas); CN e UN só inteiro; zero e vazio recusados.

import type { Unidade } from "@/dados/tipos";

export const UNIDADE_DECIMAL: Record<Unidade, boolean> = { KG: true, L: true, CN: false, UN: false };

export const NOME_UNIDADE: Record<Unidade, string> = {
  KG: "quilos (kg)",
  L: "litros (L)",
  CN: "contêineres (CN)",
  UN: "unidades (UN)",
};

/** Lê o texto digitado ("12,80", "12.8", " 3 ") como número; vazio ou inválido = null. */
export function lerQuantidade(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, "");
  if (limpo === "") return null;
  if (!/^\d+([.,]\d+)?$/.test(limpo)) return null;
  const n = Number(limpo.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export type ResultadoQuantidade =
  | { ok: true; valor: number; acimaDoHabitual: boolean }
  | { ok: false; erro: string };

/** Confere a quantidade para a unidade. `habitual` = média do cliente; acima de 5× pede confirmação. */
export function validarQuantidade(valor: number | null, unidade: Unidade, habitual?: number): ResultadoQuantidade {
  if (valor === null) return { ok: false, erro: "Informe a quantidade." };
  if (valor <= 0) return { ok: false, erro: "A quantidade precisa ser maior que zero." };
  if (UNIDADE_DECIMAL[unidade]) {
    if (Math.abs(Math.round(valor * 100) - valor * 100) > 1e-6) {
      return { ok: false, erro: "Use no máximo 2 casas decimais." };
    }
  } else if (!Number.isInteger(valor)) {
    return { ok: false, erro: `Em ${NOME_UNIDADE[unidade]} a quantidade é um número inteiro.` };
  }
  const acimaDoHabitual = habitual !== undefined && habitual > 0 && valor > habitual * 5;
  return { ok: true, valor: arredondar(valor), acimaDoHabitual };
}

/** Passo dos botões − e +: 1 para todas as unidades. */
export function passo(): number {
  return 1;
}

export function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100;
}
