"""Tests de build/assemble.py : carte d'imports, sorties de dist/site et dist/artifact, scène de la page d'accueil,
ateliers du chapitre Freins et contrôles qui les gardent."""
import json
import re
import subprocess
import sys
import unittest
from html.parser import HTMLParser
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import assemble  # noqa: E402

PIED = (
    "Le vélo et ses pièces sont dessinés d'après les documents officiels. Ce qui n'est pas publié est marqué "
    "« forme approchée » : la liste est derrière le bouton « Ce qui est approché »."
)

ZONES = [z["id"] for z in json.loads((RACINE / "src" / "scene" / "zones.json").read_text(encoding="utf-8"))]

# Les ateliers du chapitre Freins, dans l'ordre du document : id, data-zone, data-type, data-de, data-vers.
CORRESPONDANCE = [
    ("freins-systeme", "manettes", "comprendre", None, None),
    ("freins-disques", "disques", "remplacer", "Shimano SM-RT64", "Shimano Deore XT RT-MT800"),
    ("freins-plaquettes", "etrier", "remplacer", "Plaquettes d’origine", "Shimano L04C-MF"),
    ("freins-rodage", "disques", "entretenir", None, None),
    ("freins-centrage", "etrier", "regler", None, None),
    ("freins-controles", "etrier", "entretenir", None, None),
    ("freins-purge", "manettes", "entretenir", None, None),
    ("freins-securite", "manettes", "comprendre", None, None),
]
# Obligatoires dans un atelier, sauf « comprendre » qui n'en a aucun.
GESTES = {".a-dem", ".kit", "ol.steps"}
VIDEO = {"ul.media", "p.a-video"}


class Ateliers(HTMLParser):
    """Les section.atelier d'une page, avec leurs attributs et les blocs qu'elles contiennent.

    Relevé indépendant de celui d'assemble.py : les tests ne contrôlent pas le script avec son propre code."""

    BLOCS = {".a-dem": (None, "a-dem"), ".kit": (None, "kit"), "ol.steps": ("ol", "steps"),
             "ul.media": ("ul", "media"), "p.a-video": ("p", "a-video")}

    def __init__(self, texte):
        super().__init__()
        self.liste, self.pile = [], []
        self.feed(texte)
        self.close()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if tag == "section":
            s = None
            if "atelier" in classes:
                s = {"id": a.get("id"), "classes": classes, "zone": a.get("data-zone"), "type": a.get("data-type"),
                     "de": a.get("data-de"), "vers": a.get("data-vers"), "blocs": set()}
                self.liste.append(s)
            self.pile.append(s)
            return
        ouverts = [s for s in self.pile if s]
        if ouverts:
            ouverts[-1]["blocs"].update(nom for nom, (balise, classe) in self.BLOCS.items()
                                        if classe in classes and balise in (None, tag))

    def handle_endtag(self, tag):
        if tag == "section" and self.pile:
            self.pile.pop()


def atelier(ident, zone, type_, blocs, attributs=""):
    return (f'<section class="sub atelier" id="{ident}" data-zone="{zone}" data-type="{type_}" {attributs}>'
            f"<h3>{ident}</h3>{blocs}</section>")


COMPLET = '<div class="a-dem"></div><div class="kit"></div><ol class="steps"></ol><ul class="media"></ul>'


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

    def ateliers(self):
        return Ateliers(self.page()).liste

    def test_correspondance(self):
        ateliers = self.ateliers()
        self.assertEqual([(s["id"], s["zone"], s["type"], s["de"], s["vers"]) for s in ateliers], CORRESPONDANCE)
        for s in ateliers:
            self.assertIn("sub", s["classes"], s["id"])

    def test_ateliers_complets(self):
        ateliers = self.ateliers()
        self.assertTrue(ateliers, "aucune section.atelier dans la page")
        for s in ateliers:
            with self.subTest(atelier=s["id"]):
                self.assertTrue(s["blocs"] & VIDEO, "ni ul.media ni p.a-video")
                if s["type"] == "comprendre":
                    self.assertEqual(s["blocs"] & GESTES, set(), "blocs de gestes dans un atelier comprendre")
                else:
                    self.assertEqual(GESTES - s["blocs"], set(), "blocs manquants")

    def test_zones_des_ateliers(self):
        ateliers = self.ateliers()
        for s in ateliers:
            self.assertIn(s["zone"], ZONES, s["id"])
        for z in ZONES:
            self.assertTrue(any(s["zone"] == z for s in ateliers), f"zone {z} sans atelier publié")


class TestControleAteliers(unittest.TestCase):
    """controles() refuse un atelier incomplet ou hors zone, avec un message en français : le build sort alors en 1."""

    def page(self, *ateliers, zones=ZONES):
        # Un atelier « comprendre » par zone, pour que seule l'erreur cherchée apparaisse.
        base = [atelier(f"base-{z}", z, "comprendre", '<p class="a-video">Pas de vidéo.</p>') for z in zones]
        return "<main>" + "".join(base + list(ateliers)) + "</main>"

    def test_page_correcte(self):
        complet = atelier("a", ZONES[0], "remplacer", COMPLET, 'data-de="A" data-vers="B"')
        self.assertEqual(assemble.controles(self.page(complet)), [])

    def test_bloc_manquant(self):
        sans_kit = COMPLET.replace('<div class="kit"></div>', "")
        err = assemble.controles(self.page(atelier("a", ZONES[0], "entretenir", sans_kit)))
        self.assertIn("atelier a : .kit manquant (type entretenir)", err)

    def test_comprendre_sans_gestes(self):
        err = assemble.controles(self.page(atelier("a", ZONES[0], "comprendre", COMPLET)))
        self.assertIn("atelier a : ol.steps en trop (type comprendre)", err)

    def test_sans_video(self):
        sans_video = COMPLET.replace('<ul class="media"></ul>', "")
        err = assemble.controles(self.page(atelier("a", ZONES[0], "regler", sans_video)))
        self.assertIn("atelier a : ni ul.media ni p.a-video", err)

    def test_remplacer_sans_pieces(self):
        err = assemble.controles(self.page(atelier("a", ZONES[0], "remplacer", COMPLET, 'data-de="A"')))
        self.assertIn("atelier a : data-de et data-vers obligatoires (type remplacer)", err)

    def test_type_inconnu(self):
        err = assemble.controles(self.page(atelier("a", ZONES[0], "reparer", COMPLET)))
        self.assertIn("atelier a : data-type « reparer » inconnu (comprendre, entretenir, regler ou remplacer)", err)

    def test_zone_inconnue(self):
        err = assemble.controles(self.page(atelier("a", "selle", "regler", COMPLET)))
        self.assertIn("atelier a : data-zone « selle » absente de src/scene/zones.json", err)

    def test_sans_id(self):
        err = assemble.controles(self.page(atelier("", ZONES[0], "regler", COMPLET)))
        self.assertIn("atelier sans id : app.js ne peut pas l'ouvrir", err)

    def test_zone_sans_atelier(self):
        err = assemble.controles(self.page(zones=ZONES[:-1]))
        self.assertIn(f"zone « {ZONES[-1]} » sans atelier publié", err)


if __name__ == "__main__":
    unittest.main()
