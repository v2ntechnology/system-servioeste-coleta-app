// Princípio VI: sem EXPO_PUBLIC_MOCK=true, src/demo/index.ts é trocado por src/demo/vazio.ts depois da resolução,
// então os dados fictícios e o menu de demonstração nunca entram no pacote.
// Ao mudar a variável, reinicie com --clear (o Metro guarda cache).
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const modoDemo = process.env.EXPO_PUBLIC_MOCK === "true";
const entradaDemo = path.join(__dirname, "src", "demo", "index.ts");
const vazio = path.join(__dirname, "src", "demo", "vazio.ts");
const resolverPadrao = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resultado = (resolverPadrao ?? context.resolveRequest)(context, moduleName, platform);
  if (!modoDemo && resultado && resultado.type === "sourceFile" && resultado.filePath === entradaDemo) {
    return { type: "sourceFile", filePath: vazio };
  }
  return resultado;
};

module.exports = config;
