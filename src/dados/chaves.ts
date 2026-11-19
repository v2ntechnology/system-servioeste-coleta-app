// Chaves do armazenamento do aparelho. Sempre com o prefixo `coleta-`.
// Suba VERSAO_DADOS quando o formato do banco local mudar: o conteúdo antigo é descartado.

export const VERSAO_DADOS = 1;

export const CHAVES = {
  banco: "coleta-banco",
  sessao: "coleta-sessao",
  tema: "coleta-tema",
  demo: "coleta-demo",
} as const;
