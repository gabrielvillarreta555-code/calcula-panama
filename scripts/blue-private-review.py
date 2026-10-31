#!/usr/bin/env python3
"""Revisión local en memoria: nunca imprime a stdout ni guarda un informe."""
from __future__ import annotations

import importlib.util
import json
import os
import select
import sys
import time
from pathlib import Path

MAX_SECONDS = 300


def main() -> int:
    if len(sys.argv) != 3 or os.environ.get('CI'):
        print('Uso local fuera de CI: python3 scripts/blue-private-review.py REPOSITORIO HERRAMIENTAS', file=sys.stderr)
        return 2
    try:
        tty = open('/dev/tty', 'r+', encoding='utf-8')
    except OSError:
        print('Se requiere terminal local privada e interactiva.', file=sys.stderr)
        return 2
    with tty:
        if not os.isatty(tty.fileno()) or os.fstat(tty.fileno()).st_uid != os.geteuid():
            print('La terminal debe pertenecer al usuario que ejecuta el análisis.', file=sys.stderr)
            return 2
        module_path = Path(__file__).with_name('blue-security-guard.py')
        spec = importlib.util.spec_from_file_location('blue_guard', module_path)
        if spec is None or spec.loader is None:
            return 2
        guard = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(guard)
        summary = []
        code = guard.run(Path(sys.argv[1]), Path(sys.argv[2]), private_sink=summary.append)
        if code == 2 or len(summary) != 1:
            print('Análisis incompleto; no se puede concluir el resultado.', file=tty, flush=True)
            return 2
        print('Resumen privado (sin rutas, fragmentos ni valores):', file=tty)
        print(json.dumps(summary[0], indent=2), file=tty)
        print(f'Retenido en memoria hasta {MAX_SECONDS} segundos o hasta pulsar Enter.', file=tty, flush=True)
        end = time.monotonic() + MAX_SECONDS
        while time.monotonic() < end:
            if select.select([tty], [], [], max(0, end - time.monotonic()))[0]:
                tty.readline()
                break
        summary.clear()
        return code


if __name__ == '__main__':
    sys.exit(main())
