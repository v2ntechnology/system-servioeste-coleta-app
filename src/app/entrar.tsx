import { useState } from "react";
import { View } from "react-native";

import { Botao } from "@/components/ui/Botao";
import { CampoTexto } from "@/components/ui/CampoTexto";
import { Faixa } from "@/components/ui/Faixa";
import { Logo } from "@/components/ui/Logo";
import { Tela } from "@/components/ui/Tela";
import { Texto } from "@/components/ui/Texto";
import { useSessao } from "@/features/sessao/useSessao";
import { modoDemonstracao } from "@/lib/extensoesDemo";
import { espaco } from "@/tema/tokens";

export default function Entrar() {
  const entrar = useSessao((s) => s.entrar);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const enviar = () => setErro(entrar(usuario, senha));

  return (
    <Tela rodape={<Botao titulo="Entrar" aoTocar={enviar} testID="botao-entrar" />}>
      <View style={{ alignItems: "center", gap: espaco.md, marginTop: espaco.xxl, marginBottom: espaco.lg }}>
        <Logo largura={240} />
        <Texto variante="titulo">Coleta</Texto>
        <Texto suave style={{ textAlign: "center" }}>
          Registro e comprovação das coletas de resíduos
        </Texto>
      </View>
      <CampoTexto
        rotulo="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
        testID="campo-usuario"
      />
      <CampoTexto
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        autoComplete="password"
        returnKeyType="go"
        onSubmitEditing={enviar}
        testID="campo-senha"
      />
      {erro ? <Faixa tom="perigo" texto={erro} /> : null}
      {modoDemonstracao ? (
        <Faixa texto="Demonstração: usuário alan e senha 1234. Os dados são fictícios." />
      ) : null}
    </Tela>
  );
}
