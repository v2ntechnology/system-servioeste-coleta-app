// Número do comprovante: AAAAMMDD-<placa>-<seq>, único por veículo e dia, gerado sem rede.

import { diaIso } from "@/lib/formato";

/** Domínio da página pública de verificação (fase da web). */
export const DOMINIO_VERIFICACAO = "automacoes.servioeste.com.br";

export function chaveSequencia(quando: string | Date, placa: string): string {
  return `${diaIso(quando).replace(/-/g, "")}-${placa.toUpperCase()}`;
}

export function numeroComprovante(quando: string | Date, placa: string, sequencia: number): string {
  return `${chaveSequencia(quando, placa)}-${String(sequencia).padStart(3, "0")}`;
}

export function urlVerificacao(numero: string, dominio: string = DOMINIO_VERIFICACAO): string {
  return `https://${dominio}/coleta/verificar/${encodeURIComponent(numero)}`;
}

export const DECLARACAO =
  "Declaro que os resíduos acima foram coletados e destinados conforme as normas ambientais vigentes.";

/** Dados da empresa no comprovante (em aberto com a Servioeste: texto e dados finais). */
export const EMPRESA = {
  nome: "SERVIOESTE",
  linhas: ["Soluções em resíduos", "Dados da empresa a confirmar com a Servioeste"],
};
