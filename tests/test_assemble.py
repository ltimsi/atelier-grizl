"""Tests de build/assemble.py : carte d'imports, sorties de dist/site et dist/artifact, scène de la page d'accueil."""
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import assemble  # noqa: E402

PIED = (
    "Le vélo et ses pièces sont dessinés d'après les documents officiels. Ce qui n'est pas publié est marqué "
    "« forme approchée » : la liste est derrière le bouton « Ce qui est approché »."
)


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


class TestBuild(unittest.TestCase):
    """Un seul passage du script pour toute la classe : chaque test relit ce qu'il a écrit."""

    @classmethod
    def setUpClass(cls):
        cls.res = subprocess.run(
            [sys.executable, str(RACINE / "build" / "assemble.py")],
            cwd=RACINE, capture_output=True, text=True,
        )
        cls.site = RACINE / "dist" / "site"
        cls.artifact = RACINE / "dist" / "artifact"

    def page(self, cible="site"):
        dossier = self.site if cible == "site" else self.artifact
        return (dossier / "index.html").read_text(encoding="utf-8")

    def contient(self, page, morceau, oui=True):
        # Sans recopier la page entière dans le message d'échec.
        self.assertEqual(morceau in page, oui, ("absent : " if oui else "présent : ") + morceau)

    def test_build_site(self):
        self.assertEqual(self.res.returncode, 0, self.res.stdout + self.res.stderr)
        self.assertTrue((self.site / "vendor" / "three" / "three.module.min.js").is_file())
        self.assertTrue((self.site / "js" / "scene" / "app.js").is_file())
        page = self.page()
        self.assertIn('type="importmap"', page)
        self.assertIn('type="module"', page)
        self.assertLess(page.index('type="importmap"'), page.index('type="module"'))
        self.assertNotIn("three.min.js", page)

    def test_build_artifact(self):
        self.assertEqual(self.res.returncode, 0, self.res.stdout + self.res.stderr)
        self.assertTrue((self.artifact / "js" / "scene" / "app.js").is_file())
        page = self.page("artifact")
        self.assertIn('type="importmap"', page)
        self.assertIn('<script type="module" src="js/scene/app.js">', page)
        self.assertLess(page.index('type="importmap"'), page.index('type="module"'))

    def test_zones_injectees(self):
        attendu = json.loads((RACINE / "src" / "scene" / "zones.json").read_text(encoding="utf-8"))
        for cible in ("site", "artifact"):
            page = self.page(cible)
            self.contient(page, 'id="zones-data"')
            m = re.search(r'<script type="application/json" id="zones-data">(.*?)</script>', page, re.S)
            self.assertIsNotNone(m, f"{cible} : bloc zones-data introuvable")
            self.assertEqual(json.loads(m.group(1)), attendu, f"{cible} : zones-data différent de zones.json")

    def test_scene_presente(self):
        page = self.page()
        for morceau in ('canvas id="gl"', 'svg id="plan"', 'dialog id="approche-liste"'):
            self.contient(page, morceau)
        for motif in (r'<figure[^>]*\bid="scene"', r'<div[^>]*\bid="pins"', r'<div[^>]*\bid="chips"',
                      r'<article[^>]*\bid="fiche"', r'<button[^>]*\bid="approche"'):
            self.assertIsNotNone(re.search(motif, page), "absent : " + motif)
        # Les trois onglets de la maquette, dans son ordre, la 3D réaliste ouverte par défaut.
        onglets = re.findall(r'<button [^>]*role="tab"[^>]*data-mode="([^"]+)"[^>]*aria-selected="([^"]+)"', page)
        self.assertEqual(onglets, [("2d", "false"), ("simple", "false"), ("reel", "true")])
        for libelle in ("Schéma 2D", "3D simple", "3D réaliste"):
            self.contient(page, f"<b>{libelle}</b>")

    def test_pied_de_page(self):
        page = self.page()
        self.contient(page, PIED)
        self.contient(page, "Les pièces en 3D sont des modèles simplifiés", oui=False)

    def test_lot0(self):
        self.assertEqual(self.res.returncode, 0, self.res.stdout + self.res.stderr)
        ligne = next((l for l in self.res.stdout.splitlines() if l.startswith("Lots publiés : ")), "")
        self.assertIn("0 (en relecture)", ligne.removeprefix("Lots publiés : ").split(", "))


if __name__ == "__main__":
    unittest.main()
