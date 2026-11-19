// Transporte simulado (contracts/sincronizacao.md): é a especificação do envio para a futura API.
import { useEstadoDemo } from "@/demo/estadoDemo";
import type { Transporte } from "@/sincronizacao/transporte";

const recebidos = new Set<string>();
const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const transporteDemo: Transporte = {
  conectado: () => useEstadoDemo.getState().conectado,
  async enviar(item) {
    const estado = useEstadoDemo.getState();
    if (!estado.conectado) return { ok: false, motivo: "semConexao", mensagem: "Sem conexão." };
    await espera(600);
    if (!useEstadoDemo.getState().conectado) return { ok: false, motivo: "semConexao", mensagem: "A conexão caiu." };
    if (estado.recusarProximo && !recebidos.has(item.id)) {
      estado.definir({ recusarProximo: false });
      return { ok: false, motivo: "recusado", mensagem: "Envio recusado (simulação da demonstração)." };
    }
    recebidos.add(item.id); // idempotente: reenviar o mesmo id não duplica
    return { ok: true, recebidoEm: new Date().toISOString() };
  },
};
