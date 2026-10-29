"""Genera los audios que la app lee en voz alta, con voces neuronales.

Primero corre herramientas/listar_frases.mjs (Node), que saca de datos.js
todas las frases a audio/frases.json. Después crea un audio/<id>.mp3 por cada
frase que todavía no tenga audio y escribe audio/indice.json con los ids
disponibles. La app solo usa los audios del índice; lo demás lo lee la voz
del navegador.

Uso:
    python3 -m venv .venv && .venv/bin/pip install edge-tts
    .venv/bin/python herramientas/generar_audios.py

edge-tts usa el servicio de lectura en voz alta de Microsoft Edge (sin clave).
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

RAIZ = Path(__file__).resolve().parent.parent
CARPETA = RAIZ / "audio"
VOZ_ES = "es-CR-MariaNeural"   # María, voz neuronal costarricense
VOZ_EN = "en-US-JennyNeural"   # para las partes marcadas con [en]
VELOCIDAD = "-8%"              # un poco más lento para niños


async def generar(frase: dict) -> None:
    texto, voz = frase["texto"], VOZ_ES
    if texto.startswith("[en]"):
        texto, voz = texto[4:], VOZ_EN
    destino = CARPETA / f"{frase['id']}.mp3"
    await edge_tts.Communicate(texto, voz, rate=VELOCIDAD).save(str(destino))
    print(f"  {destino.name}  {texto[:60]}")


async def main() -> None:
    subprocess.run(["node", str(RAIZ / "herramientas" / "listar_frases.mjs")], check=True)
    frases = json.loads((CARPETA / "frases.json").read_text(encoding="utf-8"))
    faltan = [f for f in frases if not (CARPETA / f"{f['id']}.mp3").exists()]
    print(f"{len(frases)} frases, {len(faltan)} por generar")
    for f in faltan:
        await generar(f)

    ids = sorted(f["id"] for f in frases if (CARPETA / f"{f['id']}.mp3").exists())
    (CARPETA / "indice.json").write_text(json.dumps(ids, indent=1) + "\n", encoding="utf-8")

    sobran = {p.stem for p in CARPETA.glob("*.mp3")} - {f["id"] for f in frases}
    if sobran:
        print(f"Aviso: {len(sobran)} audios ya no se usan: {', '.join(sorted(sobran))}")
    if len(ids) < len(frases):
        sys.exit("No se pudieron generar todos los audios.")


if __name__ == "__main__":
    asyncio.run(main())
