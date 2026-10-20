"""Tests de build/assemble.py : carte d'imports et sortie de dist/site."""
import subprocess
import sys
import unittest
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import assemble  # noqa: E402


class TestCarteImports(unittest.TestCase):
    def test_carte_imports_site(self):
        carte = assemble.carte_imports("site")
        self.assertIn('type="importmap"', carte)
        self.assertIn('"three": "./vendor/three/three.module.min.js"', carte)
        self.assertIn('"three/addons/": "./vendor/three/addons/"', carte)

    def test_carte_imports_artifact(self):
        carte = assemble.carte_imports("artifact")
        self.assertIn('type="importmap"', carte)
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js", carte)
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/", carte)


class TestBuildSite(unittest.TestCase):
    def test_build_site(self):
        res = subprocess.run(
            [sys.executable, str(RACINE / "build" / "assemble.py")],
            cwd=RACINE, capture_output=True, text=True,
        )
        self.assertEqual(res.returncode, 0, res.stdout + res.stderr)
        site = RACINE / "dist" / "site"
        self.assertTrue((site / "vendor" / "three" / "three.module.min.js").is_file())
        self.assertTrue((site / "js" / "scene" / "app.js").is_file())
        page = (site / "index.html").read_text(encoding="utf-8")
        self.assertIn('type="importmap"', page)
        self.assertIn('type="module"', page)
        self.assertLess(page.index('type="importmap"'), page.index('type="module"'))
        self.assertNotIn("three.min.js", page)


if __name__ == "__main__":
    unittest.main()
