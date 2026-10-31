from __future__ import annotations
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

path = Path(__file__).resolve().parent.parent / 'scripts' / 'blue-security-guard.py'
spec = importlib.util.spec_from_file_location('guard_private_test', path)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class PrivateSummaryTests(unittest.TestCase):
    def test_whitelist_excludes_secrets_paths_and_financial_values(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / 'project'; root.mkdir()
            (root / 'package-lock.json').write_text('{}')
            reports = []
            def fake(cmd, **kwargs):
                if cmd[1] == 'version': return subprocess.CompletedProcess(cmd, 0, '8.24.2\n', '')
                if cmd[1] == '--version': return subprocess.CompletedProcess(cmd, 0, 'osv-scanner version: 2.1.0\n', '')
                if cmd[1] == 'dir':
                    out = Path(cmd[cmd.index('--report-path') + 1]); reports.append(out)
                    out.write_text(json.dumps([{'Secret': 'fake-token-42', 'File': 'salary-1234.txt', 'Match': 'fake-token-42'}]))
                    return subprocess.CompletedProcess(cmd, 1, '', '')
                out = Path(cmd[cmd.index('--output') + 1]); reports.append(out)
                out.write_text(json.dumps({'results': [{'packages': [{'vulnerabilities': [{'id': 'GHSA-abcd-efgh-jkmn', 'summary': 'fake-token-42'}]}]}]}))
                return subprocess.CompletedProcess(cmd, 1, '', '')
            captured = []
            with patch.object(guard.subprocess, 'run', side_effect=fake):
                code = guard.run(root, Path(folder) / 'tools', private_sink=captured.append)
            self.assertEqual(code, 1)
            self.assertEqual(captured, [{'config_attention': False, 'secret_count': 1, 'dependency_count': 1, 'dependency_ids': ['GHSA-abcd-efgh-jkmn']}])
            self.assertNotIn('fake-token-42', json.dumps(captured))
            self.assertNotIn('salary-1234', json.dumps(captured))
            self.assertTrue(all(not p.exists() for p in reports))


if __name__ == '__main__': unittest.main()
