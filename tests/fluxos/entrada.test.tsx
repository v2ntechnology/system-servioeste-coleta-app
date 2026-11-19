// T018: senha errada mostra o erro; alan/1234 chega a "Olá, Alan!"; "Iniciar jornada" mostra os dados do dia.
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderRouter } from "expo-router/testing-library";
import path from "path";

import { useBanco } from "@/dados/repositorio";
import { useSessao } from "@/features/sessao/useSessao";

jest.mock("expo-secure-store", () => {
  const mem = new Map<string, string>();
  return {
    getItemAsync: async (k: string) => mem.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => void mem.set(k, v),
    deleteItemAsync: async (k: string) => void mem.delete(k),
  };
});

const APP = path.resolve(__dirname, "../../src/app");

beforeEach(() => {
  useSessao.setState({ motoristaId: null });
});

it("entra, vê a saudação e confere a jornada", async () => {
  await renderRouter(APP, { initialUrl: "/" });
  // O renderRouter liga timers falsos; o armazenamento do aparelho e o Stack precisam dos reais.
  jest.useRealTimers();

  await waitFor(() => expect(screen.getByTestId("botao-entrar")).toBeTruthy());

  await fireEvent.changeText(screen.getByTestId("campo-usuario"), "alan");
  await fireEvent.changeText(screen.getByTestId("campo-senha"), "errada");
  await fireEvent.press(screen.getByTestId("botao-entrar"));
  expect(await screen.findByText("Usuário ou senha incorretos.")).toBeTruthy();

  await fireEvent.changeText(screen.getByTestId("campo-senha"), "1234");
  await fireEvent.press(screen.getByTestId("botao-entrar"));
  expect(await screen.findByText("Olá, Alan!")).toBeTruthy();

  await fireEvent.press(screen.getByTestId("botao-iniciar-jornada"));
  expect(await screen.findByText("RDU8D06")).toBeTruthy();
  expect(screen.getByText("Alan Sterce")).toBeTruthy();
  expect(screen.getByText("Douglas Silva")).toBeTruthy();

  await fireEvent.press(screen.getByTestId("botao-iniciar-rota"));
  expect(await screen.findByText("Hospital São Lucas")).toBeTruthy();
  expect(useBanco.getState().rotas.find((r) => r.id === "rota_hoje")?.situacao).toBe("emAndamento");
}, 30000);
