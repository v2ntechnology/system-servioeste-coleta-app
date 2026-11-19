import { bancoVazio, useBanco } from "@/dados/repositorio";
import { gerarDadosFicticios } from "@/demo/dados";
import { useEstadoDemo } from "@/demo/estadoDemo";
import { diaIso } from "@/lib/formato";
import { pendentes } from "@/sincronizacao/fila";

/** Carrega os dados de exemplo no primeiro uso, ou num dia novo sem nada pendente de envio. */
export function prepararDadosDemo(): void {
  const estado = useBanco.getState();
  const hoje = diaIso(new Date());
  const temRotaDeHoje = estado.rotas.some((r) => r.data === hoje);
  if (bancoVazio(estado) || (!temRotaDeHoje && pendentes(estado.fila).length === 0)) {
    estado.carregar(gerarDadosFicticios());
  }
}

export function restaurarDadosDemo(): void {
  useBanco.getState().carregar(gerarDadosFicticios());
  useEstadoDemo.getState().definir({ conectado: true, foraDaArea: false, localizacaoFalsa: false, recusarProximo: false });
}
