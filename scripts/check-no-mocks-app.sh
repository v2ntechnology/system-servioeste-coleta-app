#!/usr/bin/env bash
# Princípio VI: dados fictícios e menu de demonstração nunca chegam à produção.
# Exporta o app (web) sem EXPO_PUBLIC_MOCK e procura marcadores do código de demonstração no pacote gerado.
set -euo pipefail

APP="$(cd "$(dirname "$0")/.." && pwd)"
SAIDA="$(mktemp -d)"
trap 'rm -rf "$SAIDA"' EXIT

(cd "$APP" && env -u EXPO_PUBLIC_MOCK npx expo export --platform web --output-dir "$SAIDA" --clear >/dev/null)

PADROES=(-e 'MARCADOR_DEMO_SERVIOESTE' -e 'Restaurar dados de exemplo' -e 'Douglas Silva' -e 'transporteDemo')

if grep -rIl "${PADROES[@]}" "$SAIDA" >/dev/null 2>&1; then
  echo "ERRO: o pacote de produção contém código de demonstração:" >&2
  grep -rIl "${PADROES[@]}" "$SAIDA" >&2
  exit 1
fi

echo "OK: nenhum dado fictício nem menu de demonstração no pacote de produção."
