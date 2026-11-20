// Localização simulada: os clientes fictícios ficam no Rio, longe de quem testa. A posição é o centro da área do
// cliente, ou 600 m ao norte com "fora da área" ligado; "localização falsa" marca a leitura como falsificada.
import type { Cliente, Localizacao } from "@/dados/tipos";
import { useEstadoDemo } from "@/demo/estadoDemo";

export async function localizacaoDemo(cliente: Cliente): Promise<Localizacao | null> {
  const { foraDaArea, localizacaoFalsa } = useEstadoDemo.getState();
  return {
    lat: cliente.area.lat + (foraDaArea ? 0.0054 : 0.0002),
    lng: cliente.area.lng,
    precisao: 12,
    mocked: localizacaoFalsa,
    em: new Date().toISOString(),
  };
}
