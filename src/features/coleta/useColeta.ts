// Coleta em andamento numa parada: rascunho persistido, itens, QR, finalização imutável.
import { useBanco } from "@/dados/repositorio";
import type { Assinatura, Coleta, ItemColeta, MotivoNaoColeta, ProvaQr } from "@/dados/tipos";
import { lerLocalizacao } from "@/dispositivo/localizacao";
import { useParada } from "@/features/rota/useRota";
import { processarFila } from "@/sincronizacao/fila";

/** O rascunho (ou a coleta finalizada) da parada. */
export function useColetaDaParada(paradaId: string | undefined): Coleta | undefined {
  const detalhe = useParada(paradaId);
  return detalhe?.coleta;
}

export const acoesColeta = {
  iniciar: (rotaId: string, paradaId: string) => useBanco.getState().iniciarColeta(rotaId, paradaId),
  registrarQr: (coletaId: string, prova: ProvaQr) => useBanco.getState().registrarQr(coletaId, prova),
  salvarItem: (coletaId: string, item: ItemColeta) => useBanco.getState().salvarItem(coletaId, item),
  removerItem: (coletaId: string, tipoResiduoId: string) => useBanco.getState().removerItem(coletaId, tipoResiduoId),
  cancelar: (coletaId: string) => useBanco.getState().cancelarColeta(coletaId),
  /** Lê a localização, finaliza (a coleta fica imutável) e tenta enviar. Devolve o número do comprovante. */
  async finalizar(coletaId: string, assinatura: Assinatura): Promise<string> {
    const local = await lerLocalizacao();
    const numero = useBanco.getState().finalizarColeta(coletaId, assinatura, local);
    void processarFila();
    return numero;
  },
};

export async function registrarNaoColeta(n: {
  rotaId: string;
  paradaId: string;
  motivo: MotivoNaoColeta;
  texto?: string;
  observacao?: string;
}): Promise<string> {
  const local = await lerLocalizacao();
  const id = useBanco.getState().registrarNaoColeta({ ...n, local });
  void processarFila();
  return id;
}

/** Para as telas da coleta: a parada e o rascunho em andamento, ou null se não houver (a tela redireciona). */
export function useColetaEmCurso(paradaId: string | undefined) {
  const detalhe = useParada(paradaId);
  const coleta = detalhe?.coleta;
  if (!detalhe || !coleta || coleta.situacao !== "rascunho" || detalhe.parada.situacao !== "emAndamento") return null;
  return { ...detalhe, coleta };
}
