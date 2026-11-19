// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*", "node_modules/*"],
  },
  {
    // Princípio VI: telas e regras nunca falam com os dados fictícios; só o repositório e o layout raiz.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/demo/**", "src/app/_layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/demo/*", "**/demo/*"], message: "Telas não importam dados fictícios (princípio VI)." }] },
      ],
    },
  },
]);
