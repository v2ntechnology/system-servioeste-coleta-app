// Identificadores gerados no aparelho, sem rede. Tempo + aleatório: únicos o bastante para um aparelho.
let contador = 0;

export function novoId(prefixo: string): string {
  contador = (contador + 1) % 1296;
  const tempo = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${prefixo}_${tempo}${contador.toString(36).padStart(2, "0")}${aleatorio}`;
}
