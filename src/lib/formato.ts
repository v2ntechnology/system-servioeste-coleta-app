// Formatação para quem lê: datas no fuso de Brasília e números com vírgula decimal (princípio I).

const FUSO = "America/Sao_Paulo";

const dataFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", year: "numeric" });
const horaFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });
const diaSemanaFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, weekday: "long" });
const partesFmt = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });

/** 16/09/2026 */
export function data(iso: string | Date): string {
  return dataFmt.format(new Date(iso));
}

/** 08:32 */
export function hora(iso: string | Date): string {
  return horaFmt.format(new Date(iso));
}

/** quarta-feira */
export function diaDaSemana(iso: string | Date): string {
  return diaSemanaFmt.format(new Date(iso));
}

/** 2026-09-16, a data do dia em Brasília (para comparar dias). */
export function diaIso(iso: string | Date): string {
  return partesFmt.format(new Date(iso));
}

/** 12,8 · 2 · 22,85 (até 2 casas, sem zeros sobrando). */
export function quantidade(valor: number): string {
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/** 12,80 (sempre 2 casas, como no comprovante). */
export function quantidadeFixa(valor: number, casas: number): string {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/** 98.765.432/0001-10 */
export function cnpj(valor: string): string {
  const d = valor.replace(/\D/g, "");
  if (d.length !== 14) return valor;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** 21820-050 */
export function cep(valor: string): string {
  const d = valor.replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : valor;
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
