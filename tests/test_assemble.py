"""Tests de build/assemble.py : sorties de dist/site et dist/artifact, scène de la page d'accueil, pages des ateliers du
chapitre Freins, contrôles qui gardent les ateliers sources et les pages, configuration nginx."""
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
import gabarit  # noqa: E402

PIED = (
    "Le vélo et ses pièces sont dessinés d'après les documents officiels. Ce qui n'est pas publié est marqué "
    "« forme approchée » : la liste est derrière le bouton « Ce qui est approché »."
)

ZONES = [z["id"] for z in json.loads((RACINE / "src" / "scene" / "zones.json").read_text(encoding="utf-8"))]

SLUGS = ["systeme", "disques", "plaquettes", "rodage", "centrage", "controles", "purge", "securite"]
SLUGS_MONTAGE = ["avant", "deballer", "cintre", "selle", "roues", "pedales", "di2", "position", "controles"]
# Les ateliers du chapitre Montage, dans l'ordre du document : id et data-zone (aucune pour 1.1, 1.2 et 1.9).
ZONES_MONTAGE = [("montage-avant", None), ("montage-deballer", None), ("montage-cintre", "poste"),
                 ("montage-selle", "selle"), ("montage-roues", "axes"), ("montage-pedales", "pedalier"),
                 ("montage-di2", "derailleur"), ("montage-position", "selle"), ("montage-controles", None)]
SLUGS_TUBELESS = ["materiel", "passer", "liquide", "pression", "crevaison", "problemes"]
# Les ateliers du chapitre Pneus et tubeless, dans l'ordre du document : tous dans la zone des pneus et des valves.
ZONES_TUBELESS = [(f"tubeless-{slug}", "pneus") for slug in SLUGS_TUBELESS]
# Les ateliers du chapitre Freins, dans l'ordre du document : id, data-zone, data-type, data-de, data-vers.
CORRESPONDANCE = [
    ("freins-systeme", "manettes", "comprendre", None, None),
    ("freins-disques", "disques", "entretenir", None, None),
    ("freins-plaquettes", "etrier", "remplacer", "Plaquettes d’origine, L05A-RF attendues", "Shimano L05A-RF neuves"),
    ("freins-rodage", "disques", "entretenir", None, None),
    ("freins-centrage", "etrier", "regler", None, None),
    ("freins-controles", "etrier", "comprendre", None, None),
    ("freins-purge", "manettes", "entretenir", None, None),
    ("freins-securite", "manettes", "comprendre", None, None),
]
# Obligatoires dans un atelier, sauf « comprendre » qui n'en a aucun.
GESTES = {".a-dem", ".kit", "ol.steps"}
VIDEO = {"ul.media", "p.a-video"}


class Ateliers(HTMLParser):
    """Les ateliers d'une page (section.atelier d'un chapitre source, article.atelier d'une page générée), avec leurs
    attributs, les id des sections qui les contiennent et leurs blocs.

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
        if tag in ("section", "article"):
            s = None
            if "atelier" in classes:
                s = {"id": a.get("id"), "classes": classes, "zone": a.get("data-zone"), "type": a.get("data-type"),
                     "de": a.get("data-de"), "vers": a.get("data-vers"), "blocs": set(),
                     "ancetres": [i for i, _ in self.pile if i]}
                self.liste.append(s)
            self.pile.append((a.get("id"), s))
            return
        ouverts = [s for _, s in self.pile if s]
        if ouverts:
            ouverts[-1]["blocs"].update(nom for nom, (balise, classe) in self.BLOCS.items()
                                        if classe in classes and balise in (None, tag))

    def handle_endtag(self, tag):
        if tag in ("section", "article") and self.pile:
            self.pile.pop()


def atelier(ident, zone, type_, blocs, attributs=""):
    # Sans zone (None), la section n'a pas d'attribut data-zone du tout.
    attribut_zone = "" if zone is None else f' data-zone="{zone}"'
    return (f'<section class="sub atelier" id="{ident}"{attribut_zone} data-type="{type_}" {attributs}>'
            f"<h3>{ident}</h3>{blocs}</section>")


COMPLET = '<div class="a-dem"></div><div class="kit"></div><ol class="steps"></ol><ul class="media"></ul>'


class TestCarteImports(unittest.TestCase):
    def test_carte_imports_site(self):
        carte = gabarit.carte_imports("site")
        self.assertIn('type="importmap"', carte)
        self.assertIn('"three": "./vendor/three/three.module.min.js"', carte)
        self.assertIn('"three/addons/": "./vendor/three/addons/"', carte)

    def test_carte_imports_artifact(self):
        carte = gabarit.carte_imports("artifact")
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

    def page(self, cible="site", chemin=""):
        dossier = self.site if cible == "site" else self.artifact
        return (dossier / chemin / "index.html").read_text(encoding="utf-8")

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
        for motif in (r'<figure[^>]*\bid="scene"', r'<div[^>]*\bid="pins"', r'<div[^>]*\bid="variante"',
                      r'<button[^>]*\bid="approche"', r'<button[^>]*\bid="vue-ensemble"',
                      r'<div class="zone-carte" data-zone="disques">'):
            self.assertIsNotNone(re.search(motif, page), "absent : " + motif)
        # Ni rangée de puces ni fiche : « Où intervenir » mène aux pages des ateliers.
        for motif in (r'\bid="chips"', r'\bid="fiche"'):
            self.assertIsNone(re.search(motif, page), "présent : " + motif)
        # Les trois onglets de la maquette, dans son ordre, la 3D réaliste ouverte par défaut.
        onglets = re.findall(r'<button [^>]*role="tab"[^>]*data-mode="([^"]+)"[^>]*aria-selected="([^"]+)"', page)
        self.assertEqual(onglets, [("2d", "false"), ("simple", "false"), ("reel", "true")])
        for libelle in ("Schéma 2D", "3D simple", "3D réaliste"):
            self.contient(page, f"<b>{libelle}</b>")

    def test_garde_fou(self):
        # Si js/scene/app.js ne démarre pas, un script classique placé après lui le dit et lance la visionneuse.
        app = (RACINE / "src" / "scene" / "app.js").read_text(encoding="utf-8")
        self.assertIn("document.documentElement.dataset.app = ", app)
        for cible in ("site", "artifact"):
            page = self.page(cible)
            module = page.index('<script type="module" src="js/scene/app.js">')
            garde = page.find("hasAttribute('data-app')")
            self.assertGreater(garde, module, f"{cible} : garde-fou absent ou avant app.js")
            debut, fin = page.rfind("<script>", 0, garde), page.find("</script>", garde)
            self.assertGreater(debut, module, f"{cible} : le garde-fou n'est pas un script classique après app.js")
            for morceau in ("DOMContentLoaded", "sans-rendu", "AtelierViewer.start()", "scene-alerte"):
                self.assertIn(morceau, page[debut:fin], f"{cible} : {morceau} absent du garde-fou")

    def test_pied_de_page(self):
        page = self.page()
        self.contient(page, PIED)
        self.contient(page, "Les pièces en 3D sont des modèles simplifiés", oui=False)

    def test_lot0(self):
        self.assertEqual(self.res.returncode, 0, self.res.stdout + self.res.stderr)
        ligne = next((l for l in self.res.stdout.splitlines() if l.startswith("Lots publiés : ")), "")
        self.assertIn("0 (en relecture)", ligne.removeprefix("Lots publiés : ").split(", "))
        self.assertIn("3 (en relecture)", ligne.removeprefix("Lots publiés : ").split(", "))

    def test_sortie(self):
        # Pour chaque cible : le nombre de pages et la taille totale, sans erreur.
        for cible in ("site", "artifact"):
            ligne = next((l for l in self.res.stdout.splitlines() if l.startswith(f"{cible} : ")), "")
            self.assertRegex(ligne, rf"^{cible} : 35 pages, \d+ octets en tout$", self.res.stdout)

    def ateliers(self):
        # Une page par atelier, dans l'ordre du chapitre : chacune porte l'article.atelier de son atelier.
        return [s for slug in SLUGS for s in Ateliers(self.page(chemin=f"freins/{slug}/")).liste]

    def test_correspondance(self):
        ateliers = self.ateliers()
        self.assertEqual([(s["id"], s["zone"], s["type"], s["de"], s["vers"]) for s in ateliers], CORRESPONDANCE)
        for s in ateliers:
            self.assertIn("atelier", s["classes"], s["id"])
        # Le chapitre source a les mêmes ateliers, dans le même ordre.
        source = Ateliers((RACINE / "src" / "parts" / "20-freins.html").read_text(encoding="utf-8")).liste
        self.assertEqual([(s["id"], s["zone"], s["type"], s["de"], s["vers"]) for s in source], CORRESPONDANCE)
        # L'accueil n'a plus d'atelier : chacun est sur sa page.
        self.assertEqual(Ateliers(self.page()).liste, [])

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
        # Chaque atelier publié est dans une zone de zones.json, sauf les fiches « comprendre » sans zone du Montage,
        # et chaque zone a au moins un atelier publié : les six du chapitre 3 dans celle des pneus.
        montage = [s for slug in SLUGS_MONTAGE for s in Ateliers(self.page(chemin=f"montage/{slug}/")).liste]
        self.assertEqual([(s["id"], s["zone"]) for s in montage], ZONES_MONTAGE)
        tubeless = [s for slug in SLUGS_TUBELESS for s in Ateliers(self.page(chemin=f"tubeless/{slug}/")).liste]
        self.assertEqual([(s["id"], s["zone"]) for s in tubeless], ZONES_TUBELESS)
        ateliers = self.ateliers() + montage + tubeless
        for s in ateliers:
            if s["zone"] is None:
                self.assertEqual(s["type"], "comprendre", s["id"])
                continue
            self.assertIn(s["zone"], ZONES, s["id"])
        for z in ZONES:
            self.assertTrue(any(s["zone"] == z for s in ateliers), f"zone {z} sans atelier publié")


class TestControleAteliers(unittest.TestCase):
    """controle_ateliers() refuse un atelier source incomplet ou hors zone, avec un message en français : le build sort
    alors en 1."""

    def page(self, *ateliers, zones=ZONES):
        # Un atelier « comprendre » par zone, pour que seule l'erreur cherchée apparaisse.
        base = [atelier(f"base-{z}", z, "comprendre", '<p class="a-video">Pas de vidéo.</p>') for z in zones]
        return "<main>" + "".join(base + list(ateliers)) + "</main>"

    def controler(self, texte):
        return assemble.controle_ateliers(texte, ZONES)

    def test_page_correcte(self):
        complet = atelier("a", ZONES[0], "remplacer", COMPLET, 'data-de="A" data-vers="B"')
        self.assertEqual(self.controler(self.page(complet)), [])

    def test_chapitres_sources(self):
        # Les chapitres publiés tels qu'ils sont écrits passent le contrôle, ensemble : chaque zone a son atelier.
        texte = "".join((RACINE / "src" / "parts" / f"{nom}.html").read_text(encoding="utf-8")
                        for nom in ("20-freins", "11-montage", "30-tubeless"))
        self.assertEqual(self.controler(texte), [])

    def test_bloc_manquant(self):
        sans_kit = COMPLET.replace('<div class="kit"></div>', "")
        err = self.controler(self.page(atelier("a", ZONES[0], "entretenir", sans_kit)))
        self.assertIn("atelier a : .kit manquant (type entretenir)", err)

    def test_comprendre_sans_gestes(self):
        err = self.controler(self.page(atelier("a", ZONES[0], "comprendre", COMPLET)))
        self.assertIn("atelier a : ol.steps en trop (type comprendre)", err)

    def test_sans_video(self):
        sans_video = COMPLET.replace('<ul class="media"></ul>', "")
        err = self.controler(self.page(atelier("a", ZONES[0], "regler", sans_video)))
        self.assertIn("atelier a : ni ul.media ni p.a-video", err)

    def test_remplacer_sans_pieces(self):
        err = self.controler(self.page(atelier("a", ZONES[0], "remplacer", COMPLET, 'data-de="A"')))
        self.assertIn("atelier a : data-de et data-vers obligatoires (type remplacer)", err)

    def test_type_inconnu(self):
        err = self.controler(self.page(atelier("a", ZONES[0], "reparer", COMPLET)))
        self.assertIn("atelier a : data-type « reparer » inconnu (comprendre, entretenir, regler ou remplacer)", err)

    def test_zone_inconnue(self):
        err = self.controler(self.page(atelier("a", "garde-boue", "regler", COMPLET)))
        self.assertIn("atelier a : data-zone « garde-boue » absente de src/scene/zones.json", err)

    def test_sans_id(self):
        err = self.controler(self.page(atelier("", ZONES[0], "regler", COMPLET)))
        self.assertIn("atelier sans id : app.js ne peut pas l'ouvrir", err)

    def test_zone_sans_atelier(self):
        err = self.controler(self.page(zones=ZONES[:-1]))
        self.assertIn(f"zone « {ZONES[-1]} » sans atelier publié", err)

    # Un atelier « comprendre » peut n'avoir aucune zone (ceux du chapitre Montage : 1.1, 1.2 et 1.9). Tout autre type
    # garde le contrôle strict, et une zone écrite doit toujours exister dans zones.json.

    def fragment_sans_zone(self, *ateliers):
        # Un atelier « comprendre » sans data-zone, puis ce qu'il faut pour que la zone « disques » ait son atelier.
        comprendre = atelier("montage-avant", None, "comprendre", '<p class="a-video">Pas de vidéo.</p>')
        regler = atelier("montage-selle", "disques", "regler", COMPLET)
        return "<main>" + comprendre + regler + "".join(ateliers) + "</main>"

    def test_atelier_sans_zone_comprendre_accepte(self):
        self.assertEqual(assemble.controle_ateliers(self.fragment_sans_zone(), ["disques"]), [])

    def test_atelier_sans_zone_regler_refuse(self):
        for type_, attributs in (("regler", ""), ("entretenir", ""), ("remplacer", 'data-de="A" data-vers="B"')):
            with self.subTest(type=type_):
                sans_zone = atelier("montage-x", None, type_, COMPLET, attributs)
                err = assemble.controle_ateliers(self.fragment_sans_zone(sans_zone), ["disques"])
                self.assertIn("atelier montage-x : data-zone manquante ; seul un atelier « comprendre » peut s'en passer "
                              f"(type {type_})", err)
                self.assertEqual(len(err), 1, err)

    def test_atelier_sans_zone_type_inconnu_refuse(self):
        # Sans type valide, l'absence de zone n'est pas excusée.
        err = assemble.controle_ateliers(self.fragment_sans_zone(atelier("montage-x", None, "reparer", COMPLET)),
                                         ["disques"])
        self.assertTrue(any("montage-x : data-zone" in e for e in err), err)
        self.assertTrue(any("montage-x : data-type « reparer » inconnu" in e for e in err), err)

    def test_atelier_comprendre_zone_vide_accepte(self):
        # data-zone="" vaut pas de zone, comme dans ateliers.py.
        vide = '<section class="sub atelier" id="montage-y" data-zone="" data-type="comprendre"><h3>y</h3><p class="a-video">V</p></section>'
        self.assertEqual(assemble.controle_ateliers(self.fragment_sans_zone(vide), ["disques"]), [])

    def test_atelier_comprendre_zone_inconnue_refuse(self):
        # Une zone écrite mais absente de zones.json reste refusée, même pour « comprendre ».
        inconnue = atelier("montage-y", "garde-boue", "comprendre", '<p class="a-video">V</p>')
        err = assemble.controle_ateliers(self.fragment_sans_zone(inconnue), ["disques"])
        self.assertEqual(err, ["atelier montage-y : data-zone « garde-boue » absente de src/scene/zones.json"])

    def test_atelier_sans_zone_garde_les_autres_controles(self):
        # Sans zone, un « comprendre » reste soumis aux blocs de son type et à la vidéo.
        avec_gestes = atelier("montage-y", None, "comprendre", COMPLET)
        sans_video = atelier("montage-z", None, "comprendre", "")
        err = assemble.controle_ateliers(self.fragment_sans_zone(avec_gestes, sans_video), ["disques"])
        self.assertIn("atelier montage-y : ol.steps en trop (type comprendre)", err)
        self.assertIn("atelier montage-z : ni ul.media ni p.a-video", err)

    def test_atelier_sans_zone_ne_remplace_pas_une_zone(self):
        # Un atelier sans zone ne compte pour aucune zone : la zone sans atelier reste signalée.
        seul = "<main>" + atelier("montage-avant", None, "comprendre", '<p class="a-video">V</p>') + "</main>"
        err = assemble.controle_ateliers(seul, ["disques"])
        self.assertEqual(err, ["zone « disques » sans atelier publié"])


class TestControlesDePage(unittest.TestCase):
    """controles() vaut pour chaque page générée : ni tiret cadratin ou demi-cadratin, ni id en double."""

    def test_page_correcte(self):
        self.assertEqual(assemble.controles('<p id="a">Un texte - simple</p><p id="b"></p>'), [])

    def test_tirets(self):
        self.assertEqual(assemble.controles("<p>a \u2014 b \u2013 c</p>"), ["2 tiret(s) cadratin ou demi-cadratin"])

    def test_doublons(self):
        self.assertEqual(assemble.controles('<p id="a"></p><div id="a"></div>'), ["id en double : a"])

    def test_sans_controle_d_atelier(self):
        # Les ateliers se contrôlent sur les chapitres sources, pas sur chaque page.
        self.assertEqual(assemble.controles(atelier("a", "selle", "reparer", "")), [])


class TestDeploiement(unittest.TestCase):
    def test_js_sans_cache(self):
        # Les modules ES n'ont pas de version dans leur nom : chaque .js se revalide, pour qu'un déploiement ne mélange
        # jamais deux versions des modules. Un add_header dans ce bloc couperait l'héritage des en-têtes de sécurité.
        conf = (RACINE / "deploy" / "nginx.conf").read_text(encoding="utf-8")
        m = re.search(r"location ~\* \\\.js\$ \{(.*?)\}", conf, re.S)
        self.assertIsNotNone(m, "bloc location des .js introuvable")
        self.assertRegex(m.group(1), r"\bexpires (-1|epoch);")
        self.assertNotIn("add_header", m.group(1))

    def test_nginx_html_sans_cache(self):
        # Chaque page est un dossier et son index.html : toutes se revalident, pas seulement la racine. « expires -1 »
        # envoie « Cache-Control: no-cache ». Pas d'add_header ici non plus, pour garder les en-têtes de sécurité.
        conf = (RACINE / "deploy" / "nginx.conf").read_text(encoding="utf-8")
        m = re.search(r"location ~\* \\\.html\$ \{(.*?)\}", conf, re.S)
        self.assertIsNotNone(m, "bloc location des .html introuvable")
        self.assertRegex(m.group(1), r"\bexpires (-1|epoch);")
        self.assertNotIn("add_header", m.group(1))
        self.assertNotIn("location = /index.html", conf)
        self.assertRegex(conf, r"\n\s*index index\.html;")
        for entete in ("X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Content-Security-Policy"):
            self.assertEqual(len(re.findall(rf'add_header {entete} ".*" always;', conf)), 1, entete)


if __name__ == "__main__":
    unittest.main()
