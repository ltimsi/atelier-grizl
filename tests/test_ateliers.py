"""Tests de build/ateliers.py : le chapitre Freins relu en ateliers, puis les deux colonnes de la page d'un atelier,
étapes et blocs repliés dans des <details>, sans texte perdu ni contenu caché."""
import json
import re
import sys
import unittest
from pathlib import Path
from urllib.parse import urlparse

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import ateliers  # noqa: E402
import dom  # noqa: E402

FREINS = (RACINE / "src" / "parts" / "20-freins.html").read_text(encoding="utf-8")
SLUGS = ["systeme", "disques", "plaquettes", "rodage", "centrage", "controles", "purge", "securite"]
COMPRENDRE = ["systeme", "controles", "securite"]
NBSP = " "  # le source sépare les valeurs de leur unité par une espace insécable


def elements(parent):
    """Les enfants qui sont des éléments, sans les blancs de mise en page."""
    return [e for e in parent.enfants if isinstance(e, dom.Element)]


def ancetres(element):
    parent = element.parent
    while parent is not None:
        yield parent
        parent = parent.parent


def replie(element):
    """Vrai si l'élément est dans un <details>, donc caché tant qu'on ne l'ouvre pas."""
    return any(p.tag == "details" for p in ancetres(element))


def a_attribut(element, nom):
    return any(n == nom for n, _ in element.attrs)


class Ateliers(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.chapitre = ateliers.relever_chapitre(FREINS)
        cls.atelier = {a.slug: a for a in cls.chapitre.ateliers}
        cls.cols = {a.slug: ateliers.colonnes(a) for a in cls.chapitre.ateliers}

    def gauche(self, slug):
        return dom.analyser(self.cols[slug][0])

    def droite(self, slug):
        return dom.analyser(self.cols[slug][1])

    def test_releve(self):
        c = self.chapitre
        self.assertEqual(c.id, "freins")
        self.assertEqual((c.tete.tag, c.tete.classes()), ("header", ["ch-head"]))
        self.assertEqual([a.slug for a in c.ateliers], SLUGS)
        self.assertEqual([a.id for a in c.ateliers], ["freins-" + s for s in SLUGS])

        p = self.atelier["plaquettes"]
        self.assertEqual((p.num, p.titre, p.type, p.zone), ("2.3", "Changer les plaquettes", "remplacer", "etrier"))
        self.assertEqual((p.de, p.vers), ("Plaquettes d’origine, L05A-RF attendues", "Shimano L05A-RF neuves"))
        self.assertEqual(p.demonter, "La roue.")
        self.assertEqual(len(p.outils), 11)
        # Le vélo se tient roue déposée et parallèle au sol, comme le demande le DM-GADBR10 : le pied d'atelier.
        self.assertIn("Pied d'atelier PCS-10.3", p.outils)
        self.assertEqual(p.outils[0], "Plaquettes Shimano L05A-RF neuves, une paire par frein")
        self.assertEqual(len(p.etapes), 10)
        self.assertEqual(p.etapes[0].titre, "Sors les anciennes plaquettes")
        self.assertEqual(p.etapes[0].couples, [])
        self.assertEqual(p.etapes[5].titre, "Monte l'ensemble et serre l'axe")
        self.assertEqual(p.etapes[5].couples, [f"1-1,5{NBSP}Nm"])
        self.assertEqual(p.modeles, ["caliper"])
        self.assertEqual(p.blocs, [])
        self.assertEqual((p.section.get("id"), p.section.parent.get("id")), ("freins-plaquettes", "freins"))

        self.assertEqual(len(self.atelier["purge"].etapes), 15)
        self.assertEqual(self.atelier["purge"].modeles, ["bleed"])
        systeme = self.atelier["systeme"]
        self.assertEqual((systeme.num, systeme.type, systeme.zone), ("2.1", "comprendre", "manettes"))
        self.assertEqual((systeme.de, systeme.vers, systeme.demonter), (None, None, None))
        self.assertEqual((systeme.outils, systeme.etapes, systeme.modeles), ([], [], []))

        blocs = self.atelier["controles"].blocs
        self.assertEqual(len(blocs), 8)
        self.assertEqual((blocs[0], blocs[-1]), ("Disque usé", "Après un chantier de freins"))
        self.assertNotIn("Vidéos", blocs)

        self.assertEqual(sorted(c.resumes), ["couples", "ordre"])
        (couples,) = c.resumes["couples"]
        self.assertEqual((couples.tag, couples.classes()), ("div", ["tbl", "stack"]))
        (ordre,) = c.resumes["ordre"]
        self.assertEqual(elements(ordre)[0].texte(), f"Proposition{NBSP}: l'ordre du jour J")

        # colonnes() a travaillé sur une copie : chaque section est encore celle du source, octet pour octet.
        for a in c.ateliers:
            self.assertIn(a.section.html(), FREINS)

    def test_couples_sans_doublon(self):
        texte = (
            '<section class="chapter" id="x"><header class="ch-head"><h2>X</h2></header>'
            '<section class="sub atelier" id="x-essai" data-zone="z" data-type="regler"><h3>9.1 Un essai</h3>'
            '<div class="a-dem"><h4>À démonter avant</h4><p>Rien.</p></div>'
            '<div class="kit"><h4>Il te faut</h4><ul class="chips"><li>Clé</li></ul></div>'
            '<ol class="steps"><li><p class="st-t">Serre</p><p>À <span class="nm">5 Nm</span>, encore à '
            '<span class="nm">5 Nm</span>, puis à <span class="nm">6 Nm</span>.</p></li></ol>'
            '<h4>Vidéo</h4><p class="a-video">Aucune.</p></section></section>'
        )
        (a,) = ateliers.relever_chapitre(texte).ateliers
        self.assertEqual((a.slug, a.num, a.titre), ("essai", "9.1", "Un essai"))
        self.assertEqual(a.etapes[0].couples, ["5 Nm", "6 Nm"])
        (boite,) = dom.selectionner(dom.analyser(ateliers.colonnes(a)[1]), "div.couples-atelier")
        (ligne,) = dom.selectionner(boite, "li")
        self.assertEqual([nm.texte() for nm in dom.selectionner(ligne, "span.nm")], ["5 Nm", "6 Nm"])

    def test_etapes_repliables(self):
        a = self.atelier["plaquettes"]
        g = self.gauche("plaquettes")
        etapes = dom.selectionner(g, "li.step")
        self.assertEqual(len(etapes), 10)
        for n, (li, etape) in enumerate(zip(etapes, a.etapes), 1):
            with self.subTest(etape=n):
                (details,) = elements(li)
                self.assertEqual(details.tag, "details")
                summary, corps = elements(details)
                self.assertEqual(summary.tag, "summary")
                attendu = [("span", ["st-n"], str(n)), ("span", ["st-t"], etape.titre)]
                if etape.couples:
                    attendu.append(("span", ["nm"], etape.couples[0]))
                self.assertEqual([(e.tag, e.classes(), e.texte()) for e in elements(summary)], attendu)
                self.assertEqual((corps.tag, corps.classes()), ("div", ["st-b"]))
                self.assertTrue(corps.texte())
        self.assertEqual(dom.selectionner(g, "p.st-t"), [])

        # Étape 6 : le couple sur la ligne du résumé, et dans le corps.
        summary, corps = elements(elements(etapes[5])[0])
        self.assertEqual(elements(summary)[1].texte(), "Monte l'ensemble et serre l'axe")
        self.assertEqual(elements(summary)[2].texte(), f"1-1,5{NBSP}Nm")
        self.assertEqual([nm.texte() for nm in dom.selectionner(corps, "span.nm")], [f"1-1,5{NBSP}Nm"])
        self.assertEqual(len(elements(elements(elements(etapes[0])[0])[0])), 2)

        # Purge : ses 15 étapes restent dans le <details> du source, chacune repliée à son tour.
        g = self.gauche("purge")
        (dehors,) = [d for d in dom.selectionner(g, "details") if elements(d)[0].texte() == "La purge du DM-GADBR10, en 15 étapes"]
        self.assertEqual(len(dom.selectionner(dehors, "li.step")), 15)
        self.assertEqual(len(dom.selectionner(g, "li.step")), 15)

    def test_blocs_comprendre(self):
        # 2.6 : les 7 questions de div.flow, puis un seul bloc, celui de la liste à cocher.
        source = self.atelier["controles"].section
        g = self.gauche("controles")
        qs = dom.selectionner(g, "details.q")
        self.assertEqual(len(qs), 7)
        self.assertEqual(len(dom.selectionner(g, "div.flow > details.q")), 7)
        self.assertEqual(dom.selectionner(g, "div.q"), [])
        for q, details in zip(dom.selectionner(source, "div.flow > div.q"), qs):
            summary, corps = elements(details)
            self.assertEqual(summary.tag, "summary")
            self.assertEqual(summary.texte(), elements(q)[0].texte())
            self.assertEqual(summary.texte() + corps.texte(), q.texte())
            self.assertFalse(a_attribut(details, "open"))

        (bloc,) = dom.selectionner(g, "details.bloc")
        summary, corps = elements(bloc)
        self.assertEqual(summary.texte(), "Après un chantier de freins")
        self.assertTrue(a_attribut(bloc, "open"))
        bouton = elements(corps)[0]
        self.assertEqual((bouton.tag, bouton.get("data-reset")), ("button", "freins-apres"))
        self.assertEqual(len(dom.selectionner(corps, 'ul.check[data-key="freins-apres"] > li')), 11)
        self.assertEqual(dom.selectionner(g, "div.check-head"), [])
        # Avant la première limite : visible. Le h4 « Vidéos » et sa liste : visibles aussi.
        for selecteur in ("div.flow", "aside.note", "ul.media"):
            (e,) = dom.selectionner(g, selecteur)
            self.assertFalse(any("bloc" in p.classes() for p in ancetres(e)), selecteur)
        self.assertEqual([e.texte() for e in elements(g) if e.tag == "h4"], ["Vidéos"])
        self.assertEqual(self.atelier["controles"].blocs, [elements(d)[0].texte() for d in qs] + ["Après un chantier de freins"])

        # 2.1 : six blocs, le premier ouvert. L'étrier attendu est le seul BR-RX820 : plus de questions à déplier.
        titres = ["Les manettes", "L'étrier, à identifier", "La fixation flat mount", "Les disques", "Les plaquettes",
                  "Les couples de tes freins"]
        g = self.gauche("systeme")
        blocs = dom.selectionner(g, "details.bloc")
        self.assertEqual([elements(b)[0].texte() for b in blocs], titres)
        self.assertEqual([a_attribut(b, "open") for b in blocs], [True, False, False, False, False, False])
        self.assertEqual(dom.selectionner(g, "details.q"), [])
        self.assertEqual(len(dom.selectionner(blocs[5], '[data-resume="couples"]')), 1)
        self.assertEqual(len(dom.selectionner(blocs[5], '[data-resume="ordre"]')), 1)
        self.assertEqual(self.atelier["systeme"].blocs, titres)
        intro = elements(g)[0]
        self.assertEqual(intro.tag, "p")
        self.assertTrue(intro.texte().startswith("Chaque frein a quatre éléments"))
        self.assertEqual([e.texte() for e in elements(g) if e.tag == "h4"], ["Vidéo"])
        (video,) = dom.selectionner(g, "p.a-video")
        self.assertFalse(replie(video))

        # 2.8 : l'avertissement reste visible, les manuels forment un bloc.
        self.assertEqual(self.atelier["securite"].blocs, ["Manuels et tableaux"])
        g = self.gauche("securite")
        self.assertFalse(replie(dom.selectionner(g, "aside.note")[0]))

        # Hors « comprendre », les autres intertitres restent dépliés.
        g = self.gauche("plaquettes")
        self.assertEqual(dom.selectionner(g, "details.bloc") + dom.selectionner(g, "details.q"), [])
        self.assertEqual([e.texte() for e in elements(g) if e.tag == "h4"], ["Quand les changer"])

    def test_droite(self):
        a = self.atelier["plaquettes"]
        haut = elements(self.droite("plaquettes"))
        self.assertEqual([(e.tag, e.classes()) for e in haut], [
            ("div", ["figures"]), ("div", ["a-dem"]), ("div", ["kit"]), ("div", ["couples-atelier"]),
            ("h4", []), ("ul", ["media"]),
        ])
        figures, demonter, kit, couples, titre_video, video = haut

        self.assertTrue(a_attribut(figures, "data-onglets"))
        self.assertEqual([(f.tag, f.classes()) for f in elements(figures)], [("figure", ["plate"]), ("figure", ["v3d"])])
        self.assertEqual(elements(figures)[0].get("id"), "freins-pl-2")

        self.assertEqual(dom.selectionner(demonter, "p")[0].texte(), "La roue.")

        self.assertEqual(elements(kit)[0].texte(), "Il te faut")
        (liste,) = dom.selectionner(kit, "ul")
        self.assertEqual((liste.classes(), liste.get("data-key")), (["check"], "kit-freins-plaquettes"))
        cases = dom.selectionner(liste, "li")
        self.assertEqual([li.texte() for li in cases], a.outils)
        for n, li in enumerate(cases, 1):
            (label,) = elements(li)
            case, libelle = elements(label)
            self.assertEqual((label.tag, case.tag, case.get("type"), libelle.tag), ("label", "input", "checkbox", "span"))
            self.assertEqual(case.get("id"), f"ck-freins-plaquettes-kit-{n}")
        self.assertEqual(len(cases), 11)

        self.assertEqual(elements(couples)[0].texte(), "Couples de l’atelier")
        lignes = dom.selectionner(couples, "li")
        self.assertEqual(len(lignes), 2)
        self.assertTrue(lignes[0].texte().startswith("Étape 4 · Retire l'entonnoir et referme la manette"))
        self.assertTrue(lignes[1].texte().startswith("Étape 6 · Monte l'ensemble et serre l'axe"))
        self.assertEqual([[nm.texte() for nm in dom.selectionner(l, "span.nm")] for l in lignes],
                         [[f"0,5-0,7{NBSP}Nm"], [f"1-1,5{NBSP}Nm"]])

        self.assertEqual(titre_video.texte(), "Vidéo")
        self.assertEqual(len(dom.selectionner(video, "li")), 1)

        g = self.gauche("plaquettes")
        for selecteur in ("figure", "div.figures", "div.a-dem", "div.kit", "div.couples-atelier", "ul.media", "ul.check"):
            self.assertEqual(dom.selectionner(g, selecteur), [], selecteur)
        self.assertNotIn("Vidéo", [h.texte() for h in dom.selectionner(g, "h4")])

        # Les autres ateliers à gestes ont la même colonne, avec ou sans figures et couples.
        for slug in ("disques", "rodage", "centrage", "purge"):
            with self.subTest(slug):
                attendu = [["figures"]] if dom.selectionner(self.atelier[slug].section, "figure") else []
                attendu += [["a-dem"], ["kit"]]
                attendu += [["couples-atelier"]] if any(e.couples for e in self.atelier[slug].etapes) else []
                attendu += [[], ["media"]]
                self.assertEqual([e.classes() for e in elements(self.droite(slug))], attendu)

        # Ids uniques sur tout le site : ceux des cases du kit portent l'id de leur atelier.
        ids = [e.get("id") for s in SLUGS for cote in self.cols[s] for e in dom.selectionner(dom.analyser(cote), "[id]")]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertIn("ck-freins-disques-kit-9", ids)
        self.assertNotIn("ck-freins-disques-kit-10", ids)
        self.assertIn("ck-freins-apres-1", ids)

    def test_figures_inegales(self):
        # Planche et 3D (2.2, 2.3, 2.7), planche seule (2.4, 2.5), rien (2.1, 2.6, 2.8).
        nombre = {"systeme": 0, "disques": 2, "plaquettes": 2, "rodage": 1, "centrage": 1, "controles": 0,
                  "purge": 2, "securite": 0}
        for slug, n in nombre.items():
            with self.subTest(slug):
                boites = dom.selectionner(self.droite(slug), "div.figures")
                if n == 0:
                    self.assertEqual(boites, [])
                else:
                    (boite,) = boites
                    self.assertEqual(len(dom.selectionner(boite, "figure")), n)
                    self.assertEqual(a_attribut(boite, "data-onglets"), n > 1)
                self.assertEqual(dom.selectionner(self.gauche(slug), "figure"), [])

        # Une fiche « comprendre » sans figure garde tout à gauche, vidéo comprise : la droite est vide.
        for slug in COMPRENDRE:
            self.assertEqual(self.cols[slug][1], "", slug)
        self.assertEqual(len(dom.selectionner(self.gauche("systeme"), "p.a-video")), 1)

        # Aucune boîte vide.
        self.assertEqual(dom.selectionner(self.droite("rodage"), "div.couples-atelier"), [])
        for slug in SLUGS:
            d = self.droite(slug)
            for boite in dom.selectionner(d, "div.couples-atelier"):
                self.assertTrue(dom.selectionner(boite, "li"), slug)
            for boite in dom.selectionner(d, "div.figures"):
                self.assertTrue(dom.selectionner(boite, "figure"), slug)

    def test_sans_hidden(self):
        for slug in SLUGS:
            for cote in self.cols[slug]:
                self.assertEqual(dom.selectionner(dom.analyser(cote), "[hidden]"), [], slug)

    def test_purge_criteres_dm_gadbr10(self):
        # Les interdits et les conditions d'arrêt de la purge du DM-GADBR10 : pas de levier pendant le remplissage
        # (sinon vidange), injecter jusqu'à ne plus voir de bulles, réservoir assez plein pour déborder à la fermeture.
        corps = {dom.selectionner(li, "p.st-t")[0].texte(): li.texte()
                 for li in dom.selectionner(self.atelier["purge"].section, "ol.steps > li")}
        for attendu in ("ne serre pas le levier", "vidange l'huile", "n'ait plus de bulles d'air", "DM-GADBR10"):
            self.assertIn(attendu, corps["Injecte l'huile par l'étrier"])
        for attendu in ("sans serrer le levier", "n'ait plus de bulles d'air"):
            self.assertIn(attendu, corps["Injecte à nouveau"])
        for attendu in ("déborde quand tu serres la vis de purge", "joint torique vers le bas", "chiffon propre",
                        "alcool isopropylique"):
            self.assertIn(attendu, corps["Referme la manette"])
        self.assertIn("angle du cintre", corps["Incline l'entonnoir à 20°"])
        self.assertIn("sans les faire tomber", corps["Monte l'entonnoir"])

    def test_h3_hors_colonnes(self):
        for slug in SLUGS:
            for cote in self.cols[slug]:
                self.assertEqual(dom.selectionner(dom.analyser(cote), "h3"), [], slug)

    def test_texte_conserve(self):
        verifier_texte_conserve(self, self.chapitre.ateliers)


# ---------------------------------------------------------------------------------------------------------------
# Chapitre 1, Montage à la livraison : relu depuis son fragment, qu'il soit publié ou non
# ---------------------------------------------------------------------------------------------------------------

MONTAGE = RACINE / "src" / "parts" / "11-montage.html"
GESTES = (".a-dem", ".kit", "ol.steps")
JETONS = RACINE / "brouillons" / "jetons-personnels.txt"  # hors du dépôt : brouillons/ est ignoré par git
QSG = "canyon-grizl-quick-start-guide-2025-2.pdf"
# Les couples qu'aucun outil de Lamine ne couvre : 2 Nm, 2,5 N·m, 7 Nm (pas 12 Nm, 0,2 Nm ni 2,5 mm).
HORS_OUTILS = re.compile(r"(?<![\d,.])(?:2|7|2,5)[ \u00a0](?:Nm|N·m)\b")
# Les lignes du texte : une étape, une ligne de tableau, un point de liste, un paragraphe, une légende, un titre.
LIGNES = ("li", "tr", "p", "figcaption", "summary", "h4")


def normaliser(texte):
    """Le texte comparé : l'apostrophe typographique devient droite, pour accepter les deux."""
    return texte.replace("\u2019", "'")


def texte_de(element):
    return normaliser(element.texte())


def lignes_de(racine, questions=False):
    """Chaque ligne de `racine` : l'élément de LIGNES le plus haut, pris en entier (une étape avec son titre et son
    corps, une ligne de tableau avec ses cellules), dans l'ordre du document. Avec `questions`, chaque div.q d'une fiche
    « comprendre » (une question, son titre en b et sa réponse) compte aussi pour une ligne."""
    trouvees = []

    def parcourir(element):
        for enfant in elements(element):
            if enfant.tag in LIGNES or (questions and enfant.tag == "div" and "q" in enfant.classes()):
                trouvees.append(enfant)
            else:
                parcourir(enfant)
    parcourir(racine)
    return trouvees


def aria_labels(racine):
    return [normaliser(e.get("aria-label")) for e in dom.selectionner(racine, "[aria-label]")]


# Ce qu'aucun chapitre n'écrit : une monnaie, un chemin local, le nom du compte.
DONNEES_GENERIQUES = ("CHF", "\u20ac", "/Users/", "ltimsi", "file:")


def verifier_aucune_donnee(test, texte, html, en_plus=()):
    """Aucun jeton générique ni personnel dans le texte lu ni dans le source d'un chapitre, espaces insécables
    comprises. Les jetons personnels de Lamine (cotes, pressions, étude de position) ne sont jamais écrits dans un
    fichier suivi par git : ils sont lus dans brouillons/jetons-personnels.txt, hors du dépôt, quand il existe. Un échec
    ne répète pas le jeton : seul son rang dans le fichier."""
    texte, html = texte.replace("\u00a0", " "), html.replace("\u00a0", " ")
    for absent in DONNEES_GENERIQUES + tuple(en_plus):
        test.assertNotIn(absent, texte, absent)
        test.assertNotIn(absent, html, absent)
    if JETONS.exists():
        jetons = [l.strip() for l in JETONS.read_text(encoding="utf-8").splitlines()
                  if l.strip() and not l.lstrip().startswith("#")]
        test.assertTrue(jetons)
        for n, absent in enumerate(jetons, 1):
            test.assertFalse(absent in texte or absent in html, f"jeton personnel n°{n} de {JETONS.name}")


def verifier_texte_conserve(test, ateliers_du_chapitre):
    """Les deux colonnes de la page de chaque atelier gardent tout le texte du source. Le numéro et la copie du premier
    couple, ajoutés au résumé d'une étape, s'intercalent entre son titre et son corps : ce sont des libellés
    d'interface, retirés avant de comparer."""
    for a in ateliers_du_chapitre:
        with test.subTest(a.id):
            gauche, droite = ateliers.colonnes(a)
            sortie = dom.analyser(gauche + droite)
            for ajout in dom.selectionner(sortie, "summary > span.st-n") + dom.selectionner(sortie, "summary > span.nm"):
                ajout.retirer()
            texte = sortie.texte()
            for selecteur in ("p", "li", "h4", "td", "b", "summary", "figcaption"):
                for e in dom.selectionner(a.section, selecteur):
                    test.assertIn(e.texte(), texte, f"{selecteur} : {e.texte()[:60]}")


class TestMontage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = MONTAGE.read_text(encoding="utf-8")
        cls.ch = ateliers.relever_chapitre(cls.source)
        cls.par_id = {a.id: a for a in cls.ch.ateliers}
        cls.section = cls.ch.tete.parent

    def html_de(self, ident):
        return self.par_id[ident].section.html()

    def texte_complet(self):
        return texte_de(self.section)

    def test_chapitre(self):
        self.assertEqual(self.ch.id, "montage")
        self.assertEqual((self.section.tag, self.section.classes()), ("section", ["chapter"]))
        (num,) = dom.selectionner(self.ch.tete, "p.ch-num")
        self.assertEqual(num.texte(), "Chapitre 1 · Montage à la livraison")
        self.assertEqual(dom.selectionner(self.ch.tete, "h2")[0].texte(), "Montage à la livraison")
        ids = [e.get("id") for e in dom.selectionner(dom.analyser(self.source), "[id]")]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sorted(self.ch.resumes), ["couples", "ordre"])

    def test_ateliers_ids_types_zones(self):
        self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
            ("montage-avant", "1.1", "comprendre", None), ("montage-deballer", "1.2", "comprendre", None),
            ("montage-cintre", "1.3", "regler", "poste"), ("montage-selle", "1.4", "regler", "selle"),
            ("montage-roues", "1.5", "regler", "axes"), ("montage-pedales", "1.6", "remplacer", "pedalier"),
            ("montage-di2", "1.7", "entretenir", "derailleur"), ("montage-position", "1.8", "regler", "selle"),
            ("montage-controles", "1.9", "comprendre", None)])
        # Sans zone, pas d'attribut du tout, même vide.
        for a in self.ch.ateliers:
            self.assertEqual(any(n == "data-zone" for n, _ in a.section.attrs), a.zone is not None, a.id)

    def test_remplacer_pedales(self):
        p = self.par_id["montage-pedales"]
        self.assertEqual((p.de, p.vers), ("Aucune pédale, non fournies", "Shimano PD-ME700 et cales SM-SH51"))
        for a in self.ch.ateliers:
            if a.id != "montage-pedales":
                self.assertEqual((a.de, a.vers), (None, None), a.id)

    def test_blocs_par_type(self):
        # Une fiche « comprendre » n'a aucun bloc de gestes, les autres types les ont tous. Chacune a sa vidéo.
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                presents = [g for g in GESTES if dom.selectionner(a.section, g)]
                self.assertEqual(presents, [] if a.type == "comprendre" else list(GESTES))
                self.assertTrue(dom.selectionner(a.section, "ul.media") + dom.selectionner(a.section, "p.a-video"))
                videos = [h for h in elements(a.section) if h.tag == "h4" and h.texte() in ateliers.VIDEO]
                self.assertEqual(len(videos), 1)
                if a.type != "comprendre":
                    self.assertTrue(a.outils and a.etapes and a.demonter)
                    self.assertEqual(len(dom.selectionner(a.section, "ol.steps")), 1)
                gauche, droite = ateliers.colonnes(a)
                self.assertEqual(dom.selectionner(dom.analyser(gauche + droite), "[hidden]"), [])

    def test_figures_3d(self):
        attendu = {"montage-avant": ["torque"], "montage-cintre": ["cockpit"], "montage-roues": ["axle"],
                   "montage-pedales": ["pedal"]}
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                self.assertEqual(a.modeles, attendu.get(a.id, []))
                for figure in dom.selectionner(a.section, "figure.v3d"):
                    (scene,) = dom.selectionner(figure, "div.v3d-stage")
                    self.assertEqual(scene.get("role"), "img")
                    self.assertTrue(scene.get("aria-label"))
                    (legende,) = dom.selectionner(figure, "figcaption")
                    self.assertTrue(legende.texte().startswith(f"3D {a.num}"), legende.texte())

    def test_valeurs_du_releve(self):
        t = {a.id: texte_de(a.section) for a in self.ch.ateliers}
        for ident, valeurs in {
            "montage-cintre": ("6\xa0Nm", "2\xa0Nm", "4\xa0mm", "5\xa0mm", "3\xa0mm", "sans jour", "pictogramme",
                               "guide imprimé", "M5x22", "M6x18", "ZERO GAP"),
            "montage-selle": ("110\xa0mm", "210\xa0mm", "MIN", "6\xa0Nm", "5\xa0Nm", "7\xa0Nm", "pâte de montage",
                              "pictogramme", "guide imprimé", "18\xa0Nm", "75\xa0mm"),
            "montage-roues": ("10-15\xa0Nm", "6\xa0mm", "non publié", "3,0\xa0bar", "RIGID FORK", "12 x 100",
                              "12 x 142"),
            "montage-pedales": ("35-55\xa0Nm", "15\xa0mm", "2,5\xa0Nm", "5-6\xa0Nm", "3\xa0mm", "à gauche",
                                "4\xa0mm", "GREASE NOT INCLUDED", "20\xa0mm"),
            "montage-di2": ("BT-DN320", "EC-DN100", "une heure", "CR1632", "E-TUBE PROJECT", "test purposes",
                            "orange", "0,5\xa0s", "51-100\xa0%"),
            "montage-avant": ("TW-6.2", "ATD-1.2", "mâchoires", "à lire sur l\u2019outil", "10 à 60\xa0Nm", "4,5",
                              "5,5", "0,25\xa0Nm", "PLEASE ALWAYS USE A TORQUE WRENCH"),
            "montage-deballer": ("EC-DN100", "Reflector Set", "FIX", "p.72", "V02", "Bike Guard", "None included",
                                 "QSG R126"),
            "montage-position": ("710", "810", "Park Tool", "SETBACK", "+5", "75\xa0mm", "entretoises", "MIN"),
            "montage-controles": ("p.60", "p.61", "120\xa0kg", "BED-IN"),
        }.items():
            for v in valeurs:
                self.assertIn(normaliser(v), t[ident], f"{ident} : {v}")

    def test_aucun_outil_pour_2_25_7(self):  # Review Focus 3
        # Chaque ligne qui porte 2 Nm, 2,5 N·m ou 7 Nm dit qu'aucun de tes outils ne le couvre (TW-6.2 de 10 à
        # 60 Nm, ATD-1.2 de 4 à 6 Nm) et renvoie à la clé Canyon du carton. Les aria-label comptent aussi.
        vues = 0
        for texte in [texte_de(l) for l in lignes_de(self.section)] + aria_labels(self.section):
            if HORS_OUTILS.search(texte):
                vues += 1
                bas = texte.lower()
                self.assertIn("aucun de tes outils", bas, texte[:160])
                self.assertIn("clé canyon", bas, texte[:160])
        self.assertGreaterEqual(vues, 6)
        self.assertIsNotNone(HORS_OUTILS.search("à 2\xa0Nm"))
        self.assertIsNotNone(HORS_OUTILS.search("« 0.5-2 Nm »"))
        for permis in ("12\xa0Nm", "0,2\xa0Nm", "2,5\xa0mm", "17\xa0Nm", "2\xa0mm", "7\xa0mm"):
            self.assertIsNone(HORS_OUTILS.search(permis), permis)

    def test_valeur_avec_source_officielle(self):  # Review Focus 4
        # Toute ligne (étape, ligne de tableau, point de liste, paragraphe) qui porte un span.nm porte aussi un a.src
        # officiel : Park Tool sert pour un geste, jamais pour une valeur.
        vues = 0
        for ligne in lignes_de(self.section):
            if dom.selectionner(ligne, "span.nm"):
                vues += 1
                officielles = [a for a in dom.selectionner(ligne, "a.src") if "parktool.com" not in a.get("href")]
                self.assertTrue(officielles, texte_de(ligne)[:160])
        self.assertGreaterEqual(vues, 15)
        for a in dom.selectionner(self.section, "a.src"):
            self.assertTrue(a.get("href").startswith("https://"), a.get("href"))
            self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), a.get("href"))

    def test_pictogrammes_du_qsg(self):
        # Un couple du QSG V02 dit s'il vient d'un pictogramme ou du tableau de la page, avec sa page ; l'atelier
        # renvoie au guide imprimé du carton, à comparer (règle 5 des sources).
        # Une ligne dont le couple vient de Shimano (elle cite si.shimano.com) et qui ne cite le QSG que pour une flèche
        # n'est pas un couple du QSG : seule l'étape 5 de 1.6 (pédales, flèches 8.2 et 8.3) est dans ce cas.
        vues, shimano = set(), []
        for a in self.ch.ateliers:
            for ligne in lignes_de(a.section):
                qsg = [s for s in dom.selectionner(ligne, "a.src") if QSG in s.get("href")]
                if not (qsg and dom.selectionner(ligne, "span.nm")):
                    continue
                if any("si.shimano.com" in s.get("href") for s in dom.selectionner(ligne, "a.src")):
                    shimano.append(texte_de(ligne)[:21])
                    continue
                vues.add(a.id)
                texte = texte_de(ligne)
                self.assertTrue("pictogramme" in texte or "tableau" in texte, texte[:160])
                for s in qsg:
                    self.assertRegex(s.texte(), r"QSG V02 p\.\d", texte[:160])
                if "pictogramme" in texte:
                    self.assertIn("guide imprimé", texte_de(a.section), a.id)
        self.assertLessEqual({"montage-avant", "montage-cintre", "montage-selle", "montage-roues",
                              "montage-position"}, vues)
        self.assertEqual(shimano, ["Serre chaque pédale à"])

    def test_sans_ecarts_des_brouillons(self):
        # Les écarts du relevé (section « Écarts avec les brouillons du 20/10 »), chacun par un indice précis.
        texte, html = self.texte_complet(), normaliser(self.source)
        for absent in (
            "68\xa0mm", "68 mm", "2,5 fois",  # règle Park Tool d'insertion, au lieu des 110 mm de Canyon
            "en croix",  # le capot se serre haut puis bas
            "câble de dérailleur", "câble du dérailleur", "serre-câble", "mou initial",  # Di2 sans fil
            "DM-GARD010", "RD-RX822", "8-10\xa0Nm", "6-7\xa0Nm",
            "Ortlieb", "15\xa0kg",  # porte-bagages : hors du relevé
            "Selle Royal", "Continental", "4,5\xa0bar",  # pièces du CF 7, pression d'un revendeur
            "déjà posé",  # Canyon n'écrit pas que le ruban est posé : seul le dessin du QSG le montre
            "0,2-0,4", "ST-RX610", "CN-M6100", "BB-RS500", "DM-MACS001", "UM-LAR0A",
            "chariot de selle",  # 7 Nm est la vis d'inclinaison, au pied de la tige
            "3 à 12", "40,7", "360 in-lb",  # article de magazine, conversion d'une valeur Park Tool
            "ne donne pas la taille de clé",  # Shimano dessine l'embout de 4 mm des cales
            "How to unbox",  # titre de vidéo pris dans des résultats de recherche
        ):
            self.assertNotIn(absent, texte, absent)
        for motif in (r"\bSIS\b", r"\bBSA\b", r"ST-RX820\b"):
            self.assertIsNone(re.search(motif, texte), motif)
        # Les pages du QSG V01 des brouillons (48-49, 52-53) sont 56-57 et 60-61 en V02 : aucun renvoi au guide n'y
        # mène. Les pages 48-49 du manuel route de 2021, elles, sont justes.
        for lien in dom.selectionner(self.section, "a.src"):
            if QSG in lien.get("href"):
                self.assertIsNone(re.search(r"p\.(48|49|52|53)\b", lien.texte()), lien.texte())
        self.assertIsNone(re.search(r"(?:QSG|guide)(?: V0\d)? p\.(?:48|49|52|53)\b", texte))
        cf7 = re.compile(r"(?<![0-9a-z#])CF[\s_-]*7(?![0-9])|4553", re.I)
        self.assertIsNone(cf7.search(texte))
        self.assertIsNone(cf7.search(html))
        for adresse in ("manualslib", "bike-magazin", "nminus1", "99spokes", "rosebikes", "decathlon",
                        "bike-components", "app.canyon.com", "/en-qa/", "GADBR01-10", "MAN_WXWXXXXXX1610S",
                        "torque-specifications-and-concepts", "V0waw53NNHA"):
            self.assertNotIn(adresse, html, adresse)
        # L'axe arrière RWS n'est pas confirmé : ses 15 à 20 Nm ne sont jamais un couple à appliquer.
        self.assertNotIn('<span class="nm">15', self.source)
        # Les pédales PD-ME700 se serrent à la clé plate de 15 mm seule : ni Allen de 8 ni de 6 mm (1.6).
        pedales = texte_de(self.par_id["montage-pedales"].section)
        for absent in ("8\xa0mm", "Allen de 8", "Allen de 6", "six-pans de 6", "six-pans de 8"):
            self.assertNotIn(absent, pedales, absent)

    def test_aucune_donnee_personnelle(self):
        verifier_aucune_donnee(self, self.texte_complet(), self.source)
        texte = self.texte_complet().replace("\u00a0", " ")
        # Ni commande ni prix : « recommande » reste permis.
        self.assertIsNone(re.search(r"\b(?:commandes?|prix)\b", texte, re.I))
        # Aucune pression hors des maximums des documents : 3,0 bar (Canyon), 4 bar (paire GR 30 CF, Schwalbe).
        self.assertLessEqual(set(re.findall(r"(\d+(?:,\d+)?) bar\b", texte)), {"3,0", "4"})
        # 1.8 donne la méthode seulement : aucune cote hors de celles des documents, aucun angle.
        position = texte_de(self.par_id["montage-position"].section)
        self.assertIn("ailleurs que sur ce site", position)
        self.assertNotIn("\u00b0", position)
        cotes = set(re.findall(r"(\d+(?:,\d+)?)\u00a0mm", position))
        self.assertLessEqual(cotes, {"3", "4", "5", "6", "7", "18", "60", "75", "110", "210", "440", "710", "810"})

    def test_contradictions(self):
        # Chaque contradiction du relevé qui touche un atelier est dite sur sa page, avec la valeur appliquée.
        attendu = {
            "montage-cintre": ("2021", "4,5-5,5", "QSG V02"),  # couples de potence
            "montage-selle": ("2021", "5\xa0Nm", "6\xa0Nm"),  # collier
            "montage-roues": ("12x148", "4 bars/58PSI", "3,0\xa0bar s'applique", "DT SWISS", "levier"),  # axes et pression
            "montage-deballer": ("Organza", "Boîte à outils Canyon"),  # contenu du carton
            "montage-controles": ("120\xa0kg", "130\xa0kg", "1CX"),  # charge totale
            "montage-pedales": ("XT",),  # pédale de la photo officielle
        }
        for ident, mots in attendu.items():
            with self.subTest(ident):
                notes = [n for n in dom.selectionner(self.par_id[ident].section, "aside.note")
                         if texte_de(dom.selectionner(n, "p.note-t")[0]).startswith("Contradiction")]
                self.assertTrue(notes, ident)
                texte = " ".join(texte_de(n) for n in notes)
                for mot in mots:
                    self.assertIn(mot, texte, mot)
                self.assertTrue(any(m in texte for m in ("retenu", "appliqu", "s'impose", "prime")), texte[:160])

    def test_a_lire_a_la_livraison(self):
        # 1.2 : la liste du relevé « À lire sur la pièce ou sur l'outil à la livraison », à cocher.
        section = self.par_id["montage-deballer"].section
        (liste,) = dom.selectionner(section, "ul.check")
        self.assertEqual(liste.get("data-key"), "montage-releve")
        (bouton,) = dom.selectionner(section, "button.btn-reset")
        self.assertEqual(bouton.get("data-reset"), "montage-releve")
        points = dom.selectionner(liste, "li")
        self.assertGreaterEqual(len(points), 14)
        for n, li in enumerate(points, 1):
            self.assertEqual(dom.selectionner(li, "input")[0].get("id"), f"ck-montage-releve-{n}")
            self.assertTrue(dom.selectionner(li, "span.verif"), texte_de(li)[:80])
        tout = " ".join(texte_de(li) for li in points) + liste.html()
        for mot in ("clé dynamométrique Canyon", "p.72", "ZERO GAP", "GP0596-01", "MIN", "FLIP HEAD", "75\xa0mm",
                    "entretoises", "Axe avant", "Axe arrière", "flanc", "jante", "L et R", "1,0\xa0mm", "SPD",
                    "BT-DN320", "CR1632", "Réflecteurs", "#freins-systeme"):
            self.assertIn(normaliser(mot), tout, mot)

    def test_di2_premier_jour(self):
        di2 = texte_de(self.par_id["montage-di2"].section)
        for mot in ("RD-M8250", "△", "lock", "Single-click", "solid blue", "function button", "manivelle",
                    "pas nécessaire", "QSG V02 p.32"):
            self.assertIn(mot, di2, mot)

    def test_pied_d_atelier(self):
        # L'interdiction Canyon est en 1.1 et rappelée en 1.4.
        for ident in ("montage-avant", "montage-selle"):
            texte = texte_de(self.par_id[ident].section)
            self.assertIn("mâchoires", texte, ident)
            self.assertIn("Do not clamp carbon frames or seat posts", texte, ident)

    def test_renvois_freins(self):  # 1.9 renvoie à 2.4 et 2.6 sans les recopier
        self.assertIn('href="#freins-rodage"', self.html_de("montage-controles"))
        self.assertIn('href="#freins-controles"', self.html_de("montage-controles"))
        section = self.par_id["montage-controles"].section
        texte = texte_de(section)
        for recopie in ("20 fois", "vitesse moyenne", "allure de la marche"):
            self.assertNotIn(recopie, texte, recopie)
        premiere, chaque = dom.selectionner(section, "ul.check")
        self.assertEqual((premiere.get("data-key"), chaque.get("data-key")), ("montage-premiere", "montage-chaque"))
        self.assertGreaterEqual(len(dom.selectionner(premiere, "li")), 4)
        self.assertGreaterEqual(len(dom.selectionner(chaque, "li")), 6)

    def test_pression_maximale_comme_au_lot_3(self):
        # Une pression au-dessus de 3,0 bar n'est écrite qu'entre « », comme au chapitre 3 (TestTubeless), dans une
        # ligne qui dit « 3,0 bar s'applique » et cite le manuel Canyon des roues, la raison. En 1.5, la page de la paire
        # GR 30 CF et la fiche du pneu annoncent 4 bar : elles sont citées, puis 3,0 bar s'applique.
        vues = 0
        for a in self.ch.ateliers:
            for ligne in lignes_de(a.section):
                texte = texte_de(ligne)
                for debut, haut, unite, _ in pressions(texte):
                    if haut <= LIMITE[unite]:
                        continue
                    vues += 1
                    self.assertTrue(dans_une_citation(texte, debut), f"{a.id} : hors citation : {texte[debut:debut + 30]}")
                    self.assertIn(S_APPLIQUE, texte, f"{a.id} : {texte[:160]}")
                    liens = [x for x in dom.selectionner(ligne, "a.src") if MANUEL_ROUES in x.get("href")]
                    self.assertTrue(liens, f"{a.id} : la raison, le manuel des roues, n'est pas citée : {texte[:160]}")
        self.assertGreaterEqual(vues, 3)  # « 4 bars/58PSI » (deux valeurs) et « max. Bar: 4 Bar », en 1.5
        self.assertNotIn("s'impose donc", self.texte_complet())
        # M4 de la relecture finale du lot 3 : la pression de roulage n'est publiée ni par Canyon ni par Schwalbe pour
        # ta roue et ton pneu, mais 3.4 donne la méthode et le repère Canyon ; 1.5, lue avant 3.4 le jour J, y renvoie.
        etapes = self.etapes_de("montage-roues")
        gonfle = etapes[self.rang(etapes, "Gonfle")][1]
        self.assertIn("la méthode et le repère Canyon\u00a0: 3.4", gonfle)
        (li,) = [li for li in dom.selectionner(self.par_id["montage-roues"].section, "ol.steps > li")
                 if texte_de(li).startswith("Gonfle")]
        self.assertTrue([a for a in dom.selectionner(li, "a") if a.get("href") == "#tubeless-pression"])

    def test_typographie(self):
        # Le texte du source, balises remplacées par un séparateur (deux cellules voisines ne se collent pas).
        texte = re.sub(r"<[^>]*>", " | ", self.source) + " | " + " | ".join(aria_labels(self.section))
        self.assertIsNone(re.search("[\u2014\u2013]", self.source))
        # Une valeur et son unité sont séparées par une espace insécable, comme au chapitre 2.
        motif = r".{0,40}\d (?:Nm|N·m|mm|bar|kg|PSI|V|A|s|%)(?![\w·])"
        self.assertIsNone(re.search(motif, texte), re.search(motif, texte))
        self.assertNotIn("&nbsp;", self.source)
        # Une seule notation des couples, celle de la légende du site et du chapitre 2 : Nm, jamais N·m.
        self.assertNotIn("N\u00b7m", self.source)

    def test_potence_realigner_ou_hauteur(self):
        # 1.3 : une seule liste d'étapes. Réaligner la potence (sans toucher aux entretoises) et changer la hauteur
        # du cintre sont deux suites distinctes, avec les gestes du manuel route 2021 ; le capuchon à 2 Nm et le pivot
        # à 6 Nm sont dans des étapes, donc dans la boîte « Couples de l'atelier ».
        a = self.par_id["montage-cintre"]
        self.assertEqual(dom.selectionner(a.section, "ol"), dom.selectionner(a.section, "ol.steps"))
        titres = [e.titre for e in a.etapes]
        realigner = [i for i, e in enumerate(a.etapes) if e.titre.startswith("Réaligner")]
        hauteur = [i for i, e in enumerate(a.etapes) if e.titre.startswith("Hauteur")]
        self.assertGreaterEqual(len(realigner), 4, titres)
        self.assertGreaterEqual(len(hauteur), 6, titres)
        self.assertLess(max(realigner), min(hauteur))
        for groupe in (realigner, hauteur):
            couples = [c for i in groupe for c in a.etapes[i].couples]
            self.assertIn("2\u00a0Nm", couples)
            self.assertIn("6\u00a0Nm", couples)
            # La vis du capuchon (2 Nm) passe avant les vis du pivot (6 Nm).
            premier = {c: min(i for i in groupe if c in a.etapes[i].couples) for c in ("2\u00a0Nm", "6\u00a0Nm")}
            self.assertLess(premier["2\u00a0Nm"], premier["6\u00a0Nm"])
        texte = texte_de(a.section)
        for mot in ("Ne retire ni le capuchon ni les entretoises", "Keep hold of the fork", "Remount the stem entirely",
                    "carbon assembly paste", "irreversible", "entre tes genoux", "cuvette du haut", "trop serré",
                    "Centre the handlebars accurately", "drops", "This is a job for experts only", "encoche"):
            self.assertIn(mot, texte, mot)

    def test_pas_a_pas_de_la_potence(self):
        # Le mode pas à pas ne montre que le titre et le corps de chaque étape, en ligne droite : l'avertissement du
        # pivot en carbone et les sorties de branche doivent donc être dans les corps des étapes de 1.3.
        a = self.par_id["montage-cintre"]
        etapes = dom.selectionner(a.section, "ol.steps > li")

        def corps(n):
            return " ".join(texte_de(e) for e in elements(etapes[n - 1]) if "st-t" not in e.classes())
        for n in (9, 15):
            for mot in ("Pivot en carbone", "This is a job for experts only", "clé Canyon", "2\u00a0Nm", "ne commence pas"):
                self.assertIn(mot, corps(n), f"étape {n} : {mot}")
        self.assertIn("Fin du réalignement", corps(14))
        self.assertIn("ne fais pas l'étape 15", corps(14))
        for n in (8, 14):
            self.assertIn("ferme le mode pas à pas", corps(n).lower(), n)
        titres = [e.titre for e in a.etapes]
        self.assertEqual(len(titres), 24)
        self.assertTrue(all(t.startswith("Réaligner") for t in titres[8:14]), titres[8:14])
        self.assertTrue(all(t.startswith("Hauteur") for t in titres[14:]), titres[14:])
        # L'alignement de l'étape 8 demande la roue avant : 1.5 renvoie à l'étape 8 de 1.3, par son ancre, une fois la
        # roue montée. L'ancre est dans le corps de l'étape 8 : le lien ouvre l'étape, et le pas à pas en retire l'id.
        self.assertIn('href="#montage-cintre-8"', self.html_de("montage-roues"))
        (ancre,) = dom.selectionner(a.section, '[id="montage-cintre-8"]')
        self.assertEqual(dom.selectionner(etapes[7], '[id="montage-cintre-8"]'), [ancre])
        self.assertNotIn("st-t", ancre.classes())

    def test_corrections_de_la_relecture(self):
        par_id, texte = self.par_id, self.texte_complet()
        # Cale de transport et calages de carton retirés en étapes à part ; le vélo retourné sur la selle et le cintre.
        roues = texte_de(par_id["montage-roues"].section)
        for mot in ("Retire la cale de transport de l'étrier", "Retire le calage de carton de la fourche",
                    "Retire le calage de carton des pattes arrière", "sur la selle et le cintre", "cadenas"):
            self.assertIn(mot, roues, mot)
        for absent in ("cale orange", "posé sur son calage", "repose sur son calage"):
            self.assertNotIn(absent, texte, absent)
        # Le levier de l'encadré « Shimano » est à lire sur la pièce.
        (levier,) = [li for li in dom.selectionner(par_id["montage-roues"].section, "ol.steps > li") if "cadenas" in li.texte()]
        self.assertTrue(dom.selectionner(levier, "span.verif"))
        # 1.9 cite la page 60 pour la liste d'avant la première sortie.
        self.assertIn("QSG V02 p.60", texte_de(dom.selectionner(par_id["montage-controles"].section, "ul.check > li")[0]))
        # Les pages des manuels Canyon sont les pages imprimées, avec la page du PDF.
        vus = 0
        for lien in dom.selectionner(self.section, "a.src"):
            if "Canyon%20RR" in lien.get("href") or "wheelset-manual" in lien.get("href"):
                vus += 1
                self.assertRegex(lien.texte(), r"p\.\d+(-\d+)? imprimées? \(PDF p\.\d+\)$", lien.texte())
        self.assertGreaterEqual(vus, 40)
        # Une étape à 2, 2,5 ou 7 Nm nomme la clé Canyon dès son titre, que reprend la boîte des couples, avec sa
        # réserve : la boîte ne recopie que le titre, qui ne doit pas affirmer que la clé Canyon convient.
        for a in self.ch.ateliers:
            for e in a.etapes:
                if any(HORS_OUTILS.search(c) for c in e.couples):
                    self.assertIn("(clé Canyon, si sa plage le permet)", e.titre, e.titre)
        # Si la clé Canyon ne couvre pas ces couples : une proposition sans valeur, et le service client Canyon.
        (secours,) = [n for n in dom.selectionner(par_id["montage-avant"].section, "aside.note.prop")
                      if "service client Canyon" in n.texte()]
        self.assertIn("comme à la livraison", texte_de(secours))
        self.assertEqual(dom.selectionner(secours, "span.nm"), [])
        # Deux petites inexactitudes de la première version.
        self.assertEqual(par_id["montage-cintre"].demonter, "Rien. Le capot de la potence se dépose aux étapes 1 et 2.")
        self.assertNotIn("1.2 à 1.9 suivent", texte_de(par_id["montage-avant"].section))
        # Le sens de la pédale gauche renvoie à la flèche de l'étape 8.2 du guide.
        (gauche,) = [li for li in dom.selectionner(par_id["montage-pedales"].section, "ol.steps > li")
                     if "Left-hand thread" in li.texte()]
        self.assertIn("8.2", texte_de(gauche))
        self.assertIn("QSG V02 p.20", texte_de(gauche))

    # ---- Vague finale du lot 2 ----

    def etapes_de(self, ident):
        """Les étapes d'un atelier : (titre, texte complet du li), dans l'ordre."""
        lis = dom.selectionner(self.par_id[ident].section, "ol.steps > li")
        return [(normaliser(e.titre).replace("\xa0", " "), texte_de(li)) for e, li in zip(self.par_id[ident].etapes, lis)]

    def rang(self, etapes, debut):
        """Le rang (0, 1...) de la seule étape dont le titre commence par `debut`."""
        rangs = [i for i, (t, _) in enumerate(etapes) if t.startswith(debut)]
        self.assertEqual(len(rangs), 1, f"{debut} : {[t for t, _ in etapes]}")
        return rangs[0]

    def test_pose_des_cales_dans_l_ordre_shimano(self):  # I1
        # Les gestes de la section « Installing the cleats » du DM-MAPD001-07, dans son ordre : cache en caoutchouc,
        # écrou de cale, cale posée dans le sens de la flèche « Toe side » avec sa rondelle, serrage provisoire, place
        # vérifiée pied par pied (une consigne Shimano, plus une proposition), serrage final, joints étanches.
        etapes = self.etapes_de("montage-pedales")
        ordre = [self.rang(etapes, d) for d in (
            "Retire le cache en caoutchouc", "Place l'écrou de cale",
            "Pose la cale, bout étroit vers la pointe du pied, d'après la figure de Shimano",
            "Serre-la d'abord à 2,5", "Vérifie la place de chaque cale, pied par pied", "Serre-la à 5-6",
            "Pose les joints étanches")]
        self.assertEqual(ordre, sorted(ordre))
        self.assertEqual(ordre[1:], [ordre[0] + k for k in range(1, 7)])
        cles = ("cache", "ecrou", "pose", "provisoire", "place", "final", "joints")
        corps = {cle: etapes[i][1] for cle, i in zip(cles, ordre)}
        for cle, mots in {
            "cache": ("Remove the rubber cover", "may not be necessary", "tournevis cruciforme", "selon ta chaussure"),
            "ecrou": ("Set the cleat nut", "semelle intérieure", "trous oblongs", "selon ta chaussure"),
            "pose": ("Toe side", "Cleat washer", "rondelle", "triangle", "à lire sur la pièce", "pied gauche comme au droit",
                     "une seule par chaussure"),
            "place": ("Repeatedly adjust and confirm for each foot", "20\xa0mm", "5\xa0mm"),
            "joints": ("waterproof seals", "SHIMANO"),
        }.items():
            for mot in mots:
                self.assertIn(mot.lower(), corps[cle].lower(), f"{cle} : {mot}")
        lis = dom.selectionner(self.par_id["montage-pedales"].section, "ol.steps > li")
        for cle, i in zip(cles, ordre):
            hrefs = [a.get("href") for a in dom.selectionner(lis[i], "a.src")]
            self.assertIn("https://si.shimano.com/en/dm/MAPD001/attachi_cleat", hrefs, cle)
        # Le sens de la cale est une lecture de la figure, dite comme telle dans la légende 3D aussi (R1).
        (legende,) = dom.selectionner(self.par_id["montage-pedales"].section, "figure.v3d > figcaption")
        self.assertIn("bout étroit vers la pointe du pied, d'après la figure de Shimano", texte_de(legende))
        # La vérification de la place n'est plus une simple proposition.
        for prop in dom.selectionner(self.par_id["montage-pedales"].section, "aside.note.prop"):
            self.assertNotIn("place de la cale", texte_de(prop))
        # Le relevé cite ces gestes mot pour mot, avant le site.
        releve = (RACINE / "docs" / "recherche" / "montage-cf8-di2.md").read_text(encoding="utf-8")
        for citation in ("Remove the rubber cover for the cleat mounting holes.", "Set the cleat nut.", "Toe side",
                         "Cleat washer", "Confirm the optimal cleat positions.", "Cross head screwdriver[#2]",
                         "If your SHIMANO shoes came packaged with waterproof seals"):
            self.assertIn(citation, releve, citation)

    def test_se_servir_des_outils_dynamometriques(self):  # I2
        # Le texte, et pas seulement une pastille 3D, apprend à se servir de la TW-6.2 et de l'ATD-1.2, d'après Park
        # Tool, fabricant de ces outils : le levier du cliquet, la bague, le déclic puis lâcher, le rangement ; le
        # déclic de l'ATD-1.2 et son sens horaire seul ; le levier à gauche pour la pédale gauche ; la tête de clé
        # plate montée à angle droit, sans chiffre de correction.
        avant = dom.selectionner(self.par_id["montage-avant"].section, "ul > li")
        tw = " ".join(texte_de(li) for li in avant if "TW-6.2" in texte_de(li))
        for mot in ("levier du cliquet", "à droite", "à gauche", "bague de verrouillage", "ligne rouge", "déclic",
                    "lâche aussitôt", "Immediately release force from torque wrench", "plus petit chiffre"):
            self.assertIn(mot, tw, mot)
        atd = " ".join(texte_de(li) for li in avant if "ATD-1.2" in texte_de(li))
        for mot in ("loud", "déclic", "sens horaire", "only for setting torque clockwise", "vitesse régulière"):
            self.assertIn(mot, atd, mot)
        notice = "parktool.com/assets/doc/product/TW-5.2_TW-6.2_instructions.pdf"
        self.assertIn(notice, self.html_de("montage-avant"))
        self.assertIn("parktool.com/en-us/blog/repair-help/torque-wrench-use-and-care", self.html_de("montage-avant"))
        # Pédales : le levier du cliquet de chaque côté, et la tête de clé plate à angle droit.
        etapes = self.etapes_de("montage-pedales")
        serrage = etapes[self.rang(etapes, "Serre chaque pédale")][1]
        for mot in ("pédale gauche", "levier à gauche", "Flip ratchet lever to the left",
                    "the left pedal has a left-hand thread", "On en déduit, en regardant la pédale par le côté extérieur du vélo",
                    "Park Tool et Shimano ne l'écrivent pas pour une pédale", "étape 8.2 pour la gauche et 8.3 pour la droite",
                    "left hand and right hand threading", "déclic", "angle droit", "re-calculate the needed torque",
                    "TWB-15"):
            self.assertIn(mot, serrage, mot)
        # La déduction suit la citation Shimano, jamais l'inverse (R2), et la proposition dit comment voir l'erreur.
        self.assertLess(serrage.index("the left pedal has a left-hand thread"), serrage.index("On en déduit"))
        props = " ".join(texte_de(n) for n in dom.selectionner(self.par_id["montage-pedales"].section, "aside.note.prop"))
        self.assertIn("vérifie que la clé entraîne la vis dans le sens où tu tournes", props)
        self.assertIn("pour une pédale", " ".join(texte_de(li) for li in avant if "TW-6.2, le sens" in texte_de(li)).lower())
        lis = dom.selectionner(self.par_id["montage-pedales"].section, "ol.steps > li")
        hrefs = [a.get("href") for a in dom.selectionner(lis[self.rang(etapes, "Serre chaque pédale")], "a.src")]
        self.assertIn("https://www.parktool.com/assets/doc/product/TW-1_TW-2_instructions.pdf", hrefs)
        self.assertIn("https://www.parktool.com/en-us/product/pedal-wrench-crow-foot-twb-15", hrefs)
        # Aucun chiffre de correction : ni pourcentage ni couple corrigé dans l'étape.
        self.assertNotIn("%", serrage)
        self.assertLessEqual(set(re.findall(r"\d+(?:[,-]\d+)*\xa0Nm", serrage)), {"35-55\xa0Nm", "60\xa0Nm"})
        # Axe avant : arrêt au déclic.
        roues = self.etapes_de("montage-roues")
        self.assertIn("déclic", roues[self.rang(roues, "Serre l'axe avant")][1])

    def test_tige_de_selle_sans_perdre_la_hauteur(self):  # M1 et laissé n°3 de task-2-rereview
        # 1.4 : pour l'inclinaison, d'abord la plage de la clé Canyon, puis desserrer le collier, puis sortir la tige.
        selle = self.etapes_de("montage-selle")
        sortie = selle[self.rang(selle, "Pour l'inclinaison, sors la tige du cadre")][1]
        for mot in ("clé Canyon", "7\xa0Nm", "ne commence pas", "desserre", "collier"):
            self.assertIn(mot, sortie.lower() if mot == "desserre" else sortie, mot)
        self.assertLess(sortie.index("clé Canyon"), sortie.lower().index("desserre"))
        # 1.8 : l'inclinaison avant la hauteur, le contrôle de la clé Canyon d'abord, et la selle alignée.
        position = self.etapes_de("montage-position")
        incl, haut = (self.rang(position, d) for d in ("Reporte l'inclinaison", "Règle la hauteur de selle"))
        self.assertLess(incl, haut)
        corps = position[incl][1]
        for mot in ("clé Canyon", "ne commence pas", "desserre le collier"):
            self.assertIn(mot.lower(), corps.lower(), mot)
        self.assertLess(corps.index("clé Canyon"), corps.lower().index("desserre le collier"))
        self.assertIn("axe du cadre", position[haut][1])
        self.assertIn("Desserre le collier (1.4, étape 1) s'il ne l'est pas déjà", position[haut][1])

    def test_potence_gestes_de_canyon(self):  # M2 et laissés n°4 et n°5 de task-2-rereview
        cintre = self.etapes_de("montage-cintre")
        texte = texte_de(self.par_id["montage-cintre"].section)
        self.assertNotIn("assis sur la selle", texte)
        self.assertIn("en appuyant de ton poids sur la selle", texte)
        self.assertIn("Bring your weight to bear on the saddle", texte)
        # Les entretoises : retirées, potence renfilée, puis replacées, dans les deux sens de la double flèche.
        retire, renfile = (self.rang(cintre, d) for d in ("Hauteur : retire les entretoises",
                                                         "Hauteur : renfile la potence"))
        self.assertLess(retire, renfile)
        self.assertNotIn("au-dessus", cintre[retire][0])
        for mot in ("double flèche", "monter le cintre", "baisser le cintre", "au-dessus"):
            self.assertIn(mot, cintre[renfile][1] + cintre[retire][1], mot)
        self.assertIn("D'après le dessin du guide (encadré de la page 56, double flèche), et non d'après un texte Canyon\xa0:",
                      cintre[retire][1])
        self.assertIn("d'après le dessin du guide et non d'après un texte Canyon", cintre[renfile][1])
        self.assertNotIn("dans l'ordre", cintre[retire][1])
        props = " ".join(texte_de(n) for n in dom.selectionner(self.par_id["montage-cintre"].section, "aside.note.prop"))
        self.assertIn("entretoises", props)

    def test_di2_dans_l_ordre_shimano(self):  # M3 et M4
        di2 = self.etapes_de("montage-di2")
        batterie, cable = (self.rang(di2, d) for d in ("Mets la batterie dans le chargeur", "Branche le câble USB"))
        self.assertEqual((batterie, cable), (2, 3))
        self.assertIn("Install the battery to the battery charger", di2[batterie][1])
        self.assertIn("Connect the USB cable to the USB port of the battery charger", di2[cable][1])
        appairage = di2[self.rang(di2, "Si rien ne passe, appaire")][1]
        for mot in ("Do not operate another shift switch", "une seule manette de chaque côté"):
            self.assertIn(mot, appairage, mot)

    def test_pastilles_masquees_dites_dans_l_aide(self):  # point parqué n°4
        # La visionneuse commune (src/js/viewer.js, aussi aux freins) dessine un numéro même quand une pièce cache son
        # ancre. Plutôt que de masquer par lancer de rayon des pastilles des freins déjà en ligne, l'aide de chaque
        # pièce 3D, sa légende, le dit, aux deux chapitres.
        for texte in (self.source, FREINS):
            legendes = [texte_de(f) for f in dom.selectionner(dom.analyser(texte), "figure.v3d > figcaption")]
            self.assertTrue(legendes)
            for legende in legendes:
                self.assertIn("Touche un numéro pour repérer la pièce. Un numéro peut se dessiner par-dessus une pièce "
                              "qui cache la sienne\xa0: fais tourner la pièce, ou lis la liste numérotée sous la figure.",
                              legende, legende[:60])

    def test_abreviations_par_page(self):
        # Chaque atelier devient sa propre page : une abréviation y est développée avant ou juste après sa première
        # apparition, liens compris.
        developpements = {"QSG": "guide de démarrage Canyon", "RWS": "système d'axe à levier de DT Swiss",
                          "PDF": "Portable Document Format", "ASTM": "American Society for Testing and Materials",
                          "SPD": "système de cales Shimano", "DM": "Dealer's Manual", "UM": "User's Manual"}
        vues = set()
        for a in self.ch.ateliers:
            texte = texte_de(a.section)
            for abr, dev in developpements.items():
                m = re.search(r"\b" + abr + r"\b", texte)
                if m:
                    vues.add(abr)
                    i = texte.find(dev)
                    self.assertTrue(0 <= i <= m.start() + 40, f"{a.id} : {abr}")
        self.assertEqual(vues, set(developpements))

    def test_texte_conserve(self):
        # Comme pour Freins : les deux colonnes de chaque page gardent tout le texte du source.
        verifier_texte_conserve(self, self.ch.ateliers)


# ---------------------------------------------------------------------------------------------------------------
# Chapitre 3, Pneus et tubeless : relu depuis son fragment, hors publication (le lot 3 reste « à faire »)
# ---------------------------------------------------------------------------------------------------------------

TUBELESS = RACINE / "src" / "parts" / "30-tubeless.html"
RELEVE_TUBELESS = RACINE / "docs" / "recherche" / "tubeless-cf8-di2.md"
MANUEL_ROUES = "canyon-wheelset-manual-2025.pdf"
_N = r"\d+(?:[.,]\d+)?"
_EN_LETTRES = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "eleven": 11,
               "un": 1, "deux": 2, "trois": 3, "quatre": 4, "cinq": 5, "onze": 11}
# Une pression écrite : un nombre ou une plage (« 1,9-2,2 », « 2.5 à 4.5 »), en chiffres ou en lettres (« four bars »),
# puis bar ou psi, au besoin après le » d'une citation (« 3.0 » bar).
PRESSION = re.compile(r"(?<![\d.,])(" + _N + r"|\b(?:" + "|".join(_EN_LETTRES) + r"))(?:[\s\u00a0]*(?:-|à|to)[\s\u00a0]*("
                      + _N + r"))?[\s\u00a0]*(?:»[\s\u00a0]*)?(bars?|psi)\b", re.I)
VOLUME = re.compile(r"(?<![\d.,])" + _N + r"[\s\u00a0]*(?:»[\s\u00a0]*)?ml\b", re.I)
LIMITE = {"bar": 3.0, "psi": 43.5}  # manuel Canyon des roues : « 3.0 » bar, « 43.5 » PSI pour 45 à 54 mm
# Les documents des fabricants des pièces et du matériel de Lamine, et les vidéos de leurs chaînes : aucun autre site.
OFFICIELS = {"www.canyon.com", "dma.canyon.com", "www.schwalbe.com", "www.topeak.com", "muc-off.com", "eu.muc-off.com",
             "d2a13k6araex7u.cloudfront.net", "www.youtube.com", "www.parktool.com"}
S_APPLIQUE = "3,0\u00a0bar s'applique"


def valeur(nombre):
    return float(_EN_LETTRES[nombre.lower()] if nombre.lower() in _EN_LETTRES else nombre.replace(",", "."))


def pressions(texte):
    """Chaque pression du texte : (début, valeur la plus haute, unité « bar » ou « psi », nombres lus)."""
    for m in PRESSION.finditer(texte):
        nombres = [valeur(n) for n in m.groups()[:2] if n]
        yield m.start(), max(nombres), "bar" if m.group(3).lower().startswith("bar") else "psi", nombres


def dans_une_citation(texte, i):
    """Vrai si la position `i` est entre « et »."""
    return texte[:i].count("«") > texte[:i].count("»")


def lignes_tubeless(racine):
    """Les lignes du chapitre 3, questions de 3.6 comprises."""
    return lignes_de(racine, questions=True)


class TestTubeless(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = TUBELESS.read_text(encoding="utf-8")
        cls.releve = RELEVE_TUBELESS.read_text(encoding="utf-8")
        cls.ch = ateliers.relever_chapitre(cls.source)
        cls.par_id = {a.id: a for a in cls.ch.ateliers}
        cls.section = cls.ch.tete.parent

    def texte_complet(self):
        return texte_de(self.section)

    def texte_atelier(self, ident):
        return texte_de(self.par_id[ident].section)

    def lignes(self):
        return [texte_de(l) for l in lignes_tubeless(self.section)]

    def paragraphes(self):
        """Les lignes, mais une étape de plusieurs paragraphes compte pour autant d'unités : la règle des 3,0 bar
        s'applique au paragraphe (« dont le même paragraphe dit 3,0 bar s'applique »), le titre allant avec le premier."""
        unites = []
        for ligne in lignes_tubeless(self.section):
            corps = [e for e in elements(ligne) if e.tag == "p" and "st-t" not in e.classes()] if ligne.tag == "li" else []
            if len(corps) > 1:
                titre = [e for e in elements(ligne) if "st-t" in e.classes()]
                unites += [(titre + [corps[0]])] + [[p] for p in corps[1:]]
            else:
                unites.append([ligne])
        return unites

    def textes_lus(self):
        """Tout ce que le visiteur lit ou entend : les lignes, les aria-label, les titres h3, et les attributs data-de,
        data-vers et title, que la page de l'atelier affiche."""
        titres = [texte_de(h) for h in dom.selectionner(self.section, "h3")]
        attributs = [normaliser(e.get(nom)) for nom in ("data-de", "data-vers", "title")
                     for e in dom.selectionner(self.section, f"[{nom}]")]
        return self.lignes() + aria_labels(self.section) + titres + attributs

    def etapes_de(self, ident):
        """Les étapes d'un atelier : (titre, corps), le corps sans le titre, comme le montre le mode pas à pas."""
        return [(texte_de(dom.selectionner(li, "p.st-t")[0]),
                 " ".join(texte_de(e) for e in elements(li) if "st-t" not in e.classes()))
                for li in dom.selectionner(self.par_id[ident].section, "ol.steps > li")]

    def corps(self, ident, debut):
        """Le corps de la seule étape de l'atelier dont le titre commence par `debut`."""
        trouvees = [c for t, c in self.etapes_de(ident) if t.startswith(debut)]
        self.assertEqual(len(trouvees), 1, f"{ident} : {debut} : {[t for t, _ in self.etapes_de(ident)]}")
        return trouvees[0]

    def test_chapitre(self):
        self.assertEqual(self.ch.id, "tubeless")
        self.assertEqual((self.section.tag, self.section.classes()), ("section", ["chapter"]))
        (num,) = dom.selectionner(self.ch.tete, "p.ch-num")
        self.assertEqual(num.texte(), "Chapitre 3 · Pneus et tubeless")
        self.assertEqual(dom.selectionner(self.ch.tete, "h2")[0].texte(), "Pneus et tubeless")
        ids = [e.get("id") for e in dom.selectionner(dom.analyser(self.source), "[id]")]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sorted(self.ch.resumes), ["ordre"])

    def test_publie(self):
        # Le lot 3 est publié en relecture, avec ce chapitre et ses deux pièces 3D, sans « prevu » : sa catégorie
        # montre ses ateliers.
        config = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
        (lot,) = [l for l in config["lots"] if l["lot"] == 3]
        self.assertEqual((lot["statut"], lot["parts"], lot["modeles"]),
                         ("en relecture", ["30-tubeless"], ["rim", "plug"]))
        self.assertNotIn("prevu", lot)

    def test_ateliers_ids_types_zones(self):
        self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
            ("tubeless-materiel", "3.1", "comprendre", "pneus"), ("tubeless-passer", "3.2", "remplacer", "pneus"),
            ("tubeless-liquide", "3.3", "entretenir", "pneus"), ("tubeless-pression", "3.4", "regler", "pneus"),
            ("tubeless-crevaison", "3.5", "entretenir", "pneus"), ("tubeless-problemes", "3.6", "comprendre", "pneus")])

    def test_remplacer_passer(self):
        p = self.par_id["tubeless-passer"]
        self.assertEqual((p.de, p.vers), ("Chambres à air si le vélo en est livré (à lire sur la pièce)",
                                          "Tubeless\xa0: valves, liquide Muc-Off"))
        for a in self.ch.ateliers:
            if a.id != "tubeless-passer":
                self.assertEqual((a.de, a.vers), (None, None), a.id)

    def test_blocs_par_type(self):
        # Une fiche « comprendre » n'a aucun bloc de gestes, les autres types les ont tous ; chacune a sa vidéo.
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                presents = [g for g in GESTES if dom.selectionner(a.section, g)]
                self.assertEqual(presents, [] if a.type == "comprendre" else list(GESTES))
                self.assertTrue(dom.selectionner(a.section, "ul.media") + dom.selectionner(a.section, "p.a-video"))
                videos = [h for h in elements(a.section) if h.tag == "h4" and h.texte() in ateliers.VIDEO]
                self.assertEqual(len(videos), 1)
                if a.type != "comprendre":
                    self.assertTrue(a.outils and a.etapes and a.demonter)
                    self.assertEqual(len(dom.selectionner(a.section, "ol.steps")), 1)
                gauche, droite = ateliers.colonnes(a)
                self.assertEqual(dom.selectionner(dom.analyser(gauche + droite), "[hidden]"), [])

    def test_figures_3d(self):
        # Les deux pièces de la tâche 2 : leurs légendes et leurs aria-label ne portent que des valeurs du relevé.
        attendu = {"tubeless-passer": ["rim"], "tubeless-crevaison": ["plug"]}
        mots = {"rim": ("GR 30 CF", "sans crochet", "27\xa0mm", "33\xa0mm", "30\xa0mm", "G-One RX", "45-622", "ruban",
                        "liquide", "Presta", "3,0\xa0bar", "approché"),
                "plug": ("TPT-1", "alèse", "mi-longueur", "6,35\xa0mm", "0,25\xa0pouce", "bague", "5 mèches", "approché")}
        releve = self.releve.replace(",", ".")
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                self.assertEqual(a.modeles, attendu.get(a.id, []))
                for figure in dom.selectionner(a.section, "figure.v3d"):
                    (scene,) = dom.selectionner(figure, "div.v3d-stage")
                    self.assertEqual(scene.get("role"), "img")
                    (legende,) = dom.selectionner(figure, "figcaption")
                    self.assertTrue(legende.texte().startswith(f"3D {a.num}"), legende.texte())
                    textes = [normaliser(scene.get("aria-label")), texte_de(legende)]
                    for mot in mots[figure.get("data-model")]:
                        for t in textes:
                            self.assertIn(mot, t, mot)
                    # Chaque nombre, hors du numéro de la figure et des pages citées, est un nombre du relevé.
                    for t in textes:
                        t = re.sub(r"\(PDF p\.\d+\)|p\.\d+ imprimée", "", t.replace(f"3D {a.num}", ""))
                        for n in re.findall(_N, t):
                            self.assertIn(n.replace(",", "."), releve, f"{n} : {t[:80]}")

    def test_jamais_plus_de_3_bar(self):  # Review Focus 1
        # Chaque pression écrite (bar, psi, en chiffres ou en lettres, plages comprises) est d'au plus 3,0 bar ou
        # 43,5 psi. Seule exception : une citation entre « », dans une ligne qui dit « 3,0 bar s'applique » et qui cite
        # le manuel Canyon des roues, la raison (la plus basse des sources, « always never exceed »).
        vues, citees = 0, 0
        textes = [" ".join(texte_de(e) for e in u) for u in self.paragraphes()] + self.textes_lus()[len(self.lignes()):]
        for texte in textes:
            for debut, haut, unite, _ in pressions(texte):
                vues += 1
                if haut <= LIMITE[unite]:
                    continue
                citees += 1
                self.assertTrue(dans_une_citation(texte, debut), f"hors citation : {texte[debut:debut + 30]} : {texte[:160]}")
                self.assertIn(S_APPLIQUE, texte, texte[:160])
        self.assertGreaterEqual(vues, 40)
        self.assertGreaterEqual(citees, 10)
        raisons = 0
        for unite in self.paragraphes():
            texte = " ".join(texte_de(e) for e in unite)
            if S_APPLIQUE in texte:
                raisons += 1
                liens = [a for e in unite for a in dom.selectionner(e, "a.src") if MANUEL_ROUES in a.get("href")]
                self.assertTrue(liens, texte[:160])
        self.assertGreaterEqual(raisons, 6)
        # Les citations qui disent de gonfler davantage sont toutes citées, comme contradictions.
        texte = self.texte_complet()
        for citation in ("Slightly over-inflate the tire for a short time", "Inflate the tire to at least the maximum pressure",
                         "pump as hard and as fast as you can", "always never exceed"):
            self.assertIn(citation, texte, citation)
        # Les consignes fausses du brouillon, et toute invitation française à dépasser.
        for absent in ("maximum du flanc", "au moins à la pression maximale", "jusqu'au maximum", "augmente brièvement",
                       "pression de talonnage de"):
            self.assertNotIn(absent, texte, absent)
        self.assertIsNone(re.search(r"\bsurgonfle\b", texte))  # « surgonfler », titre d'une contradiction, reste permis
        # Le motif lui-même : plages, lettres, unité après le guillemet, et rien d'autre.
        def lues(t):
            return [(h, u) for _, h, u, _ in pressions(t)]
        self.assertEqual(lues("« 4 bars/58PSI »"), [(4, "bar"), (58, "psi")])
        self.assertEqual(lues("« 3.0 » bar, « 43.5 » PSI"), [(3.0, "bar"), (43.5, "psi")])
        self.assertEqual(lues("« 160\xa0psi / 11\xa0bar »"), [(160, "psi"), (11, "bar")])
        self.assertEqual(lues("de 2.5 à 4.5 bar, 1,9-2,2\xa0bar, leave it at four bars"),
                         [(4.5, "bar"), (2.2, "bar"), (4, "bar")])
        self.assertEqual(lues("45\xa0mm, 70 à 80\xa0ml, 3,0\xa0bars"), [(3.0, "bar")])

    def test_reservoir_contre_pneu(self):  # Review Focus 2, et I1 de la relecture du 26/10
        # L'étape 12 charge le réservoir : sa charge de 11 bar n'est jamais la pression du pneu. À l'étape 13, au moment
        # du passage sur INFLATE, l'aiguille montre encore cette charge (dessin de STEP 4 dans la notice) : tu attends
        # qu'elle ne bouge plus ; à l'étape 14, tu lis l'échelle en bar et tu purges au-delà de 3,0 bar ; l'étape 15 dit
        # de ne jamais gonfler plus fort (N5 de la relecture finale : l'ancienne étape 13 coupée en trois). Vider le
        # réservoir vient en fin de chantier, à l'étape 24.
        charge = self.corps("tubeless-passer", "Ouvre la valve, puis charge le réservoir")
        talon = self.corps("tubeless-passer", "Talonne")
        lecture = self.corps("tubeless-passer", "Lis le manomètre en bar")
        echec = self.corps("tubeless-passer", "S'il ne talonne pas")
        roulage = self.corps("tubeless-passer", "Règle la pression de roulage")
        titres = [t for t, _ in self.etapes_de("tubeless-passer")]
        rangs = [i for i, t in enumerate(titres) if t.startswith(("Talonne", "Lis le manomètre", "S'il ne talonne pas"))]
        self.assertEqual(rangs, [12, 13, 14], titres)
        for mot in ("Pump to 160\u00a0psi / 11\u00a0bar for best results.", "CHARGE", "Air Chamber", "réservoir",
                    "pas dans le pneu", "jamais celle de ton pneu", S_APPLIQUE, "always never exceed",
                    "DO NOT squeeze tire when engaging pump head.", "DO NOT turn Mode Selector to mid-point between modes."):
            self.assertIn(mot, charge, mot)
        for mot in ("INFLATE", "l'aiguille montre encore la charge du réservoir", "«\u00a0160\u00a0psi / 11\u00a0bar\u00a0»",
                    "Ce n'est pas la pression de ton pneu\u00a0: dans le pneu, " + S_APPLIQUE,
                    "Proposition\u00a0: ne touche pas au bouton de purge pendant la bouffée, attends que l'aiguille ne bouge "
                    "plus."):
            self.assertIn(mot, talon, mot)
        for mot in ("Tant que l'aiguille montre la charge du réservoir, ce n'est pas ton pneu",
                    "Aiguille immobile, valve ouverte, le manomètre donne la pression du pneu", "lecture de ce site",
                    "Continue to pump to desired pressure immediately.", "Pump to desired pressure.", "échelle en bar",
                    "«\u00a043.5\u00a0» PSI", "Si l'aiguille immobile dépasse 3,0\u00a0bar", "Air Release Button",
                    "appuie sur le bouton de purge, «\u00a0Air Release Button\u00a0», jusqu'à 3,0\u00a0bar au plus",
                    "always never exceed", "DO NOT exceed the maximum air pressure of your tubeless tire.", "non publiée"):
            self.assertIn(mot, lecture, mot)
        # L'ordre du mode pas à pas : la charge vue au passage sur INFLATE et l'attente sans purger (étape 13), puis la
        # lecture et la purge elle-même, jusqu'à 3,0 bar au plus (étape 14) (N4 de la seconde relecture de la tâche 1).
        ordre = [talon.index(m) for m in ("charge du réservoir", "ne touche pas au bouton de purge", "ne bouge plus")]
        self.assertEqual(ordre, sorted(ordre))
        ordre = [lecture.index(m) for m in ("Aiguille immobile", "Si l'aiguille immobile dépasse",
                                            "appuie sur le bouton de purge", "jusqu'à 3,0\u00a0bar au plus")]
        self.assertEqual(ordre, sorted(ordre))
        for absent in ("Regarde aussitôt le manomètre", "dégonfle aussitôt", "Topeak n'écrit pas ce que le manomètre",
                       "DO NOT store pressurized air", "en haut du cadran"):
            self.assertNotIn(absent, talon + lecture + echec, absent)
        for mot in ("vide le réservoir", "DO NOT store pressurized air in Air Chamber when not in use."):
            self.assertIn(mot, roulage, mot)
        # Le relevé consigne ce que la notice dessine et écrit, à la source de cette étape.
        for fait in ("aiguille en haut de l'échelle, vers « 160 » psi", "« HOW TO INFLATE NORMAL TIRES »",
                     "« Pump to desired pressure. Press the Air Release Button", "de « 1 » à « 11 », marquée « BAR »",
                     "Dabei entweicht die komprimierte Luft aus dem Zylinder in den Reifen."):
            self.assertIn(fait, self.releve, fait)
        # 11 bar et 160 psi ne s'écrivent que dans les citations de Topeak, dans des lignes qui parlent du réservoir.
        vues = 0
        for texte in self.textes_lus():
            for debut, haut, unite, _ in pressions(texte):
                if haut in (11, 160):
                    vues += 1
                    self.assertTrue(dans_une_citation(texte, debut), texte[:160])
                    self.assertIn("réservoir", texte, texte[:160])
        self.assertGreaterEqual(vues, 2)

    def test_valve_presta_ouverte(self):  # I1 de la relecture finale, avec N4
        # Schwalbe : l'écrou moleté de la valve Presta (« Sclaverand ») se desserre avant de gonfler. 3.2 le dit en
        # entier à l'étape 12, avant d'engager la tête de pompe, puis chaque étape qui gonfle ou mesure, en 3.2, 3.3, 3.4
        # et 3.5, le rappelle dans son corps, celui que montre le mode pas à pas. L'étape 13 dit qu'une aiguille restée
        # sur la charge du réservoir peut venir d'une valve fermée, comme lecture de ce site, avant de lire la pression ;
        # 3.6 range la valve restée fermée parmi les causes d'un pneu qui ne talonne pas.
        valve = "https://www.schwalbe.com/en/technology-faq/valve/"
        moletee = ("It can be locked manually with the knurled nut. Before inflating, the knurled nut must be loosened. "
                   "First time users frequently have some problems.")
        for fait in (moletee, "Also the thin top pin can be easily bent when attaching and removing the pump connector.",
                     "Sclaverand-Ventil (auch Presta-Ventil oder französisches Ventil)",
                     "https://www.schwalbe.com/fr/technique-faq/valves/", "The rim nut fixes the valve in the rim.",
                     "Valve restée fermée : lecture de ce relevé", "l'aiguille reste alors sur la charge du réservoir",
                     "Précision du manomètre : non publiée"):
            self.assertIn(fait, self.releve, fait)
        # L'étape 12 : le geste entier, avec sa source, avant d'engager la tête de pompe.
        (charge,) = [li for li in dom.selectionner(self.par_id["tubeless-passer"].section, "ol.steps > li")
                     if texte_de(dom.selectionner(li, "p.st-t")[0]).startswith("Ouvre la valve")]
        corps = self.corps("tubeless-passer", "Ouvre la valve")
        for mot in ("desserre à la main son écrou moleté", moletee, "Sclaverand-Ventil (auch Presta-Ventil",
                    "Also the thin top pin can be easily bent", "The rim nut fixes the valve in the rim.",
                    "pas l'écrou de jante", "lecture de ce site", "à lire sur la notice"):
            self.assertIn(mot, corps, mot)
        self.assertLess(corps.index("desserre à la main son écrou moleté"),
                        corps.index("Engage the valve and turn to CHARGE mode."))
        self.assertTrue([a for a in dom.selectionner(charge, "a.src") if a.get("href") == valve])
        # Chaque étape qui gonfle ou mesure : son corps dit l'écrou moleté, et cite Schwalbe ou renvoie à l'étape 12.
        gonfle = re.compile(r"(?<![dD]é)(?<![dD]e)gonfl", re.I)
        vues = []
        for ident in ("tubeless-passer", "tubeless-liquide", "tubeless-pression", "tubeless-crevaison"):
            for titre, c in self.etapes_de(ident):
                francais = re.sub(r"«[^»]*»", "", titre + " " + c)
                if gonfle.search(francais) or titre.startswith(("Ouvre la valve", "Lis le manomètre",
                                                                 "Règle la pression de roulage")):
                    vues.append((ident, titre))
                    self.assertIn("écrou moleté", c, f"{ident} : {titre}")
                    self.assertTrue("Before inflating, the knurled nut must be loosened." in c or "étape 12" in c
                                    or "étapes 12" in c, f"{ident} : {titre}")
        self.assertEqual([i for i, _ in vues], ["tubeless-passer"] * 8 + ["tubeless-liquide"] + ["tubeless-pression"] * 2
                         + ["tubeless-crevaison"] * 2, vues)
        # Le verrouillage, une fois la tête retirée : Proposition pour le moment, Schwalbe pour le geste.
        roulage = self.corps("tubeless-passer", "Règle la pression de roulage")
        for mot in ("Proposition", "revissé à la main", "It can be locked manually with the knurled nut."):
            self.assertIn(mot, roulage, mot)
        # L'étape 13 : l'aiguille qui ne quitte pas la charge du réservoir, avant la lecture du manomètre.
        talon = self.corps("tubeless-passer", "Talonne")
        for mot in ("la valve est peut-être restée fermée", "l'aiguille montre encore le réservoir", "lecture de ce site",
                    "étape 12", "3.6"):
            self.assertIn(mot, talon, mot)
        # La lecture du manomètre vient à l'étape suivante, une fois la valve ouverte.
        etapes = self.etapes_de("tubeless-passer")
        (i,) = [k for k, (t, _) in enumerate(etapes) if t.startswith("Talonne")]
        self.assertIn("Aiguille immobile, valve ouverte", etapes[i + 1][1])
        self.assertIn("Contrôle aussi l'écrou moleté de la valve (étape 12)", self.corps("tubeless-passer", "S'il ne talonne"))
        # 3.6 : la cause, avec la citation et sa source.
        (q,) = [x for x in dom.selectionner(self.par_id["tubeless-problemes"].section, "div.q")
                if texte_de(dom.selectionner(x, "b")[0]) == "Le pneu ne talonne pas"]
        for mot in ("Valve restée fermée", "Before inflating, the knurled nut must be loosened.", "écrou moleté",
                    "3.2, étape 13"):
            self.assertIn(mot, texte_de(q), mot)
        self.assertTrue([a for a in dom.selectionner(q, "a.src") if a.get("href") == valve])

    def test_corrections_de_la_relecture_finale(self):  # mineurs de la relecture finale et points parqués
        # M1 : la dose lue sur le ruban de la vidéo cède à celle du liquide, Muc-Off, à l'étape 17.
        ruban = self.corps("tubeless-passer", "Contrôle le ruban")
        for mot in ("c'est la dose Muc-Off qui s'applique (étape 19)",
                    "You can usually find this information on the packaging of your respective sealant."):
            self.assertIn(mot, ruban, mot)
        # M2 : 3.3 regonfle un pneu dégonflé complètement : lecture en bar, et 3.2 s'il a déjanté.
        (li,) = [x for x in dom.selectionner(self.par_id["tubeless-liquide"].section, "ol.steps > li")
                 if texte_de(dom.selectionner(x, "p.st-t")[0]).startswith("Remets l'obus")]
        corps = self.corps("tubeless-liquide", "Remets l'obus")
        for mot in ("échelle en bar", "S'il a déjanté pendant le dégonflage de l'étape 2",
                    "recommence le talonnage, étapes 12 à 15"):
            self.assertIn(mot, corps, mot)
        self.assertTrue([a for a in dom.selectionner(li, "a") if a.get("href") == "#tubeless-passer"])
        # M3 : le dégraissant de l'étape 8 est dans la liste du chantier.
        self.assertIn("Pour un pneu neuf\u00a0: un nettoyant Muc-Off de l'étape 8 et un chiffon propre, loin de la jante",
                      self.par_id["tubeless-passer"].outils)
        # M8 : la précision du manomètre n'est pas publiée, à l'étape 13 et à l'étape 22.
        talon = self.corps("tubeless-passer", "Talonne")
        self.assertIn("sa précision est non publiée", self.corps("tubeless-passer", "Lis le manomètre"))
        self.assertIn("précision non publiée", self.corps("tubeless-passer", "Règle la pression de roulage"))
        # N3 : l'aiguille du dessin de STEP 4 est en bout d'échelle, pas en haut du cadran.
        self.assertIn("en bout d'échelle, vers", talon)
        self.assertNotIn("en haut du cadran", self.texte_complet())
        # N6 : l'ébavurage est rangé parmi les gestes abrasifs par ce site, et il le dit.
        self.assertIn("Ce site range l'ébavurage parmi les gestes abrasifs.", self.texte_atelier("tubeless-problemes"))
        self.assertNotIn("Ébavurer est un geste abrasif", self.texte_complet())
        self.assertNotIn("Ébavurer est un geste abrasif", self.releve)
        self.assertNotIn("magasin des", self.releve)  # M10

    def test_talonnage_lisible_pas_a_pas(self):  # N5 de la relecture finale
        # Le mode pas à pas se lit de loin, les mains dans la roue : le talonnage tient en trois étapes d'au plus
        # 1 500 caractères de corps, chacune avec son titre d'action, et aucune étape de 3.2 ne dépasse 2 000
        # caractères (l'étape 12, la plus longue, porte le geste entier de l'écrou moleté).
        etapes = self.etapes_de("tubeless-passer")
        self.assertEqual(len(etapes), 25)
        trois = [(t, c) for t, c in etapes if t.startswith(("Talonne", "Lis le manomètre", "S'il ne talonne pas"))]
        self.assertEqual([t for t, _ in trois], [
            "Talonne en mode INFLATE, jamais plus de 3,0\u00a0bar",
            "Lis le manomètre en bar, purge jusqu'à 3,0\u00a0bar au plus",
            "S'il ne talonne pas\u00a0: pas plus fort, pas de cartouche, dégonfle et contrôle"])
        for t, c in trois:
            self.assertLessEqual(len(c), 1500, t)
        for t, c in etapes:
            self.assertLessEqual(len(c), 2000, t)

    # Chaque renvoi à une étape de 3.2, dans tout le chapitre : le passage qui le porte, et le début du titre de chaque
    # étape visée, qui doit nommer l'action dont parle le renvoi. Une étape ajoutée ou retirée dans 3.2 décale les
    # numéros : le titre ne correspond plus, et le test échoue.
    RENVOIS_3_2 = (
        ("tubeless-materiel", "à lire sur la pièce (3.2, étape 4)", {4: "Note ce que tu trouves"}),
        ("tubeless-materiel", "à constater sur la pièce (3.2, étape 4)", {4: "Note ce que tu trouves"}),
        ("tubeless-passer", "La roue, à l'étape 1 (1.5)", {1: "Dépose la roue"}),
        ("tubeless-passer", "roue remontée, étape 19)", {19: "Injecte"}),
        ("tubeless-passer", "un nettoyant Muc-Off de l'étape 8", {8: "Pneu neuf"}),
        ("tubeless-passer", "passe à l'étape 2.", {2: "Dégonfle complètement"}),
        ("tubeless-passer", "c'est la dose Muc-Off qui s'applique (étape 19)", {19: "Injecte"}),
        ("tubeless-passer", "passe à l'étape 7.", {7: "Pose la valve"}),
        ("tubeless-passer", "l'écrou de jante, serré à la main (étape 7)", {7: "Pose la valve, écrou serré à la main"}),
        ("tubeless-passer", "contrôle-le (étape 12)", {12: "Ouvre la valve"}),
        ("tubeless-passer", "la consigne d'échec de Topeak (étape 15)", {15: "S'il ne talonne pas"}),
        ("tubeless-passer", "ce n'est pas ton pneu (étape 13)", {13: "Talonne"}),
        ("tubeless-passer", "l'écrou moleté est desserré depuis l'étape 12", {12: "Ouvre la valve"}),
        ("tubeless-passer", "l'écrou moleté de la valve (étape 12)", {12: "Ouvre la valve"}),
        ("tubeless-passer", "remonte-la d'abord (étape 23)", {23: "Remonte la roue"}),
        ("tubeless-passer", "desserre l'écrou moleté de la valve, comme à l'étape 12", {12: "Ouvre la valve"}),
        ("tubeless-passer", "l'échelle en bar comme à l'étape 14, sans cartouche", {14: "Lis le manomètre en bar"}),
        ("tubeless-passer", "pendant le dégonflage de l'étape 17", {17: "Dégonfle complètement et retire l'obus"}),
        ("tubeless-passer", "recommence le talonnage, étapes 12 à 15.", {12: "Ouvre la valve", 15: "S'il ne talonne pas"}),
        ("tubeless-passer", "écrou moleté desserré comme à l'étape 12, sans", {12: "Ouvre la valve"}),
        ("tubeless-passer", "Écrou moleté desserré pour gonfler, comme à l'étape 12.", {12: "Ouvre la valve"}),
        ("tubeless-passer", "l'échelle en bar comme à l'étape 14, précision", {14: "Lis le manomètre en bar"}),
        ("tubeless-passer", "puis revissé, comme aux étapes 12 et 24.",
         {12: "Ouvre la valve", 24: "Règle la pression de roulage"}),
        ("tubeless-passer", "talonne sans cartouche (étapes 12 et 13)", {12: "Ouvre la valve", 13: "Talonne"}),
        ("tubeless-passer", "s'applique (étape 10)", {10: "Pose le second talon"}),
        ("tubeless-passer", "Le changement du ruban, étape 6.", {6: "Ruban à changer"}),
        ("tubeless-passer", "La dépose et la pose des roues, étapes 1 et 23.", {1: "Dépose la roue", 23: "Remonte la roue"}),
        ("tubeless-passer", "la limite de ta jante (étape 13)", {13: "Talonne en mode INFLATE, jamais plus de 3,0\u00a0bar"}),
        ("tubeless-liquide", "(3.2, étape 19)", {19: "Injecte"}),
        ("tubeless-liquide", "comme en 3.2, étapes 12 et 24", {12: "Ouvre la valve", 24: "Règle la pression de roulage"}),
        ("tubeless-liquide", "comme à l'étape 14 de 3.2", {14: "Lis le manomètre en bar"}),
        ("tubeless-liquide", "recommence le talonnage, étapes 12 à 15 de 3.2",
         {12: "Ouvre la valve", 15: "S'il ne talonne pas"}),
        ("tubeless-pression", "(3.2, étapes 12 et 24)", {12: "Ouvre la valve", 24: "Règle la pression de roulage"}),
        ("tubeless-pression", "(3.2, étapes 12 et 24)", {12: "Ouvre la valve", 24: "Règle la pression de roulage"}),
        ("tubeless-crevaison", "(3.2, étapes 12 et 24)", {12: "Ouvre la valve", 24: "Règle la pression de roulage"}),
        ("tubeless-crevaison", "(3.2, étape 12)", {12: "Ouvre la valve"}),
        ("tubeless-problemes", "(3.2, étape 13)", {13: "Talonne"}),
        ("tubeless-problemes", "Vois aussi 3.2, étape 15.", {15: "S'il ne talonne pas"}),
    )

    def test_renvois_aux_etapes_de_3_2(self):  # N5 de la relecture finale : la renumérotation
        titres = [t for t, _ in self.etapes_de("tubeless-passer")]
        for ident, passage, cibles in self.RENVOIS_3_2:
            with self.subTest(passage):
                fois = len([r for r in self.RENVOIS_3_2 if r[:2] == (ident, passage)])
                self.assertGreaterEqual(self.texte_atelier(ident).count(passage), fois, passage)
                for n, debut in cibles.items():
                    self.assertLessEqual(n, len(titres))
                    self.assertTrue(titres[n - 1].startswith(debut), f"étape {n} de 3.2 : « {titres[n - 1]} »")
        # Chaque renvoi du chapitre est dans la liste, et vise une étape qui existe (les plages comprises). Dans 3.2,
        # « étape N » vise 3.2 ; ailleurs, seuls « 3.2, étape N » et « étape N de 3.2 » la visent.
        dans_3_2 = re.compile(r"\bétapes? (\d+)(?: (?:et|à) (\d+))?")
        ailleurs = re.compile(r"3\.2, étapes? (\d+)(?: (?:et|à) (\d+))?|\bétapes? (\d+)(?: (?:et|à) (\d+))? de 3\.2\b")
        for a in self.ch.ateliers:
            texte = self.texte_atelier(a.id)
            trouves = list((dans_3_2 if a.id == "tubeless-passer" else ailleurs).finditer(texte))
            listes = [r for r in self.RENVOIS_3_2 if r[0] == a.id]
            # Les mêmes numéros, autant de fois : un renvoi changé ou ajouté hors de la liste fait échouer le test.
            self.assertEqual(sorted(tuple(int(g) for g in m.groups() if g) for m in trouves),
                             sorted(tuple(sorted(c)) for _, _, c in listes), f"{a.id} : {[m.group(0) for m in trouves]}")
            for m in trouves:
                nombres = [int(g) for g in m.groups() if g]
                for n in range(min(nombres), max(nombres) + 1) if " à " in m.group(0) else nombres:
                    self.assertTrue(1 <= n <= len(titres), f"{a.id} : {m.group(0)}")
        # Le lot 2 ne renvoie à aucune étape de 3.2.
        montage = (RACINE / "src" / "parts" / "11-montage.html").read_text(encoding="utf-8")
        self.assertIsNone(re.search(r"tubeless-passer\">3\.2</a>, étape", montage))

    def test_valeur_avec_source_officielle(self):  # Review Focus 3
        # Toute ligne qui porte un span.nm, une pression ou une dose en ml porte un a.src officiel autre que Park Tool,
        # qui ne sert que pour un geste ou pour ses propres outils.
        vues = 0
        for ligne in lignes_tubeless(self.section):
            texte = texte_de(ligne)
            if dom.selectionner(ligne, "span.nm") or PRESSION.search(texte) or VOLUME.search(texte):
                vues += 1
                officielles = [a for a in dom.selectionner(ligne, "a.src")
                               if urlparse(a.get("href")).hostname != "www.parktool.com"]
                self.assertTrue(officielles, texte[:160])
        self.assertGreaterEqual(vues, 35)
        # Chaque lien sort vers un document officiel, et c'est un document du relevé, à son adresse exacte.
        liens = [e for e in dom.selectionner(self.section, "[href]") if e.tag == "a"]
        self.assertGreaterEqual(len(liens), 100)
        for a in liens:
            href = a.get("href")
            if href.startswith("#"):
                continue
            self.assertTrue(href.startswith("https://"), href)
            self.assertIn(urlparse(href).hostname, OFFICIELS, href)
            self.assertIn(href, self.releve, href)
            self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), href)
        # Les pages du manuel Canyon des roues : la page imprimée, puis celle du PDF, qui vaut une de plus.
        vues = 0
        for a in dom.selectionner(self.section, "a.src"):
            if MANUEL_ROUES in a.get("href"):
                vues += 1
                m = re.fullmatch(r"Canyon, manuel des roues p\.(\d+)(?:-(\d+))? imprimées? \(PDF p\.(\d+)(?:-(\d+))?\)",
                                 a.texte())
                self.assertIsNotNone(m, a.texte())
                self.assertEqual(int(m.group(3)), int(m.group(1)) + 1, a.texte())
                if m.group(2):
                    self.assertEqual(int(m.group(4)), int(m.group(2)) + 1, a.texte())
        self.assertGreaterEqual(vues, 30)

    def test_pas_a_pas_securite(self):  # Review Focus 5
        # Le mode pas à pas ne montre que le titre et le corps des étapes : 3,0 bar, solvants sur le carbone et CO2
        # sont dans les corps des étapes de 3.2 (et de 3.5 pour le CO2), pas seulement dans un encadré.
        etapes = self.etapes_de("tubeless-passer")
        gonfler = [(t, c) for t, c in etapes
                   if re.search(r"(?<!dé)gonfle|talonne|réservoir|manomètre|pression|fuites|ligne du pneu|roule", t, re.I)]
        self.assertGreaterEqual(len(gonfler), 7, [t for t, _ in etapes])
        for t, c in gonfler:
            self.assertIn("3,0\xa0bar", c, t)
        # Le talonnage tient en trois étapes (N5 de la relecture finale) : la troisième porte, dans son corps, le
        # surgonflage cité en contradiction, le CO2 et la consigne d'échec.
        talon = self.corps("tubeless-passer", "S'il ne talonne pas")
        for mot in ("always never exceed", S_APPLIQUE, "Slightly over-inflate the tire for a short time",
                    "Inflate the tire to at least the maximum pressure on the label.", "pump as hard and as fast as you can",
                    "CO2 (dioxyde de carbone)", "Please do not use CO2 cartridges for inflation.",
                    "If a floor pump fails, use a tubeless inflator, CO2 cartridge, or compressor.", "la plus prudente",
                    "ne gonfle jamais plus fort", "3.6",
                    "If inflation fails, deflate tire and check tire installation, rim and valve."):
            self.assertIn(mot, talon, mot)
        for debut, mots in {
            "Démonte": ("Do not use metal tools to install or remove tubeless tyres.", "Use plastic tyre lever if necessary."),
            "Contrôle le ruban": ("solvant", "carbone", "which is not visible to the naked eye"),
            "Ruban à changer": ("Isopropyl Alcohol", "solvant", "carbone", "which is not visible to the naked eye",
                                "service client Canyon"),
            "Pneu neuf": ("Disc Brake Cleaner", "solvant", "carbone", "loin de la jante", "Proposition"),
        }.items():
            c = self.corps("tubeless-passer", debut)
            for mot in mots:
                self.assertIn(mot, c, f"{debut} : {mot}")
        # 3.5 : chaque étape qui fait regonfler dit 3,0 bar et écarte le CO2, avec sa raison.
        regonfler = [(t, c) for t, c in self.etapes_de("tubeless-crevaison") if "gonfle" in t.lower()]
        self.assertGreaterEqual(len(regonfler), 2)
        for t, c in regonfler:
            for mot in ("3,0\xa0bar", "CO2", "Please do not use CO2 cartridges for inflation.", "la plus prudente"):
                self.assertIn(mot, c, f"{t} : {mot}")

    def test_materiel(self):
        texte = self.texte_complet()
        for mot in ("Muc-Off", "Road & Gravel Tubeless Sealant", "JoeBlow Booster", "TPT-1"):
            self.assertIn(mot, texte, mot)
        outils = {a.id: " ".join(a.outils) for a in self.ch.ateliers}
        for ident, mots in {"tubeless-passer": ("JoeBlow Booster", "Muc-Off", "plastique", "Presta"),
                            "tubeless-liquide": ("Muc-Off",), "tubeless-pression": ("JoeBlow Booster",),
                            "tubeless-crevaison": ("TPT-1", "45-622", "Presta", "plastique")}.items():
            for mot in mots:
                self.assertIn(mot, outils[ident], f"{ident} : {mot}")
        # Les valves : les critères officiels du relevé, sans aucune marque.
        materiel = self.texte_atelier("tubeless-materiel")
        for mot in ("Presta", "obus démontable", "If you use valves without exchangeable valve inserts",
                    "The valve nut is absolutely necessary", "Exclusively tighten the valve nut by hand.",
                    "install the valve according to the valve instructions", "30\xa0mm", "notice de la valve",
                    "aucune marque"):
            self.assertIn(mot, materiel, mot)
        marques = r"(?:DT\s?Swiss|Schwalbe|Muc-Off|Stan[’']?s|Topeak|Park Tool|Canyon|Pirelli|Clik|Reserve|Silca|Zipp)"
        for motif in (r"valves?\s+(?:tubeless\s+)?" + marques, marques + r"\s+(?:tubeless\s+)?valves?", r"\bclik\b",
                      r"TVVXA", r"\bStan[’']?s\b", r"0,5\u00a0Nm", r"Dynaplug", r"\bDART\b"):
            self.assertIsNone(re.search(motif, texte, re.I), motif)

    def test_sans_ecarts_des_brouillons(self):
        # Les écarts du relevé (section « Écarts avec les brouillons du 20/10 »), chacun par un indice précis.
        texte, html = self.texte_complet(), normaliser(self.source)
        for absent in (
            "Continental", "Terra Adventure", "RevoSealant", "Gravel LN", "G 540", "G540",  # pièces du CF 7
            "24\xa0mm", "25 ou 26", "25\xa0mm", "TVX2710S29813S",  # cotes et ruban de la jante du CF 7
            "4,5\xa0bar", "65\xa0psi", "pression de départ", "ton calcul", "Ton fichier",  # revendeurs, données perso
            "maximum du flanc", "plafond", "au moins à la pression maximale",  # talonnage dangereux
            "acétone", "liquide vaisselle", "Lave le pneu", "lave le pneu",  # solvant et lavage du CF 7, dosage Stan's
            "2,5 à 5", "5 à 7\xa0cm", "7 à 9\xa0cm", "30\xa0ml", "475\xa0ml", "0,17",  # Park Tool, Stan's, Continental
            "aluminium", "corrosion", "tous les 3\xa0mois", "12\xa0mois",  # jante aluminium, ruban DT Swiss des roues
            "Vittoria", "ENVE", "SRAM", "Zipp", "Silca", "BikeRadar",  # tableaux et calculateurs hors pièces
            "Dynaplug", "DART", "Stan's", "TB-2",  # outils non choisis
            "à crochets", "à crochet", "contre les crochets", "Le crochet", "le crochet retient",  # jante à crochets
            "Ruban DT Swiss 27",  # mauvais ruban pour 27 mm
        ):
            self.assertNotIn(absent, texte, absent)
        for motif in (r"\bTC\b", r"\bTR\b", r"\b[4578]\u00a0h\b", r"\d\u00a0bar (?:avant|arrière|à l'avant|à l'arrière)"):
            self.assertIsNone(re.search(motif, texte), motif)
        cf7 = re.compile(r"(?<![0-9a-z#])CF[\s_-]*7(?![0-9])|4553", re.I)
        self.assertIsNone(cf7.search(texte))
        self.assertIsNone(cf7.search(html))
        for adresse in ("mrcyclingworld", "rosebikes", "mhw-bike", "modernbike", "bicyclerollingresistance", "cykelpartner",
                        "cdn.shopify", "continental-tires", "bikeradar", "MAN_WXWXXXXXX1610S", "MAN_RXWXXXXXXWRXXS",
                        "MAN_TDXXXXXX04814S", "tire-and-tube-removal-and-installation", "tubeless-tire-conversion",
                        "/grizl-cf-7/", "50047675", "WGR00LNAIDXSO19861"):
            self.assertNotIn(adresse, html, adresse)
        # La conversion des 750 miles de Muc-Off est un calcul, dit comme tel.
        for ligne in self.lignes():
            if "1200\xa0km" in ligne:
                self.assertIn("calcul de ce site", ligne)
        # Le ruban posé n'est pas affirmé : Canyon l'écrit pour la paire vendue seule, pas pour le vélo.
        self.assertIn("Delivered pre-taped", self.texte_atelier("tubeless-materiel"))
        self.assertNotIn("ruban déjà posé", texte)

    def test_aucune_donnee_personnelle(self):
        # Comme pour Montage, et le prénom de Lamine en plus : le site le tutoie sans le nommer.
        verifier_aucune_donnee(self, self.texte_complet(), self.source, en_plus=("Lamine",))
        texte = self.texte_complet().replace("\u00a0", " ")
        self.assertIsNone(re.search(r"\b(?:commandes?|prix|magasin|boutique)\b", texte, re.I))
        # Aucune pression calculée : chaque pression du chapitre est une valeur du relevé, avec son unité.
        dans_le_releve = {(n, u) for _, _, u, ns in pressions(self.releve) for n in ns}
        for t in self.textes_lus():
            for _, _, u, ns in pressions(t):
                for n in ns:
                    self.assertIn((n, u), dans_le_releve, f"{n} {u} : {t[:120]}")
        # Aucun poids hors du tableau Canyon (catégories de cyclistes) et des charges admises (vélo, paire de roues).
        self.assertLessEqual(set(re.findall(r"(?<![\d.,])(\d+)\s?kg\b", texte, re.I)), {"64", "82", "120", "130"})
        self.assertLessEqual(set(re.findall(r"(?<![\d.,])(\d+)\s?lbs\b", texte, re.I)), {"140", "180"})
        # 3.4 donne la méthode et les limites, et fait noter ta pression ailleurs.
        pression = self.texte_atelier("tubeless-pression")
        self.assertIn("ailleurs que sur ce site", pression)
        self.assertIn("ne calcule pas ta pression", pression)

    def test_contradictions(self):
        # Chaque contradiction du relevé qui touche un atelier est dite sur sa page, avec la valeur appliquée.
        attendu = {
            "tubeless-materiel": ("Delivered with tubeless valve", "chat Canyon", "Delivered pre-taped", "Performance",
                                  "608\xa0g", "4\xa0bars/58PSI", "130\xa0kg", "120\xa0kg", "2-4\xa0mm wider", "29\xa0mm"),
            "tubeless-passer": ("Slightly over-inflate", "at least the maximum pressure", "as hard and as fast",
                                "Please do not use CO2 cartridges", "CO2 cartridge", "Can be used with CO2",
                                "beginning at the valve", "Isopropyl Alcohol", "brake cleaner", "Disc Brake Cleaner",
                                "three spoke positions", "15\xa0cm", "overlap in the valve area", "40-622"),
            "tubeless-liquide": ("70 - 80ml", "60 - 90", "fill in 60\xa0ml", "60 à 100\xa0ml", "50 à 80\xa0ml",
                                 "Lasts 3-6 months", "2000\xa0km", "three to six months", "for the life of the tyre",
                                 "No Puncture Hassle", "Cross 700CC"),
            "tubeless-pression": ("4\xa0bars/58PSI", "55\xa0PSI", "4.5", "5\xa0bar for road bikes", "four bars", "0\xa0Bar",
                                  "Coming soon", "rough guide"),
            "tubeless-crevaison": ("Please do not use CO2 cartridges", "Can be used with CO2", "snake", "anglais"),
            "tubeless-problemes": ("Slightly over-inflate", "as hard and as fast", "clean and deburr", "abrasives",
                                   "ni ébavurage ni solvant"),
        }
        for ident, mots in attendu.items():
            with self.subTest(ident):
                notes = [n for n in dom.selectionner(self.par_id[ident].section, "aside.note")
                         if texte_de(dom.selectionner(n, "p.note-t")[0]).startswith("Contradiction")]
                self.assertTrue(notes, ident)
                texte = " ".join(texte_de(n) for n in notes)
                for mot in mots:
                    self.assertIn(mot, texte, mot)
                for n in notes:
                    t = texte_de(n)
                    self.assertTrue(any(m in t for m in ("s'applique", "retenu", "appliqu", "s'impose", "prime")), t[:160])

    def test_a_lire_a_la_livraison(self):
        # 3.1 : la liste du relevé « À lire sur la pièce à la livraison », à cocher, point par point.
        section = self.par_id["tubeless-materiel"].section
        (liste,) = dom.selectionner(section, "ul.check")
        self.assertEqual(liste.get("data-key"), "tubeless-releve")
        (bouton,) = dom.selectionner(section, "button.btn-reset")
        self.assertEqual(bouton.get("data-reset"), "tubeless-releve")
        points = dom.selectionner(liste, "li")
        self.assertEqual(len(points), 11)
        for n, li in enumerate(points, 1):
            self.assertEqual(dom.selectionner(li, "input")[0].get("id"), f"ck-tubeless-releve-{n}")
            self.assertTrue(dom.selectionner(li, "span.verif"), texte_de(li)[:80])
        tout = " ".join(texte_de(li) for li in points)
        for mot in ("chambres à air", "TUBELESS SEALANT QUANTITY", "obus démontable", "622x27TSS", "trou de valve",
                    "PRO", "45-622", "flèche", "plastique", "TJB-BST2", "TJB-BST3", "fill lines",
                    "use within 2 years of purchase", "à retirer entièrement", "p.72", "s'il contient", "30\xa0mm",
                    "3,0\xa0bar"):
            self.assertIn(mot, tout, mot)

    def test_corrections_de_la_relecture(self):  # mineurs de la relecture du 26/10
        # M1 : l'en-tête, seul sur la page de la catégorie, développe PDF.
        self.assertIn("PDF (Portable Document Format)", texte_de(self.ch.tete))
        # M3 : aucun corps d'étape n'est une citation anglaise seule, hors liens.
        for a in self.ch.ateliers:
            for li in dom.selectionner(a.section, "ol.steps > li"):
                copie = dom.analyser("".join(e.html() for e in elements(li) if "st-t" not in e.classes()))
                for lien in dom.selectionner(copie, "a.src"):
                    lien.retirer()
                francais = re.sub(r"[^A-Za-zÀ-ÿ]", "", re.sub(r"«[^»]*»", "", copie.texte()))
                self.assertGreaterEqual(len(francais), 40, f"{a.num} : {texte_de(dom.selectionner(li, 'p.st-t')[0])}")
        # M5 : traverser le ruban, regonfler après l'étape 15, le couple de l'axe avant.
        self.assertIn("You can simply push the tubeless valve through the rim tape with the tip.",
                      self.corps("tubeless-passer", "Pose la valve"))
        regonfler = self.corps("tubeless-passer", "Remets l'obus")
        for mot in ("sans charger le réservoir", "Pump to desired pressure.", "recommence le talonnage, étapes 12 à 15",
                    "Proposition"):
            self.assertIn(mot, regonfler, mot)
        # N2 de la seconde relecture de la tâche 1 : le couple est celui que donne 1.5, pas « 1.5 » lu comme un couple.
        self.assertIn("au couple donné en 1.5", self.corps("tubeless-passer", "Remonte la roue"))
        self.assertNotIn("au couple de 1.5", self.texte_complet())
        self.assertIn("sans lui, le sachet Muc-Off, roue remontée, étape 19", " ".join(self.par_id["tubeless-passer"].outils))
        # M6 : regonfler en route se lit sur un manomètre.
        self.assertIn("Mini-pompe avec manomètre (Proposition)", self.par_id["tubeless-crevaison"].outils)
        for debut in ("Mèche\u00a0: regonfle", "Chambre\u00a0: gonfle"):
            self.assertIn("lus sur son manomètre", self.corps("tubeless-crevaison", debut), debut)
        # M7 : 3,0 bar vaut pour les pneus de 45 à 54 mm ; une autre largeur renvoie au tableau du manuel.
        self.assertIn("avec un pneu d'une autre largeur, elle change", self.texte_atelier("tubeless-materiel"))
        self.assertIn("ton pneu de 45\u00a0mm", texte_de(self.ch.tete))

    def test_typographie(self):
        texte = re.sub(r"<[^>]*>", " | ", self.source) + " | " + " | ".join(aria_labels(self.section))
        self.assertIsNone(re.search("[\u2014\u2013]", self.source))
        motif = r".{0,40}\d (?:Nm|mm|cm|bars?|psi|PSI|kg|ml|km|g|h|°C|%|miles|lbs|pouces?)(?![\w·])"
        self.assertIsNone(re.search(motif, texte), re.search(motif, texte))
        # Une espace insécable avant « : ; ? ! » et à l'intérieur des guillemets, comme aux chapitres 1 et 2.
        self.assertIsNone(re.search(r".{0,30}[^\s|] [:;?!»]", texte), re.search(r".{0,30}[^\s|] [:;?!»]", texte))
        self.assertIsNone(re.search(r".{0,30}« ", texte), re.search(r".{0,30}« ", texte))
        self.assertNotIn("&nbsp;", self.source)
        self.assertNotIn("N·m", self.source)

    def test_abreviations_par_page(self):
        # Chaque atelier devient sa propre page : une abréviation y est développée avant ou juste après sa première
        # apparition, liens compris.
        developpements = {"TLR": "Tubeless Ready", "TLE": "Tubeless Easy", "TSS": "Tubeless Straight Side",
                          "ETRTO": "European Tyre and Rim Technical Organization", "psi": "livres par pouce carré",
                          "CO2": "dioxyde de carbone", "QSG": "guide de démarrage Canyon",
                          "PDF": "Portable Document Format", "FAQ": "foire aux questions",
                          "lbs": "livres anglo-saxonnes"}
        vues = set()
        for a in self.ch.ateliers:
            texte = texte_de(a.section)
            for abr, dev in developpements.items():
                m = re.search(r"\b" + abr + r"\b", texte, re.I if abr == "psi" else 0)
                if m:
                    vues.add(abr)
                    i = texte.find(dev)
                    self.assertTrue(0 <= i <= m.start() + 40, f"{a.id} : {abr}")
        self.assertEqual(vues, set(developpements))

    def test_texte_conserve(self):
        # Comme pour Freins et Montage : les deux colonnes de chaque page gardent tout le texte du source.
        verifier_texte_conserve(self, self.ch.ateliers)


if __name__ == "__main__":
    unittest.main()
