import { CircleCheck, CloudOff, RefreshCw, TriangleAlert } from "lucide-react-native";
import { useMemo, useState } from "react";

import { useResumoSincronizacao } from "@/components/FaixaSincronizacao";
import { Botao } from "@/components/ui/Botao";
import { Faixa } from "@/components/ui/Faixa";
import { ItemLista } from "@/components/ui/Lista";
import { Selo } from "@/components/ui/Selo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useBanco } from "@/dados/repositorio";
import type { ItemDaFila } from "@/dados/tipos";
import { useClientes } from "@/features/rota/useRota";
import { diaIso, hora } from "@/lib/formato";
import { processarFila } from "@/sincronizacao/fila";

const TIPO: Record<ItemDaFila["tipo"], string> = {
  coleta: "Coleta",
  naoColeta: "Não coleta",
  mudancaDeOrdem: "Mudança de ordem",
  encerramento: "Encerramento da rota",
};

export default function Sincronizacao() {
  const fila = useBanco((b) => b.fila);
  const clientes = useClientes();
  const resumo = useResumoSincronizacao();
  const [tentando, setTentando] = useState(false);

  const { pendentes, enviadosHoje } = useMemo(() => {
    const hoje = diaIso(new Date());
    const ordem = [...fila].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return {
      pendentes: ordem.filter((i) => i.situacao !== "enviado"),
      enviadosHoje: ordem.filter((i) => i.situacao === "enviado" && i.enviadoEm && diaIso(i.enviadoEm) === hoje),
    };
  }, [fila]);

  const descricao = (i: ItemDaFila) => {
    const dados = i.dados as { clienteId?: string };
    const cliente = dados.clienteId ? clientes[dados.clienteId]?.nome : undefined;
    return [cliente, `criado às ${hora(i.criadoEm)}`, i.ultimoErro && i.situacao !== "enviado" ? i.ultimoErro : null]
      .filter(Boolean)
      .join(" · ");
  };

  const tentar = async () => {
    setTentando(true);
    await processarFila(true);
    setTentando(false);
  };

  return (
    <Tela
      rodape={
        pendentes.length ? (
          <Botao titulo="Tentar agora" icone={RefreshCw} aoTocar={() => void tentar()} carregando={tentando} desabilitado={!resumo.conectado} testID="botao-tentar" />
        ) : null
      }
    >
      {!resumo.conectado ? (
        <Faixa icone={CloudOff} tom="aviso" titulo="Sem conexão" texto="Os registros ficam guardados neste aparelho e são enviados sozinhos quando a conexão voltar." />
      ) : pendentes.length === 0 ? (
        <Faixa icone={CircleCheck} tom="sucesso" titulo="Tudo sincronizado" texto="Nenhum registro aguardando envio." />
      ) : null}

      {pendentes.length ? <Texto variante="rotulo">Aguardando envio ({pendentes.length})</Texto> : null}
      {pendentes.map((i) => (
        <ItemLista
          key={i.id}
          icone={i.situacao === "erro" ? TriangleAlert : RefreshCw}
          titulo={TIPO[i.tipo]}
          descricao={descricao(i)}
          direita={
            <Selo
              texto={{ aguardando: "Aguardando", enviando: "Enviando", erro: "Erro", enviado: "Enviado" }[i.situacao]}
              tom={i.situacao === "erro" ? "perigo" : i.situacao === "enviando" ? "andamento" : "aviso"}
            />
          }
        />
      ))}

      {enviadosHoje.length ? <Texto variante="rotulo">Enviados hoje ({enviadosHoje.length})</Texto> : null}
      {enviadosHoje.map((i) => (
        <ItemLista
          key={i.id}
          icone={CircleCheck}
          titulo={TIPO[i.tipo]}
          descricao={[descricao(i), i.enviadoEm ? `enviado às ${hora(i.enviadoEm)}` : null].filter(Boolean).join(" · ")}
          direita={<Selo texto="Enviado" tom="sucesso" />}
        />
      ))}
    </Tela>
  );
}
