// Entrada do modo demonstração. Só o layout raiz importa este módulo.
// Sem EXPO_PUBLIC_MOCK=true, o metro.config.js troca este arquivo por ./vazio.ts: nada daqui chega à produção.
import { MARCADOR_DEMO } from "@/demo/dados";
import { MenuDemo } from "@/demo/MenuDemo";
import { PainelQrDemo } from "@/demo/PainelQrDemo";
import { prepararDadosDemo, restaurarDadosDemo } from "@/demo/preparar";
import { localizacaoDemo } from "@/demo/localizacaoDemo";
import { transporteDemo } from "@/demo/transporteDemo";
import { definirProvedorLocalizacao } from "@/dispositivo/localizacao";
import { registrarDemo } from "@/lib/extensoesDemo";
import { definirTransporte } from "@/sincronizacao/transporte";

export const demoAtivo = MARCADOR_DEMO.length > 0;

export function instalarDemo(): void {
  definirTransporte(transporteDemo);
  definirProvedorLocalizacao(localizacaoDemo);
  registrarDemo({ MenuDemo, PainelQr: PainelQrDemo, restaurar: restaurarDadosDemo });
}

export { prepararDadosDemo };
