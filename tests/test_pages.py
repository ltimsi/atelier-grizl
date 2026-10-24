"""Tests de build/pages.py et de l'écriture du site par build/assemble.py : les 20 pages, leurs liens, le texte des
ateliers conservé, l'index de la recherche, la page Composants d'origine recopiée de la fiche, la page d'accueil et
les blocs qu'elle reçoit (Où intervenir, D'origine puis à monter, Toutes les catégories).

Le site est construit une seule fois, dans un dossier temporaire, pour les deux cibles."""
import copy
import dataclasses
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import assemble  # noqa: E402
import ateliers  # noqa: E402
import dom  # noqa: E402
import gabarit  # noqa: E402
import pages  # noqa: E402

CONFIG = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
ZONES = json.loads((RACINE / "src" / "scene" / "zones.json").read_text(encoding="utf-8"))
SLUGS = ["systeme", "disques", "plaquettes", "rodage", "centrage", "controles", "purge", "securite"]
A_VENIR = ["montage", "tubeless", "transmission", "accessoires", "revision"]
REFERENCES = ["composants", "outils", "couples", "approche", "sources"]
CHEMINS = [""] + ["freins/"] + [f"freins/{s}/" for s in SLUGS] + [f"{c}/" for c in A_VENIR] + [f"{r}/" for r in REFERENCES]
MD = (RACINE / "docs" / "recherche" / "composants-origine.md").read_text(encoding="utf-8")
COMPOSANTS = (RACINE / "src" / "parts" / "composants.html").read_text(encoding="utf-8")
# Les blocs du source dont le texte doit se retrouver dans la page de l'atelier. div.q compte à part : son texte nu
# (hors de tout p ou li) ne serait vu par aucun autre sélecteur. tr colle les cases d'une ligne : une case courte
# perdue (« 40 Nm ») ne passe plus inaperçue parce que son texte revient ailleurs dans l'atelier. svg donne le titre
# et les libellés d'une planche ; summary et button, les résumés et boutons écrits dans le source.
BLOCS = ("p", "li", "td", "th", "tr", "div.q", "figcaption", "h4", "summary", "svg", "button")


def elements(parent):
    return [e for e in parent.enfants if isinstance(e, dom.Element)]


def un(racine, selecteur):
    trouves = dom.selectionner(racine, selecteur)
    if len(trouves) != 1:
        raise AssertionError(f"{selecteur} : {len(trouves)} éléments au lieu d'un")
    return trouves[0]


def texte_de_l_atelier(html):
    """Le texte de main.page d'une page d'atelier, sans les copies que le build ajoute : l'en-tête (titre, pastilles,
    pièce d'origine et pièce à monter), la barre des étapes, la boîte des couples, le numéro et le premier couple
    recopiés dans le résumé de chaque étape, et les liens précédent et suivant."""
    page = un(dom.analyser(html), "main.page")
    for selecteur in ("header.atelier-tete", "div.etapes-barre", "div.couples-atelier", "nav.precsuiv"):
        for e in dom.selectionner(page, selecteur):
            e.retirer()
    for li in dom.selectionner(page, "li.step"):
        resume = elements(elements(li)[0])[0]
        for e in elements(resume):
            if e.tag == "span" and ("st-n" in e.classes() or "nm" in e.classes()):
                e.retirer()
    return page.texte()


def textes_perdus(section, html):
    """Les textes des blocs de la section source qui ne sont pas dans la page de l'atelier."""
    texte = texte_de_l_atelier(html)
    return [f"{s} : {e.texte()[:70]}" for s in BLOCS for e in dom.selectionner(section, s) if e.texte() not in texte]


class Site(unittest.TestCase):
    """Le site, écrit une fois pour toute la classe dans un dossier temporaire."""

    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        cls.dossier = Path(cls._tmp.name)
        cls.chapitres = pages.chapitres_publies(CONFIG)
        cls.pages = pages.toutes_les_pages(CONFIG)
        cls.sorties = {c: assemble.ecrire(c, cls.dossier / c, CONFIG, cls.pages, cls.chapitres)
                       for c in ("site", "artifact")}

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def html(self, chemin, cible="site"):
        return (self.dossier / cible / chemin / "index.html").read_text(encoding="utf-8")

    def arbre(self, chemin, cible="site"):
        return dom.analyser(self.html(chemin, cible))


class TestPages(Site):
    def test_pages_generees(self):
        # 20 pages : la racine, Freins, ses 8 ateliers, les 5 catégories à venir et les 5 références.
        self.assertEqual(len(CHEMINS), 20)
        self.assertEqual([p.chemin for p in self.pages], CHEMINS)
        for cible in ("site", "artifact"):
            trouvees = sorted(p.relative_to(self.dossier / cible).as_posix()
                              for p in (self.dossier / cible).rglob("index.html") if "js" not in p.parts)
            self.assertEqual(trouvees, sorted(f"{c}index.html" for c in CHEMINS), cible)
            self.assertEqual(sorted(self.sorties[cible][0]), sorted(CHEMINS), cible)

    def test_fichiers_copies(self):
        attendus = {"js/recherche.js", "js/viewer.js", "js/site.js", "js/references.js", "js/m-rotor.js",
                    "js/m-caliper.js", "js/m-bleed.js", "js/scene/app.js", "js/scene/zones.json"}
        for cible in ("site", "artifact"):
            fichiers = self.sorties[cible][1]
            self.assertEqual(attendus - fichiers, set(), cible)
        self.assertIn("vendor/three/three.module.min.js", self.sorties["site"][1])
        self.assertIn("vendor/three/LICENSE.txt", self.sorties["site"][1])
        self.assertNotIn("vendor/three/LICENSE", self.sorties["site"][1])
        self.assertFalse(any(f.startswith("vendor/") for f in self.sorties["artifact"][1]))

    def test_aucun_lien_casse(self):
        for cible in ("site", "artifact"):
            rendues, fichiers = self.sorties[cible]
            self.assertEqual(assemble.liens_casses(rendues, fichiers), [], cible)

    def test_page_atelier(self):
        html = self.html("freins/plaquettes/")
        racine = dom.analyser(html)
        h1 = un(racine, "h1")
        self.assertIn("<h1>", html)
        self.assertEqual(h1.texte(), "Changer les plaquettes")
        self.assertEqual(len(re.findall(r'<li class="step"', html)), 10)
        self.assertIn('<aside class="atelier-droite"', html)
        self.assertIn('id="tout-deplier"', html)
        self.assertIn('id="pas-a-pas"', html)
        self.assertIn('<script src="../../js/m-caliper.js">', html)
        precsuiv = un(racine, "nav.precsuiv")
        self.assertEqual([(a.get("class"), a.get("href")) for a in dom.selectionner(precsuiv, "a")],
                         [("prec", "../disques/"), ("suiv", "../rodage/")])
        self.assertIn("2.2 Déposer et reposer un disque", precsuiv.texte())
        self.assertIn("2.4 Roder les freins", precsuiv.texte())

        article = un(racine, "article.atelier")
        self.assertEqual([article.get(n) for n in ("id", "data-zone", "data-type", "data-de", "data-vers")],
                         ["freins-plaquettes", "etrier", "remplacer", "Plaquettes d’origine, L05A-RF attendues",
                          "Shimano L05A-RF neuves"])
        tete = un(article, "header.atelier-tete")
        self.assertEqual(un(tete, "p.atelier-num").texte(), "Atelier 2.3 · Zone 2, Étrier et plaquettes")
        self.assertEqual([p.texte() for p in dom.selectionner(tete, "span.pill")],
                         ["Remplacer", "10 étapes", "À démonter : La roue."])
        self.assertEqual(un(tete, "p.de-vers").texte(),
                         "D’origine Plaquettes d’origine, L05A-RF attendues À monter Shimano L05A-RF neuves")
        # La barre des étapes dans la colonne de gauche, juste avant les étapes.
        barre = un(article, "div.etapes-barre")
        gauche = un(article, "div.atelier-gauche")
        self.assertIs(barre.parent, gauche)
        suivant = elements(gauche)[elements(gauche).index(barre) + 1]
        self.assertEqual((suivant.tag, suivant.classes()), ("ol", ["steps"]))
        self.assertEqual([b.get("id") for b in dom.selectionner(barre, "button")], ["tout-deplier", "pas-a-pas"])
        # Fil d'Ariane, menu déplié sur Freins, titre de l'onglet.
        fil = un(racine, "nav.crumbs")
        self.assertEqual(fil.texte(), "Ateliers/Freins/2.3 Changer les plaquettes")
        self.assertEqual(un(fil, "a").get("href"), "../")
        self.assertIn('<div class="sub-nav">', html)
        self.assertIn("<title>2.3 Changer les plaquettes · Atelier Grizl</title>", html)
        # Les liens « #id » mènent à la page qui porte l'id.
        self.assertIn('<a href="../centrage/">2.5</a>', html)
        self.assertIn('<a href="../rodage/">2.4</a>', html)

    def test_pages_d_atelier(self):
        for slug in SLUGS:
            with self.subTest(slug):
                racine = self.arbre(f"freins/{slug}/")
                precsuiv = un(racine, "nav.precsuiv")
                i = SLUGS.index(slug)
                attendu = ([("prec", f"../{SLUGS[i - 1]}/")] if i else []) + \
                          ([("suiv", f"../{SLUGS[i + 1]}/")] if i + 1 < len(SLUGS) else [])
                self.assertEqual([(a.get("class"), a.get("href")) for a in dom.selectionner(precsuiv, "a")], attendu)
                self.assertEqual(len(dom.selectionner(racine, "h1")), 1)

    def test_barre_des_etapes(self):
        # Chaque atelier à étapes a une barre, une seule, dans sa colonne de gauche, juste avant le bloc de premier
        # niveau qui contient ses étapes : l'ol.steps lui-même, ou le <details> qui le range (la purge).
        for slug in ("disques", "plaquettes", "rodage", "centrage", "purge"):
            with self.subTest(slug):
                gauche = un(self.arbre(f"freins/{slug}/"), "div.atelier-gauche")
                barre = un(gauche, "div.etapes-barre")
                enfants = elements(gauche)
                self.assertIs(barre.parent, gauche)
                suivant = enfants[enfants.index(barre) + 1]
                premier = dom.selectionner(gauche, "ol.steps")[0]
                self.assertTrue(suivant is premier or premier in dom.selectionner(suivant, "ol.steps"), slug)
                if slug == "purge":
                    self.assertEqual(suivant.tag, "details")

    def test_pages_js(self):
        # Ce qui est approché et Sources : sans leur script, une phrase le dit au lieu d'une boîte vide.
        for chemin, ident in (("approche/", "approche-page"), ("sources/", "sources-page")):
            with self.subTest(chemin):
                boite = un(self.arbre(chemin), f'div[id="{ident}"]')
                self.assertEqual(boite.texte(), "Cette liste a besoin de JavaScript pour s’afficher.")
                self.assertEqual(dom.selectionner(boite, "noscript"), [])

    def test_une_colonne(self):
        # 2.1, 2.6 et 2.8 n'ont rien à droite : une seule colonne, jamais un aside vide, pas de barre d'étapes.
        for slug in ("systeme", "controles", "securite"):
            with self.subTest(slug):
                racine = self.arbre(f"freins/{slug}/")
                self.assertEqual(dom.selectionner(racine, "aside.atelier-droite"), [])
                cols = un(racine, "div.atelier-cols")
                self.assertEqual([e.classes() for e in elements(cols)], [["atelier-gauche"]])
                self.assertIn("une-colonne", cols.classes())
                self.assertEqual(dom.selectionner(racine, "div.etapes-barre"), [])
        for slug in ("disques", "plaquettes", "rodage", "centrage", "purge"):
            with self.subTest(slug):
                cols = un(self.arbre(f"freins/{slug}/"), "div.atelier-cols")
                self.assertEqual([(e.tag, e.classes()) for e in elements(cols)],
                                 [("div", ["atelier-gauche"]), ("aside", ["atelier-droite"])])
                self.assertTrue(elements(elements(cols)[1]))

    def test_comprendre(self):
        tete = un(self.arbre("freins/controles/"), "header.atelier-tete")
        self.assertEqual([p.texte() for p in dom.selectionner(tete, "span.pill")], ["Comprendre", "8 blocs à lire"])
        self.assertEqual(dom.selectionner(tete, "p.de-vers"), [])
        tete = un(self.arbre("freins/securite/"), "header.atelier-tete")
        self.assertEqual([p.texte() for p in dom.selectionner(tete, "span.pill")], ["Comprendre", "1 bloc à lire"])

    def test_scripts_par_page(self):
        accueil = self.html("")
        for morceau in ('id="zones-data"', 'id="liens-data"', 'type="importmap"', 'src="js/scene/app.js"',
                        "hasAttribute('data-app')", 'src="js/recherche.js"', 'src="js/site.js"'):
            self.assertIn(morceau, accueil)
        self.assertNotIn("viewer.js", accueil)
        for slug, modele in (("disques", "rotor"), ("plaquettes", "caliper"), ("purge", "bleed")):
            html = self.html(f"freins/{slug}/")
            for morceau in ('"three": "../../vendor/three/three.module.min.js"', 'src="../../js/viewer.js"',
                            f'src="../../js/m-{modele}.js"', 'src="../../js/scene/app.js"'):
                self.assertIn(morceau, html, slug)
            self.assertEqual(re.findall(r'js/m-(\w+)\.js', html), [modele], slug)
            self.assertNotIn("zones-data", html)
            # Le garde-fou, script classique après app.js : si app.js ne démarre pas, il lance la visionneuse, qui
            # affiche son message sans three.js au lieu d'une boîte vide.
            garde = html.index("hasAttribute('data-app')")
            self.assertGreater(garde, html.index('src="../../js/scene/app.js"'), slug)
            self.assertGreater(html.rfind("<script>", 0, garde), html.index('src="../../js/scene/app.js"'), slug)
            self.assertIn("window.AtelierViewer.start()", html[garde:html.index("</script>", garde)], slug)
        for chemin in ("freins/rodage/", "freins/systeme/", "freins/", "outils/", "montage/"):
            html = self.html(chemin)
            for absent in ("importmap", "viewer.js", "scene/app.js", "references.js", "zones-data", "liens-data",
                           "hasAttribute('data-app')"):
                self.assertNotIn(absent, html, chemin)
            self.assertIn("js/site.js", html, chemin)
        for chemin in ("approche/", "sources/"):
            self.assertIn('<script type="module" src="../js/references.js"></script>', self.html(chemin))
        # Aperçu Claude : three.js depuis jsDelivr, mêmes chemins pour le reste.
        html = self.html("freins/plaquettes/", "artifact")
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js", html)
        self.assertIn('src="../../js/m-caliper.js"', html)

    def test_liens_vers_les_categories_a_venir(self):
        # « #montage » et « #tubeless » mènent aux pages des catégories à venir, sans ancre ; « #montage-position »,
        # qui n'est sur aucune page, reste un texte gris.
        for cible in ("site", "artifact"):
            plan = un(self.arbre("", cible), "ol.plan")
            self.assertEqual([(a.get("href"), a.texte()) for a in dom.selectionner(plan, "a")],
                             [("montage/", "Chapitre 1"), ("tubeless/", "Chapitre 3"),
                              ("freins/rodage/", "Chapitre 2")], cible)
            gris = dom.selectionner(plan, "span.muted")
            self.assertEqual([s.texte() for s in gris], ["Chapitre 1"], cible)
            self.assertIn("Reporter ta position", gris[0].parent.texte(), cible)
            disques = self.html("freins/disques/", cible)
            self.assertIn('vois le <a href="../../montage/">chapitre 1</a>.', disques, cible)
            self.assertNotIn('<span class="muted">chapitre 1</span>', disques, cible)

    def test_liens_data(self):
        html = self.html("")
        bloc = re.search(r'<script type="application/json" id="liens-data">(.*?)</script>', html, re.S).group(1)
        self.assertNotIn("<", bloc)
        liens = json.loads(bloc)
        self.assertEqual(liens["freins-plaquettes"], "freins/plaquettes/")
        self.assertEqual(liens["freins"], "freins/")
        self.assertEqual(liens["freins-pl-2"], "freins/plaquettes/#freins-pl-2")
        # Chaque adresse mène à une page générée et à un id de cette page.
        for ident, adresse in liens.items():
            chemin, _, ancre = adresse.partition("#")
            self.assertIn(chemin, CHEMINS, ident)
            if ancre:
                self.assertIn(f'id="{ancre}"', self.html(chemin), ident)

    def test_page_categorie(self):
        html = self.html("freins/")
        racine = dom.analyser(html)
        self.assertEqual(html.count('class="carte"'), 8)
        cartes = dom.selectionner(racine, "a.carte")
        self.assertEqual([un(c, "span.num").texte() for c in cartes], [f"2.{n}" for n in range(1, 9)])
        self.assertEqual([c.get("href") for c in cartes], [f"{s}/" for s in SLUGS])
        remplacer = [un(c, "span.num").texte() for c in cartes if c.get("data-type") == "remplacer"]
        self.assertEqual(remplacer, ["2.3"])
        self.assertEqual(len(dom.selectionner(racine, '[data-resume="couples"]')), 1)
        self.assertEqual(len(dom.selectionner(racine, '[data-resume="ordre"]')), 1)
        filtres = un(racine, "div.filtres")
        boutons = dom.selectionner(filtres, "button")
        self.assertEqual([b.get("data-type") for b in boutons], ["tout", "comprendre", "remplacer", "regler", "entretenir"])
        self.assertEqual([b.texte() for b in boutons], ["Tout", "Comprendre", "Remplacer", "Régler", "Entretenir"])
        self.assertEqual([b.get("aria-pressed") for b in boutons], ["true", "false", "false", "false", "false"])
        # En-tête : badge du lot, puis le ch-head du chapitre, dont le h2 devient le h1 de la page (même id, même
        # texte). Le chapitre source garde son h2.
        chapitre = self.chapitres["freins"]
        tete = chapitre.tete.html()
        self.assertIn('<h2 id="freins-h">Freins</h2>', tete)
        copie = tete.replace('<h2 id="freins-h">Freins</h2>', '<h1 id="freins-h">Freins</h1>')
        self.assertIn('<p class="lot-badge">Lot 1 · en relecture</p>\n' + copie, html)
        h1 = un(racine, "h1")
        self.assertEqual((h1.get("id"), h1.texte()), ("freins-h", "Freins"))
        self.assertIs(un(un(racine, "header.ch-head"), "h1"), h1)
        self.assertEqual(dom.selectionner(un(racine, "header.ch-head"), "h2"), [])
        # Le résumé des couples est sur le côté, l'ordre et les cartes à gauche.
        cote = un(racine, "aside.categorie-cote")
        self.assertEqual(len(dom.selectionner(cote, '[data-resume="couples"]')), 1)
        # Les faits d'une carte.
        plaquettes = cartes[2]
        faits = [(dt.texte(), dd.texte()) for dt, dd in zip(dom.selectionner(plaquettes, "dt"), dom.selectionner(plaquettes, "dd"))]
        self.assertEqual(faits, [("Change", "Plaquettes d’origine, L05A-RF attendues → Shimano L05A-RF neuves"),
                                 ("Démonter", "La roue."), ("Étapes", "10"), ("Couples", "0,5-0,7\u00a0Nm 1-1,5\u00a0Nm")])
        self.assertEqual(un(plaquettes, "h3").texte(), "Changer les plaquettes")
        self.assertEqual(un(plaquettes, "span.zone").texte(), "Zone 2 · Étrier et plaquettes")
        self.assertEqual(un(plaquettes, "span.pill").texte(), "Remplacer")
        faits = [(dt.texte(), dd.texte()) for dt, dd in zip(dom.selectionner(cartes[0], "dt"), dom.selectionner(cartes[0], "dd"))]
        self.assertEqual(faits, [("Fiche", "6 blocs à lire")])
        rodage = cartes[3]
        self.assertEqual([dt.texte() for dt in dom.selectionner(rodage, "dt")], ["Démonter", "Étapes"])
        self.assertIn("<title>Freins · Atelier Grizl</title>", html)
        self.assertEqual(un(racine, "nav.crumbs").texte(), "Ateliers/Freins")

    def test_menu_partout(self):
        for cible in ("site", "artifact"):
            for chemin in CHEMINS:
                html = self.html(chemin, cible)
                self.assertIn('class="side"', html, f"{cible} {chemin}")
                self.assertIn('id="recherche"', html, f"{cible} {chemin}")
                # Le lien d'évitement, premier enfant de .app, mène au contenu de la page.
                app = un(dom.analyser(html), "div.app")
                premier = elements(app)[0]
                self.assertEqual((premier.tag, premier.classes(), premier.get("href"), premier.texte()),
                                 ("a", ["evitement"], "#contenu", "Aller au contenu"), f"{cible} {chemin}")
                self.assertEqual(un(app, '[id="contenu"]').tag, "main", f"{cible} {chemin}")

    def test_texte_des_ateliers_conserve(self):
        for a in self.chapitres["freins"].ateliers:
            with self.subTest(a.slug):
                self.assertEqual(textes_perdus(a.section, self.html(f"freins/{a.slug}/")), [])

    def test_conservation_voit_un_texte_nu_perdu(self):
        # Le contrôle doit voir la perte d'un texte nu : sans le corps d'une des questions de 2.6 (un div.q-b, sans p
        # ni li), il le signale.
        controles = self.chapitres["freins"].ateliers[5]
        html = self.html("freins/controles/")
        racine = dom.analyser(html)
        dom.selectionner(racine, "div.q-b")[1].retirer()
        perdus = textes_perdus(controles.section, racine.html())
        self.assertEqual(len(perdus), 1, perdus)
        self.assertTrue(perdus[0].startswith("div.q : Grincement"), perdus)

    def test_sans_tiret_ni_doublon(self):
        for cible in ("site", "artifact"):
            for chemin, html in self.sorties[cible][0].items():
                self.assertEqual(assemble.controles(html), [], f"{cible} {chemin}")

    def test_page_a_venir(self):
        lot = next(l for l in CONFIG["lots"] if l["lot"] == 4)
        racine = self.arbre("transmission/")
        self.assertEqual(un(racine, "h1").texte(), "Transmission")
        self.assertEqual(un(racine, "p.lot-badge").texte(), "Lot 4 · à venir")
        self.assertEqual([li.texte() for li in dom.selectionner(un(racine, "ul.prevu"), "li")], lot["prevu"])
        self.assertEqual(un(racine, "nav.crumbs").texte(), "Ateliers/Transmission")
        self.assertIn('<a class="soon" href="./" aria-current="page">Transmission', self.html("transmission/"))

    def test_page_outils(self):
        racine = self.arbre("outils/")
        lignes = dom.selectionner(racine, "ul.outils > li")
        noms = [un(li, "span.outil").texte() for li in lignes]
        tous = [o for a in self.chapitres["freins"].ateliers for o in a.outils]
        self.assertEqual(sorted(noms), sorted(set(tous)))
        self.assertEqual(len(noms), len(set(noms)))
        par_nom = dict(zip(noms, lignes))
        tl_fc36 = [a.get("href") for a in dom.selectionner(par_nom["Outil Center Lock selon ta bague\u00a0: TL-FC36 (denture extérieure)"], "a")]
        self.assertEqual(tl_fc36, ["../freins/disques/"])
        cle_3 = [a.texte() for a in dom.selectionner(par_nom["Clé Allen 3\u00a0mm"], "a")]
        self.assertEqual(cle_3, ["2.3 Changer les plaquettes", "2.7 Purger les freins"])
        faible = [a.texte() for a in dom.selectionner(par_nom["Clé dynamométrique faible plage"], "a")]
        self.assertEqual(faible, ["2.3 Changer les plaquettes", "2.7 Purger les freins"])

    def test_page_couples(self):
        racine = self.arbre("couples/")
        (section,) = dom.selectionner(racine, "section.couples-cat")
        self.assertEqual(un(section, "h2").texte(), "Freins")
        (tableau,) = dom.selectionner(section, '[data-resume="couples"]')
        self.assertEqual(tableau.html(), self.chapitres["freins"].resumes["couples"][0].html())
        # Le renvoi vers l'atelier d'où vient le tableau.
        self.assertEqual(dom.selectionner(un(section, "p.origine"), "a")[0].get("href"), "../freins/systeme/")

    def atelier_source(self, slug):
        return next(a for a in self.chapitres["freins"].ateliers if a.slug == slug)

    def test_purge_st_rx825(self):
        # 2.7 suit la purge du DM-GADBR10, celle des manettes ST-RX825 : repose-main retourné par l'arrière, entonnoir
        # à 20°, levier actionné environ 10 fois, vis de purge de l'étrier à 4-6 Nm, mise en garde Di2 sur le fil
        # électrique. Rien de la purge du DM-GADBR01 là où elle diffère : ni « par l'avant », ni « 45° », ni l'étape
        # « 0,5 seconde », ni le purgeur des autres étriers GRX.
        source = self.atelier_source("purge").section.texte()
        page = un(self.arbre("freins/purge/"), "main.page").texte()
        for texte in (source, page):
            for attendu in ("par l'arrière", "20°", "4-6", "environ 10 fois", "fil électrique", "DM-GADBR10"):
                self.assertIn(attendu, texte)
            for absent in ("par l'avant", "par l’avant", "45°", "45 °", "0,5 seconde", "purgeur", "RX400", "RX610"):
                self.assertNotIn(absent, texte)

    def test_couples_cf8(self):
        # La vis de purge de l'étrier : 4-6 Nm d'après le DM-GADBR10, le même couple dans l'atelier 2.1, dans la page
        # Freins et dans Couples de serrage. Plus de « non publié » pour cette ligne, plus de ligne BR-RX400 ou RX810.
        for chemin in ("freins/systeme/", "freins/", "couples/"):
            with self.subTest(chemin):
                (tableau,) = dom.selectionner(self.arbre(chemin), '[data-resume="couples"]')
                lignes = [dom.selectionner(tr, "td") for tr in dom.selectionner(tableau, "tbody > tr")]
                elements_ = [tds[0].texte() for tds in lignes]
                (ligne,) = [tds for tds in lignes if tds[0].texte().startswith("Vis de purge de l'étrier")]
                element, couple, source = ligne
                self.assertEqual(couple.texte(), "4-6 Nm")
                self.assertIn("clé de 3 mm", element.texte())
                self.assertEqual([a.texte() for a in dom.selectionner(source, "a")], ["Shimano DM-GADBR10"])
                self.assertNotIn("non publié", element.texte() + couple.texte() + source.texte())
                self.assertFalse([e for e in elements_ if "RX400" in e or "RX810" in e or "RX410" in e], elements_)

    def test_atelier_disques(self):
        # 2.2 devient « Déposer et reposer un disque », en entretenir, sans pièce d'origine ni pièce à monter. Son
        # adresse ne change pas, et l'ancienne ancre #freins-disques mène toujours à sa page.
        racine = self.arbre("freins/disques/")
        self.assertEqual(un(racine, "h1").texte(), "Déposer et reposer un disque")
        article = un(racine, "article.atelier")
        self.assertEqual([article.get(n) for n in ("id", "data-zone", "data-type")],
                         ["freins-disques", "disques", "entretenir"])
        self.assertEqual([n for n, _ in article.attrs if n in ("data-de", "data-vers")], [])
        tete = un(article, "header.atelier-tete")
        self.assertEqual(dom.selectionner(tete, "p.de-vers"), [])
        self.assertNotIn("D’origine", tete.texte())
        self.assertEqual(dom.selectionner(tete, "span.pill")[0].texte(), "Entretenir")
        bloc = re.search(r'<script type="application/json" id="liens-data">(.*?)</script>', self.html(""), re.S).group(1)
        self.assertEqual(json.loads(bloc)["freins-disques"], "freins/disques/")
        # Ni achat de disques neufs, ni disque du CF 7 : le type de bague d'origine est à lire sur la pièce.
        texte = un(racine, "main.page").texte()
        for absent in ("SM-RT64", "à la place des", "2 disques RT-MT800", "à vérifier à l'achat"):
            self.assertNotIn(absent, texte)
        for attendu in ("TL-FC36", "TL-LR15", "Type de bague d'origine : à lire sur la pièce"):
            self.assertIn(attendu, texte)
        # La pièce 3D de l'atelier : le disque nommé comme Canyon le liste, la bague dessinée à denture extérieure mais
        # à lire sur la pièce, et l'outil qui dépend de la bague. Ni sa légende ni sa description ne donnent le
        # RT-MT800 pour certain.
        figure = un(racine, 'figure[data-model="rotor"]')
        legende = un(figure, "figcaption").texte()
        description = un(figure, "div.v3d-stage").get("aria-label")
        for decrit in (legende, description):
            for attendu in ("Deore XT MT800", "TL-FC36", "TL-LR15"):
                self.assertIn(attendu, decrit)
            self.assertNotIn("RT-MT800", decrit)
        self.assertIn("Type de bague : à lire sur la pièce", legende)

    def test_plaquettes_cf8(self):
        # 2.3 : des L05A-RF d'origine aux L05A-RF neuves. Les plaquettes métalliques L04C-MF disparaissent du chapitre.
        # L'entonnoir se monte comme le veut le DM-GADBR10 pour la ST-RX825 : repose-main retourné par l'arrière.
        section = self.atelier_source("plaquettes").section
        page = self.html("freins/plaquettes/")
        for texte in (section.html(), page):
            self.assertIn("L05A-RF", texte)
            self.assertNotIn("L04C", texte)
        article = un(dom.analyser(page), "article.atelier")
        self.assertEqual((article.get("data-de"), article.get("data-vers")),
                         ("Plaquettes d’origine, L05A-RF attendues", "Shimano L05A-RF neuves"))
        entonnoir = [li for li in dom.selectionner(section, "ol.steps > li")
                     if li.texte().startswith("Monte l'entonnoir sur la manette")]
        (etape,) = entonnoir
        self.assertIn("Retourne le repose-main par l'arrière", etape.texte())
        self.assertIn("DM-GADBR10", etape.texte())
        self.assertNotIn("par l'avant", section.texte())
        for slug in SLUGS:
            self.assertNotIn("L04C", self.html(f"freins/{slug}/"), slug)

    def test_pistons_collants(self):
        # 2.6 suit l'entretien des pistons du DM-GADBR01 : entonnoir monté sur la manette avant de repousser les pistons,
        # sinon la membrane peut s'abîmer, puis plaquettes et cale rouge posées avant d'actionner le levier.
        source = self.atelier_source("controles").section
        page = un(self.arbre("freins/controles/"), "main.page")
        for racine in (source, page):
            blocs = dom.selectionner(racine, "div.q") + dom.selectionner(racine, "details.q")
            (bloc,) = [q for q in blocs if q.texte().startswith("Pistons collants")]
            texte = bloc.texte()
            for attendu in ("entonnoir", "cale"):
                self.assertIn(attendu, texte)
            ordre = ["Dépose la roue", "Monte l'entonnoir", "Nettoie", "Repousse", "Retire l'entonnoir", "cale rouge",
                     "Actionne le levier", "Retire la cale", "remonte la roue"]
            places = [texte.find(t) for t in ordre]
            self.assertNotIn(-1, places, dict(zip(ordre, places)))
            self.assertEqual(places, sorted(places), dict(zip(ordre, places)))
            hrefs = [a.get("href") for a in dom.selectionner(bloc, "a")]
            self.assertIn("https://si.shimano.com/fr/dm/GADBR01/adjust_pistons_when_not_operating", hrefs)

    def test_rt_mt800_sous_reserve(self):
        # Le disque du vélo est RT-MT800 ou RT-CL800, à lire sur la pièce. Sur 2.2 et 2.6, titres des planches et
        # descriptions des pièces 3D compris, « RT-MT800 » n'apparaît que dans cette réserve, ou pour dire ce que
        # dessine la vue éclatée EV-BR-RX820-5000C et ce que serre le DM-TORQUE-03.
        documents = ("RT-MT800 ou RT-CL800", "il dessine le RT-MT800", "DM-TORQUE-03 donne deux options pour le RT-MT800")
        for chemin in ("freins/disques/", "freins/controles/"):
            page = un(self.arbre(chemin), "main.page")
            textes = [e.texte() for s in ("p", "li", "div.q", "figcaption", "title", "text") for e in dom.selectionner(page, s)]
            textes += [e.get("aria-label") for e in dom.selectionner(page, "[aria-label]")]
            phrases = [ph for t in textes for ph in re.split(r"(?<=[.!?])\s+", t) if "RT-MT800" in ph]
            for phrase in phrases:
                with self.subTest(chemin=chemin, phrase=phrase[:80]):
                    self.assertTrue(any(d in phrase for d in documents), phrase)
        titre = un(self.arbre("freins/disques/"), '[id="freins-pl-1-t"]').texte()
        self.assertIn("disque Deore XT MT800", titre)

    def test_plaquettes_pieces_d_usure(self):
        # La liste des composants ne nomme pas les plaquettes, mais l'onglet des pièces d'usure de la fiche anglaise
        # propose des L05A-RF : plus de « Canyon ne nomme pas les plaquettes », et la réserve reste.
        systeme = self.atelier_source("systeme").section
        (para,) = [p for p in dom.selectionner(systeme, "p") if "Shimano L05A-RF Organic Brake Pads" in p.texte()]
        self.assertIn("La liste des composants de Canyon ne nomme pas les plaquettes", para.texte())
        self.assertEqual([s.texte() for s in dom.selectionner(para, "span.verif")], ["à lire sur la pièce"])
        self.assertIn("https://www.canyon.com/en-ch/gravel-bikes/adventure/grizl/cf/grizl-cf-8-di2/4556.html",
                      [a.get("href") for a in dom.selectionner(para, "a")])
        for slug in SLUGS:
            self.assertNotRegex(self.html(f"freins/{slug}/"), r"(?<!composants de )Canyon ne nomme pas les plaquettes", slug)

    def test_bague_40_nm_sans_dt_swiss(self):
        # 40 Nm : DM-TORQUE-03 et la vue éclatée EV-BR-RX820-5000C. Le manuel DT Swiss parle d'une autre pièce.
        for chemin in ("freins/systeme/", "freins/", "couples/"):
            with self.subTest(chemin):
                (tableau,) = dom.selectionner(self.arbre(chemin), '[data-resume="couples"]')
                lignes = [dom.selectionner(tr, "td") for tr in dom.selectionner(tableau, "tbody > tr")]
                (ligne,) = [tds for tds in lignes if tds[0].texte().startswith("Bague Center Lock")]
                self.assertEqual(ligne[1].texte().replace("\xa0", " "), "40 Nm")
                self.assertEqual([a.texte() for a in dom.selectionner(ligne[2], "a")],
                                 ["Shimano DM-TORQUE", "Shimano EV-BR-RX820"])
        for slug in SLUGS:
            self.assertNotIn("MAN_WXWXXXXXX1610S", self.html(f"freins/{slug}/"), slug)
        (etape,) = [li for li in dom.selectionner(self.atelier_source("disques").section, "ol.steps > li")
                    if li.texte().startswith("Serre la bague à 40")]
        self.assertEqual([a.texte() for a in dom.selectionner(etape, "a")][:2], ["Shimano DM-TORQUE", "Shimano EV-BR-RX820"])

    def test_valeurs_des_gestes(self):
        # Les couples et les clés des gestes de 2.2, 2.3 et 2.7, d'après le DM-TORQUE-03, le DM-GADBR01-11 et le
        # DM-GADBR10 relus, et les renvois entre ateliers.
        def etape(slug, debut):
            textes = [li.texte().replace("\xa0", " ")
                      for li in dom.selectionner(self.atelier_source(slug).section, "ol.steps > li")]
            (texte,) = [t for t in textes if t.startswith(debut)]
            return texte
        attendus = [
            ("disques", "Serre la bague à 40 Nm", ("40 Nm",)),
            ("plaquettes", "Sors les anciennes plaquettes", ("pied d'atelier", "parallèle au sol")),
            ("plaquettes", "Monte l'entonnoir sur la manette", ("clé Allen de 2,5 mm", "parallèle au sol",
                                                                "par exemple l'angle du cintre")),
            ("plaquettes", "Nettoie et repousse les pistons", ("alcool isopropylique", "nettoyants pour freins")),
            ("plaquettes", "Retire l'entonnoir et referme la manette",
             ("0,5-0,7 Nm", "clé Allen de 2,5 mm", "assez plein pour que l'huile déborde")),
            ("plaquettes", "Monte l'ensemble et serre l'axe", ("1-1,5 Nm", "clé Allen de 3 mm")),
            ("plaquettes", "Remonte la roue", ("guide Canyon",)),
            ("purge", "Monte l'entonnoir", ("clé Allen de 2,5 mm",)),
            ("purge", "Injecte l'huile par l'étrier", ("demi-tour", "clé Allen de 3 mm")),
            ("purge", "Serre la vis de purge de l'étrier", ("4-6 Nm", "clé Allen de 3 mm")),
            ("purge", "Referme la manette", ("0,5-0,7 Nm", "clé Allen de 2,5 mm")),
            ("purge", "Remonte", ("étapes 5 à 9 de 2.3",)),
        ]
        for slug, debut, valeurs in attendus:
            texte = etape(slug, debut)
            for v in valeurs:
                with self.subTest(slug=slug, etape=debut, valeur=v):
                    self.assertIn(v, texte)
        self.assertIn("Pied d'atelier PCS-10.3", self.atelier_source("plaquettes").outils)
        # 2.5 : la clé des vis d'étrier, d'après la fiche BR-RX820.
        self.assertIn("4 mm pour les vis Shimano, à confirmer sur tes vis",
                      self.atelier_source("centrage").outils[0].replace("\xa0", " "))
        self.assertIn("clé Allen de 4 mm pour les vis Shimano", etape("centrage", "Libère l'étrier"))

    def test_reserves_du_chapitre(self):
        # La première fois que le chapitre dit « tes manettes ST-RX825 », la gauche reste à lire sur la pièce ; plus de
        # renvoi vers un « chapitre 0 » ; le TL-FC36 sur E-THRU vaut pour les moyeux Shimano, pas pour tes DT Swiss 350.
        texte = " ".join(a.section.texte() for a in self.chapitres["freins"].ateliers)
        i = texte.index("tes manettes ST-RX825")
        self.assertTrue(texte[i:].startswith("tes manettes ST-RX825 (la gauche à lire sur la pièce)"), texte[i:i + 80])
        self.assertNotIn("chapitre 0", texte.lower())
        disques = self.atelier_source("disques").section.texte()
        self.assertNotIn("l'outil que tu as", disques)
        for attendu in ("moyeux Shimano", "DT Swiss 350"):
            self.assertIn(attendu, disques)

    def test_pieces_3d_cf8(self):
        # Les pièces 3D des ateliers 2.2, 2.3 et 2.7, dans le dépôt et telles que les deux cibles les servent : plus de
        # plaquettes L04C, ni de couple RX400, ni de manette à 45°, ni de repose-main « vers l'avant », ni de disque
        # SM-RT64 du CF 7. Elles montrent le disque XT et ses deux bagues possibles, l'étrier BR-RX820 et ses L05A-RF,
        # et la purge du DM-GADBR10, avec les couples du chapitre.
        # Vague finale : le RT-CL800 possible sur la pastille du disque, l'entonnoir sur la manette avant de repousser
        # les pistons, le demi-tour puis le serrage de la vis de purge, le « par exemple » de l'angle du cintre.
        attendus = {"m-rotor.js": ("Deore XT MT800", "TL-LR15", "40\xa0Nm",
                                   "Disque Deore XT MT800 (ou RT-CL800), 160\xa0mm\xa0: modèle à lire sur la pièce"),
                    "m-caliper.js": ("BR-RX820", "L05A-RF", "1-1,5\xa0Nm", "6-8\xa0Nm", "5-7\xa0Nm",
                                     "Pistons en résine du BR-RX820\xa0: entonnoir monté sur la manette"),
                    "m-bleed.js": ("DM-GADBR10", "par l’arrière", "Entonnoir à 20°", "0,5-0,7\xa0Nm", "4-6\xa0Nm",
                                   "environ 10 fois", "desserre d’un demi-tour, puis 4-6\xa0Nm au serrage",
                                   "change par exemple l’angle du cintre")}
        for nom, presents in attendus.items():
            textes = {"src": (RACINE / "src" / "js" / "models" / nom).read_text(encoding="utf-8")}
            for cible in ("site", "artifact"):
                textes[cible] = (self.dossier / cible / "js" / nom).read_text(encoding="utf-8")
            for ou, texte in textes.items():
                for absent in ("L04C", "RX400", "45°", "45 °", "45\xa0°", "vers l'avant", "vers l’avant", "SM-RT64",
                               "Canyon ne nomme", "acier 1,8", "ailettes de refroidissement noires"):
                    self.assertNotIn(absent, texte, f"{ou} {nom} : {absent}")
                for present in presents:
                    self.assertIn(present, texte, f"{ou} {nom} : {present}")
        # La pastille des 20° vient en fin de liste, et la visionneuse oublie la pastille choisie quand la liste change :
        # aucun numéro ne passe à une autre pièce. Plus de matière « ceramic » inutilisée.
        bleed = (RACINE / "src" / "js" / "models" / "m-bleed.js").read_text(encoding="utf-8")
        self.assertRegex(bleed, r"function pinsFor\(\) \{ return pinCommon\.concat\(\[pinBoss, mode === 'inj' \? pinSyr : pinBag, "
                                r"pinTap\], tiltT \? \[pinTilt\] : \[\]\); \}")
        viewer = (RACINE / "src" / "js" / "viewer.js").read_text(encoding="utf-8")
        set_pins = viewer[viewer.index("Viewer.prototype.setPins"):viewer.index("Viewer.prototype.renderPins")]
        self.assertIn("this.sel = -1;", set_pins)
        self.assertNotIn("ceramic", viewer)

    def test_pieces_3d_montage(self):
        # Les pièces 3D des ateliers 1.3 et 1.5, dans le dépôt (la tâche 5 y ajoutera les copies servies) : la potence
        # ST0046, son capot serré par les deux vis du haut d'abord, sans jour en haut, puis par celles du bas, le cintre
        # HB0067 et les cocottes ST-RX825, avec les couples du chapitre ; l'axe avant de 12 x 100 serré à 10-15 Nm à la
        # clé de 6 mm, son type à lire sur la pièce. Aucune pièce du CF 7, aucun ordre de serrage croisé. L'en-tête de
        # chaque fichier dit ce qui est approché.
        attendus = {"m-cockpit.js": ("ST0046", "HB0067", "ST-RX825", "6\xa0Nm", "2\xa0Nm", "haut", "sans jour"),
                    "m-axle.js": ("12 x 100", "10-15\xa0Nm", "6\xa0mm", "à lire sur la pièce")}
        absents = ("CF 7", "CF\xa07", "GRX 610", "RX610", "RX820 mécanique", "en croix",
                   "DT Swiss 350 Center Lock disque SM-RT64")
        for nom, presents in attendus.items():
            texte = (RACINE / "src" / "js" / "models" / nom).read_text(encoding="utf-8")
            # assertTrue plutôt qu'assertIn : un échec nomme la valeur sans recopier tout le fichier.
            for present in presents:
                self.assertTrue(present in texte, f"{nom} : {present!r} absent")
            for absent in absents:
                self.assertFalse(absent in texte, f"{nom} : {absent!r} présent")
            self.assertIsNone(re.search("[\u2014\u2013]", texte), f"{nom} : tiret cadratin ou demi-cadratin")
            entete = texte[:texte.index("*/")]
            self.assertIn("approchée", entete, f"{nom} : en-tête sans forme approchée")

    def test_approche_et_sources(self):
        for chemin, ident in (("approche/", "approche-page"), ("sources/", "sources-page")):
            racine = self.arbre(chemin)
            self.assertEqual(len(dom.selectionner(racine, f'div[id="{ident}"]')), 1, chemin)
            self.assertEqual(len(dom.selectionner(racine, "h1")), 1, chemin)
        lien = [a for a in dom.selectionner(self.arbre("sources/"), "a") if a.get("href") == "../freins/securite/"]
        self.assertEqual([a.texte() for a in lien], ["2.8 Sécurité et manuels"])

    def test_sources_suit_l_atelier(self):
        # Le libellé du renvoi vient de l'atelier freins-securite : il suit son numéro et son titre, et disparaît
        # quand l'atelier n'est pas publié.
        chapitre = self.chapitres["freins"]
        renomme = dataclasses.replace(chapitre, ateliers=[
            dataclasses.replace(a, titre="Un autre titre") if a.id == "freins-securite" else a for a in chapitre.ateliers])
        contenu = pages.page_sources({"freins": renomme}).contenu
        self.assertIn('<a href="../freins/securite/">2.8 Un autre titre</a>', contenu)
        self.assertNotIn("Sécurité et manuels", contenu)
        sans = pages.page_sources({}).contenu
        self.assertNotIn("<a ", sans)
        self.assertNotIn("2.8", sans)
        self.assertIn('id="sources-page"', sans)

    def test_un_h1_par_page(self):
        for cible in ("site", "artifact"):
            for chemin in CHEMINS:
                self.assertEqual(len(dom.selectionner(self.arbre(chemin, cible), "h1")), 1, f"{cible} {chemin}")

    def test_page_d_accueil(self):
        # Mon vélo : l'en-tête, la scène et « Où intervenir » côte à côte, puis les pièces à remplacer, l'introduction
        # et toutes les catégories. Ni rangée de puces ni fiche : les zones mènent aux pages des ateliers.
        page = un(self.arbre(""), "main.page")
        blocs = elements(page)
        self.assertEqual([(e.tag, e.classes()) for e in blocs],
                         [("header", ["page-h"]), ("section", ["accueil-grille"]), ("section", ["accueil-bloc"]),
                          ("div", ["intro"]), ("section", ["accueil-bloc"])])
        self.assertEqual(un(blocs[0], "p.eyebrow").texte(), "Canyon Grizl CF 8 Di2 · taille M · Floating Violet")
        self.assertEqual(un(blocs[0], "h1").texte(), "Ton Grizl CF 8 Di2, tel qu’il sort du carton")
        # Sans « à droite » : sous 1100 px, « Où intervenir » est sous la scène.
        self.assertEqual(un(blocs[0], "p.lead").texte(), "Fais tourner le vélo, touche une pastille, ou choisis une "
                         "zone pour ouvrir ses ateliers.")
        grille = blocs[1]
        self.assertEqual([(e.tag, e.get("id") or e.classes()) for e in elements(grille)],
                         [("figure", "scene"), ("section", ["ou-intervenir"]), ("dialog", "approche-liste")])
        self.assertEqual(len(dom.selectionner(grille, "section.ou-intervenir > div.zone-carte")), len(ZONES))
        # Les boutons de la variante sont dans l'image de la scène.
        variante = un(page, '[id="variante"]')
        self.assertIn(variante, dom.selectionner(un(page, '[id="scene-stage"]'), "div.swap"))
        self.assertEqual((variante.tag, variante.classes(), variante.get("role")), ("div", ["swap"], "group"))
        for absent in ('[id="chips"]', '[id="fiche"]', "section.atelier", "article.atelier"):
            self.assertEqual(dom.selectionner(page, absent), [], absent)
        self.assertEqual([un(b, "h2").texte() for b in (elements(grille)[1], blocs[2], blocs[4])],
                         ["Où intervenir", "D’origine, puis à monter", "Toutes les catégories"])
        self.assertEqual(len(dom.selectionner(blocs[2], "ul.a-remplacer > li")), 1)
        self.assertEqual(len(dom.selectionner(blocs[4], "div.cats > a.cat")), 1 + len(A_VENIR))
        # L'introduction garde son texte : les caractéristiques, le jour de la livraison et la règle des sources.
        intro = blocs[3]
        specs = {un(d, "dt").texte(): un(d, "dd").texte() for d in dom.selectionner(intro, "dl.specs > div")}
        self.assertEqual(list(specs), ["Transmission", "Freins", "Roues et pneus", "Poste de pilotage",
                                       "Limites Canyon", "Prévu dès la livraison"])
        # Les limites que le relevé du CF 8 Di2 soutient : les 120 kg de la fiche Canyon. Ni charge du porte-bagages ni
        # limite de disque : Canyon n'en publie pas pour ce vélo.
        self.assertEqual(specs["Limites Canyon"], "120 kg au total (toi, le vélo et les bagages)")
        self.assertEqual(specs["Prévu dès la livraison"], "Pédales PD-ME700 et cales SPD, tubeless")
        for attendu in ("Di2", "RD-M8250-GS", "9-45", "40 dents"):
            self.assertIn(attendu, specs["Transmission"])
        for attendu in ("Deore XT MT800", "160 mm"):
            self.assertIn(attendu, specs["Freins"])
        # Ce que le relevé laisse à lire sur la pièce l'est aussi dans le résumé, comme en 2.1 et sur Composants : la
        # manette gauche (ST-RX825-L ou BL-RX825-L), les étriers et les plaquettes d'origine.
        self.assertIn("manette droite GRX ST-RX825, manette gauche à lire sur la pièce (ST-RX825-L ou BL-RX825-L)",
                      specs["Transmission"])
        self.assertNotIn("manettes", specs["Transmission"])
        self.assertIn("étriers à lire sur la pièce (BR-RX820 attendu)", specs["Freins"])
        self.assertIn("plaquettes d'origine à lire sur la pièce (L05A-RF en résine attendues)", specs["Freins"])
        verif = {un(d, "dt").texte(): [s.texte() for s in dom.selectionner(d, "span.verif")]
                 for d in dom.selectionner(intro, "dl.specs > div")}
        self.assertEqual(verif["Transmission"], ["à lire sur la pièce"])
        self.assertEqual(verif["Freins"], ["à lire sur la pièce"] * 2)
        for attendu in ("GR 30 CF", "27 mm", "G-One RX", "45 mm"):
            self.assertIn(attendu, specs["Roues et pneus"])
        self.assertIn("SP100 VCLS 2.1", specs["Poste de pilotage"])
        # Le jour de la livraison : les disques XT et les plaquettes sont d'origine, on n'y touche plus.
        # Chaque point garde son renvoi ; celui de la position, vers un id qui n'est encore sur aucune page, reste gris.
        plan = [(un(li, "b").texte(), elements(li)[-1].texte(), elements(li)[-1].get("href"))
                for li in dom.selectionner(intro, "ol.plan > li")]
        self.assertEqual(plan, [("Monter le vélo", "Chapitre 1", "montage/"),
                                ("Passer en tubeless", "Chapitre 3", "tubeless/"),
                                ("Reporter ta position", "Chapitre 1", None),
                                ("Roder les freins et rouler", "Chapitre 2", "freins/rodage/")])
        self.assertEqual(un(intro, "aside.note.info > p.note-t").texte(), "Règle des sources")

    def test_accueil_sans_javascript(self):
        # Sans JavaScript, ni onglets de rendu ni boutons ni aide dans la scène, et une phrase à la place de
        # « Montage du vélo en 3D… ». Par <noscript>, pas par html:not(.js), qui vaut aussi quand seul site.js manque.
        for cible in ("site", "artifact"):
            html = self.html("", cible)
            style = re.search(r"<noscript><style>(.*?)</style></noscript>", html, re.S)
            self.assertIsNotNone(style, cible)
            self.assertLess(style.start(), html.index('<div class="app"'), cible)
            regles = re.sub(r"/\*.*?\*/", "", style.group(1), flags=re.S).strip()
            selecteurs, _, declaration = regles.partition("{")
            self.assertEqual(set(selecteurs.split(",")),
                             {"#scene .modes", "#scene-aide", "#scene-statut", "#approche", "#vue-ensemble"}, cible)
            self.assertEqual(declaration, "display:none}", cible)
            scene = un(self.arbre("", cible), '[id="scene-stage"]')
            phrase = un(un(scene, "noscript"), "div.status")
            self.assertEqual(phrase.texte(), "Le vélo en 3D a besoin de JavaScript.", cible)
            self.assertEqual(un(scene, '[id="scene-statut"]').texte(), "Montage du vélo en 3D…", cible)

    def test_page_composants(self):
        racine = self.arbre("composants/")
        self.assertEqual(un(racine, "nav.crumbs").texte(), "Références/Composants d'origine")
        self.assertIn(COMPOSANTS.strip(), self.html("composants/"))

    def test_plus_de_cf7(self):
        # Le site ne parle plus que du Grizl CF 8 Di2. Aucun fichier servi par les deux cibles, hors de three.js, ne
        # garde le CF 7, sa fiche ou ses pièces : ni les 20 pages, ni l'index de la recherche, ni les pièces 3D des
        # ateliers, ni les modules de la scène. Le menu, la description de chaque page et l'accueil nomment le CF 8 Di2.
        # « CF 7 » est cherché sans casse, avec ou sans espace (même insécable), tiret ou soulignement : « cf 7 »,
        # « CF7 », « grizl-cf-7 ». Les autres noms aussi, sans casse. Une couleur comme « #cf7a3b » n'est pas une trace.
        self.maxDiff = None
        absents = re.compile(r"(?<![0-9a-z#])CF[\s_-]*7(?![0-9])|" + "|".join(re.escape(a) for a in (
            "4553", "SM-RT64", "RX822", "RX610", "M7100", "Continental", "Terra Adventure", "Selle Royal")), re.I)
        for exemple in ("CF 7", "cf\u00a07", "CF7", "grizl-cf-7", "selle royal", "CONTINENTAL"):
            self.assertTrue(absents.search(exemple.replace("\u00a0", " ")), exemple)
        for permis in ("CF 8 Di2", "CF 70", "grizl-cf-8-di2", "#cf7a3b", "0xcf7a3b"):
            self.assertIsNone(absents.search(permis), permis)
        for cible in ("site", "artifact"):
            rendues, fichiers = self.sorties[cible]
            servis = sorted(f for f in fichiers if not f.startswith("vendor/"))
            for attendu in ["js/recherche.js", "js/m-rotor.js", "js/m-caliper.js", "js/m-bleed.js",
                            "js/scene/sources.js"] + [f"{c}index.html" for c in CHEMINS]:
                self.assertIn(attendu, servis, cible)
            traces = []
            for nom in servis:
                texte = (self.dossier / cible / nom).read_text(encoding="utf-8")
                texte = texte.replace("\u00a0", " ").replace("\u202f", " ")
                traces += sorted({f"{nom} : {m.group()}" for m in absents.finditer(texte)})
            self.assertEqual(traces, [], cible)
            for chemin, html in rendues.items():
                marque = '<div class="label">Grizl CF 8 Di2 · M · Floating Violet</div>'
                self.assertIn(marque, html, f"{cible} {chemin}")
                self.assertIn('<meta name="description" content="Guide d\'atelier pour monter, régler et réparer '
                              'soi-même le Canyon Grizl CF 8 Di2.">', html, f"{cible} {chemin}")
            self.assertIn("Grizl CF 8 Di2", un(dom.analyser(rendues[""]), "main.page").texte(), cible)

    def test_composants_cf8(self):
        # Le contenu de la page (main.page) décrit le Grizl CF 8 Di2 et ne garde rien du CF 7. Le menu et l'en-tête
        # du site changent à part, avec les autres textes du site.
        for cible in ("site", "artifact"):
            html = self.html("composants/", cible)
            contenu = html[html.index('<main class="page"'):html.index("</main>")]
            for attendu in ("Grizl CF 8 Di2", "RD-M8250-GS", "ST-RX825", "CS-M8200-12", "9-45", "GR 30 CF", "G-One RX",
                            "Argo Terra X5", "SP100 VCLS 2.1", "PF 86,5", "690", "531"):
                self.assertIn(attendu, contenu, f"{cible} : {attendu}")
            for absent in ("CF 7", "RX822", "SM-RT64"):
                self.assertNotIn(absent, contenu, f"{cible} : {absent}")
            geometrie = un(un(dom.analyser(contenu), '[id="composants-geometrie"]'), "tbody")
            lignes = {tds[0].texte(): tds[2].texte() for tds in
                      (dom.selectionner(tr, "td") for tr in dom.selectionner(geometrie, "tr"))}
            self.assertEqual((lignes["o"], lignes["p"]), ("690 mm", "531 mm"), cible)
            self.assertIn('href="https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-8-di2/4556.html'
                          '?dwvar_4556_pv_rahmenfarbe=R126_P06"', contenu, cible)


class TestRecherche(Site):
    def test_recherche(self):
        index = pages.index_recherche(CONFIG, self.chapitres)
        for entree in index:
            self.assertEqual(sorted(entree), ["k", "t", "u"], entree)
        self.assertIn({"k": "Atelier 2.3", "t": "Changer les plaquettes", "u": "freins/plaquettes/"}, index)
        self.assertIn({"k": "Outil · 2.2", "t": "Outil Center Lock selon ta bague\u00a0: TL-FC36 (denture extérieure)", "u": "freins/disques/"},
                      index)
        self.assertIn({"k": "Étape · 2.3", "t": "Sors les anciennes plaquettes", "u": "freins/plaquettes/"}, index)
        self.assertIn({"k": "Catégorie", "t": "Freins", "u": "freins/"}, index)
        self.assertIn({"k": "Lot 4 · à venir", "t": "Transmission", "u": "transmission/"}, index)
        pieces = [e for e in index if e["k"] == "Pièce d’origine"]
        self.assertTrue(any("RD-M8250" in e["t"] for e in pieces))
        self.assertTrue(all(e["u"].startswith("composants/") for e in pieces))
        # Une entrée par ligne des tableaux de composants.html, et une par accessoire livré.
        fiche = dom.analyser(COMPOSANTS)
        lignes = len(dom.selectionner(fiche, "tbody > tr")) + len(dom.selectionner(fiche, "ul.accessoires > li"))
        self.assertEqual(len(pieces), lignes)
        self.assertEqual(len([e for e in index if e["k"].startswith("Étape · ")]), 45)
        # Les ateliers passent en premier, avant les étapes et les outils.
        genres = [e["k"].split(" ")[0] for e in index]
        self.assertLess(genres.index("Atelier"), genres.index("Étape"))

    def test_adresses_de_la_recherche(self):
        for entree in pages.index_recherche(CONFIG, self.chapitres):
            chemin, _, ancre = entree["u"].partition("#")
            self.assertIn(chemin, CHEMINS, entree)
            if ancre:
                self.assertIn(f'id="{ancre}"', self.html(chemin), entree)

    def test_recherche_js(self):
        for cible in ("site", "artifact"):
            texte = (self.dossier / cible / "js" / "recherche.js").read_text(encoding="utf-8")
            self.assertTrue(texte.startswith("window.RECHERCHE = ["), texte[:40])
            self.assertTrue(texte.rstrip().endswith("];"))
            donnees = json.loads(texte.strip().removeprefix("window.RECHERCHE = ").removesuffix(";"))
            self.assertEqual(donnees, pages.index_recherche(CONFIG, self.chapitres))


class TestAccueil(unittest.TestCase):
    """Les trois blocs que la page d'accueil reçoit à la place des marques de 05-top."""

    @classmethod
    def setUpClass(cls):
        cls.chapitres = pages.chapitres_publies(CONFIG)

    def test_ou_intervenir(self):
        racine = dom.analyser(pages.cartes_des_zones(self.chapitres, ZONES))
        cartes = dom.selectionner(racine, "div.zone-carte")
        self.assertEqual([c.get("data-zone") for c in cartes], ["disques", "etrier", "manettes"])
        attendu = {"disques": ["2.2", "2.4"], "etrier": ["2.3", "2.5", "2.6"], "manettes": ["2.1", "2.7", "2.8"]}
        for n, (carte, zone) in enumerate(zip(cartes, ZONES), 1):
            self.assertEqual(un(carte, "span.zone-n").texte(), str(n))
            bouton = un(carte, "button.zone-btn")
            self.assertEqual((bouton.get("data-zone"), bouton.get("type"), bouton.texte()), (zone["id"], "button", zone["nom"]))
            liens = dom.selectionner(carte, "a")
            self.assertEqual([un(a, "span.num").texte() for a in liens], attendu[zone["id"]])
            for a in liens:
                self.assertRegex(a.get("href"), r"^freins/[a-z]+/$")
        disques = dom.selectionner(cartes[0], "a")[0]
        self.assertEqual(disques.get("href"), "freins/disques/")
        self.assertEqual([s.texte() for s in elements(disques)], ["2.2", "Déposer et reposer un disque", "Entretenir"])

    def test_a_remplacer(self):
        racine = dom.analyser(pages.pieces_a_remplacer(self.chapitres))
        lignes = dom.selectionner(racine, "ul.a-remplacer > li")
        # 2.2 dépose et repose le disque d'origine : seule la pièce de 2.3 se remplace.
        self.assertEqual(len(lignes), 1)
        self.assertEqual(un(lignes[0], ".vers").texte(), "Shimano L05A-RF neuves")
        self.assertEqual(un(lignes[0], ".de").texte(), "à la place de : Plaquettes d’origine, L05A-RF attendues")
        self.assertEqual(un(lignes[0], "a").get("href"), "freins/plaquettes/")

    def test_categories(self):
        racine = dom.analyser(pages.cartes_des_categories(CONFIG, self.chapitres))
        cartes = dom.selectionner(racine, "a.cat")
        self.assertEqual([c.get("href") for c in cartes], ["freins/"] + [f"{c}/" for c in A_VENIR])
        self.assertEqual([c.classes() for c in cartes], [["cat"]] + [["cat", "soon"]] * 5)
        self.assertEqual(un(cartes[0], "span.label").texte(), "Lot 1 · en relecture")
        self.assertEqual(un(cartes[0], "h3").texte(), "Freins")
        self.assertEqual(un(cartes[0], "p").texte(), "8 ateliers")
        self.assertEqual(un(cartes[3], "span.label").texte(), "Lot 4 · à venir")
        self.assertEqual(un(cartes[3], "p").texte(), CONFIG["lots"][4]["prevu"][0])

    def test_marques_remplacees(self):
        modele = "<p>avant</p>\n<!--OU-INTERVENIR-->\n<!--A-REMPLACER-->\n<!--CATEGORIES-->\n<p>après</p>"
        with mock.patch.object(pages, "lire", return_value=modele):
            page = pages.page_accueil(CONFIG, self.chapitres, ZONES)
        for marque in pages.MARQUES:
            self.assertNotIn(marque, page.contenu)
        self.assertIn(pages.cartes_des_zones(self.chapitres, ZONES), page.contenu)
        self.assertIn(pages.pieces_a_remplacer(self.chapitres), page.contenu)
        self.assertIn(pages.cartes_des_categories(CONFIG, self.chapitres), page.contenu)
        self.assertTrue(page.contenu.startswith("<p>avant</p>") and page.contenu.endswith("<p>après</p>"))

    def test_marques_de_05_top(self):
        # 05-top porte chaque marque une fois ; la page d'accueil n'en garde aucune.
        source = gabarit.lire("05-top")
        for marque in pages.MARQUES:
            self.assertEqual(source.count(marque), 1, marque)
        page = pages.page_accueil(CONFIG, self.chapitres, ZONES)
        for marque in pages.MARQUES:
            self.assertNotIn(marque, page.contenu)
        for bloc in (pages.cartes_des_zones(self.chapitres, ZONES), pages.pieces_a_remplacer(self.chapitres),
                     pages.cartes_des_categories(CONFIG, self.chapitres)):
            self.assertIn(bloc, page.contenu)
        self.assertEqual((page.chemin, page.titre, page.fil), ("", "Atelier Grizl", [("Mon vélo", None)]))
        self.assertEqual(page.scripts, dict(zones=True, liens=True, three=True, app=True, garde_fou=True))


class TestComposants(unittest.TestCase):
    """composants.html recopie la fiche relevée dans docs/recherche/composants-origine.md, sans ses identifiants
    internes de sources."""

    @staticmethod
    def nettoyer(ligne):
        ligne = re.sub(r" \(`[^`]+`\)", "", ligne)  # « (`canyon-4556`) »
        ligne = re.sub(r"\(`[^`]+`, ", "(", ligne)  # « (`shimano-c-461`, relevé le ...) »
        ligne = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", ligne)
        return ligne.replace("**", "").replace("`", "").strip()

    @classmethod
    def setUpClass(cls):
        cls.racine = dom.analyser(COMPOSANTS)

    def tableaux_md(self):
        tableaux, courant = [], None
        for ligne in MD.splitlines():
            if ligne.startswith("|"):
                cellules = [self.nettoyer(c) for c in ligne.strip().strip("|").split("|")]
                if courant is None:
                    courant = {"tete": cellules, "lignes": []}
                    tableaux.append(courant)
                elif not set("".join(cellules)) <= set("-: "):
                    courant["lignes"].append(cellules)
            else:
                courant = None
        return tableaux

    def test_tableaux(self):
        md = self.tableaux_md()
        html = dom.selectionner(self.racine, "table")
        self.assertEqual(len(html), len(md), "nombre de tableaux")
        self.assertEqual(len(md), 6)
        for t_md, t_html in zip(md, html):
            with self.subTest(t_md["tete"][0]):
                self.assertEqual([th.texte() for th in dom.selectionner(t_html, "th")], t_md["tete"])
                lignes = [[td.texte() for td in dom.selectionner(tr, "td")] for tr in dom.selectionner(t_html, "tr")[1:]]
                self.assertEqual(lignes, t_md["lignes"])
                for tr in dom.selectionner(t_html, "tr")[1:]:
                    self.assertEqual([td.get("data-label") for td in dom.selectionner(tr, "td")], t_md["tete"])

    def test_titres(self):
        titres = [self.nettoyer(l[3:]) for l in MD.splitlines() if l.startswith("## ")]
        self.assertEqual([h.texte() for h in dom.selectionner(self.racine, "h2")], titres)
        self.assertEqual(titres, ["Cadre", "Transmission", "Freins", "Roues et pneus", "Poste de pilotage et selle",
                                  "Accessoires livrés", "Géométrie de la taille M", "Contradictions et compléments relevés",
                                  "À lire sur le vélo à la livraison"])
        self.assertEqual(un(self.racine, "h1").texte(), MD.splitlines()[0][2:])

    def test_textes(self):
        # Chaque paragraphe et chaque puce de la fiche, nettoyés du Markdown, sont dans la page. Seule la phrase qui
        # annonce les identifiants internes (retirés) n'y est pas.
        annonce = (" Les documents suivis d'un identifiant entre parenthèses sont enregistrés dans `src/scene/sources.js`,"
                   " sous cet identifiant.")
        texte = self.racine.texte()
        puces = [li.texte() for li in dom.selectionner(self.racine, "li")]
        for ligne in MD.replace(annonce, "").splitlines():
            if not ligne.strip() or ligne.startswith(("#", "|", "Source : ", "Photo officielle du coloris : ")):
                continue
            with self.subTest(ligne[:50]):
                if ligne.startswith("- "):
                    self.assertIn(self.nettoyer(ligne[2:]), puces)
                else:
                    self.assertIn(self.nettoyer(ligne), texte)
        self.assertNotIn("sources.js", COMPOSANTS)
        self.assertIn("« Hauteur de la jantee en mm 30 »", texte)

    def test_liens(self):
        adresses = re.findall(r"\]\((https://[^)]+)\)", MD) + re.findall(r"^(?:Source|Photo officielle du coloris) : (\S+)$", MD, re.M)
        hrefs = [a.get("href") for a in dom.selectionner(self.racine, "a")]
        self.assertEqual(set(hrefs), set(adresses))
        self.assertIn("https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-8-di2/4556.html"
                      "?dwvar_4556_pv_rahmenfarbe=R126_P06", hrefs)
        for a in dom.selectionner(self.racine, "a"):
            self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), a.get("href"))

    def test_sans_identifiant_interne(self):
        # Les identifiants ne sont pas dans le texte (certaines adresses de Canyon contiennent le même mot).
        texte = self.racine.texte()
        idents = re.findall(r"`([a-z0-9]+(?:-[a-z0-9]+)+)`", MD)
        self.assertEqual(len(set(idents)), 19)
        for ident in idents:
            self.assertNotIn(ident, texte)
        self.assertNotIn("(`", COMPOSANTS)
        self.assertNotIn("()", texte)

    def test_a_lire_sur_la_piece(self):
        # L'étrier, la variante de la manette gauche et le modèle des disques sont à lire sur le vélo : chacun a son
        # paragraphe sous le tableau des freins, marqué par span.verif.
        freins = un(self.racine, '[id="composants-freins"]')
        for indice in ("BR-RX820", "BL-RX825-L", "RT-CL800"):
            with self.subTest(indice):
                paragraphe = [p for p in dom.selectionner(freins, "p") if indice in p.texte()]
                self.assertEqual(len(paragraphe), 1)
                marques = [s.texte() for s in dom.selectionner(paragraphe[0], "span.verif")]
                self.assertEqual(marques, ["à lire sur la pièce"])

    def test_pieces_d_usure(self):
        # Relu le 24 octobre 2026 : l'onglet « Wear parts » de la fiche anglaise propose des plaquettes L05A-RF, la chaîne
        # CN-M8100 de 138 maillons, son attache SM-CN910 et le boîtier SM-BB72-41B. Les noms sont recopiés tels quels, sans
        # les prix, dans la fiche et dans le relevé des sources. La réserve « à lire sur la pièce » reste, et l'écart
        # avec l'ancienne formulation est noté dans les contradictions, comme celui des valves.
        noms = ["Pirelli Cinturato Gravel H 45-622 Tubeless Tyre", "Shimano GRX RX820 1x 12-Speed Chainring",
                "Shimano Ultegra RT-CL800 Brake Rotor", "Pirelli Cinturato SmarTUBE 33/45-622 60mm TPU Tube",
                "Shimano SM-CN910 12-speed Quick-Link Chain Connector",
                "Shimano L05A-RF Organic Brake Pads for Deore XT, SLX, GRX, Ultegra & 105", "Shimano EC-DN100 Di2 Charger",
                "Shimano XT M8200 12-speed Cassette", "Shimano Di2 BT-DN320 Battery", "Shimano CN-M8100 12-speed Chain 138 Links",
                "Shimano SM-BB72-41B II Press-Fit Bottom Bracket"]
        sources = (RACINE / "docs" / "recherche" / "sources-cf8-di2.md").read_text(encoding="utf-8")
        contradictions = {li.texte().split(".")[0]: li.texte()
                          for li in dom.selectionner(un(self.racine, '[id="composants-contradictions"]'), "li")}
        for nom in noms:
            self.assertIn(nom, contradictions["Pièces d'usure"])
            self.assertIn(nom, sources)
        for texte in (MD, self.racine.texte(), sources):
            for absent in ("CHF", "supposé", "ne nomme ni les étriers ni les plaquettes", "Canyon ne les nomme pas"):
                self.assertNotIn(absent, texte)
        freins = un(self.racine, '[id="composants-freins"]')
        (plaquettes,) = [p for p in dom.selectionner(freins, "p") if p.texte().startswith("Plaquettes.")]
        self.assertIn("« Shimano L05A-RF Organic Brake Pads for Deore XT, SLX, GRX, Ultegra & 105 »", plaquettes.texte())
        self.assertEqual([s.texte() for s in dom.selectionner(plaquettes, "span.verif")], ["à lire sur la pièce"])
        ecart = contradictions["Plaquettes, chaîne et boîtier"]
        for attendu in ("23 octobre 2026", "24 octobre 2026", "CN-M8100", "SM-BB72-41B", "L05A-RF", "à lire sur la pièce"):
            self.assertIn(attendu, ecart)
        valves = contradictions["Valves tubeless"]
        for attendu in ("chat Canyon", "« Delivered with tubeless valve »"):
            self.assertIn(attendu, valves)
        a_lire = [li.texte() for li in dom.selectionner(un(self.racine, '[id="composants-a-lire"]'), "li")]
        self.assertIn("La chaîne : référence, nombre de maillons et attache QUICK-LINK. Canyon propose en pièces d'usure la "
                      "CN-M8100 de 138 maillons et l'attache SM-CN910.", a_lire)
        self.assertIn("Le boîtier : référence exacte. Canyon propose en pièce d'usure le SM-BB72-41B II.", a_lire)

    def test_statut_rt_mt800(self):
        # Contradiction n° 6 de la recherche : RT-MT800 marqué discon dans C-461 et absent de productinfo, mais fiche
        # bike.shimano.com en ligne et absent de la liste des produits abandonnés. Ses quatre documents sont liés.
        disques = [li for li in dom.selectionner(un(self.racine, '[id="composants-contradictions"]'), "li")
                   if li.texte().startswith("Disques.")]
        self.assertEqual(len(disques), 1)
        texte = disques[0].texte()
        for attendu in ("discon", "« No results »", "23 octobre 2026", "non tranché"):
            self.assertIn(attendu, texte)
        hrefs = [a.get("href") for a in dom.selectionner(disques[0], "a")]
        for adresse in ("https://productinfo.shimano.com/en/compatibility/C-461",
                        "https://productinfo.shimano.com/en/product/RT-MT800",
                        "https://bike.shimano.com/products/components/pdp.P-RT-MT800.html",
                        "https://bike.shimano.com/products/discontinued.html"):
            self.assertIn(adresse, hrefs)

    def test_jante_gr30cf(self):
        # Largeur extérieure et désignation ETRTO de la jante : publiées par la page Canyon de la paire GR 30 CF.
        roues = un(self.racine, '[id="composants-roues"]')
        for tr in dom.selectionner(roues, "tbody > tr")[:2]:
            self.assertIn("largeur externe 33 mm", tr.texte())
        self.assertIn("« External width: 33mm, ETRTO 622x27TSS »", roues.texte())
        self.assertIn("https://www.canyon.com/en-de/gear/bike-parts/tyres-and-tubes/wheels/canyon-gr-30-cf-wheelset/"
                      "10014610.html", [a.get("href") for a in dom.selectionner(roues, "a")])

    def test_regles(self):
        self.assertIsNone(re.search("[\u2014\u2013]", COMPOSANTS))
        for prive in ("claude.ai", "docs.google.com", "Lamine"):
            self.assertNotIn(prive, COMPOSANTS)

    def test_releves_du_depot(self):
        # Les deux relevés versés au dépôt : sans tiret cadratin ni demi-cadratin, sans chemin de travail local.
        sources = (RACINE / "docs" / "recherche" / "sources-cf8-di2.md").read_text(encoding="utf-8")
        for nom, texte in (("composants-origine.md", MD), ("sources-cf8-di2.md", sources)):
            with self.subTest(nom):
                self.assertIsNone(re.search("[\u2014\u2013]", texte))
                for local in ("/private/", "/tmp/", "scratchpad", "releve-composants.txt", "pdf/"):
                    self.assertNotIn(local, texte)
        self.assertTrue(sources.startswith("# Grizl CF 8 Di2 (4556, taille M, Floating Violet R126_P06)"))


class TestLiensCasses(unittest.TestCase):
    """liens_casses sur un petit site écrit à la main."""

    PAGES = {
        "": '<a href="freins/">Freins</a><a href="freins/plaquettes/#pl-2">planche</a><a href="#haut">haut</a>'
            '<p id="haut"></p><script src="js/site.js"></script><a href="https://www.shimano.com/">S</a>'
            '<a href="mailto:a@b.fr">m</a><img src="data:image/png;base64,AA">',
        "freins/": '<a href="../">Mon vélo</a><a href="plaquettes/">2.3</a><a href="./">ici</a>'
                   '<a href="plaquettes/index.html">2.3</a>',
        "freins/plaquettes/": '<figure id="pl-2"></figure><a href="../../">racine</a>'
                              '<script src="../../js/m-caliper.js"></script>'
                              '<script type="importmap">{"imports": {"three": "../../vendor/three/three.module.min.js",'
                              ' "three/addons/": "../../vendor/three/addons/", "x": "https://cdn.example/x.js"}}</script>',
    }
    FICHIERS = {"js/site.js", "js/m-caliper.js", "vendor/three/three.module.min.js",
                "vendor/three/addons/controls/OrbitControls.js"}

    def test_site_correct(self):
        self.assertEqual(assemble.liens_casses(self.PAGES, self.FICHIERS), [])

    def casse(self, chemin, ajout, fichiers=None):
        pages_ = dict(self.PAGES)
        pages_[chemin] += ajout
        return assemble.liens_casses(pages_, self.FICHIERS if fichiers is None else fichiers)

    def test_page_absente(self):
        (erreur,) = self.casse("freins/", '<a href="purge/">2.7</a>')
        self.assertIn("purge/", erreur)
        self.assertTrue(erreur.startswith("freins/ : "), erreur)

    def test_ancre_absente(self):
        self.assertEqual(len(self.casse("", '<a href="freins/plaquettes/#pl-9">x</a>')), 1)
        self.assertEqual(len(self.casse("freins/plaquettes/", '<a href="#pl-9">x</a>')), 1)
        self.assertEqual(len(self.casse("freins/plaquettes/", '<a href="#">x</a>')), 1)
        # Une ancre d'une autre page n'existe pas dans la page courante.
        self.assertEqual(len(self.casse("freins/", '<a href="#pl-2">x</a>')), 1)

    def test_fichier_absent(self):
        (erreur,) = self.casse("freins/plaquettes/", '<script src="../../js/m-rotor.js"></script>')
        self.assertIn("m-rotor.js", erreur)
        self.assertEqual(len(self.casse("", "", fichiers=self.FICHIERS - {"js/site.js"})), 1)

    def test_carte_d_imports(self):
        self.assertEqual(len(self.casse("", "", fichiers=self.FICHIERS - {"vendor/three/three.module.min.js"})), 1)
        self.assertEqual(len(self.casse("", "", fichiers={"js/site.js", "js/m-caliper.js",
                                                          "vendor/three/three.module.min.js"})), 1)

    def test_absolu_et_hors_site(self):
        self.assertEqual(len(self.casse("", '<a href="/freins/">x</a>')), 1)
        self.assertEqual(len(self.casse("", '<a href="//cdn.example/x.js">x</a>')), 1)
        self.assertEqual(len(self.casse("freins/", '<a href="../../">x</a>')), 1)

    def test_sans_barre_finale(self):
        self.assertEqual(len(self.casse("", '<a href="freins">x</a>')), 1)

    def test_scripts_ignores(self):
        # Un « src= » ou un « href= » écrit dans un script n'est pas un lien de la page.
        self.assertEqual(self.casse("", "<script>var a = '<a href=\"nulle-part/\">';</script>"), [])


class TestAncres(unittest.TestCase):
    def test_premiere_page_gagne(self):
        a = gabarit.Page(chemin="freins/plaquettes/", titre="2.3", contenu='<article id="freins-plaquettes"><figure id="pl-2"></figure></article>')
        b = gabarit.Page(chemin="freins/", titre="Freins", contenu='<div id="freins"><figure id="pl-2"></figure></div>')
        self.assertEqual(pages.ancres([a, b]), {"freins-plaquettes": "freins/plaquettes/", "pl-2": "freins/plaquettes/",
                                                "freins": "freins/"})


# Un chapitre de test comme celui du Montage : deux ateliers « comprendre » sans data-zone (1.1 et 1.2) et un atelier
# « regler » dans la zone « disques » (1.4). Les zones viennent de src/scene/zones.json.
CHAPITRE_SANS_ZONE = (
    '<section class="chapter" id="montage"><header class="ch-head"><h2>Montage à la livraison</h2></header>'
    '<section class="sub atelier" id="montage-avant" data-type="comprendre"><h3>1.1 Avant de commencer</h3>'
    '<h4>Ce qu’il faut savoir</h4><p>Lis le guide du carton.</p>'
    '<h4>Vidéo</h4><p class="a-video">Pas de vidéo.</p></section>'
    '<section class="sub atelier" id="montage-deballer" data-type="comprendre"><h3>1.2 Déballer sans rien abîmer</h3>'
    '<h4>Le carton</h4><p>Sors les pièces une à une.</p>'
    '<h4>Vidéo</h4><p class="a-video">Pas de vidéo.</p></section>'
    '<section class="sub atelier" id="montage-selle" data-zone="disques" data-type="regler"><h3>1.4 Monter la selle</h3>'
    '<div class="a-dem"><h4>À démonter avant</h4><p>Rien.</p></div>'
    '<div class="kit"><h4>Il te faut</h4><ul class="chips"><li>Clé de 4 mm</li></ul></div>'
    '<ol class="steps"><li><p class="st-t">Serre le collier</p><p>À <span class="nm">6\xa0Nm</span>.</p></li></ol>'
    '<h4>Vidéo</h4><p class="a-video">Pas de vidéo.</p></section></section>'
)


def config_sans_zone():
    """La configuration réelle, avec le lot du Montage publié : son chapitre est CHAPITRE_SANS_ZONE."""
    config = copy.deepcopy(CONFIG)
    lot = next(l for l in config["lots"] if l.get("categorie", {}).get("id") == "montage")
    lot["statut"], lot["parts"] = "en relecture", ["11-test-sans-zone"]
    return config


class TestAtelierSansZone(unittest.TestCase):
    """Un atelier « comprendre » peut n'avoir aucune zone : pas de « Zone N », pas de data-zone, pas de carte dans
    « Où intervenir ». Les pièces de page, une à une, sur le chapitre de test."""

    @classmethod
    def setUpClass(cls):
        cls.chapitre = ateliers.relever_chapitre(CHAPITRE_SANS_ZONE)

    def test_zone_absente_du_releve(self):
        self.assertEqual([a.zone for a in self.chapitre.ateliers], [None, None, "disques"])
        self.assertEqual([a.type for a in self.chapitre.ateliers], ["comprendre", "comprendre", "regler"])

    def test_zone_vide_vaut_pas_de_zone(self):
        texte = CHAPITRE_SANS_ZONE.replace('id="montage-avant" data-type', 'id="montage-avant" data-zone="" data-type')
        self.assertIn('data-zone=""', texte)
        self.assertIsNone(ateliers.relever_chapitre(texte).ateliers[0].zone)

    def test_page_atelier_sans_zone(self):
        for i in (0, 1):
            with self.subTest(atelier=i):
                contenu = pages.page_atelier(self.chapitre, i).contenu
                self.assertNotIn("Zone ", contenu)
                self.assertNotIn("data-zone", contenu)
                article = un(dom.analyser(contenu), "article.atelier")
                self.assertIsNone(article.get("data-zone"))
                self.assertEqual([article.get(n) for n in ("id", "data-type")],
                                 [self.chapitre.ateliers[i].id, "comprendre"])

    def test_entete_sans_zone(self):
        racine = dom.analyser(pages.page_atelier(self.chapitre, 0).contenu)
        self.assertEqual(un(racine, "p.atelier-num").texte(), "Atelier 1.1")
        self.assertEqual(un(racine, "h1").texte(), "Avant de commencer")

    def test_page_atelier_avec_zone_inchangee(self):
        racine = dom.analyser(pages.page_atelier(self.chapitre, 2).contenu)
        self.assertEqual(un(racine, "p.atelier-num").texte(), "Atelier 1.4 · Zone 1, Disques de frein")
        self.assertEqual(un(racine, "article.atelier").get("data-zone"), "disques")

    def test_precedent_et_suivant_traversent_les_ateliers_sans_zone(self):
        racine = dom.analyser(pages.page_atelier(self.chapitre, 1).contenu)
        liens = dom.selectionner(un(racine, "nav.precsuiv"), "a")
        self.assertEqual([(a.get("class"), a.get("href")) for a in liens],
                         [("prec", "../avant/"), ("suiv", "../selle/")])

    def test_carte_sans_zone(self):
        cartes = [pages._carte(self.chapitre, a) for a in self.chapitre.ateliers]
        for carte in cartes[:2]:
            racine = dom.analyser(carte)
            self.assertEqual(dom.selectionner(racine, "span.zone"), [])
            self.assertNotIn("Zone ", carte)
            self.assertEqual(un(racine, "a.carte").get("data-type"), "comprendre")
        self.assertEqual(un(dom.analyser(cartes[2]), "span.zone").texte(), "Zone 1 · Disques de frein")

    def test_cartes_des_zones_ignorent_sans_zone(self):
        html = pages.cartes_des_zones({"montage": self.chapitre}, ZONES)
        self.assertNotIn("montage/avant/", html)
        self.assertNotIn("montage/deballer/", html)
        # L'atelier avec une zone y est, lui.
        self.assertIn('href="montage/selle/"', html)
        racine = dom.analyser(html)
        self.assertEqual([len(dom.selectionner(c, "a")) for c in dom.selectionner(racine, "div.zone-carte")], [1, 0, 0])

    def test_page_categorie(self):
        lot = next(l for l in config_sans_zone()["lots"] if l.get("categorie", {}).get("id") == "montage")
        racine = dom.analyser(pages.page_categorie(lot, self.chapitre).contenu)
        cartes = dom.selectionner(racine, "a.carte")
        self.assertEqual([un(c, "span.num").texte() for c in cartes], ["1.1", "1.2", "1.4"])
        self.assertEqual([len(dom.selectionner(c, "span.zone")) for c in cartes], [0, 0, 1])


class TestSiteAvecAtelierSansZone(unittest.TestCase):
    """Le site entier, avec le lot du Montage publié sur CHAPITRE_SANS_ZONE : les ateliers sans zone ont leur page,
    leur ligne de menu, leur carte de catégorie et leurs entrées de recherche, et « Où intervenir » les ignore."""

    @classmethod
    def setUpClass(cls):
        cls.config = config_sans_zone()
        lire = gabarit.lire
        with mock.patch.object(pages, "lire", side_effect=lambda nom: CHAPITRE_SANS_ZONE
                               if nom == "11-test-sans-zone" else lire(nom)):
            cls.chapitres = pages.chapitres_publies(cls.config)
            cls.pages = pages.toutes_les_pages(cls.config)
            cls._tmp = tempfile.TemporaryDirectory()
            cls.sortie = assemble.ecrire("site", Path(cls._tmp.name), cls.config, cls.pages, cls.chapitres)
        cls.rendues = cls.sortie[0]

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def test_recherche(self):
        index = pages.index_recherche(self.config, self.chapitres)
        self.assertIn({"k": "Atelier 1.1", "t": "Avant de commencer", "u": "montage/avant/"}, index)
        self.assertIn({"k": "Atelier 1.2", "t": "Déballer sans rien abîmer", "u": "montage/deballer/"}, index)
        texte = (Path(self._tmp.name) / "js" / "recherche.js").read_text(encoding="utf-8")
        self.assertIn('"u": "montage/avant/"', texte)
        self.assertIn('"u": "montage/deballer/"', texte)

    def test_pages_du_site(self):
        chemins = [p.chemin for p in self.pages]
        for chemin in ("montage/", "montage/avant/", "montage/deballer/", "montage/selle/"):
            self.assertEqual(chemins.count(chemin), 1, chemin)
        self.assertEqual(assemble.liens_casses(*self.sortie), [])
        for chemin, texte in self.rendues.items():
            self.assertEqual(assemble.controles(texte), [], chemin)

    def test_documents_sans_zone(self):
        for chemin in ("montage/avant/", "montage/deballer/"):
            texte = self.rendues[chemin]
            self.assertNotIn("Zone ", texte, chemin)
            self.assertNotIn("data-zone", texte, chemin)

    def test_accueil_n_a_pas_de_carte_sans_zone(self):
        # « Où intervenir » (les div.zone-carte) liste l'atelier à zone du Montage et aucun des deux autres. L'ancre
        # « montage-avant » du bloc des anciennes adresses mène, elle, à sa page.
        racine = dom.analyser(self.rendues[""])
        hrefs = [a.get("href") for carte in dom.selectionner(racine, "div.zone-carte") for a in dom.selectionner(carte, "a")]
        self.assertEqual([h for h in hrefs if h.startswith("montage/")], ["montage/selle/"])
        self.assertEqual(len([h for h in hrefs if h.startswith("freins/")]), 8)

    def test_atelier_sans_zone_sans_scene(self):
        # app.js ne cherche l'atelier d'une page nulle part : sans #scene ni #zones-data, il ne lance que la visionneuse.
        for chemin in ("montage/avant/", "montage/deballer/"):
            racine = dom.analyser(self.rendues[chemin])
            self.assertEqual(dom.selectionner(racine, '[id="scene"]'), [], chemin)
            self.assertEqual(dom.selectionner(racine, '[id="zones-data"]'), [], chemin)

    def test_menu_et_categorie_listent_les_ateliers_sans_zone(self):
        attendu = {"montage/": ["avant/", "deballer/", "selle/"],  # depuis la catégorie
                   "montage/avant/": ["./", "../deballer/", "../selle/"],  # depuis l'atelier 1.1 : lui-même en « ./ »
                   "montage/deballer/": ["../avant/", "./", "../selle/"]}
        for chemin, liens in attendu.items():
            nav = un(dom.analyser(self.rendues[chemin]), "nav.nav")
            hrefs = [a.get("href") for a in dom.selectionner(un(nav, "div.sub-nav"), "a")]
            self.assertEqual(hrefs, liens, chemin)
        cartes = dom.selectionner(dom.analyser(self.rendues["montage/"]), "a.carte")
        self.assertEqual([c.get("href") for c in cartes], ["avant/", "deballer/", "selle/"])


if __name__ == "__main__":
    unittest.main()
