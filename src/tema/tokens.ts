// Tokens de cor copiados do Estoque (system-servioeste-estoque-front/src/index.css).
// Preto, branco e cinzas na interface; verde Servioeste só para selecionado e sucesso;
// cores de situação só para indicar situação (princípio XI).

export type Cores = {
  fundo: string;
  texto: string;
  cartao: string;
  primario: string;
  textoPrimario: string;
  suave: string;
  textoSuave: string;
  borda: string;
  perigo: string;
  aviso: string;
  marca: string;
  textoMarca: string;
  sucesso: string;
};

export const claro: Cores = {
  fundo: "#ffffff",
  texto: "#0a0a0a",
  cartao: "#ffffff",
  primario: "#0a0a0a",
  textoPrimario: "#fafafa",
  suave: "#f4f4f5",
  textoSuave: "#71717a",
  borda: "#e4e4e7",
  perigo: "#dc2626",
  aviso: "#d97706",
  marca: "#6ca33c",
  textoMarca: "#0a0a0a",
  sucesso: "#6ca33c",
};

export const escuro: Cores = {
  fundo: "#000000",
  texto: "#fafafa",
  cartao: "#0a0a0a",
  primario: "#fafafa",
  textoPrimario: "#0a0a0a",
  suave: "#161616",
  textoSuave: "#a1a1aa",
  borda: "#222222",
  perigo: "#f87171",
  aviso: "#fbbf24",
  marca: "#7fb84e",
  textoMarca: "#0a0a0a",
  sucesso: "#7fb84e",
};

export const raio = { pequeno: 8, medio: 10, grande: 12, enorme: 16 };

export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const fonte = {
  regular: "Rubik_400Regular",
  media: "Rubik_500Medium",
  forte: "Rubik_700Bold",
};

// Alvos de toque: mínimo 48 dp; botões principais 56 dp.
export const alvo = { minimo: 48, principal: 56 };
