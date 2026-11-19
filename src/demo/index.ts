// Entrada do modo demonstração. Só o layout raiz importa este módulo.
// Sem EXPO_PUBLIC_MOCK=true, o metro.config.js troca este arquivo por ./vazio.ts: nada daqui chega à produção.
import { MARCADOR_DEMO } from "@/demo/dados";
import { MenuDemo } from "@/demo/MenuDemo";
import { PainelQrDemo } from "@/demo/PainelQrDemo";
import { prepararDadosDemo, restaurarDadosDemo } from "@/demo/preparar";
import { transporteDemo } from "@/demo/transporteDemo";
import { registrarDemo } from "@/lib/extensoesDemo";
import { definirTransporte } from "@/sincronizacao/transporte";

export const demoAtivo = MARCADOR_DEMO.length > 0;

export function instalarDemo(): void {
  definirTransporte(transporteDemo);
  registrarDemo({ MenuDemo, PainelQr: PainelQrDemo, restaurar: restaurarDadosDemo });
}

export { prepararDadosDemo };
