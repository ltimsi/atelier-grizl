"""Tests de build/pages.py et de l'écriture du site par build/assemble.py : les 20 pages, leurs liens, le texte des
ateliers conservé, l'index de la recherche, la page Composants d'origine recopiée de la fiche, la page d'accueil et
les blocs qu'elle reçoit (Où intervenir, D'origine puis à monter, Toutes les catégories).

Le site est construit une seule fois, dans un dossier temporaire, pour les deux cibles."""
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
        self.assertIn("2.2 Remplacer les disques par des XT", precsuiv.texte())
        self.assertIn("2.4 Roder les freins", precsuiv.texte())

        article = un(racine, "article.atelier")
        self.assertEqual([article.get(n) for n in ("id", "data-zone", "data-type", "data-de", "data-vers")],
                         ["freins-plaquettes", "etrier", "remplacer", "Plaquettes d’origine", "Shimano L04C-MF"])
        tete = un(article, "header.atelier-tete")
        self.assertEqual(un(tete, "p.atelier-num").texte(), "Atelier 2.3 · Zone 2, Étrier et plaquettes")
        self.assertEqual([p.texte() for p in dom.selectionner(tete, "span.pill")],
                         ["Remplacer", "10 étapes", "À démonter : La roue."])
        self.assertEqual(un(tete, "p.de-vers").texte(), "D’origine Plaquettes d’origine À monter Shimano L04C-MF")
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
            self.assertNotIn("hasAttribute('data-app')", html)
        for chemin in ("freins/rodage/", "freins/systeme/", "freins/", "outils/", "montage/"):
            html = self.html(chemin)
            for absent in ("importmap", "viewer.js", "scene/app.js", "references.js", "zones-data", "liens-data"):
                self.assertNotIn(absent, html, chemin)
            self.assertIn("js/site.js", html, chemin)
        for chemin in ("approche/", "sources/"):
            self.assertIn('<script type="module" src="../js/references.js"></script>', self.html(chemin))
        # Aperçu Claude : three.js depuis jsDelivr, mêmes chemins pour le reste.
        html = self.html("freins/plaquettes/", "artifact")
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js", html)
        self.assertIn('src="../../js/m-caliper.js"', html)

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
        self.assertEqual(remplacer, ["2.2", "2.3"])
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
        self.assertEqual(faits, [("Change", "Plaquettes d’origine → Shimano L04C-MF"), ("Démonter", "La roue."),
                                 ("Étapes", "10"), ("Couples", "0,5-0,7\u00a0Nm 1-1,5\u00a0Nm 0,2-0,4\u00a0Nm")])
        self.assertEqual(un(plaquettes, "h3").texte(), "Changer les plaquettes")
        self.assertEqual(un(plaquettes, "span.zone").texte(), "Zone 2 · Étrier et plaquettes")
        self.assertEqual(un(plaquettes, "span.pill").texte(), "Remplacer")
        faits = [(dt.texte(), dd.texte()) for dt, dd in zip(dom.selectionner(cartes[0], "dt"), dom.selectionner(cartes[0], "dd"))]
        self.assertEqual(faits, [("Fiche", "5 blocs à lire")])
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

    def test_texte_des_ateliers_conserve(self):
        for a in self.chapitres["freins"].ateliers:
            with self.subTest(a.slug):
                self.assertEqual(textes_perdus(a.section, self.html(f"freins/{a.slug}/")), [])

    def test_conservation_voit_un_texte_nu_perdu(self):
        # Le contrôle doit voir la perte d'un texte nu : sans le corps d'une des trois options d'étrier de 2.1 (un
        # div.q-b, sans p ni li), il le signale.
        systeme = self.chapitres["freins"].ateliers[0]
        html = self.html("freins/systeme/")
        racine = dom.analyser(html)
        dom.selectionner(racine, "div.q-b")[1].retirer()
        perdus = textes_perdus(systeme.section, racine.html())
        self.assertEqual(len(perdus), 1, perdus)
        self.assertTrue(perdus[0].startswith("div.q : BR-RX820"), perdus)

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
        tl_fc36 = [a.get("href") for a in dom.selectionner(par_nom["Outil Center Lock TL-FC36"], "a")]
        self.assertEqual(tl_fc36, ["../freins/disques/"])
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
        self.assertEqual(un(blocs[0], "h1").texte(), "Ton Grizl CF 7, tel qu’il sort du carton")
        self.assertEqual(un(blocs[0], "p.lead").texte(), "Fais tourner le vélo, touche une pastille, ou choisis une "
                         "zone à droite pour ouvrir ses ateliers.")
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
        self.assertEqual(len(dom.selectionner(blocs[2], "ul.a-remplacer > li")), 2)
        self.assertEqual(len(dom.selectionner(blocs[4], "div.cats > a.cat")), 1 + len(A_VENIR))
        # L'introduction garde son texte : les caractéristiques, le jour de la livraison et la règle des sources.
        intro = blocs[3]
        self.assertEqual(len(dom.selectionner(intro, "dl.specs > div")), 6)
        self.assertEqual(len(dom.selectionner(intro, "ol.plan > li")), 5)
        self.assertEqual(un(intro, "aside.note.info > p.note-t").texte(), "Règle des sources")

    def test_page_composants(self):
        racine = self.arbre("composants/")
        self.assertEqual(un(racine, "nav.crumbs").texte(), "Références/Composants d'origine")
        self.assertIn(COMPOSANTS.strip(), self.html("composants/"))


class TestRecherche(Site):
    def test_recherche(self):
        index = pages.index_recherche(CONFIG, self.chapitres)
        for entree in index:
            self.assertEqual(sorted(entree), ["k", "t", "u"], entree)
        self.assertIn({"k": "Atelier 2.3", "t": "Changer les plaquettes", "u": "freins/plaquettes/"}, index)
        self.assertIn({"k": "Outil · 2.2", "t": "Outil Center Lock TL-FC36", "u": "freins/disques/"}, index)
        self.assertIn({"k": "Étape · 2.3", "t": "Sors les anciennes plaquettes", "u": "freins/plaquettes/"}, index)
        self.assertIn({"k": "Catégorie", "t": "Freins", "u": "freins/"}, index)
        self.assertIn({"k": "Lot 4 · à venir", "t": "Transmission", "u": "transmission/"}, index)
        pieces = [e for e in index if e["k"] == "Pièce d’origine"]
        self.assertTrue(any("RD-RX822" in e["t"] for e in pieces))
        self.assertTrue(all(e["u"].startswith("composants/") for e in pieces))
        # Une entrée par ligne des tableaux de composants.html, et une par accessoire livré.
        fiche = dom.analyser(COMPOSANTS)
        lignes = len(dom.selectionner(fiche, "tbody > tr")) + len(dom.selectionner(fiche, "ul.accessoires > li"))
        self.assertEqual(len(pieces), lignes)
        self.assertEqual(len([e for e in index if e["k"].startswith("Étape · ")]), 41)
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
        self.assertEqual([s.texte() for s in elements(disques)], ["2.2", "Remplacer les disques par des XT", "Remplacer"])

    def test_a_remplacer(self):
        racine = dom.analyser(pages.pieces_a_remplacer(self.chapitres))
        lignes = dom.selectionner(racine, "ul.a-remplacer > li")
        self.assertEqual(len(lignes), 2)
        self.assertEqual(un(lignes[0], ".vers").texte(), "Shimano Deore XT RT-MT800")
        self.assertEqual(un(lignes[0], ".de").texte(), "à la place de : Shimano SM-RT64")
        self.assertEqual(un(lignes[0], "a").get("href"), "freins/disques/")
        self.assertEqual(un(lignes[1], ".vers").texte(), "Shimano L04C-MF")
        self.assertEqual(un(lignes[1], "a").get("href"), "freins/plaquettes/")

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
        ligne = re.sub(r" \(`[^`]+`\)", "", ligne)  # « (`canyon-4553`) »
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
                                  "Accessoires livrés", "Géométrie de la taille M", "Contradictions et compléments relevés"])
        self.assertEqual(un(self.racine, "h1").texte(), MD.splitlines()[0][2:])

    def test_textes(self):
        # Chaque paragraphe et chaque puce de la fiche, nettoyés du Markdown, sont dans la page. Seule la phrase qui
        # annonce les identifiants internes (retirés) n'y est pas.
        annonce = " Chaque document cité est enregistré dans `src/scene/sources.js`, sous l'identifiant donné entre parenthèses."
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
        self.assertIn("« Contintental Terra Adventure Trail Grip »", texte)

    def test_liens(self):
        adresses = re.findall(r"\]\((https://[^)]+)\)", MD) + re.findall(r"^(?:Source|Photo officielle du coloris) : (\S+)$", MD, re.M)
        hrefs = [a.get("href") for a in dom.selectionner(self.racine, "a")]
        self.assertEqual(set(hrefs), set(adresses))
        self.assertIn("https://www.canyon.com/fr-ch/velos-de-gravel/adventure/grizl/cf/grizl-cf-7/4553.html"
                      "?dwvar_4553_pv_rahmenfarbe=R126_P06", hrefs)
        for a in dom.selectionner(self.racine, "a"):
            self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), a.get("href"))

    def test_sans_identifiant_interne(self):
        # Les identifiants ne sont pas dans le texte (certaines adresses de Canyon contiennent le même mot).
        texte = self.racine.texte()
        idents = re.findall(r"`([a-z0-9]+(?:-[a-z0-9]+)+)`", MD)
        self.assertEqual(len(set(idents)), 8)
        for ident in idents:
            self.assertNotIn(ident, texte)
        self.assertNotIn("(`", COMPOSANTS)
        self.assertNotIn("()", texte)

    def test_regles(self):
        self.assertIsNone(re.search("[\u2014\u2013]", COMPOSANTS))
        for prive in ("claude.ai", "docs.google.com", "Lamine"):
            self.assertNotIn(prive, COMPOSANTS)


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


if __name__ == "__main__":
    unittest.main()
