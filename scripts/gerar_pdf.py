# /// script
# requires-python = ">=3.10"
# dependencies = ["markdown>=3.5", "weasyprint>=62"]
# ///
"""Gera os PDFs da documentação a partir de docs/.

- docs/pdf/coleta-manual.pdf: manual do sistema, para o cliente (docs/documentacao/usuario/).
- docs/pdf/coleta-documentacao-tecnica.pdf: para o desenvolvedor (usuário + técnico + backlog + changelog + commits).

Uso (na raiz do projeto): uv run scripts/gerar_pdf.py
"""

import html
import subprocess
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import markdown
from weasyprint import HTML

RAIZ = Path(__file__).resolve().parent.parent
DOCS = RAIZ / "docs"
ASSETS = DOCS / "assets"
USUARIO = sorted((DOCS / "documentacao" / "usuario").glob("*.md"))
TECNICO = sorted((DOCS / "documentacao" / "tecnico").glob("*.md"))

PDFS = [
    {
        "arquivo": DOCS / "pdf" / "coleta-manual.pdf",
        "titulo": "Manual do sistema",
        "capitulos": USUARIO,
        "commits": False,
    },
    {
        "arquivo": DOCS / "pdf" / "coleta-documentacao-tecnica.pdf",
        "titulo": "Documentação técnica",
        "capitulos": USUARIO + TECNICO + [DOCS / "backlog.md", DOCS / "changelog.md"],
        "commits": True,
    },
]

VERDE = "#6ca33c"


def css(titulo: str) -> str:
    fontes = "".join(
        f'@font-face {{ font-family: "Rubik"; font-weight: {peso}; src: url("{(ASSETS / "fontes" / f"rubik-{sub}-{peso}-normal.woff2").as_uri()}"); }}\n'
        for sub in ("latin", "latin-ext") for peso in (400, 500)
    )
    return fontes + f"""
@page {{
  size: A4;
  margin: 2cm 1.8cm;
  @bottom-left {{ content: "Servioeste Coleta · {titulo}"; font-family: "Rubik", sans-serif; font-size: 8.5pt; color: #71717a; }}
  @bottom-right {{ content: counter(page); font-family: "Rubik", sans-serif; font-size: 8.5pt; color: #71717a; }}
}}
@page capa {{ margin: 0; background: #0a0a0a; @bottom-left {{ content: none; }} @bottom-right {{ content: none; }} }}
body {{ font-family: "Rubik", "DejaVu Sans", sans-serif; font-size: 10pt; line-height: 1.55; color: #0a0a0a; }}
.capa {{ page: capa; page-break-after: always; height: 29.7cm; padding: 0 2.2cm; color: #fafafa;
  display: flex; flex-direction: column; justify-content: center; }}
.capa img {{ width: 11cm; }}
.capa .faixa {{ width: 2cm; height: 4pt; background: {VERDE}; border-radius: 2pt; margin: 1.2cm 0 0.6cm; }}
.capa .produto {{ font-size: 26pt; font-weight: 500; letter-spacing: -0.5pt; }}
.capa .subtitulo {{ font-size: 15pt; color: {VERDE}; margin-top: 4pt; }}
.capa .descricao {{ color: #a1a1aa; margin-top: 0.8cm; max-width: 13cm; }}
.capa .data {{ color: #a1a1aa; margin-top: 1.5cm; font-size: 9pt; }}
.sumario {{ page-break-after: always; }}
.sumario ol {{ padding-left: 14pt; }}
.sumario li {{ margin: 5pt 0; font-size: 11pt; }}
.capitulo {{ page-break-before: always; }}
h1 {{ font-weight: 500; font-size: 20pt; letter-spacing: -0.3pt; margin: 0 0 12pt; padding-bottom: 6pt;
  border-bottom: 3px solid {VERDE}; }}
h2 {{ font-weight: 500; font-size: 13.5pt; margin-top: 18pt; color: #0a0a0a; }}
h2::before {{ content: ""; display: inline-block; width: 6pt; height: 6pt; border-radius: 2pt; background: {VERDE};
  margin-right: 6pt; vertical-align: middle; }}
h3 {{ font-weight: 500; font-size: 11pt; }}
strong {{ font-weight: 500; }}
table {{ border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 8.8pt; page-break-inside: auto; }}
tr {{ page-break-inside: avoid; }}
th {{ background: #f4f4f5; color: #0a0a0a; font-weight: 500; text-align: left; border-bottom: 2px solid {VERDE}; }}
th, td {{ border: 1px solid #e4e4e7; padding: 4pt 6pt; vertical-align: top; }}
code {{ font-family: "DejaVu Sans Mono", monospace; font-size: 8.3pt; background: #f4f4f5; padding: 0 2pt; border-radius: 2pt; }}
pre {{ background: #f4f4f5; padding: 8pt; border-radius: 6pt; border-left: 3px solid {VERDE}; white-space: pre-wrap; }}
pre code {{ background: none; padding: 0; }}
a {{ color: #4d7a26; text-decoration: none; }}
ul li::marker {{ color: {VERDE}; }}
.commits td:first-child, .commits td:nth-child(2) {{ font-family: "DejaVu Sans Mono", monospace; white-space: nowrap; }}
"""


def commits_recentes(limite: int = 40) -> str:
    try:
        saida = subprocess.run(
            ["git", "log", f"-{limite}", "--date=short", "--format=%h%x1f%ad%x1f%an%x1f%s"],
            cwd=RAIZ, capture_output=True, text=True, check=True,
        ).stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""
    linhas = [linha.split("\x1f") for linha in saida.strip().splitlines() if linha]
    if not linhas:
        return ""
    corpo = "".join(
        "<tr>" + "".join(f"<td>{html.escape(c)}</td>" for c in campos) + "</tr>" for campos in linhas
    )
    return (
        '<section class="capitulo"><h1>Commits recentes</h1>'
        f"<p>Últimos {len(linhas)} commits do repositório.</p>"
        '<table class="commits"><tr><th>Commit</th><th>Data</th><th>Autor</th><th>Mensagem</th></tr>'
        f"{corpo}</table></section>"
    )


def gerar(pdf: dict, agora: str) -> None:
    secoes, titulos = [], []
    for arquivo in pdf["capitulos"]:
        texto = arquivo.read_text(encoding="utf-8")
        primeira = next((linha for linha in texto.splitlines() if linha.startswith("# ")), arquivo.stem)
        titulos.append(primeira.lstrip("# ").strip())
        corpo = markdown.markdown(texto, extensions=["tables", "fenced_code", "sane_lists"])
        secoes.append(f'<section class="capitulo">{corpo}</section>')

    commits = commits_recentes() if pdf["commits"] else ""
    if commits:
        titulos.append("Commits recentes")

    logo = ASSETS / "logo-servioeste.svg"
    capa_logo = f'<img src="{logo.as_uri()}">' if logo.exists() else ""
    publico = ("Para quem usa o sistema: o que é, como fazer as coletas e acompanhar as rotas, e dúvidas comuns."
               if not pdf["commits"] else
               "Para quem mantém o sistema: manual, arquitetura, desenvolvimento, backlog e histórico.")
    sumario = "".join(f"<li>{html.escape(t)}</li>" for t in titulos)
    documento = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Servioeste Coleta · {pdf['titulo']}</title><style>{css(pdf['titulo'])}</style></head><body>
<div class="capa">{capa_logo}<div class="faixa"></div>
<div class="produto">Servioeste Coleta</div><div class="subtitulo">{pdf['titulo']}</div>
<div class="descricao">Registro e comprovação das coletas de resíduos: rotas, coletas, comprovantes e acompanhamento.
{publico}</div>
<div class="data">Atualizada em {agora}</div></div>
<div class="sumario"><h1>Sumário</h1><ol>{sumario}</ol></div>
{''.join(secoes)}{commits}</body></html>"""

    pdf["arquivo"].parent.mkdir(parents=True, exist_ok=True)
    HTML(string=documento, base_url=str(RAIZ)).write_pdf(pdf["arquivo"])
    print(f"PDF gerado: {pdf['arquivo'].relative_to(RAIZ)}")


def main() -> None:
    agora = datetime.now(ZoneInfo("America/Sao_Paulo")).strftime("%d/%m/%Y %H:%M")
    for pdf in PDFS:
        gerar(pdf, agora)


if __name__ == "__main__":
    main()
