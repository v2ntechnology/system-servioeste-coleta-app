// Layout raiz: fontes, tema, espera o armazenamento do aparelho carregar e protege as telas sem sessão.
// É o único lugar que importa "@/demo" (trocado por um módulo vazio fora do modo demonstração).
import { Rubik_400Regular, Rubik_500Medium, Rubik_700Bold, useFonts } from "@expo-google-fonts/rubik";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useSyncExternalStore } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useBanco } from "@/dados/repositorio";
import { instalarDemo, prepararDadosDemo } from "@/demo";
import { useSessao } from "@/features/sessao/useSessao";
import { ARQUIVOS_FONTES_ASSINATURA } from "@/tema/fontesAssinatura";
import { fonte } from "@/tema/tokens";
import { usePreferenciaTema, useTema } from "@/tema/useTema";

instalarDemo();
void SplashScreen.preventAutoHideAsync();

// Os dados de exemplo entram assim que o banco do aparelho termina de carregar, antes da primeira tela.
if (useBanco.persist.hasHydrated()) prepararDadosDemo();
else useBanco.persist.onFinishHydration(() => prepararDadosDemo());

type ArmazemPersistido = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

function useHidratado(armazem: ArmazemPersistido): boolean {
  return useSyncExternalStore(
    (avisar) => armazem.persist.onFinishHydration(avisar),
    () => armazem.persist.hasHydrated(),
  );
}

export default function LayoutRaiz() {
  const [fontes] = useFonts({ Rubik_400Regular, Rubik_500Medium, Rubik_700Bold, ...ARQUIVOS_FONTES_ASSINATURA });
  const banco = useHidratado(useBanco);
  const sessao = useHidratado(useSessao);
  const tema = useHidratado(usePreferenciaTema);

  const pronto = fontes && banco && sessao && tema;

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navegacao />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Navegacao() {
  const { cores, escuro } = useTema();
  const logado = useSessao((s) => s.motoristaId !== null);

  return (
    <>
      <StatusBar style={escuro ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.fundo },
          headerTintColor: cores.texto,
          headerTitleStyle: { fontFamily: fonte.media, fontSize: 17 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Protected guard={!logado}>
          <Stack.Screen name="entrar" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={logado}>
          <Stack.Screen name="index" options={{ title: "Início" }} />
          <Stack.Screen name="jornada" options={{ title: "Dados da jornada" }} />
          <Stack.Screen name="rota" options={{ title: "Rota do dia" }} />
          <Stack.Screen name="parada/[id]" options={{ title: "Dados do cliente" }} />
          <Stack.Screen name="coleta/[paradaId]/qr" options={{ title: "QR Code do cliente" }} />
          <Stack.Screen name="coleta/[paradaId]/residuos" options={{ title: "Selecionar resíduo" }} />
          <Stack.Screen name="coleta/[paradaId]/quantidade/[tipoId]" options={{ title: "Quantidade" }} />
          <Stack.Screen name="coleta/[paradaId]/outro" options={{ title: "Resíduo adicionado" }} />
          <Stack.Screen name="coleta/[paradaId]/resumo" options={{ title: "Resumo da coleta" }} />
          <Stack.Screen name="coleta/[paradaId]/assinatura" options={{ title: "Assinatura do cliente" }} />
          <Stack.Screen
            name="coleta/[paradaId]/finalizada"
            options={{ title: "Coleta finalizada", headerBackVisible: false, gestureEnabled: false }}
          />
          <Stack.Screen name="nao-coleta/[paradaId]" options={{ title: "Não foi possível coletar" }} />
          <Stack.Screen name="comprovante/[coletaId]" options={{ title: "Comprovante" }} />
          <Stack.Screen name="configuracoes" options={{ title: "Configurações" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
