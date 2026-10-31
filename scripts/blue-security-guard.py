#!/usr/bin/env python3
"""Guardia pública: solo expone un estado, nunca detalles ni informes."""
from __future__ import annotations

import json
from typing import Callable
import re
import subprocess
import sys
import tempfile
from pathlib import Path


def run(root: Path, tools: Path, private_sink: Callable[[dict], None] | None = None) -> int:
    root = root.resolve()
    gitleaks = tools / 'gitleaks'; osv = tools / 'osv-scanner'
    lock = root / 'package-lock.json'
    if not root.is_dir() or lock.is_symlink() or not lock.is_file():
        return 2
    try:
        config_attention = False
        workflows = root / '.github' / 'workflows'
        if workflows.is_symlink():
            return 2
        if workflows.is_dir():
            for workflow in list(workflows.glob('*.yml')) + list(workflows.glob('*.yaml')):
                if workflow.is_symlink() or workflow.stat().st_size > 1024 * 1024:
                    return 2
                text = workflow.read_text(encoding='utf-8')
                if re.search(r'^\s*(?:pull_request_target\s*:|permissions\s*:\s*write-all\b)', text, re.MULTILINE):
                    config_attention = True
        for binary, command, expected in ((gitleaks, 'version', '8.24.2'), (osv, '--version', 'osv-scanner version: 2.1.0')):
            p = subprocess.run([str(binary), command], capture_output=True, text=True, timeout=15, check=False)
            if p.returncode != 0 or p.stdout.splitlines()[:1] != [expected]:
                return 2
        with tempfile.TemporaryDirectory(prefix='blue-guard-') as tmp:
            d = Path(tmp)
            config = d / 'gitleaks.toml'; config.write_text('[extend]\nuseDefault = true\n')
            ignore = d / 'ignore'; ignore.write_text('')
            osv_config = d / 'osv.toml'; osv_config.write_text('# Sin exclusiones\n')
            secrets_file = d / 'secretos.json'; dependencies_file = d / 'dependencias.json'
            secret_cmd = [str(gitleaks), 'dir', '--config', str(config), '--gitleaks-ignore-path', str(ignore),
                          '--ignore-gitleaks-allow', '--redact=100', '--no-banner', '--no-color', '--log-level=error',
                          '--max-target-megabytes=1', '--report-format=json', '--report-path', str(secrets_file), str(root)]
            dep_cmd = [str(osv), 'scan', 'source', '--lockfile', str(lock), '--config', str(osv_config),
                       '--format=json', '--output', str(dependencies_file), '--verbosity=error']
            secrets = subprocess.run(secret_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, text=True, timeout=180, check=False)
            dependencies = subprocess.run(dep_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, text=True, timeout=180, check=False)
            if secrets_file.stat().st_size > 25 * 1024 * 1024 or dependencies_file.stat().st_size > 25 * 1024 * 1024:
                return 2
            sdata = json.loads(secrets_file.read_text(encoding='utf-8'))
            ddata = json.loads(dependencies_file.read_text(encoding='utf-8'))
            if secrets.returncode not in (0, 1) or not isinstance(sdata, list) or ((secrets.returncode == 1) != bool(sdata)):
                return 2
            if dependencies.returncode not in (0, 1) or not isinstance(ddata, dict) or not isinstance(ddata.get('results'), list):
                return 2
            dep_findings = []
            for result in ddata['results']:
                if not isinstance(result, dict) or not isinstance(result.get('packages'), list):
                    return 2
                for package in result['packages']:
                    if not isinstance(package, dict) or not isinstance(package.get('vulnerabilities', []), list):
                        return 2
                    if any(not isinstance(item, dict) or not isinstance(item.get('id'), str) for item in package.get('vulnerabilities', [])):
                        return 2
                    dep_findings.extend(package.get('vulnerabilities', []))
            if (dependencies.returncode == 1) != bool(dep_findings):
                return 2
            if private_sink is not None:
                # Exclusiva lista blanca: no exporta rutas, líneas, fragmentos ni secretos.
                ids = sorted({v['id'] for v in dep_findings
                              if re.fullmatch(r'(?:GHSA-[a-zA-Z0-9-]{4,80}|CVE-[0-9]{4}-[0-9]{4,12})', v['id'])})
                private_sink({'config_attention': config_attention, 'secret_count': len(sdata),
                              'dependency_count': len(dep_findings),
                              'dependency_ids': ids})
            return 1 if config_attention or sdata or dep_findings else 0
    except (OSError, UnicodeError, ValueError, subprocess.TimeoutExpired):
        return 2


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Uso: guard.py DIRECTORIO_AUTORIZADO DIRECTORIO_HERRAMIENTAS', file=sys.stderr)
        sys.exit(2)
    code = run(Path(sys.argv[1]), Path(sys.argv[2]))
    if code == 0:
        print('Blue Security Lab: comprobaciones completadas. Esto no certifica seguridad.')
    elif code == 1:
        print('Blue Security Lab: la revisión requiere atención privada; no se publican detalles.')
    else:
        print('Blue Security Lab: análisis incompleto; no se puede concluir el resultado.')
    sys.exit(code)
