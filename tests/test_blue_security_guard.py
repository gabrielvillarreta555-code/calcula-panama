from __future__ import annotations
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

here = Path(__file__).resolve().parent
path = here / 'guard.py'
if not path.exists(): path = here.parent / 'scripts' / 'blue-security-guard.py'
spec = importlib.util.spec_from_file_location('blue_guard', path)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class GuardTests(unittest.TestCase):
    def execute(self, *, found=False, failed=False, risky_workflow=False, malformed_osv=False):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); project = root / 'project'; project.mkdir()
            lock = project / 'package-lock.json'; lock.write_text('{}')
            if risky_workflow:
                workflows = project / '.github' / 'workflows'; workflows.mkdir(parents=True)
                (workflows / 'test.yml').write_text('on:\n  pull_request_target:\n')
            temporary_reports = []
            def fake(cmd, **kwargs):
                if cmd[1] == 'version': return subprocess.CompletedProcess(cmd, 0, '8.24.2\n', '')
                if cmd[1] == '--version': return subprocess.CompletedProcess(cmd, 0, 'osv-scanner version: 2.1.0\n', '')
                if cmd[1] == 'dir':
                    output = Path(cmd[cmd.index('--report-path') + 1]); temporary_reports.append(output)
                    if not failed: output.write_text(json.dumps([{'Secret': 'dato-sintetico'}] if found else []))
                    return subprocess.CompletedProcess(cmd, 1 if found or failed else 0, '', '')
                output = Path(cmd[cmd.index('--output') + 1]); temporary_reports.append(output)
                output.write_text(json.dumps({} if malformed_osv else {'results': []}))
                return subprocess.CompletedProcess(cmd, 0, '', '')
            with patch.object(guard.subprocess, 'run', side_effect=fake):
                result = guard.run(project, root / 'bin')
            self.assertEqual(lock.read_text(), '{}')
            self.assertEqual({p.name for p in project.iterdir()}, {'package-lock.json', '.github'} if risky_workflow else {'package-lock.json'})
            self.assertTrue(all(not p.exists() for p in temporary_reports))
            return result

    def test_clean_and_detected_states_differ(self):
        self.assertEqual(self.execute(), 0)
        self.assertEqual(self.execute(found=True), 1)

    def test_failed_tool_is_incomplete_not_clean(self):
        self.assertEqual(self.execute(failed=True), 2)
        self.assertEqual(self.execute(malformed_osv=True), 2)

    def test_risky_workflow_triggers_a_generic_alert(self):
        self.assertEqual(self.execute(risky_workflow=True), 1)


if __name__ == '__main__': unittest.main()
