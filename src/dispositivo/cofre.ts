// Armazenamento protegido para a sessão: SecureStore no celular, AsyncStorage no navegador.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { StateStorage } from "zustand/middleware";

export const cofre: StateStorage = {
  getItem: (chave) => (Platform.OS === "web" ? AsyncStorage.getItem(chave) : SecureStore.getItemAsync(chave)),
  setItem: (chave, valor) =>
    Platform.OS === "web" ? AsyncStorage.setItem(chave, valor) : SecureStore.setItemAsync(chave, valor),
  removeItem: (chave) =>
    Platform.OS === "web" ? AsyncStorage.removeItem(chave) : SecureStore.deleteItemAsync(chave),
};
