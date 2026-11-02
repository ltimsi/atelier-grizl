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


def verifier_blocs_par_type(test, ateliers_du_chapitre):
    """Une fiche « comprendre » n'a aucun bloc de gestes, les autres types les ont tous. Chacune a sa vidéo, sous un
    seul h4 « Vidéo » ou « Vidéos », et aucune des deux colonnes de sa page n'a de contenu caché."""
    for a in ateliers_du_chapitre:
        with test.subTest(a.id):
            presents = [g for g in GESTES if dom.selectionner(a.section, g)]
            test.assertEqual(presents, [] if a.type == "comprendre" else list(GESTES))
            test.assertTrue(dom.selectionner(a.section, "ul.media") + dom.selectionner(a.section, "p.a-video"))
            videos = [h for h in elements(a.section) if h.tag == "h4" and h.texte() in ateliers.VIDEO]
            test.assertEqual(len(videos), 1)
            if a.type != "comprendre":
                test.assertTrue(a.outils and a.etapes and a.demonter)
                test.assertEqual(len(dom.selectionner(a.section, "ol.steps")), 1)
            gauche, droite = ateliers.colonnes(a)
            test.assertEqual(dom.selectionner(dom.analyser(gauche + droite), "[hidden]"), [])


def verifier_abreviations(test, ateliers_du_chapitre, developpements, sans_casse=(), sans_titre=False):
    """Chaque atelier devient sa propre page : une abréviation y est développée avant ou juste après sa première
    apparition, liens compris. Chaque abréviation de `developpements` apparaît au moins une fois dans le chapitre ;
    celles de `sans_casse` se cherchent sans tenir compte de la casse (« psi » comme « PSI »). Avec `sans_titre`, le h3,
    qui devient le titre de la page, ne compte pas : au lot 5, un atelier de montage doit s'ouvrir sur l'encadré de
    prudence, et c'est la première phrase de cet encadré qui développe l'abréviation du titre (« adaptateur UDH »)."""
    vues = set()
    for a in ateliers_du_chapitre:
        texte = texte_de(a.section)
        if sans_titre:
            # Le h3 ne compte pas, mais une abréviation de son titre doit être développée dès l'élément qui le suit.
            enfants = elements(a.section)
            h3 = next(e for e in enfants if e.tag == "h3")
            suivant = texte_de(enfants[enfants.index(h3) + 1])
            for abr, dev in developpements.items():
                if re.search(r"\b" + abr + r"\b", texte_de(h3)):
                    test.assertIn(dev, suivant, f"{a.id} : {abr} du titre")
            texte = texte.replace(texte_de(h3), "", 1)
        for abr, dev in developpements.items():
            m = re.search(r"\b" + abr + r"\b", texte, re.I if abr in sans_casse else 0)
            if m:
                vues.add(abr)
                i = texte.find(dev)
                test.assertTrue(0 <= i <= m.start() + 40, f"{a.id} : {abr}")
    test.assertEqual(vues, set(developpements))


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
        verifier_blocs_par_type(self, self.ch.ateliers)

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
        verifier_abreviations(self, self.ch.ateliers, {
            "QSG": "guide de démarrage Canyon", "RWS": "système d'axe à levier de DT Swiss",
            "PDF": "Portable Document Format", "ASTM": "American Society for Testing and Materials",
            "SPD": "système de cales Shimano", "DM": "Dealer's Manual", "UM": "User's Manual"})

    def test_texte_conserve(self):
        # Comme pour Freins : les deux colonnes de chaque page gardent tout le texte du source.
        verifier_texte_conserve(self, self.ch.ateliers)


# ---------------------------------------------------------------------------------------------------------------
# Chapitre 3, Pneus et tubeless : relu depuis son fragment (lot 3, publié en relecture)
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


class PasAPas:
    """Les étapes d'un chapitre comme les montre le mode pas à pas, pour une classe de test qui a `par_id`."""

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


class TestTubeless(PasAPas, unittest.TestCase):
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
        verifier_blocs_par_type(self, self.ch.ateliers)

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
        verifier_abreviations(self, self.ch.ateliers, {
            "TLR": "Tubeless Ready", "TLE": "Tubeless Easy", "TSS": "Tubeless Straight Side",
            "ETRTO": "European Tyre and Rim Technical Organization", "psi": "livres par pouce carré",
            "CO2": "dioxyde de carbone", "QSG": "guide de démarrage Canyon", "PDF": "Portable Document Format",
            "FAQ": "foire aux questions", "lbs": "livres anglo-saxonnes"}, sans_casse=("psi",))

    def test_texte_conserve(self):
        # Comme pour Freins et Montage : les deux colonnes de chaque page gardent tout le texte du source.
        verifier_texte_conserve(self, self.ch.ateliers)


# ---------------------------------------------------------------------------------------------------------------
# Chapitre 4, Transmission : relu depuis son fragment (lot 4, publié en relecture)
# ---------------------------------------------------------------------------------------------------------------

TRANSMISSION = RACINE / "src" / "parts" / "40-transmission.html"
RELEVE_TRANSMISSION = RACINE / "docs" / "recherche" / "transmission-cf8-di2.md"
# Le relevé du lot 4 renvoie aux relevés de base déjà vérifiés (« Base déjà vérifiée, non refaite ») sans les recopier :
# une adresse du chapitre peut venir de l'un d'eux.
RELEVES_DE_BASE = tuple(RACINE / "docs" / "recherche" / nom
                        for nom in ("sources-cf8-di2.md", "montage-cf8-di2.md", "composants-origine.md"))
# Les documents des fabricants des pièces, des produits et des outils de Lamine, et les vidéos de leurs chaînes.
OFFICIELS_TRANSMISSION = {"si.shimano.com", "productinfo.shimano.com", "bike.shimano.com", "www.canyon.com",
                          "www.sram.com", "motorex.com", "muc-off.com", "www.parktool.com", "www.pbswisstools.com",
                          "www.youtube.com"}
# Un couple écrit au format du site : « 10-12 Nm », « 0,7-1,5 Nm », « 25 Nm ». Le site n'écrit jamais N·m.
# Sans \b final : dans une ligne de tableau, le texte d'une cellule se colle à la suivante (« 10-12 NmTW-6.2 »).
COUPLE = re.compile(r"(?<![\d.,])\d+(?:[.,]\d+)?(?:-\d+(?:[.,]\d+)?)?\u00a0Nm")
AIDE_3D = ("Touche un numéro pour repérer la pièce. Un numéro peut se dessiner par-dessus une pièce qui cache la "
           "sienne\xa0: fais tourner la pièce, ou lis la liste numérotée sous la figure.")
# La valeur ou la consigne appliquée, en mots entiers (« prime », pas « imprimer ») et au pluriel aussi, une négation
# retirée d'abord : « que ce site ne retient pas », « Park ne la retient pas » ne disent pas ce qui s'applique, ni « les
# valeurs à appliquer », ni « Shimano ne dit pas laquelle s'applique ». « Ce site applique… » compte, comme dans les
# encadrés de Montage et Tubeless ; le « ne » d'une négation est un mot entier (pas celui de « neuve »).
APPLIQUE = re.compile(r"\b(?:s'appliquent|s'applique|applique|appliquent|retient|retenu|retenue|s'impose|s'imposent|prime"
                      r"|priment)\b")
NEGATION = re.compile(r"(?:\bne\b|\bn')\s?(?:[\w']+\s){0,4}?(?:s'appliquent|s'applique|applique|appliquent|retient|"
                      r"retiennent|retenu|prime|priment|s'impose|s'imposent)\b")


def dit_ce_qui_s_applique(texte):
    return bool(APPLIQUE.search(NEGATION.sub("", texte)))


class TestTransmission(PasAPas, unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = TRANSMISSION.read_text(encoding="utf-8")
        cls.releve = RELEVE_TRANSMISSION.read_text(encoding="utf-8")
        cls.releves = "\n".join([cls.releve] + [f.read_text(encoding="utf-8") for f in RELEVES_DE_BASE])
        cls.ch = ateliers.relever_chapitre(cls.source)
        cls.par_id = {a.id: a for a in cls.ch.ateliers}
        cls.section = cls.ch.tete.parent

    def texte_complet(self):
        return texte_de(self.section)

    def texte_atelier(self, ident):
        return texte_de(self.par_id[ident].section)

    def lignes(self):
        """Les lignes du chapitre, questions des fiches « comprendre » comprises."""
        return lignes_de(self.section, questions=True)

    def notes(self, ident, debut):
        """Les encadrés de l'atelier dont le titre commence par `debut`."""
        return [n for n in dom.selectionner(self.par_id[ident].section, "aside.note")
                if texte_de(dom.selectionner(n, "p.note-t")[0]).startswith(debut)]

    def test_chapitre(self):
        self.assertEqual(self.ch.id, "transmission")
        self.assertEqual((self.section.tag, self.section.classes()), ("section", ["chapter"]))
        (num,) = dom.selectionner(self.ch.tete, "p.ch-num")
        self.assertEqual(num.texte(), "Chapitre 4 · Transmission")
        self.assertEqual(dom.selectionner(self.ch.tete, "h2")[0].texte(), "Transmission")
        ids = [e.get("id") for e in dom.selectionner(dom.analyser(self.source), "[id]")]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sorted(self.ch.resumes), ["couples"])
        # L'en-tête, seul sur la page de la catégorie, développe ses abréviations et dit les travaux d'atelier.
        tete = texte_de(self.ch.tete)
        for mot in ("UDH (Universal Derailleur Hanger", "DM (Dealer's Manual", "UM (User's Manual",
                    "Nm (newton-mètre)", "travaux d'atelier"):
            self.assertIn(mot, tete, mot)

    def test_publie(self):
        # Le lot 4 est publié en relecture, avec ce chapitre et ses trois pièces 3D (la pièce « crank » du brouillon
        # n'en est plus), sans « prevu » : sa catégorie montre ses ateliers.
        config = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
        (lot,) = [l for l in config["lots"] if l["lot"] == 4]
        self.assertEqual((lot["statut"], lot["parts"], lot["categorie"]["id"], lot["modeles"]),
                         ("en relecture", ["40-transmission"], "transmission", ["chain", "cassette", "derailleur"]))
        self.assertNotIn("prevu", lot)

    def test_ateliers_ids_types_zones(self):
        self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
            ("transmission-di2", "4.1", "comprendre", "derailleur"),
            ("transmission-nettoyer", "4.2", "entretenir", "chaine"),
            ("transmission-usure", "4.3", "entretenir", "chaine"),
            ("transmission-chaine", "4.4", "remplacer", "chaine"),
            ("transmission-cassette", "4.5", "entretenir", "chaine"),
            ("transmission-reglage", "4.6", "regler", "derailleur"),
            ("transmission-patte", "4.7", "comprendre", "derailleur"),
            ("transmission-pedalier", "4.8", "comprendre", "pedalier"),
            ("transmission-depannage", "4.9", "comprendre", "derailleur")])
        self.assertEqual([normaliser(a.titre) for a in self.ch.ateliers], [
            "Ta transmission Di2", "Nettoyer et lubrifier la chaîne", "Mesurer l'usure de la chaîne",
            "Remplacer la chaîne", "Démonter et remonter la cassette", "Régler le dérailleur Di2", "La patte UDH",
            "Pédalier et boîtier", "Dépannage Di2"])

    def test_remplacer_chaine(self):
        c = self.par_id["transmission-chaine"]
        self.assertEqual((c.de, c.vers), ("CN-M8100 usée", "CN-M8100 neuve et attache SM-CN910-12 neuve"))
        for a in self.ch.ateliers:
            if a.id != "transmission-chaine":
                self.assertEqual((a.de, a.vers), (None, None), a.id)

    def test_blocs_par_type(self):
        verifier_blocs_par_type(self, self.ch.ateliers)

    def test_figures_3d(self):
        # Les trois pièces de la tâche 2 : leurs légendes et leurs aria-label ne portent que des valeurs du relevé.
        attendu = {"transmission-chaine": ["chain"], "transmission-cassette": ["cassette"],
                   "transmission-reglage": ["derailleur"]}
        mots = {"chain": ("CN-M8100", "SM-CN910-12", "face marquée", "maillons intérieurs", "sens de rotation",
                          "neuve", "CC-3.2", "0.5", "approch"),
                "cassette": ("CS-M8200-12", "9-45", "MICRO SPLINE", "contre-écrou", "TL-LR021", "fouet",
                             "9, 11 et 13", "30-50\xa0Nm", "approch"),
                "derailleur": ("RD-M8250-GS", "BT-DN320", "UDH", "10-12\xa0Nm", "vis B", "butées", "13 dents",
                               "jaune fixe", "approch")}
        releve = self.releve.replace(",", ".")
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                self.assertEqual(a.modeles, attendu.get(a.id, []))
                for figure in dom.selectionner(a.section, "figure.v3d"):
                    (scene,) = dom.selectionner(figure, "div.v3d-stage")
                    self.assertEqual(scene.get("role"), "img")
                    (legende,) = dom.selectionner(figure, "figcaption")
                    self.assertTrue(legende.texte().startswith(f"3D {a.num}"), legende.texte())
                    self.assertIn(AIDE_3D, texte_de(legende))
                    textes = [normaliser(scene.get("aria-label")), texte_de(legende)]
                    for mot in mots[figure.get("data-model")]:
                        for t in textes:
                            self.assertIn(mot, t, mot)
                    # Chaque nombre, hors du numéro de la figure, est un nombre du relevé.
                    for t in textes:
                        for n in re.findall(_N, t.replace(f"3D {a.num}", "")):
                            self.assertIn(n.replace(",", "."), releve, f"{n} : {t[:80]}")

    def test_valeurs_du_releve(self):
        t = {a.id: self.texte_atelier(a.id) for a in self.ch.ateliers}
        for ident, valeurs in {
            "transmission-di2": ("RD-M8250-GS", "BT-DN320", "ST-RX825-R", "BL-RX825-L", "CS-M8200-12", "9-45",
                                 "9-11-13-15-17-19-21-24-28-33-39-45T", "CN-M8100", "138 Links", "SM-CN910-12",
                                 "FC-RX820-1", "40 dents", "165\xa0mm", "SM-BB72-41B", "86,5\xa0mm", "Total capacity 36T",
                                 "C-473", "Di2 with BT-DN320", "E-BIKE", "GS type", "[Shifting/Adj. mode]",
                                 "does not support wired shifting", "over a month", "R126-01"),
            "transmission-nettoyer": ("neutral detergent", "Never use alkali- or acid-based solvents",
                                      "Wash the bicycle with the battery installed", "CM-5.3", "59\xa0mL",
                                      "thirty revolutions", "three passes", "lint-free cloth", "Bio Drivetrain Cleaner",
                                      "CHAINLUBE FOR WET CONDITIONS", "Avoid contact with the brakes",
                                      "AFTER EVERY RIDE"),
            "transmission-usure": ("CC-3.2", "0.5 stamp", "0,5\xa0%", "completely fall into the chain", "TL-CN42",
                                   "AFTER 6 MONTHS", "SEE A MECHANIC IF NECESSARY", "non vérifié"),
            "transmission-chaine": ("QUICK-LINK + 5 links", "QUICK-LINK + 6 links", "TL-CN10", "MLP-1.2", "CT-3.3",
                                    "138 maillons", "rotation direction of the crank", "between the inner links",
                                    "Do not reuse a QUICK-LINK", "front (outer side)", "floating shelf"),
            "transmission-cassette": ("TL-LR021", "SR-12.2", "TL-SR24", "30-50\xa0Nm", "40\xa0Nm", "9T", "11T", "13T",
                                      "wear gloves and eye protection", "perpendicular", "Adjustable wrench",
                                      "Y0GX01500", "Y0T49809T", "non publié", "combined into a single part"),
            "transmission-reglage": ("10-12\xa0Nm", "45 dents", "24 dents", "28 dents", "solid yellow",
                                     "Press shift switch (Y) 5 times", "just touches", "with the wheels stopped",
                                     "non publié", "[Shifting/Adj. mode]", "GS", "E-BIKE", "TL-RD11"),
            "transmission-patte": ("25\xa0Nm", "left-hand threaded", "Do NOT apply grease", "1.5\xa0Nm", "TL-RD11",
                                   "R126-01", "DAG-3", "3\xa0mm"),
            "transmission-pedalier": ("12-14\xa0Nm", "12-16\xa0Nm", "0,7-1,5\xa0Nm", "35-55\xa0Nm", "100\xa0km", "TL-BB12",
                                      "TL-BB13", "86.5\xa0mm", "Do not reuse the cups", "FC-RX820", "EVERY MONTH"),
            "transmission-depannage": ("Solid green: 51 - 100%", "CR1632", "3 years", "E401", "SM-PCE02",
                                       "[UPDATE AVAILABLE]", "Gear position control", "4.0.0", "1.5\xa0A",
                                       "The letter \"O\" is not used in the product serial ID."),
        }.items():
            for v in valeurs:
                self.assertIn(normaliser(v), t[ident], f"{ident} : {v}")
        self.assertIn('href="#montage-di2"', self.par_id["transmission-di2"].section.html())
        self.assertIn('href="#montage-di2"', self.par_id["transmission-depannage"].section.html())

    def test_aucune_valeur_du_cf7(self):  # Review Focus 1
        lus = " ".join([self.texte_complet()] + aria_labels(self.section))
        html = normaliser(self.source)
        for absent in ("molette", "stabilisateur", "shadow", "gaine", "serre-câble", "cs-m7100", "tl-lr15",
                       "fr-5.2h", "rx822", "rx610", "bb-rs500", "cn-m6100", "dm-gard010", "dm-macs001", "c-454",
                       "10-45", "10-51", "kit montée", "16-17", "16 - 17", "16 à 17", "38 dents", "y0sr980"):
            self.assertNotIn(absent, lus.lower(), absent)
            self.assertNotIn(absent, html.lower(), absent)
        # Le TL-FC36 de Lamine n'est nommé que pour dire qu'il ne sert pas à cette cassette, et jamais en 4.5.
        fc36 = [texte_de(l) for l in self.lignes() if "TL-FC36" in texte_de(l)]
        self.assertEqual(len(fc36), 1)
        self.assertIn("il ne sert pas à cette cassette", fc36[0])
        self.assertNotIn("TL-FC36", self.texte_atelier("transmission-cassette"))
        # Pas de câble sur ce Di2 sans fil : le seul câble du chapitre est celui de la charge, en USB.
        self.assertEqual(re.findall(r".{0,30}câbles?(?![\s\u00a0]USB)", lus, re.I), [])
        # Fixation du dérailleur à 10-12 Nm, jamais à 8-10 Nm (ni le serre-câble à 6-7 Nm).
        for motif in (r"(?<![\d,])8[\s\u00a0]*(?:-|à)[\s\u00a0]*10[\s\u00a0]*Nm", r"(?<![\d,])6[\s\u00a0]*(?:-|à)[\s\u00a0]*7[\s\u00a0]*Nm"):
            self.assertIsNone(re.search(motif, lus), motif)
        self.assertIn("10-12\xa0Nm", self.corps("transmission-reglage", "Serre l'axe B"))
        # « +4/+5 » n'est jamais une règle : il n'est écrit que dans un encadré « Contradiction » qui dit que la méthode
        # du DM-MARD011 s'applique.
        quatre = re.compile(r"4/5|\+[\s\u00a0]?4\b|\b4 ou 5\b")
        vues = 0
        for ligne in self.lignes():
            t = texte_de(ligne)
            if quatre.search(t):
                vues += 1
                note = next((p for p in ancetres(ligne) if p.tag == "aside"), None)
                self.assertIsNotNone(note, t[:120])
                self.assertTrue(texte_de(dom.selectionner(note, "p.note-t")[0]).startswith("Contradiction"), t[:120])
                self.assertIn("DM-MARD011", texte_de(note))
                self.assertIn("s'applique", texte_de(note))
        self.assertEqual(vues, 1)
        self.assertIsNone(quatre.search(" ".join(aria_labels(self.section))))

    def test_touche_du_mode_reglage(self):  # Review Focus 2
        # La touche de la ST-RX825 qui entre en mode réglage n'est pas publiée par défaut : l'étape le dit, renvoie à
        # E-TUBE PROJECT Cyclist et au bouton de fonction du dérailleur, qui suffit.
        mode = self.corps("transmission-reglage", "Roue arrêtée, entre en mode réglage")
        for mot in ("for 2 to 5 seconds", "until the LED turns solid yellow", "bouton de fonction", "non publié",
                    "E-TUBE PROJECT Cyclist", "[Shifting/Adj. mode]", "with the wheels stopped"):
            self.assertIn(mot, mode, mot)
        self.assertRegex(mode, r"manette[^.]*non publié")
        (note,) = self.notes("transmission-reglage", "La touche du mode réglage")
        for mot in ("non publié", "[Shifting/Adj. mode]", "Press and hold the shift switch assigned to the mode switch "
                    "function", "For the setting procedure, contact your place of purchase or a distributor.",
                    "bouton de fonction du dérailleur suffit"):
            self.assertIn(mot, texte_de(note), mot)
        self.assertIn("https://si.shimano.com/en/um/0RM0B/shift_adjust_mode", note.html())
        # Le « switch (A) » du DM est dessiné sur une manette de VTT : chaque ligne qui le cite le dit.
        vues = 0
        for ligne in self.lignes():
            t = texte_de(ligne)
            if "switch (A)" in t:
                vues += 1
                self.assertIn("VTT", t, t[:120])
        self.assertGreaterEqual(vues, 2)
        # Aucune touche de manette n'est donnée pour entrer en mode réglage, ni le bouton du repose-main.
        texte = self.texte_complet()
        self.assertIsNone(re.search(r"(?:repose-main|hood button)[^.]{0,80}mode réglage", texte))
        self.assertIsNone(re.search(r"mode réglage[^.]{0,80}(?:repose-main|hood button)", texte))

    def test_valeur_avec_source_officielle(self):  # Review Focus 3
        # Toute ligne qui porte un couple à appliquer (span.nm), des maillons à ajouter ou à compter, cite une source
        # officielle autre que Park Tool, qui ne sert que pour un geste ou pour ses propres outils. Toute ligne qui porte
        # un couple ou un pourcentage cite au moins une source.
        vues = dict.fromkeys(("nm", "couple", "%", "maillons"), 0)
        for ligne in self.lignes():
            t = texte_de(ligne)
            hotes = [urlparse(a.get("href")).hostname for a in dom.selectionner(ligne, "a.src")]
            hors_park = [h for h in hotes if h != "www.parktool.com"]
            for cle, present, sources in (
                    ("nm", dom.selectionner(ligne, "span.nm"), hors_park),
                    ("couple", COUPLE.search(t), hotes),
                    ("%", re.search(r"\d[\s\u00a0]?%", t), hotes),
                    ("maillons", re.search(r"\d[\s\u00a0]+(?:maillons|links)\b", t, re.I), hors_park)):
                if present:
                    vues[cle] += 1
                    self.assertTrue(sources, f"{cle} : {t[:160]}")
        for cle, plancher in {"nm": 14, "couple": 19, "%": 6, "maillons": 5}.items():
            self.assertGreaterEqual(vues[cle], plancher, cle)
        # Une proposition ne porte aucun couple à appliquer.
        for note in dom.selectionner(self.section, "aside.note.prop"):
            self.assertEqual(dom.selectionner(note, "span.nm"), [], texte_de(note)[:80])
        # Chaque lien sort vers un document officiel, à son adresse exacte dans les relevés ; chaque renvoi interne vise
        # un id des chapitres sources.
        ids = set()
        for nom in ("11-montage", "20-freins", "30-tubeless", "40-transmission"):
            ids |= {e.get("id") for e in dom.selectionner(dom.analyser(
                (RACINE / "src" / "parts" / f"{nom}.html").read_text(encoding="utf-8")), "[id]")}
        liens = [e for e in dom.selectionner(self.section, "[href]") if e.tag == "a"]
        self.assertGreaterEqual(len(liens), 500)
        for a in liens:
            href = a.get("href")
            with self.subTest(href):
                if href.startswith("#"):
                    self.assertIn(href[1:], ids)
                    continue
                self.assertTrue(href.startswith("https://"), href)
                self.assertIn(urlparse(href).hostname, OFFICIELS_TRANSMISSION, href)
                self.assertIn(href, self.releves, href)
                self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), href)
        # Les pages des documents Canyon et SRAM : le guide V02 par sa page ; le manuel route 2021 par sa page imprimée,
        # puis celle du PDF (deux pages imprimées par page PDF, la paire divisée par 2, plus 2) ; le manuel des roues, page
        # imprimée plus 1 ; le manuel SRAM, seulement aux pages que le relevé nomme.
        for a in dom.selectionner(self.section, "a.src"):
            href, texte = a.get("href"), a.texte()
            if QSG in href:
                self.assertRegex(texte, r"^Canyon QSG V02 p\.\d+$")
            elif "Canyon%20RR" in href:
                m = re.fullmatch(r"Canyon, manuel route 2021 p\.(\d+)(?:-(\d+))? imprimées? \(PDF p\.(\d+)\)", texte)
                self.assertIsNotNone(m, texte)
                paire = int(m.group(1)) - int(m.group(1)) % 2
                self.assertEqual(int(m.group(3)), paire // 2 + 2, texte)
            elif MANUEL_ROUES in href:
                m = re.fullmatch(r"Canyon, manuel des roues p\.(\d+) imprimée \(PDF p\.(\d+)\)", texte)
                self.assertIsNotNone(m, texte)
                self.assertEqual(int(m.group(2)), int(m.group(1)) + 1, texte)
            elif "udh-universal-derailleur-hanger-user-manual" in href:
                # La page quand le relevé la donne (p.3, p.4, p.11, la figure p.9), la section de pose sinon (p.6 à 9).
                self.assertRegex(texte, r"^SRAM, manuel UDH(?: p\.(?:3|4|9|11|6-9))?$")

    def test_pas_a_pas_securite(self):  # Review Focus 5
        # Le mode pas à pas ne montre que le titre et le corps des étapes : chaque avertissement est dans le corps de
        # l'étape qui en a besoin, pas seulement dans un encadré.
        for ident, consignes in {
            "transmission-nettoyer": {
                "Laisse la batterie dans le dérailleur": ("Wash the bicycle with the battery installed",
                                                          "Do not clean the bicycle with a high-pressure wash"),
                "Vérifie ton dégraissant": ("Wear approved eye protection while performing maintenance tasks",),
                "Lubrifie": ("Avoid contact with the brakes", "Otherwise, the brakes will fail!")},
            "transmission-chaine": {
                "Ouvre l'ancienne attache": ("Do not reuse a QUICK-LINK that has been removed",
                                             "lose control of the bicycle and fall", "Jette"),
                "Pose l'attache SM-CN910-12 neuve": ("be sure to replace the QUICK-LINK with a new one as well",
                                                    "rotation direction of the crank"),
                "Ferme l'attache": ("insufficient connecting force may cause chain separation or skip", "TL-CN10",
                                    "MLP-1.2"),
                "Contrôle que l'attache": ("as far as they will go", "ne roule pas"),
                "Coupe au CT-3.3": ("Wear approved eye protection while performing maintenance tasks",
                                    "Une coupe ne se rattrape pas"),
                "Passe toutes les vitesses": ("Your fingers can be seriously injured if caught", "doigts")},
            "transmission-cassette": {
                # I2 de la relecture finale : la roue reste déposée des étapes 2 à 11 ; la cale et le levier de frein
                # sont dans le corps de l'étape qui la dépose, la cale retirée dans celle qui la remonte.
                "Dépose la roue arrière": ("it is recommended that pad spacers are installed",
                                           "Do not depress the brake lever while the wheel is removed",
                                           "the pistons will protrude further than normal", "cale de plaquettes",
                                           "n'actionne pas le levier de frein", "(pas le levier de l'axe)"),
                "Mets des gants et des lunettes": ("wear gloves and eye protection",
                                                   "A sudden release of resistance on the lock ring may cause serious injury"),
                "Dévisse le contre-écrou": ("wear gloves and eye protection", "gradually apply force", "Gants et lunettes"),
                "Engage le TL-LR021": ("Keep TL-LR021 perpendicular to the smallest sprocket during use",),
                "Remonte la roue": ("Retire la cale de plaquettes", "Roue arrière décollée du sol",
                                    "Your fingers can be seriously injured if caught")},
            "transmission-reglage": {
                "Dans E-TUBE PROJECT Cyclist": ("The rear derailleur does not shift when connected",),
                "Roue arrêtée": ("with the wheels stopped", "Your fingers can be seriously injured if caught"),
                "Appuie sur X": ("Your fingers can be seriously injured if caught",),
                # O3 : les étapes 9, 12 et 13 font bouger le galet ou passer le dérailleur, manivelle en main.
                "Appuie 5 fois sur Y": ("Your fingers can be seriously injured if caught", "doigts"),
                "Butée basse": ("the wheel may lock", "The battery level drops quickly", "Roue arrière décollée du sol",
                                "Your fingers can be seriously injured if caught"),
                "Butée haute": ("The chain will become derailed from the sprocket", "Roue arrière décollée du sol",
                                "Your fingers can be seriously injured if caught"),
                "Passe sur le 45 dents": ("Roue arrière décollée du sol", "Your fingers can be seriously injured if caught"),
                "Passe toutes les vitesses": ("Roue arrière décollée du sol",
                                              "Your fingers can be seriously injured if caught"),
                "Passe chaque vitesse": ("Roue arrière décollée du sol", "Your fingers can be seriously injured if caught")},
        }.items():
            for debut, mots in consignes.items():
                corps = self.corps(ident, debut)
                for mot in mots:
                    self.assertIn(mot, corps, f"{ident}, {debut} : {mot}")
        self.assertIn("Gants et lunettes de protection", self.par_id["transmission-cassette"].outils)
        self.assertIn("Cale de plaquettes (2.2)", self.par_id["transmission-cassette"].outils)
        self.assertIn("Lunettes de protection", self.par_id["transmission-chaine"].outils)
        # La consigne de la roue déposée vient du DM-GADBR01 en HTML, recopiée au relevé ; 2.2 et 1.5 la donnent aussi.
        depose = self.par_id["transmission-cassette"].section
        for lien in ("https://si.shimano.com/en/dm/GADBR01/TO_ENSURE_SAFETY", "#freins-disques", "#montage-roues"):
            self.assertIn(f'href="{lien}"', depose.html(), lien)
        self.assertIn("https://si.shimano.com/en/dm/GADBR01/TO_ENSURE_SAFETY", self.releve)
        self.assertIn("Do not depress the brake lever while the wheel is removed.", self.releve)

    def test_etapes_lisibles(self):
        # Une étape tient sur un écran du mode pas à pas : au plus 1 600 caractères de corps, et du français autour des
        # citations anglaises (au moins 40 lettres hors citations et liens).
        nombres = {"transmission-nettoyer": 11, "transmission-usure": 5, "transmission-chaine": 12,
                   "transmission-cassette": 12, "transmission-reglage": 13}
        self.assertEqual({a.id: len(a.etapes) for a in self.ch.ateliers if a.etapes}, nombres)
        for a in self.ch.ateliers:
            for li in dom.selectionner(a.section, "ol.steps > li"):
                titre = texte_de(dom.selectionner(li, "p.st-t")[0])
                with self.subTest(f"{a.num} : {titre}"):
                    corps = [e for e in elements(li) if "st-t" not in e.classes()]
                    self.assertLessEqual(len(" ".join(texte_de(e) for e in corps)), 1600)
                    copie = dom.analyser("".join(e.html() for e in corps))
                    for lien in dom.selectionner(copie, "a.src"):
                        lien.retirer()
                    francais = re.sub(r"[^A-Za-zÀ-ÿ]", "", re.sub(r"«[^»]*»", "", copie.texte()))
                    self.assertGreaterEqual(len(francais), 40)

    # Chaque renvoi à une étape, dans tout le chapitre : l'atelier qui le porte, le passage, l'atelier visé, et le début
    # du titre de chaque étape visée. Une étape ajoutée, retirée ou déplacée décale les numéros : le titre ne correspond
    # plus, et le test échoue.
    RENVOIS = (
        ("transmission-di2", "(4.4, étape 1)", "transmission-chaine", {1: "Compte les maillons"}),
        ("transmission-nettoyer", "dans le dérailleur (étape 1)", "transmission-nettoyer", {1: "Laisse la batterie"}),
        ("transmission-nettoyer", "(Proposition), étape 2", "transmission-nettoyer", {2: "Vérifie ton dégraissant"}),
        ("transmission-nettoyer", "sans haute pression (étape 1)", "transmission-nettoyer", {1: "Laisse la batterie"}),
        ("transmission-nettoyer", "ou les plaquettes (étape 9)", "transmission-nettoyer", {9: "Lubrifie"}),
        ("transmission-nettoyer", "de ton produit (étapes 9 à 11)", "transmission-nettoyer", {9: "Lubrifie", 11: "Essuie"}),
        ("transmission-nettoyer", "MOTOREX s'applique (étapes 9 à 11)", "transmission-nettoyer", {9: "Lubrifie", 11: "Essuie"}),
        ("transmission-usure", "ce que tu fais est à l'étape 5", "transmission-usure", {5: "Décide"}),
        ("transmission-usure", "le faire confirmer (étape 5)", "transmission-usure", {5: "Décide"}),
        ("transmission-chaine", "il te servira aux étapes 5 et 6", "transmission-chaine",
         {5: "Trouve le point zéro", 6: "Coupe au CT-3.3"}),
        ("transmission-chaine", "le total au nombre noté à l'étape 1", "transmission-chaine", {1: "Compte les maillons"}),
        ("transmission-chaine", "si le total de l'étape 5", "transmission-chaine", {5: "Trouve le point zéro"}),
        ("transmission-chaine", "sur le nombre noté à l'étape 1", "transmission-chaine", {1: "Compte les maillons"}),
        ("transmission-chaine", "comme sur les figures de l'étape 5", "transmission-chaine", {5: "Trouve le point zéro"}),
        ("transmission-chaine", "face marquée dehors (étape 3)", "transmission-chaine", {3: "Repère la face marquée"}),
        ("transmission-chaine", "Contrôle-la à l'étape 10", "transmission-chaine", {10: "Contrôle que l'attache"}),
        ("transmission-chaine", "au moindre doute à l'étape 10", "transmission-chaine", {10: "Contrôle que l'attache"}),
        ("transmission-chaine", "plus l'attache (étape 5)", "transmission-chaine", {5: "Trouve le point zéro"}),
        ("transmission-chaine", "du DM-MARD011 (étape 5)", "transmission-chaine", {5: "Trouve le point zéro"}),
        ("transmission-cassette", "(1.5), à l'étape 1", "transmission-cassette", {1: "Dépose la roue arrière"}),
        ("transmission-cassette", "posée à l'étape 1", "transmission-cassette", {1: "Dépose la roue arrière"}),
        ("transmission-cassette", "en place (étape 2)", "transmission-cassette", {2: "Mets des gants"}),
        ("transmission-cassette", "à leur place (étape 6)", "transmission-cassette", {6: "Sors la cassette"}),
        ("transmission-cassette", "Shimano de l'étape 11", "transmission-cassette", {11: "Serre le contre-écrou"}),
        ("transmission-cassette", "(étapes 4 et 11)", "transmission-cassette",
         {4: "Engage le TL-LR021", 11: "Serre le contre-écrou"}),
        ("transmission-reglage", "passe à l'étape 2", "transmission-reglage", {2: "Contrôle la plaque de butée"}),
        ("transmission-reglage", "contre sa butée (étape 2)", "transmission-reglage", {2: "Contrôle la plaque de butée"}),
        ("transmission-reglage", "manette de VTT (étape 7)", "transmission-reglage", {7: "Roue arrêtée"}),
        ("transmission-reglage", "comme le (A) de l'étape 7", "transmission-reglage", {7: "Roue arrêtée"}),
        ("transmission-reglage", "que celle de l'étape 8", "transmission-reglage", {8: "Appuie sur X"}),
        ("transmission-reglage", "reviens à l'étape 8", "transmission-reglage", {8: "Appuie sur X"}),
        ("transmission-reglage", "reviens en mode réglage (étape 7)", "transmission-reglage", {7: "Roue arrêtée"}),
        ("transmission-reglage", "du dérailleur suffit (étape 7)", "transmission-reglage", {7: "Roue arrêtée"}),
        ("transmission-reglage", "celle des étapes 6 à 9", "transmission-reglage",
         {6: "Passe sur le 24 dents", 9: "Appuie 5 fois sur Y"}),
        ("transmission-patte", "(4.6, étape 11)", "transmission-reglage", {11: "Passe chaque vitesse"}),
    )

    def test_renvois_aux_etapes(self):
        for source, passage, cible, visees in self.RENVOIS:
            with self.subTest(passage):
                self.assertIn(passage, self.texte_atelier(source))
                titres = [normaliser(t) for t, _ in self.etapes_de(cible)]
                for n, debut in visees.items():
                    self.assertLessEqual(n, len(titres))
                    self.assertTrue(titres[n - 1].startswith(debut), f"étape {n} de {cible} : « {titres[n - 1]} »")
        # Chaque renvoi du chapitre est dans la liste : autant de renvois par atelier (« étape 6.1 » est celle du guide
        # Canyon, pas un renvoi).
        motif = re.compile(r"\bétapes? \d+(?!\.\d|\d)(?: (?:et|à) \d+)?")
        for a in self.ch.ateliers:
            self.assertEqual(len(motif.findall(self.texte_atelier(a.id))), len([r for r in self.RENVOIS if r[0] == a.id]),
                             a.id)

    def test_longueur_de_chaine(self):
        # La règle est la méthode du DM-MARD011, 5 ou 6 maillons plus l'attache ; le nombre de maillons du vélo n'est pas
        # publié : il se compte sur la chaîne livrée et se note ailleurs que sur ce site.
        compte = self.corps("transmission-chaine", "Compte les maillons")
        for mot in ("non publié", "à compter", "ailleurs que sur ce site",
                    "If you know that the old chain was of the correct length originally"):
            self.assertIn(mot, compte, mot)
        for mot in ("toute la boucle, attache comprise", "Un maillon, c'est un seul maillon intérieur ou extérieur",
                    "Compte donc l'attache comme un maillon de plus", "lecture de la figure par ce site",
                    "Shimano ne dit pas comment compter"):
            self.assertIn(mot, compte, mot)
        mesure = self.corps("transmission-chaine", "Trouve le point zéro")
        for mot in ("QUICK-LINK + 5 links", "QUICK-LINK + 6 links", "DM-MARD011", "étape 1", "figures",
                    "use a QUICK-LINK to connect the chain", "lu sur les figures par ce site",
                    "S'il est extérieur, ajoute 5 maillons", "s'il est intérieur, ajoute 6",
                    "Une seule des deux valeurs laisse un maillon intérieur à chaque bout"):
            self.assertIn(mot, mesure, mot)
        # La coupe : d'abord la règle d'arrêt, une proposition sans valeur, puis les lunettes.
        coupe = self.corps("transmission-chaine", "Coupe au CT-3.3")
        arret = coupe[coupe.index("Proposition"):coupe.index("Une coupe ne se rattrape pas.")]
        for mot in ("ne coupe pas", "fais contrôler la longueur par un atelier", "étape 5", "étape 1"):
            self.assertIn(mot, arret, mot)
        self.assertIsNone(re.search(r"\d[\s\u00a0]*(?:maillons|links)", arret))
        self.assertLess(coupe.index("Proposition"), coupe.index("Cut the chain if it is too long."))
        # La lecture des figures est dans le relevé, et c'est elle que le site reprend.
        for mot in ("Lecture des figures QUICK-LINK, 30/10/2026, seconde passe",
                    "**bleu clair = maillon intérieur, orange = maillon extérieur**",
                    "5 maillons quand le maillon qui arrive au point zéro est extérieur, 6 quand il est intérieur"):
            self.assertIn(mot, self.releve, mot)
        self.assertNotIn("lecture des couleurs de la figure non certaine", self.releve)
        (note,) = self.notes("transmission-chaine", "Contradiction\xa0: le nombre de maillons")
        for mot in ("Hard tail bike with QUICK-LINK + 4/5 links", "5 to 6 links + a QUICK-LINK", "s'applique"):
            self.assertIn(mot, texte_de(note), mot)
        releve = " ".join(texte_de(li) for li in dom.selectionner(self.par_id["transmission-di2"].section, "ul.check > li"))
        self.assertIn("nombre de maillons, à compter et à noter ailleurs que sur ce site", releve)
        # Aucun nombre final de maillons pour ton vélo : seuls 5 et 6 (attache), 6 et 7 (goupille), 4/5 de l'article et
        # les 138 maillons de la chaîne vendue par Canyon.
        nombres = set(re.findall(r"(\d+)[\s\u00a0]+(?:maillons|links)\b", self.texte_complet(), re.I))
        self.assertLessEqual(nombres, {"5", "6", "7", "138"})

    def test_usure_contradiction(self):
        # Le critère Shimano (sa jauge entre complètement) et le CC-3.2 de Park à 0,5 % : une contradiction, avec la
        # conduite à tenir.
        (note,) = self.notes("transmission-usure", "Contradiction\xa0: le critère d'usure")
        for mot in ("completely fall into the chain", "it is important to use a SHIMANO chain gauge",
                    "premature chain replacements", "replace at or just before 0.5%", "Check with manufacturer",
                    "AFTER 6 MONTHS", "prime"):
            self.assertIn(mot, texte_de(note), mot)
        decide = self.corps("transmission-usure", "Décide")
        for mot in ("garde ta chaîne", "Park", "Shimano", "TL-CN42", "non vérifié", "SEE A MECHANIC IF NECESSARY",
                    "4.4"):
            self.assertIn(mot, decide, mot)

    def test_reglage_di2(self):
        titres = [t for t, _ in self.etapes_de("transmission-reglage")]
        ordre = [next(i for i, t in enumerate(titres) if t.startswith(d)) for d in (
            "Dans E-TUBE PROJECT Cyclist", "Contrôle la plaque de butée", "Serre l'axe B", "Passe sur le 45 dents",
            "Passe toutes les vitesses", "Passe sur le 24 dents", "Roue arrêtée", "Appuie sur X", "Appuie 5 fois sur Y",
            "Reviens au mode normal", "Passe chaque vitesse", "Butée basse", "Butée haute")]
        # L'ordre du DM-MARD011 : « Adjusting the B-screw », « Shifting adjustment », « Adjusting the low / high limits ».
        self.assertEqual(ordre, list(range(13)))
        for debut, mots in {
            "Dans E-TUBE PROJECT Cyclist": ("This setting is enabled by default", "Switches between the SGS type and "
                                            "GS type.", "le tien est GS", "non publié"),
            "Contrôle la plaque de butée": ("stopper plate contacts the B-tension stop with no gap in between",),
            "Serre l'axe B": ("10-12\xa0Nm", "5\xa0mm", "B-axle"),
            "Passe sur le 45 dents": ("Align the contour of the outer plate with the tip of the tallest tooth on the "
                                      "largest sprocket", "2\xa0mm", "non publié"),
            "Butée basse": ("Tighten the low limit screw until it just touches the low limit stopper.",
                            "largest sprocket"),
            "Butée haute": ("Tighten the high limit screw until it just touches the high limit stopper.",
                            "smallest sprocket"),
            "Passe sur le 24 dents": ("fifth gear position from the largest sprocket", "le cinquième est le 24 dents",
                                      "le quatrième le 28 dents", "déduction"),
            "Roue arrêtée": ("solid yellow",),
            "Appuie sur X": ("fourth gear", "subtle noise", "28 dents"),
            "Appuie 5 fois sur Y": ("Press shift switch (Y) 5 times", "five steps toward the smallest sprocket"),
            "Reviens au mode normal": ("0.5 seconds or longer", "the LED turns off"),
            "Passe chaque vitesse": ("check that no noise is generated at any sprocket position", "TL-RD11"),
        }.items():
            corps = self.corps("transmission-reglage", debut)
            for mot in mots:
                self.assertIn(mot, corps, f"{debut} : {mot}")
        (note,) = self.notes("transmission-reglage", "Le même réglage dans l'application")
        for mot in ("If the battery charge is low, a confirmation screen is displayed and you cannot perform adjustment.",
                    "5 crans"):
            self.assertIn(mot, texte_de(note), mot)

    def test_travaux_d_atelier(self):
        # Le boîtier, l'alignement de la patte et la mise à jour des manettes par un fil : des travaux d'atelier, dits
        # comme tels, sans pas à pas (les trois ateliers qui en parlent sont des fiches « comprendre », sans liste).
        for ident, mots in {
            "transmission-patte": ("travail d'atelier", "TL-RD11", "non publié", "qualified bicycle mechanic"),
            "transmission-pedalier": ("travail d'atelier", "TL-BB12", "TL-BB13",
                                      "Do not reuse the cups as they can be damaged during removal."),
            "transmission-depannage": ("travail d'atelier", "SM-PCE02",
                                       "Wireless firmware update is not available for the wireless shifter/switch"),
        }.items():
            a = self.par_id[ident]
            self.assertEqual(a.type, "comprendre")
            self.assertEqual(dom.selectionner(a.section, "ol"), [], ident)
            for mot in mots:
                self.assertIn(mot, self.texte_atelier(ident), f"{ident} : {mot}")
        # La patte : Canyon 2021 contre SRAM UDH (graisse, couple, filetage à gauche), le manuel de la pièce montée prime.
        (note,) = self.notes("transmission-patte", "Contradiction")
        for mot in ("apply a little grease between derailleur hanger and frame", "1.5\xa0Nm",
                    "Do NOT apply grease to the UDH hanger or frame.", "25\xa0Nm", "filetage à gauche", "s'applique"):
            self.assertIn(mot, texte_de(note), mot)

    def test_outils_de_lamine(self):
        # La liste confirmée le 30/10 (relevé, « Outils de Lamine et ce qui manque ») : chaque atelier demande ses outils ;
        # 4.1 dit ce qui manque et ce qui reste à l'atelier.
        outils = {a.id: " ".join(a.outils) for a in self.ch.ateliers}
        for ident, mots in {"transmission-nettoyer": ("CM-5.3", "Muc-Off", "MOTOREX"),
                            "transmission-usure": ("CC-3.2",),
                            "transmission-chaine": ("MLP-1.2", "CT-3.3", "SM-CN910-12", "CN-M8100"),
                            "transmission-cassette": ("TL-LR021", "SR-12.2", "TW-6.2", "Gants et lunettes"),
                            "transmission-reglage": ("TW-6.2", "5\xa0mm", "PB Swiss")}.items():
            for mot in mots:
                self.assertIn(mot, outils[ident], f"{ident} : {mot}")
        di2 = self.texte_atelier("transmission-di2")
        for mot in ("CC-3.2", "MLP-1.2", "CT-3.3", "CM-5.3", "TW-6.2", "ATD-1.2", "Muc-Off", "MOTOREX", "PB Swiss",
                    "TL-LR021", "SR-12.2", "TL-SR24", "TL-CN10", "6\xa0mm", "8\xa0mm", "lint-free cloth",
                    "E-TUBE PROJECT Cyclist", "gants", "lunettes", "travaux d'atelier", "aucun couple de ce chapitre"):
            self.assertIn(mot, di2, mot)
        # La MLP-1.2 suit Park Tool, et le site dit que Shimano demande la TL-CN10.
        (note,) = self.notes("transmission-chaine", "Contradiction\xa0: l'outil de l'attache")
        for mot in ("MLP-1.2", "TL-CN10", "A SHIMANO original tool is required to remove the QUICK-LINK.",
                    "Shimano® XTR® 12-speed", "s'applique"):
            self.assertIn(mot, texte_de(note), mot)

    def test_contradictions(self):
        # Chaque contradiction du relevé qui touche un atelier est dite sur sa page, avec ce qui s'applique.
        attendu = {
            "transmission-di2": ("1,000\xa0km", "about 1 hour", "over a month"),
            "transmission-nettoyer": ("Never use alkali- or acid-based solvents", "There is no need to use special degreasers.",
                                      "Under no circumstances should a chain be soaked in degreaser.",
                                      "a small drop of lube in the joint of each link", "trois passages",
                                      "Apply a small drop to each individual rivet.", "AFTER EVERY RIDE",
                                      "after dusty or wet rides", "at least during every second wash"),
            "transmission-usure": ("completely fall into the chain", "0.5%", "AFTER 6 MONTHS", "lift it off the teeth"),
            "transmission-chaine": ("4/5", "5 to 6 links", "Connecting pin", "TL-CN10", "MLP-1.2", "SM-CN910", "SM-CN900",
                                    "you won't need a tool for installation"),
            "transmission-cassette": ("30-50\xa0Nm", "40\xa0Nm", "10T smallest sprocket"),
            "transmission-reglage": ("for 2 seconds or longer", "for 2 to 5 seconds", "4 steps", "five steps",
                                     "E-TUBE PROJECT Professional"),
            "transmission-patte": ("apply a little grease", "1.5\xa0Nm", "Do NOT apply grease", "25\xa0Nm"),
            "transmission-pedalier": ("high-grade grease", "PF-86"),
            "transmission-depannage": ("dummy plug", "PC linkage devices"),
        }
        for ident, mots in attendu.items():
            with self.subTest(ident):
                notes = self.notes(ident, "Contradiction")
                self.assertTrue(notes, ident)
                texte = " ".join(texte_de(n) for n in notes)
                for mot in mots:
                    self.assertIn(mot, texte, mot)
                for n in notes:
                    self.assertTrue(dit_ce_qui_s_applique(texte_de(n)), texte_de(n)[:160])
        self.assertGreaterEqual(sum(len(self.notes(a.id, "Contradiction")) for a in self.ch.ateliers), 17)
        # Le contrôle lui-même : une négation, « à appliquer » ou un mot qui contient « prime » ne comptent pas ; les
        # pluriels comptent.
        # N4 de task-1-rereview.md : le « ne » de « neuve » n'est pas une négation, « Ce site applique » compte (la
        # tournure de Montage et Tubeless), et « ne dit pas laquelle s'applique » ne dit pas ce qui s'applique.
        for faux in ("Park Tool donne sa valeur, que ce site ne retient pas.", "Park ne la retient pas.",
                     "ce site n'applique pas cette valeur", "les valeurs à appliquer sont dans le tableau",
                     "une page à imprimer", "Shimano ne dit pas laquelle s'applique.",
                     "Canyon ne précise pas ce qui s'applique.", "Ce site n'applique ni l'une ni l'autre."):
            self.assertFalse(dit_ce_qui_s_applique(faux), faux)
        for vrai in ("La plage Shimano s'applique.", "les figures s'appliquent", "Ces consignes priment.",
                     "120 kg s'imposent", "Ce site retient de 2 à 5 secondes.", "La règle de la chaîne neuve s'applique.",
                     "Ce site applique le guide Canyon.", "Les deux textes s'appliquent, la notice d'abord."):
            self.assertTrue(dit_ce_qui_s_applique(vrai), vrai)

    def test_a_lire_a_la_livraison(self):
        # 4.1 : la liste du relevé « À lire sur la pièce à la livraison », à cocher, point par point.
        section = self.par_id["transmission-di2"].section
        (liste,) = dom.selectionner(section, "ul.check")
        self.assertEqual(liste.get("data-key"), "transmission-releve")
        (bouton,) = dom.selectionner(section, "button.btn-reset")
        self.assertEqual(bouton.get("data-reset"), "transmission-releve")
        points = dom.selectionner(liste, "li")
        self.assertEqual(len(points), 10)
        for n, li in enumerate(points, 1):
            self.assertEqual(dom.selectionner(li, "input")[0].get("id"), f"ck-transmission-releve-{n}")
            self.assertTrue(dom.selectionner(li, "span.verif"), texte_de(li)[:80])
        tout = " ".join(texte_de(li) for li in points)
        for mot in ("RD-M8250-GS", "plaque de butée", "UDH", "marquage de couple", "ST-RX825-L", "BL-RX825-L",
                    "[X] et [Y]", "numéro de série", "bouchon du port E-TUBE", "CN-M8100", "nombre de maillons",
                    "flèche", "face marquée", "du 9 «\xa0A\xa0» au 45 «\xa0H\xa0»", "contre-écrou intégré",
                    "Micro Spline", "TL-LR021", "FC-RX820", "165", "plateau de 40", "empreinte", "plaque de sécurité",
                    "SM-BB72-41B", "[UPDATE AVAILABLE]", "E-BIKE", "GS", "[Shifting/Adj. mode]", "changement multiple",
                    "CR1632", "MOTOREX", "Muc-Off", "fiche de données de sécurité", "clé Canyon"):
            self.assertIn(mot, tout, mot)

    def test_aucune_donnee_personnelle(self):
        # Comme pour Montage et Tubeless : ni jeton personnel, ni prénom, ni magasin, ni prix, ni commande.
        verifier_aucune_donnee(self, self.texte_complet(), self.source, en_plus=("Lamine",))
        texte = self.texte_complet().replace("\u00a0", " ")
        self.assertIsNone(re.search(r"\b(?:commandes?|prix|magasin|boutique)\b", texte, re.I))

    def test_typographie(self):
        attributs = [normaliser(e.get(nom)) for nom in ("aria-label", "data-de", "data-vers")
                     for e in dom.selectionner(self.section, f"[{nom}]")]
        texte = re.sub(r"<[^>]*>", " | ", self.source) + " | " + " | ".join(attributs)
        self.assertIsNone(re.search("[—–]", self.source))
        # Une valeur et son unité sont séparées par une espace insécable.
        motif = r".{0,40}\d (?:Nm|mm|cm|km|kg|g|h|s|°C|%|V|A|mL|ml|Wh|Ah|miles)(?![\w·])"
        self.assertIsNone(re.search(motif, texte), re.search(motif, texte))
        # Une espace insécable avant « : ; ? ! » et à l'intérieur des guillemets, comme aux chapitres 1 à 3.
        self.assertIsNone(re.search(r".{0,30}[^\s|] [:;?!»]", texte), re.search(r".{0,30}[^\s|] [:;?!»]", texte))
        self.assertIsNone(re.search(r".{0,30}« ", texte), re.search(r".{0,30}« ", texte))
        self.assertNotIn("&nbsp;", self.source)
        self.assertNotIn("N·m", self.source)
        self.assertNotIn("’", self.source)  # apostrophes droites

    def test_abreviations_par_page(self):
        verifier_abreviations(self, self.ch.ateliers, {
            "DM": "Dealer's Manual", "UM": "User's Manual", "QSG": "guide de démarrage Canyon",
            "PDF": "Portable Document Format", "FAQ": "foire aux questions", "UDH": "Universal Derailleur Hanger",
            "USB": "Universal Serial Bus", "LED": "diode électroluminescente", "VTT": "vélo tout terrain",
            "MTB": "mountain bike", "PF": "Press-Fit", "LE": "Low Energy"})

    def test_couples(self):
        # Le tableau des couples du chapitre (résumé « couples », en 4.1) : chaque couple à appliquer, une fois, avec son
        # outil et sa source officielle ; aucun autre span.nm dans le chapitre.
        (resume,) = self.ch.resumes["couples"]
        self.assertTrue(any(p is self.par_id["transmission-di2"].section for p in ancetres(resume)))
        lignes = dom.selectionner(resume, "tbody > tr")
        couples = [[texte_de(nm) for nm in dom.selectionner(tr, "span.nm")] for tr in lignes]
        self.assertEqual(couples, [["10-12\xa0Nm"], ["30-50\xa0Nm"], ["12-14\xa0Nm"], ["12-16\xa0Nm"],
                                   ["0,7-1,5\xa0Nm"], ["35-55\xa0Nm"], ["25\xa0Nm"]])
        for tr in lignes:
            sources = [a for a in dom.selectionner(tr, "a.src") if "parktool.com" not in a.get("href")]
            self.assertTrue(sources, texte_de(tr)[:80])
        self.assertEqual({texte_de(e) for e in dom.selectionner(self.section, "span.nm")}, {c for (c,) in couples})
        (capuchon,) = [tr for tr in lignes if "0,7-1,5" in texte_de(tr)]
        self.assertIn("Aucun de tes outils", texte_de(capuchon))
        (cassette,) = [tr for tr in lignes if "30-50" in texte_de(tr)]
        for mot in ("Adjustable wrench", "non publié", "40\xa0Nm"):
            self.assertIn(mot, texte_de(cassette), mot)

    def test_sans_ecarts_des_brouillons(self):
        # Les autres écarts du relevé (section « Écarts avec les brouillons du 20/10 »), chacun par un indice précis.
        texte, html = self.texte_complet(), normaliser(self.source)
        for absent in ("Front Chainwheel", "Cassette Sprocket",  # développés des préfixes, non vérifiés
                       "24 rivets", "1/16", "four additional rivets", "2 pouces",  # chiffres Park hors de ses outils
                       "au moins 40", "Entre 40 et 50",  # règle inventée pour la cassette
                       "5 à 6\xa0mm", "TL-CT12", "OT-RS900", "Torx 27", "5,5\xa0mm",  # vis B de Park, câble du CF 7
                       "Y0GY", "10\xa0dents", "10, 12 et 14",  # cassette 10-45 du CF 7
                       "Rose Bikes", "Excel Sports", "SJS Cycles", "Performance Bike", "Competitive Cyclist",
                       "n-1", "99spokes", "Fabio"):
            self.assertNotIn(absent, texte, absent)
        for motif in (r"\bSIS\b", r"\bBSA\b"):
            self.assertIsNone(re.search(motif, texte), motif)
        cf7 = re.compile(r"(?<![0-9a-z#])CF[\s_-]*7(?![0-9])|4553", re.I)
        self.assertIsNone(cf7.search(texte))
        self.assertIsNone(cf7.search(html))
        for adresse in ("mtb.shimano.com", "bike-discount", "rosebikes", "excelsports", "99spokes", "nminus1",
                        "/en-qa/", "/pdfs/", "UkZxPIZ1ngY", "Y6W6djIOdnM", "a0YAoGhgAK8"):
            self.assertNotIn(adresse, html, adresse)
        # Les galets n'ont pas de sens de rotation (le brouillon leur en donnait un).
        self.assertIn("The pulleys do not have a specific direction of rotation.", texte)
        # Le dérailleur se lave batterie en place (consigne qui manquait au brouillon).
        self.assertIn("Wash the bicycle with the battery installed", self.texte_atelier("transmission-nettoyer"))

    def test_relecture_de_la_tache_1(self):  # mineurs de task-1-review.md
        # 1. La jauge Shimano chez un mécanicien est une proposition du site, pas une consigne Canyon.
        decide = self.corps("transmission-usure", "Décide")
        self.assertIn("Proposition : fais alors confirmer l'usure à une jauge Shimano par un mécanicien".replace(" :", "\u00a0:"),
                      decide)
        self.assertNotIn("comme le prévoit Canyon", decide)
        # 2. La fréquence retenue garde le nettoyage à sec, et le dégraissage complet n'a pas d'intervalle publié.
        (note,) = self.notes("transmission-nettoyer", "Contradiction\u00a0: la fréquence")
        for mot in ("DRY CLEAN", "USE BIKE CLEANER", "n'a pas d'intervalle publié"):
            self.assertIn(mot, texte_de(note), mot)
        # 4. Le geste de la MLP-1.2, d'après la page Park Tool, à l'ouverture et à la fermeture.
        self.assertIn("Then squeeze the handles to open or pull the handles to close the link.",
                      self.corps("transmission-chaine", "Ouvre l'ancienne attache"))
        self.assertIn("pull the handles to close the link", self.corps("transmission-chaine", "Ferme l'attache"))
        # 5. La graisse Shimano de la liste des outils du relevé.
        self.assertIn("Premium Grease(Y04110000)", self.texte_atelier("transmission-di2"))
        # 6. Sans fil, la mise à jour des manettes ne s'affiche pas, en 4.1 (liste à lire) comme en 4.9.
        manque = "[UPDATE AVAILABLE] is not displayed even when an update is possible."
        releve = " ".join(texte_de(li) for li in dom.selectionner(self.par_id["transmission-di2"].section, "ul.check > li"))
        self.assertIn(manque, releve)
        self.assertIn(manque, self.texte_atelier("transmission-depannage"))
        # 8. Le sens de dépose du contre-écrou, lu sur la figure du DM, dit comme une lecture.
        devisse = self.corps("transmission-cassette", "Dévisse le contre-écrou")
        for mot in ("sens inverse des aiguilles d'une montre", "lecture de la figure par ce site"):
            self.assertIn(mot, devisse, mot)
        self.assertIn("l'outil tourne dans le sens inverse des aiguilles d'une montre", self.releve)

    def test_vague_finale(self):  # final-review.md (I1, M1, M2) et points parqués (vague-finale-parquee.md)
        # I1. Le (X) et le (Y) du DM-MARD011 sont dessinés sur une manette de VTT : les palettes X et Y de la ST-RX825
        # en mode réglage sont une déduction de ce site, dite dans le corps des étapes 8 et 9, avec le contrôle du sens
        # que Shimano rend possible ; de même au relevé.
        x = self.corps("transmission-reglage", "Appuie sur X")
        for mot in ("dessiné sur une manette de VTT", "comme le (A) de l'étape 7", "déduction de ce site",
                    "so that you can check the adjustment direction", "le galet doit aller vers le 28 dents",
                    "prends l'autre palette"):
            self.assertIn(mot, x, mot)
        y = self.corps("transmission-reglage", "Appuie 5 fois sur Y")
        for mot in ("l'autre palette que celle de l'étape 8", "déduction de ce site", "le galet doit aller vers le petit "
                    "pignon"):
            self.assertIn(mot, y, mot)
        self.assertNotIn("En mode réglage, [X] et [Y] de la manette droite déplacent le galet", self.releve)
        for mot in ("En mode réglage, ce que font [X] et [Y] de la ST-RX825 : **non publié**",
                    "Déduction de ce relevé : (X) est la palette [X] de la manette droite",
                    "so that you can check the adjustment direction"):
            self.assertIn(mot, self.releve, mot)
        # M1. Deux pannes de charge, chacune avec ses remèdes : l'adaptateur de 1,5 A ne répond qu'au voyant d'erreur.
        (charge,) = [texte_de(q) for q in dom.selectionner(self.par_id["transmission-depannage"].section, "div.q")
                     if texte_de(q).startswith("La batterie ne charge pas")]
        for mot in ("Is the USB cable connected securely?", "check whether the USB cable is damaged",
                    "Replace the battery with a new one.", "but this is normal",
                    "The current may be insufficient for charging."):
            self.assertIn(mot, charge, mot)
        self.assertNotIn("Il faut un adaptateur", charge)
        self.assertNotIn("« Cannot charge. » et", charge.replace("\xa0", " "))
        erreur = charge.index("The error indicator flashes while charging.")
        self.assertLess(charge.index("but this is normal"), erreur)
        self.assertLess(erreur, charge.index("higher than 1.5\xa0A"))
        self.assertIn("« Cannot charge. » : « Is the USB cable connected securely? »", self.releve)
        self.assertNotIn("« Cannot charge. » et « The error indicator flashes while charging. »", self.releve)
        # M2. Deux lectures signalées : le bleu clignotant d'un appui trop court, sa sortie non publiée ; le type GS.
        mode = self.corps("transmission-reglage", "Roue arrêtée")
        self.assertIn("lecture du tableau de Shimano par ce site", mode)
        self.assertRegex(mode, r"sortir[^.]*non publié")
        self.assertNotIn("recommence", mode)
        self.assertIn("le type GS est le tien (lecture de ce site)", self.texte_atelier("transmission-di2"))
        self.assertIn("le tien est GS (lecture de ce site", self.corps("transmission-reglage", "Dans E-TUBE PROJECT"))
        # Parqué. Le sens de dépose du contre-écrou : vu du côté du 9 dents, à confirmer sur la pièce.
        devisse = self.corps("transmission-cassette", "Dévisse le contre-écrou")
        for mot in ("du côté du 9 dents", "à confirmer sur la pièce", "lecture de la figure par ce site"):
            self.assertIn(mot, devisse, mot)
        self.assertIn("petit pignon vers le lecteur", self.releve)
        self.assertIn("à confirmer sur la pièce, la cassette vue du côté du petit pignon", self.releve)
        # N1 à N3. Le maillon intérieur des figures, le point zéro, et le total épelé.
        compte = self.corps("transmission-chaine", "Compte les maillons")
        for mot in ("bleu clair", "orange", "lecture de ce site"):
            self.assertIn(mot, compte, mot)
        mesure = self.corps("transmission-chaine", "Trouve le point zéro")
        self.assertNotIn("un bout de la chaîne, un maillon intérieur, s'arrête au point zéro", mesure)
        for mot in ("le brin qui arrive par le 45 dents s'arrête au point zéro", "juste en dessous",
                    "plus 5 ou 6, plus 1 pour l'attache"):
            self.assertIn(mot, mesure, mot)
        # N5. La fermeture de la MLP-1.2, mot pour mot.
        ferme = self.corps("transmission-chaine", "Ferme l'attache")
        self.assertNotIn("écartant", ferme)
        self.assertIn("en tirant les poignées", ferme)
        # Réserves : « sans fil » pour [UPDATE AVAILABLE] ; les lunettes « pour l'entretien », sans « tout ».
        releve = " ".join(texte_de(li) for li in dom.selectionner(self.par_id["transmission-di2"].section, "ul.check > li"))
        self.assertIn("Pour tes manettes, reliées sans fil, l'absence", releve)
        self.assertNotIn("pour tout l'entretien", self.texte_complet())
        # O2. La graisse Shimano du relevé : l'axe B seulement, la manivelle sans graisse nommée.
        self.assertNotIn("(manivelle, axe B)", self.releve)
        self.assertIn("Shimano cite « Premium Grease(Y04110000) » pour l'axe B (6.7)", self.releve)

    def test_texte_conserve(self):
        # Comme pour Freins, Montage et Tubeless : les deux colonnes de chaque page gardent tout le texte du source.
        verifier_texte_conserve(self, self.ch.ateliers)


# ---------------------------------------------------------------------------------------------------------------
# Chapitre 5, Accessoires des trajets : relu depuis son fragment (lot 5, publié en relecture)
# ---------------------------------------------------------------------------------------------------------------

ACCESSOIRES = RACINE / "src" / "parts" / "60-accessoires.html"
RELEVE_ACCESSOIRES = RACINE / "docs" / "recherche" / "accessoires-cf8-di2.md"
# Le relevé du lot 5 renvoie aux relevés déjà vérifiés (« Base déjà vérifiée, non refaite ») : une adresse du chapitre
# peut venir de l'un d'eux (les outils de Lamine, la patte UDH, la tige de selle).
RELEVES_DU_LOT_5 = (RELEVE_ACCESSOIRES, RELEVE_TRANSMISSION) + RELEVES_DE_BASE
# Les documents des fabricants des pièces et des outils de Lamine, et les vidéos de leurs chaînes : aucun autre site.
OFFICIELS_ACCESSOIRES = {"www.tailfin.cc", "media.tailfin.cc", "www.canyon.com", "www.sram.com", "si.shimano.com",
                         "www.garmin.com", "www8.garmin.com", "www.parktool.com", "www.pbswisstools.com",
                         "www.youtube.com"}
# Les ateliers de montage, qui commencent chacun par l'avertissement du lot (spec, « La règle de prudence du lot »).
MONTAGES = ("accessoires-axe", "accessoires-rack", "accessoires-gardeboue", "accessoires-sacs", "accessoires-feu")
PRUDENCE = "À confirmer avec Canyon avant de rouler chargé"
SERVICE_CLIENT = "réponse écrite du service client Tailfin"
# La notice 2025 de l'axe, celle du kit précédent : elle écrit le sens de dépose (étape 9) et le filetage à graisser
# (étape 3).
NOTICE_AXE_2025 = ("https://media.tailfin.cc/app/uploads/2025/02/19144832/"
                   "UNIVERSAL-THRU-AXLE-PACKING-LAYOUT_PRINT_ROUND-3.pdf")
# Les couples qu'aucun outil de Lamine ne couvre : 1, 1,5, 2, 3 et 8 Nm (TW-6.2 de 10 à 60 Nm, ATD-1.2 de 4 à 6 Nm). Le
# bout d'une plage (« 8-10 Nm ») n'en est pas un.
HORS_OUTILS_5 = re.compile(r"(?<![\d,.\-])(?:1|1,5|2|3|8) Nm")
# Une charge écrite, en français ou dans une citation : « 9 kg », « 9kg », « 4.5kg », « 120 KG ».
KG = re.compile(r"(?<![\d.,])(\d+(?:[.,]\d+)?)\s?kg\b", re.I)
# Les phrases du service client Tailfin que garde le relevé (section 7), sans lien public.
PHRASES_DU_SERVICE = ("the Journey Rack uses the Universal Thru Axle along with the SRAM UDH adaptor",
                      "We can't confirm a perfect fit for your Canyon SP100 VCLS 2.1 split carbon seatpost",
                      "The Journey Rack with Mudguard has a clearance of 29 x 2.4.",
                      "The 16L is the most common commuter size but won't fit a 16-inch laptop.",
                      "Shoulder straps are available for the 22L panniers.",
                      "will have a clear view as long as you don't use a Top Bag",
                      # M5 de la revue finale : le début du point sur les sacoches, coupé à la virgule.
                      "The Journey Rack comes with pannier mounts designed for our 22L panniers")


def charges(texte):
    """Les charges du texte, en kilos : 4,5 et 4.5 donnent 4.5."""
    return [float(n.replace(",", ".")) for n in KG.findall(texte)]


class TestAccessoires(PasAPas, unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = ACCESSOIRES.read_text(encoding="utf-8")
        cls.releve = normaliser(RELEVE_ACCESSOIRES.read_text(encoding="utf-8"))
        cls.releves = "\n".join(f.read_text(encoding="utf-8") for f in RELEVES_DU_LOT_5)
        cls.ch = ateliers.relever_chapitre(cls.source)
        cls.par_id = {a.id: a for a in cls.ch.ateliers}
        cls.section = cls.ch.tete.parent

    def texte_complet(self):
        return texte_de(self.section)

    def texte_atelier(self, ident):
        return texte_de(self.par_id[ident].section)

    def lignes(self):
        return lignes_de(self.section, questions=True)

    def notes(self, ident, debut):
        """Les encadrés de l'atelier dont le titre commence par `debut`."""
        return [n for n in dom.selectionner(self.par_id[ident].section, "aside.note")
                if texte_de(dom.selectionner(n, "p.note-t")[0]).startswith(debut)]

    def releve_section(self, titre, suivant):
        """Le texte d'une section du relevé, de son titre au titre suivant."""
        return self.releve[self.releve.index(titre):self.releve.index(suivant)]

    def test_chapitre(self):
        self.assertEqual(self.ch.id, "accessoires")
        self.assertEqual((self.section.tag, self.section.classes()), ("section", ["chapter"]))
        (num,) = dom.selectionner(self.ch.tete, "p.ch-num")
        self.assertEqual(num.texte(), "Chapitre 5 · Accessoires des trajets")
        self.assertEqual(dom.selectionner(self.ch.tete, "h2")[0].texte(), "Accessoires des trajets")
        ids = [e.get("id") for e in dom.selectionner(dom.analyser(self.source), "[id]")]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sorted(self.ch.resumes), ["couples"])
        # L'en-tête, seul sur la page de la catégorie, développe ses abréviations et dit la règle de prudence du lot.
        tete = texte_de(self.ch.tete)
        for mot in ("UDH (Universal Derailleur Hanger", "Nm (newton-mètre)", "Tailfin", "Garmin Varia RearVue 820",
                    "à confirmer avec Canyon avant de rouler chargé", SERVICE_CLIENT):
            self.assertIn(mot, tete, mot)

    def test_publie(self):
        # Le lot 5 est publié en relecture, avec ce chapitre seul et sa pièce 3D, sans « prevu » : sa catégorie montre
        # ses ateliers. L'entretien courant et le dépannage sont passés au lot 6.
        config = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
        (lot,) = [l for l in config["lots"] if l["lot"] == 5]
        self.assertEqual((lot["statut"], lot["parts"], lot["categorie"]["id"], lot["modeles"]),
                         ("en relecture", ["60-accessoires"], "accessoires", ["rack"]))
        self.assertNotIn("prevu", lot)

    def test_ateliers_ids_types_zones(self):
        self.assertEqual([(a.id, a.num, a.type, a.zone) for a in self.ch.ateliers], [
            ("accessoires-materiel", "5.1", "comprendre", "portebagages"),
            ("accessoires-axe", "5.2", "remplacer", "portebagages"),
            ("accessoires-rack", "5.3", "remplacer", "portebagages"),
            ("accessoires-gardeboue", "5.4", "remplacer", "portebagages"),
            ("accessoires-sacs", "5.5", "regler", "portebagages"),
            ("accessoires-feu", "5.6", "remplacer", "portebagages"),
            ("accessoires-charge", "5.7", "comprendre", "portebagages")])
        self.assertEqual([normaliser(a.titre) for a in self.ch.ateliers], [
            "Ton matériel Tailfin", "Remplacer l'axe arrière et poser l'adaptateur UDH", "Monter le Journey Rack",
            "Le garde-boue du Journey Rack", "Sacoches, CargoPack, étuis et bandoulière",
            "Le feu arrière Garmin RearVue 820", "Rouler chargé"])

    def test_remplacer(self):
        # Les libellés de la spec ; « en alliage », comme Tailfin, qui écrit « Alloy » et jamais « aluminium » pour ce
        # porte-bagages (relevé, « Configuration retenue »).
        attendu = {"accessoires-axe": ("Axe arrière DT Swiss livré", "Universal Thru Axle et adaptateur UDH Tailfin"),
                   "accessoires-rack": ("Aucun porte-bagages", "Journey Rack en alliage"),
                   "accessoires-gardeboue": ("Aucun garde-boue", "Garde-boue du Journey Rack"),
                   "accessoires-feu": ("Aucun feu arrière", "Support Tailfin et Garmin Varia RearVue 820")}
        for a in self.ch.ateliers:
            if a.id in attendu:
                self.assertEqual((normaliser(a.de), normaliser(a.vers)), attendu[a.id], a.id)
            else:
                self.assertEqual((a.de, a.vers), (None, None), a.id)
        self.assertNotIn("aluminium", self.texte_complet())

    def test_blocs_par_type(self):
        verifier_blocs_par_type(self, self.ch.ateliers)

    def test_figures_3d(self):
        # La pièce de la tâche 2, en 5.3 seulement : sa légende et son aria-label ne portent que des valeurs du relevé.
        mots = ("Journey Rack", "Universal Thru Axle", "adaptateur UDH", "25\xa0Nm", "filetage à gauche", "sangle",
                "le plus bas possible", "avant la séparation", "approch", "Tailfin ne publie pas de cotes")
        releve = self.releve.replace(",", ".")
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                self.assertEqual(a.modeles, ["rack"] if a.id == "accessoires-rack" else [])
                for figure in dom.selectionner(a.section, "figure.v3d"):
                    (scene,) = dom.selectionner(figure, "div.v3d-stage")
                    self.assertEqual(scene.get("role"), "img")
                    (legende,) = dom.selectionner(figure, "figcaption")
                    self.assertTrue(legende.texte().startswith(f"3D {a.num}"), legende.texte())
                    self.assertIn(AIDE_3D, texte_de(legende))
                    textes = [normaliser(scene.get("aria-label")), texte_de(legende)]
                    for mot in mots:
                        for t in textes:
                            self.assertIn(mot, t, mot)
                    for t in textes:
                        for n in re.findall(_N, t.replace(f"3D {a.num}", "")):
                            self.assertIn(n.replace(",", "."), releve, f"{n} : {t[:80]}")

    def test_valeurs_du_releve(self):
        t = {a.id: self.texte_atelier(a.id) for a in self.ch.ateliers}
        for ident, valeurs in {
            "accessoires-materiel": ("Journey Rack", "CargoPack v2 (bag only)", "18L (+3.0L Pockets)",
                                     "Pannier Laptop Holster 22L", "Pannier Shoulder Strap", "Journey Rack Mudguard",
                                     "Garmin Varia / Wahoo Trackr Light Mount", "Grizl Gen 2 (2025+)",
                                     "1.0mm x M12 Thru-Axle", "Universal Thru Axle (UTA)", "UDH Adaptor Set",
                                     "If installed correctly, the Universal Thru Axle is just as strong",
                                     "attaching in three places", "142mm and 148mm", "12x142\xa0mm", "R126-01",
                                     "Max. Load: 32kg", "Max. Top Load: 12kg", "Max. Pannier Side Load: 10kg (each side)",
                                     "Max. Load: 22kg", "6kg (each side)", "The maximum weight the axles can carry is 32kg",
                                     "9kg on the road, 4.5kg off-road", "120\xa0kg", "MAX. LOAD 120 KG",
                                     "further limited by the component manufacturers", "avoid tackling MTB jumps",
                                     "Interfaces for front and rear racks", "Mounting a pannier rack is not permitted.",
                                     "GRAIL AL", "contact our service hotline", "Always use the thru axles delivered",
                                     "no dedicated rack mounts", "Frame Mount Adaptors", "740g", "780g",
                                     "Torx T25", "1.5, 2, 2.5, 3, 4, 5, 6, 8, 10", "pre-applied thread lock",
                                     "10 to 60", "TW-6.2", "ATD-1.2", "clé Canyon"),
            "accessoires-axe": ("You must install SRAM UDH/Transmission adaptors before the axle.",
                                "(A) Remove your existing thru axle from your bike.", "reverse thread",
                                "You will need to re-use the UDH Frame Washer", "The UDH Bolt is no longer needed.",
                                "(C) Leave UDH Hanger installed in bike.", "Tighten to 25Nm.", "Add Assembly Grease",
                                "12mm hex", "8mm hex", "Keep with your multi tool out on your rides.", "25\xa0Nm",
                                "A reversible (left-hand and right-hand thread) torque wrench MUST be used",
                                "Confirm the hanger is seated", "Confirm the hanger has not moved",
                                "no gap between the B-tension stop and the stopper plate",
                                "M12 X 1.0 Single Start Thread", "M12x1.0 thread pitch", "12.7\xa0mm", "8\xa0Nm",
                                "Flat Seat", "Cone Seat", "Flat 3mm", "Flat 6mm", "Cone 3mm", "Flat 9mm",
                                "two 8mm central extenders", "Fit the bike wheel and install the Tailfin Universal Thru Axle.",
                                "ARRÊTEZ IMMÉDIATEMENT", "10\xa0Nm", "on the non-driveside (left)", "Tighten to 10Nm.",
                                "NE PAS TROP SERRER", "threads to show on the drive-side",
                                "undo it from the driveside (right) of your bike", "RETRAIT INCORRECT",
                                "machined to accept a standard 5mm Hex", "non publié",
                                "Apply grease only to the thru axle threads",
                                "Apply grease to the thru axle threads before axle installation.",
                                "Tailfin Thru Axle | M12 X 1.0"),
            "accessoires-rack": ("A TopStay", "B Arch", "C Seatpost Connector", "M Fast Release Dropouts",
                                 "Included if ordered when purchasing.", "8\xa0Nm", "6\xa0Nm", "5\xa0Nm", "2\xa0Nm",
                                 "3\xa0Nm", "1\xa0Nm", "Right Hand Side", "Left Hand Side", "LEFT HAND SIDE",
                                 "Align the arch and check that the dropouts are positioned correctly on your axle",
                                 "both pins are engaged and secure", "FitLinks", "Click",
                                 "as low down on the seatpost as possible, before it separates",
                                 "Avoid over-tightening the strap", "Push the lever and ensure the clamp is locked.",
                                 "MIN", "There is a screw that locks the strap onto the Seatpost Connector.",
                                 "this may take a few tries with a combination of spacers", "BT-DN320", "RD-M8250"),
            "accessoires-gardeboue": ("3\xa0Nm", "29″ x 2.25″ (700C x 55mm)", "55\xa0mm", "45\xa0mm", "29 x 2.4",
                                      "54\xa0mm measured tyre clearance", "non publié",
                                      "Compatible with the Journey Pannier Rack."),
            "accessoires-sacs": ("Steps 8 and 9 should be performed before Step 1", "3\xa0Nm", "5\xa0Nm", "1,5\xa0Nm",
                                 "M5x10MM Low Head Screw", "M5x12MM Countersunk Screw", "Gen 2 Top Bag (Jan 2026+)",
                                 "LIFT TO CHECK", "you shouldn't have any of the pins left showing",
                                 "must be rolled closed 2-3 times", "X Clamp", "Lower Hook", "9kg for road riding only",
                                 "4.5kg", "9\xa0kg", "4,5\xa0kg", "The main compartment is 100% waterproof.",
                                 "all seams welded", "16″", "320mm max width", "Max 320 MM", "protective case",
                                 "only compatible with the new 22L Panniers", "Fully adjustable and reversible",
                                 "Shoulder straps are available for the 22L panniers.", "Remove in 5 seconds"),
            "accessoires-feu": ("These attach at the underside of the top deck at the rear.", "5\xa0Nm",
                                "Alignez les languettes de l'arrière de l'appareil",
                                "faites-le pivoter dans le sens des aiguilles d'une montre", "quart de tour",
                                "perpendiculairement au sol", "orienté droit vers l'arrière", "Top Bag",
                                "positions the radar at the back of your bike", "USB-C", "15\xa0minutes", "2,5\xa0heures",
                                "0,3\xa0m", "pendant 2\xa0secondes", "250", "1\xa0200\xa0mm", "Lever-lock",
                                "Seatpost Mimic Light Mount", "immersion accidentelle", "non publiés",
                                "aussi haut que possible sur le vélo", "application Varia", "Ajouter capteur",
                                "Ajouter nouv.", "essuyez soigneusement le port USB"),
            "accessoires-charge": ("Check your Seat Post Connector", "Make sure your Dropouts are safe",
                                   "must be rolled closed 2-3 times", "Loctite 243", "Take a test ride",
                                   "Regularly check and confirm the UDH hanger is tight", "Every ride",
                                   "INSPECTEZ RÉGULIÈREMENT LE PRODUIT", "no tools needed to remove your rack",
                                   "You can leave the axle fitted even without the Tailfin AeroPack attached.",
                                   "undo it from the driveside (right) of your bike", "10\xa0Nm", "5\xa0mm",
                                   "Do not use bleach or solvents", "Please do not machine wash the bags.",
                                   "You can use a pressure washer on your bikepacking bags",
                                   "Do not clean your Canyon with a strong water or steam jet from a short distance.",
                                   "Wear on parts such as bushings and rubber parts.", "5 Years", "2-year guarantee",
                                   "120\xa0kg", "9\xa0kg", "4,5\xa0kg"),
        }.items():
            for v in valeurs:
                self.assertIn(normaliser(v), t[ident], f"{ident} : {v}")

    def test_prudence_en_tete_des_montages(self):
        # Décision du lot : chaque atelier de montage commence par « à confirmer avec Canyon avant de rouler chargé »,
        # dans un aside.note.warn juste sous le titre, et aussi dans le corps de sa première étape, que montre seul le
        # mode pas à pas. Les deux disent les contradictions Canyon contre Tailfin (l'axe, le porte-bagages du manuel de
        # 2021, l'écart du Di2) et la valeur appliquée.
        contradictions = ("Always use the thru axles delivered with your bike or fork.",
                          "Mounting a pannier rack is not permitted.", "Di2", "non publié")
        for ident in MONTAGES:
            with self.subTest(ident):
                section = self.par_id[ident].section
                premier = [e for e in elements(section) if e.tag != "h3"][0]
                self.assertEqual((premier.tag, premier.classes()), ("aside", ["note", "warn"]))
                self.assertEqual(texte_de(dom.selectionner(premier, "p.note-t")[0]), PRUDENCE)
                corps = self.etapes_de(ident)[0][1]
                self.assertTrue(corps.startswith(PRUDENCE), corps[:80])
                for texte in (texte_de(premier), corps):
                    for mot in contradictions:
                        self.assertIn(mot, texte, mot)
                    self.assertTrue(dit_ce_qui_s_applique(texte), texte[:120])
                self.assertIn('href="#accessoires-materiel"', premier.html())
        # Les deux fiches « comprendre » n'ont pas l'encadré, mais 5.1 dit la règle et 5.7 la rappelle.
        for ident in ("accessoires-materiel", "accessoires-charge"):
            self.assertEqual(dom.selectionner(self.par_id[ident].section, "aside.note.warn"), [], ident)
            self.assertIn("à confirmer avec canyon avant de rouler chargé", self.texte_atelier(ident).lower(), ident)

    def test_limites_de_charge(self):  # Review Focus 1
        # Des limites seulement, jamais un calcul avec le poids de Lamine ; la plus basse de chaque paire en
        # contradiction s'applique : 9 kg dessus (CargoPack) contre 12 kg (Journey Rack), 9 kg par sacoche contre 10 kg
        # par côté, et 4,5 kg hors route pour chacun. Toute charge écrite est une valeur du relevé, avec sa source.
        lues = [texte_de(l) for l in self.lignes()] + aria_labels(self.section)
        valeurs = {v for t in lues for v in charges(t)}
        self.assertLessEqual(valeurs, {120.0, 32.0, 22.0, 12.0, 10.0, 9.0, 6.0, 4.5})
        self.assertLessEqual({120.0, 32.0, 12.0, 10.0, 9.0, 4.5}, valeurs)
        for ligne in self.lignes():
            t = texte_de(ligne)
            vues = charges(t)
            if not vues:
                continue
            with self.subTest(t[:60]):
                self.assertTrue(dom.selectionner(ligne, "a.src") or SERVICE_CLIENT in t, t[:120])
                # Une limite haute d'une paire n'est jamais écrite seule : la ligne dit la plus basse et qu'elle
                # s'applique.
                if {12.0, 10.0} & set(vues):
                    self.assertTrue({9.0, 6.0} & set(vues), t[:160])
                    self.assertTrue(dit_ce_qui_s_applique(t), t[:160])
        # Les deux encadrés des contradictions 7 et 8 du relevé, avec la valeur appliquée, en 5.1 et en 5.5.
        for ident in ("accessoires-materiel", "accessoires-sacs"):
            for debut, mots in {"Contradiction\xa0: la charge sur le dessus": (
                                    "Max. Top Load: 12kg", "9kg on the road, 4.5kg off-road", "12kg (pannier mounts version)",
                                    "9\xa0kg sur route", "4,5\xa0kg hors route"),
                                "Contradiction\xa0: la charge par côté": (
                                    "Max. Pannier Side Load: 10kg (each side)", "9kg on each side pannier mount",
                                    "12 + 9 + 9", "9\xa0kg sur route", "4,5\xa0kg hors route")}.items():
                (note,) = self.notes(ident, debut)
                for mot in mots:
                    self.assertIn(mot, texte_de(note), f"{ident}, {debut} : {mot}")
                self.assertTrue(dit_ce_qui_s_applique(texte_de(note)))
        # Le mode pas à pas : chaque étape qui charge un sac dit sa limite, sur route et hors route.
        for debut in ("Sac\xa0: ferme", "Sacoches\xa0: ferme"):
            corps = self.corps("accessoires-sacs", debut)
            for mot in ("9\xa0kg", "4,5\xa0kg", "hors route", "sur route"):
                self.assertIn(mot, corps, f"{debut} : {mot}")
        # 9 kg par sacoche suppose la version « pannier mounts » ; sinon, 6 kg par côté (M4 de la revue).
        self.assertIn("avec «\xa0pannier mounts\xa0»", self.corps("accessoires-sacs", "Sacoches\xa0: ferme"))
        self.assertIn("6\xa0kg par côté", self.corps("accessoires-sacs", "Sacoches\xa0: ferme"))
        self.assertIn("sinon 6\xa0kg par côté", self.texte_atelier("accessoires-charge"))
        # 120 kg pour l'ensemble, d'après Canyon, en 5.1 et en 5.7 ; jamais de calcul avec ton poids.
        for ident in ("accessoires-materiel", "accessoires-charge"):
            self.assertIn("120\xa0kg", self.texte_atelier(ident))
        texte = self.texte_complet()
        for phrase in re.split(r"(?<=[.!?])\s", texte):
            if re.search(r"\b(?:ton|ta) (?:poids|masse)\b|\btu pèses\b", phrase):
                self.assertIn("aucun calcul", phrase, phrase)
        self.assertIn("aucun calcul avec ton poids", self.texte_atelier("accessoires-materiel"))
        for absent in ("Charge totale", "ton calcul", "15\xa0kg", "15 kg", "130\xa0kg", "kg de bagages"):
            self.assertNotIn(absent, texte, absent)
        # Aucune phrase n'applique la limite haute d'une paire (« retient 12 kg », « 10 kg s'applique ») ; 5.1 dit les
        # deux limites retenues, en toutes lettres.
        for motif in (r"(?:retient|retenues?|s'appliquen?t?)\D{0,30}\b1[02]\xa0kg", r"\b1[02]\xa0kg\D{0,20}s'appliquen?t?"):
            self.assertIsNone(re.search(motif, texte), motif)
        materiel = self.texte_atelier("accessoires-materiel")
        for phrase in ("Ce site retient 9\xa0kg sur route et 4,5\xa0kg hors route\xa0: c'est la plus basse des limites du "
                       "dessus", "Ce site retient 9\xa0kg sur route et 4,5\xa0kg hors route par sacoche"):
            self.assertIn(phrase, materiel, phrase)

    def test_sangle_sur_la_tige_a_deux_lames(self):  # Review Focus 2
        # La sangle se pose le plus bas possible sur la SP100 VCLS 2.1, avant la séparation des lames (service client
        # Tailfin, plus prudent que le guide du Grizl), et reste à vérifier au montage.
        (li,) = [li for li in dom.selectionner(self.par_id["accessoires-rack"].section, "ol.steps > li")
                 if texte_de(dom.selectionner(li, "p.st-t")[0]).startswith("Ferme la sangle")]
        corps = self.corps("accessoires-rack", "Ferme la sangle")
        titre = texte_de(dom.selectionner(li, "p.st-t")[0])
        for mot in ("le plus bas possible", "avant la séparation"):
            self.assertIn(mot, titre, mot)
        for mot in ("as low down on the seatpost as possible, before it separates", SERVICE_CLIENT, "le plus bas possible",
                    "MIN", "plus prudente", "à vérifier au montage", "ne roule pas chargé"):
            self.assertIn(mot, corps, mot)
        self.assertTrue([s for s in dom.selectionner(li, "span.verif") if "à vérifier au montage" in texte_de(s)])
        # La réponse du service client n'a pas de lien : aucun lien de l'étape ne la porte.
        self.assertEqual([a for a in dom.selectionner(li, "a") if "service" in texte_de(a).lower()], [])
        (note,) = self.notes("accessoires-rack", "Contradiction\xa0: la sangle sur ta tige à deux lames")
        for mot in ("safe to use on carbon seat posts and split seat posts", "We can't confirm a perfect fit",
                    SERVICE_CLIENT, "le plus bas possible", "la plus prudente", "non publié"):
            self.assertIn(mot, texte_de(note), mot)
        self.assertTrue(dit_ce_qui_s_applique(texte_de(note)))
        verifier = " ".join(texte_de(li) for li in dom.selectionner(self.par_id["accessoires-materiel"].section,
                                                                    "ul.check > li"))
        self.assertIn("le plus bas possible, avant la séparation des deux lames", verifier)
        # Aucune autre place pour la sangle, nulle part : ni en haut de la tige, ni au-dessus de la séparation.
        for absent in ("haut de la tige", "au-dessus de la séparation", "après la séparation", "sur les lames"):
            self.assertNotIn(absent, self.texte_complet(), absent)

    def test_axe_tailfin(self):  # Review Focus 3
        # L'axe Tailfin se serre par la gauche à la clé de 5 mm, à 10 Nm (la valeur retenue de la contradiction 3), et se
        # défait par la droite, sans levier. 5.2 le fait en étapes, 5.7 le rappelle.
        serre = self.corps("accessoires-axe", "Serre l'axe par la gauche")
        for mot in ("10\xa0Nm", "5\xa0mm", "on the non-driveside (left)", "Tighten to 10Nm.", "TW-6.2", "retient",
                    "NE PAS TROP SERRER"):
            self.assertIn(mot, serre, mot)
        defait = self.corps("accessoires-axe", "Roue\xa0: dévisse l'axe par la droite")
        for mot in ("undo it from the driveside (right) of your bike", "5mm hex key from the driveside (right)",
                    "RETRAIT INCORRECT", "n'a pas de levier", "machined to accept a standard 5mm Hex", "jamais par la gauche",
                    "ne vaut plus",
                    # I1 de la revue finale : le sens est écrit par Tailfin, dans la notice 2025 du kit précédent, pour
                    # sa dépose clé à droite ; « vu de la droite » est une lecture de ce site, et le même sens pour le kit
                    # V2 de Lamine une déduction. Le contrôle qui arrête l'erreur reste, avec ce que l'on sent dans le
                    # bon sens (R3), dit comme une lecture.
                    "«\xa0Turn clockwise to thread axle back through bike.\xa0»", "kit précédent",
                    "vu de la droite, côté clé (lecture de ce site)",
                    "il se dévisse dans le sens des aiguilles d'une montre", "kit V2", "déduction de ce site",
                    "s'il durcit, tu le serres\xa0; arrête-toi et tourne dans l'autre sens",
                    "il se débloque puis tourne sans forcer, une lecture de ce site"):
            self.assertIn(mot, defait, mot)
        (li,) = [li for li in dom.selectionner(self.par_id["accessoires-axe"].section, "ol.steps > li")
                 if texte_de(dom.selectionner(li, "p.st-t")[0]).startswith("Roue\xa0: dévisse l'axe par la droite")]
        self.assertIn(NOTICE_AXE_2025, [a.get("href") for a in dom.selectionner(li, "a.src")])
        # L'ancien raisonnement sur le pas de vis n'est plus la source du sens.
        self.assertNotIn("ce que Tailfin n'écrit pas", self.texte_complet())
        self.assertNotIn("filetage à droite", self.texte_complet())
        # Le relevé cite l'étape 9 de la notice mot pour mot, dit quel kit elle couvre et d'où le sens est vu.
        releve_axe = self.releve_section("### 3.2", "### 3.3")
        for mot in ("« Step Nine Removal »",
                    "« To avoid axle separating during removal use 5mm hex key on drive side (right). »",
                    "« Turn clockwise to thread axle back through bike. »", "kit précédent", "**lecture**",
                    "**déduction**", "kit V2", "s'il durcit, on le serre"):
            self.assertIn(mot, releve_axe, mot)
        for absent in ("Sens de dévissage par la droite : non publié", "illisible, 403"):
            self.assertNotIn(absent, releve_axe, absent)
        # M7 : le titre de l'adaptateur dit le sens de rotation, pas un côté du vélo.
        titres = [t for t, _ in self.etapes_de("accessoires-axe")]
        self.assertIn("Serre l'adaptateur à 25\xa0Nm, dans le sens inverse des aiguilles d'une montre", titres)
        self.assertEqual([t for t in titres if "vers la gauche" in t], [])
        # I2 de la revue : remonter à la maison à 10 Nm, en route à la main d'après Tailfin, puis reprendre à la maison.
        remonte = self.corps("accessoires-axe", "Roue\xa0: remonte l'axe par la gauche")
        for mot in ("par la gauche", "10\xa0Nm", "5\xa0mm", "à la main", "filetage de l'embout graissé", "À la maison",
                    "En route",
                    "hand tight", "we will always recommend you tighten the Tailfin axle",
                    "the Tailfin axle shouldn't be able to be loosened just by hand.",
                    "Proposition\xa0: de retour à la maison, reprends le serrage à la TW-6.2"):
            self.assertIn(mot, remonte, mot)
        proposition = remonte[remonte.index("Proposition"):]
        proposition = proposition[:proposition.index(".") + 1]
        self.assertIsNone(re.search(r"\d+(?:[.,]\d+)?\xa0Nm", proposition), proposition)
        rappel = self.texte_atelier("accessoires-charge")
        for mot in ("par la droite", "par la gauche", "10\xa0Nm", "n'a pas de levier", "#accessoires-axe-roue",
                    "dans le sens des aiguilles d'une montre", "hand tight", "s'il durcit",
                    # I1 de la revue finale : la source du sens, son kit, et la déduction pour le kit V2.
                    "«\xa0Turn clockwise to thread axle back through bike.\xa0»", "kit précédent", "kit V2",
                    "déduction de ce site", NOTICE_AXE_2025, "filetage de l'embout graissé",
                    # R1 : la clé de 5 mm est une Proposition de 5.2, dite comme telle, comme le resserrage.
                    "reprends le serrage à la TW-6.2 à la maison (Proposition de 5.2)",
                    "Proposition de 5.2\xa0: garde une clé de 5\xa0mm avec toi en route"):
            self.assertIn(mot, rappel if not mot.startswith(("#", "https")) else
                          self.par_id["accessoires-charge"].section.html(), mot)
        (note,) = self.notes("accessoires-axe", "Contradiction\xa0: le couple de l'axe")
        for mot in ("8-10Nm", "Tighten to 10Nm.", "hand tight", "differing specific torque settings", "non publié",
                    "Ce site retient 10\xa0Nm", "TW-6.2"):
            self.assertIn(mot, texte_de(note), mot)
        self.assertTrue(dit_ce_qui_s_applique(texte_de(note)))
        # Le seul couple appliqué à l'axe est 10 Nm ; jamais un levier, jamais par la gauche pour le défaire, jamais
        # les couples de l'axe DT Swiss.
        texte = self.texte_complet()
        self.assertIsNone(re.search(r"axe Tailfin[^.]{0,60}(?:par son levier|à la main par)", texte))
        for faux in ("se dévisse par la gauche", "dévisse-le par la gauche", "dévisse l'axe par la gauche",
                     "se défait par la gauche", "défais-le par la gauche", "se serre par la droite",
                     "serre-le par la droite", "serre l'axe par la droite", "se revisse par la droite"):
            self.assertNotIn(faux, texte, faux)
        self.assertNotIn('<span class="nm">15', self.source)
        self.assertNotIn('<span class="nm">8-10', self.source)

    def test_renvois_de_1_5_et_3_5(self):  # Review Focus 3, les renvois
        # 1.5 (roues et axes) et 3.5 (crevaison) reçoivent chacun une phrase de renvoi vers 5.2, dans le corps de l'étape
        # qui dépose la roue arrière, et rien d'autre sur Tailfin.
        for fichier, ident, debut in ((MONTAGE, "montage-roues", "Dévisse l'axe arrière par son levier"),
                                      (TUBELESS, "tubeless-crevaison", "Chambre\xa0: si la mèche ne suffit pas")):
            with self.subTest(ident):
                source = fichier.read_text(encoding="utf-8")
                ch = ateliers.relever_chapitre(source)
                (section,) = [a.section for a in ch.ateliers if a.id == ident]
                (li,) = [li for li in dom.selectionner(section, "ol.steps > li")
                         if texte_de(dom.selectionner(li, "p.st-t")[0]).startswith(debut)]
                corps = " ".join(texte_de(e) for e in elements(li) if "st-t" not in e.classes())
                # Le renvoi atterrit sur les étapes « Roue » de 5.2 (fix 1 : I2 de la revue).
                self.assertEqual([a.get("href") for a in dom.selectionner(li, "a") if a.get("href").startswith("#acc")],
                                 ["#accessoires-axe-roue"])
                (phrase,) = [p for p in re.split(r"(?<=[.])\s", corps) if "Tailfin" in p]
                for mot in ("Tailfin", "pas de levier", "se dévisse par la droite", "5\xa0mm", "se revisse par la gauche",
                            "5.2", "dans le sens des aiguilles d'une montre",
                            # I1 de la revue finale : le sens est écrit par la notice du kit précédent, citée en 5.2 ;
                            # « vu de la droite » est une lecture du site (N2), et pour le kit de Lamine, c'est une
                            # déduction. R2 : le contrôle d'arrêt est dans la phrase.
                            "pour le kit précédent, écrit «\xa0clockwise\xa0» avec la clé côté transmission",
                            "«\xa0vu de la droite\xa0» est une lecture du site",
                            "pour ton kit, une déduction", "s'il durcit, arrête-toi"):
                    self.assertIn(mot, phrase, mot)
                self.assertNotIn("non publié", phrase)
                self.assertEqual(source.count("Tailfin"), 1, ident)
                self.assertEqual(source.count("#accessoires-"), 1, ident)
        self.assertIn('id="accessoires-axe"', self.source)
        # L'ancre est dans le corps de la première étape « Roue » : le lien ouvre l'étape repliée.
        (li,) = [li for li in dom.selectionner(self.par_id["accessoires-axe"].section, "ol.steps > li")
                 if texte_de(dom.selectionner(li, "p.st-t")[0]).startswith("Roue\xa0: dépose d'abord")]
        (ancre,) = dom.selectionner(self.section, '[id="accessoires-axe-roue"]')
        self.assertEqual(dom.selectionner(li, '[id="accessoires-axe-roue"]'), [ancre])
        self.assertNotIn("st-t", ancre.classes())

    def test_valeur_avec_source_officielle(self):  # Review Focus 4
        # Toute ligne qui porte un couple à appliquer (span.nm) cite une source officielle autre que Park Tool ; toute
        # ligne qui porte un couple ou une charge cite une source, ou la réponse écrite du service client Tailfin.
        vues = dict.fromkeys(("nm", "couple", "kg"), 0)
        for ligne in self.lignes():
            t = texte_de(ligne)
            hotes = [urlparse(a.get("href")).hostname for a in dom.selectionner(ligne, "a.src")]
            hors_park = [h for h in hotes if h != "www.parktool.com"]
            for cle, present, sources in (("nm", dom.selectionner(ligne, "span.nm"), hors_park),
                                          ("couple", COUPLE.search(t), hotes or SERVICE_CLIENT in t),
                                          ("kg", charges(t), hotes or SERVICE_CLIENT in t)):
                if present:
                    vues[cle] += 1
                    self.assertTrue(sources, f"{cle} : {t[:160]}")
        for cle, plancher in {"nm": 25, "couple": 35, "kg": 12}.items():
            self.assertGreaterEqual(vues[cle], plancher, cle)
        for note in dom.selectionner(self.section, "aside.note.prop"):
            self.assertEqual(dom.selectionner(note, "span.nm"), [], texte_de(note)[:80])
        # La réponse du service client Tailfin n'a pas de lien public : elle se cite par son nom, chaque fois.
        for phrase in PHRASES_DU_SERVICE:
            self.assertIn(phrase, self.releve_section("## 7. Réponse écrite", "## Contradictions"), phrase)
            lignes = [texte_de(l) for l in self.lignes() if phrase in texte_de(l)]
            self.assertTrue(lignes, phrase)
            for t in lignes:
                self.assertIn(SERVICE_CLIENT, t, phrase)
        # Chaque lien sort vers un document officiel, à son adresse exacte dans les relevés ; chaque renvoi interne vise
        # un id des chapitres sources.
        ids = set()
        for nom in ("11-montage", "20-freins", "30-tubeless", "40-transmission", "60-accessoires"):
            ids |= {e.get("id") for e in dom.selectionner(dom.analyser(
                (RACINE / "src" / "parts" / f"{nom}.html").read_text(encoding="utf-8")), "[id]")}
        liens = [e for e in dom.selectionner(self.section, "[href]") if e.tag == "a"]
        self.assertGreaterEqual(len(liens), 200)
        for a in liens:
            href = a.get("href")
            with self.subTest(href):
                if href.startswith("#"):
                    self.assertIn(href[1:], ids)
                    continue
                self.assertTrue(href.startswith("https://"), href)
                self.assertIn(urlparse(href).hostname, OFFICIELS_ACCESSOIRES, href)
                self.assertIn(href, self.releves, href)
                self.assertEqual((a.get("target"), a.get("rel")), ("_blank", "noopener"), href)
        # Les pages des documents Canyon, SRAM et Garmin, au format des chapitres 1 à 4.
        for a in dom.selectionner(self.section, "a.src"):
            href, texte = a.get("href"), a.texte()
            if QSG in href:
                self.assertRegex(texte, r"^Canyon QSG V02 p\.\d+$")
            elif "Canyon%20RR" in href:
                m = re.fullmatch(r"Canyon, manuel route 2021 p\.(\d+)(?:-(\d+))? imprimées? \(PDF p\.(\d+)\)", texte)
                self.assertIsNotNone(m, texte)
                self.assertEqual(int(m.group(3)), (int(m.group(1)) - int(m.group(1)) % 2) // 2 + 2, texte)
            elif MANUEL_ROUES in href:
                m = re.fullmatch(r"Canyon, manuel des roues p\.(\d+) imprimée \(PDF p\.(\d+)\)", texte)
                self.assertIsNotNone(m, texte)
                self.assertEqual(int(m.group(2)), int(m.group(1)) + 1, texte)
            elif "udh-universal-derailleur-hanger-user-manual" in href:
                self.assertRegex(texte, r"^SRAM, manuel UDH p\.(?:3|5|6|9|11)$")
            elif "Varia_RearVue_820" in href:
                # Le manuel entier, ou une page que le relevé nomme.
                self.assertRegex(texte, r"^Garmin, manuel RearVue 820(?: p\.(?:4|5|6|6-7|15|19))?$")
            elif "Varia_RTL515_516" in href:
                self.assertRegex(texte, r"^Garmin, manuel RTL515/RTL516 p\.(?:1|6)$")
            elif "Journey-Pannier-Rack-Assembly-Guide" in href:
                self.assertRegex(texte, r"^Tailfin, notice du Journey Rack p\.[2-8]$")

    def test_aucune_valeur_du_cf7(self):  # Review Focus 4
        # Les écarts du relevé avec le brouillon du 20/10, écrit pour le CF 7 : ni Ortlieb, ni DEFEND, ni Knog, ni
        # Litelok, ni ruban de cintre, ni « Charge totale : ton calcul », ni les liens du brouillon.
        lus = " ".join([self.texte_complet()] + aria_labels(self.section)).lower()
        html = normaliser(self.source).lower()
        for absent in ("ortlieb", "quick-rack", "defend", "knog", "litelok", "ruban", "charge totale", "ton calcul",
                       "porter tes bagages", "chapitre 6", "17\xa0mm", "50\xa0km", "service center", "gravel ln",
                       "bikeradar", "4,5\xa0bar", "rx822"):
            self.assertNotIn(absent, lus, absent)
            self.assertNotIn(absent, html, absent)
        cf7 = re.compile(r"(?<![0-9a-z#])CF[\s_-]*7(?![0-9])|4553", re.I)
        self.assertIsNone(cf7.search(self.texte_complet()))
        self.assertIsNone(cf7.search(self.source))
        for adresse in ("ortlieb.com", "defend", "knog", "litelok", "bikeradar", "/grizl-cf-7/", "parktool.com/en-us/blog/"
                        "repair-help/handlebar-tape", "endurace"):
            self.assertNotIn(adresse, html, adresse)
        # Park Tool sert pour tes outils seulement : jamais pour une valeur du lot, jamais une vidéo.
        for a in [a for a in dom.selectionner(self.section, "a") if "parktool.com" in (a.get("href") or "")]:
            self.assertIn(a.get("href"),("https://www.parktool.com/en-us/product/ratcheting-click-type-torque-wrench-tw-6-2",
                                          "https://www.parktool.com/assets/doc/product/TW-5.2_TW-6.2_instructions.pdf",
                                          "https://www.parktool.com/en-us/product/adjustable-torque-driver-atd-1-2"),
                          a.get("href"))
        # Les Varia d'un autre modèle ne sont jamais le feu de Lamine : seul le RearVue 820 est posé.
        for ligne in self.lignes():
            t = texte_de(ligne)
            if re.search(r"RTL515|RCT715|RVR315", t):
                self.assertTrue(re.search(r"autre|RCT715, il faut|pour le RCT715|un autre Varia", t), t[:160])

    def test_aucune_donnee_personnelle(self):  # Review Focus 4
        # Ni jeton personnel, ni prénom, ni lieu, ni prix, ni magasin, ni modèle d'ordinateur : « ton ordinateur ».
        verifier_aucune_donnee(self, self.texte_complet(), self.source, en_plus=("Lamine",))
        texte = self.texte_complet().replace(" ", " ")
        self.assertIsNone(re.search(r"\b(?:commandes?|prix|magasin|boutique|livré à|livraison à)\b", texte, re.I))
        self.assertIsNone(re.search(r"thinkpad|lenovo|\bdell\b|\bhp\b|\basus\b|\bacer\b|surface pro|\bapple\b|"
                                    r"zenbook|xps\b|pre-order|shipping", texte, re.I))
        sacs = self.texte_atelier("accessoires-sacs").replace(" ", " ")
        self.assertIn("ton ordinateur", sacs)
        # Les tailles d'ordinateur sont les limites de Tailfin, jamais celle d'un ordinateur de Lamine.
        self.assertLessEqual(set(re.findall(r"(?<![\d.,])(\d+)(?:″|-inch| pouces| inches)", sacs)), {"16", "17"})

    def test_contradictions(self):
        # Chaque contradiction du relevé qui touche un atelier est dite sur sa page, avec ce qui s'applique.
        attendu = {
            "accessoires-materiel": ("Mounting a pannier rack is not permitted.", "GRAIL AL", "contact our service hotline",
                                     "Interfaces for front and rear racks", "Always use the thru axles delivered",
                                     "permanent replacement for your old axle", "no dedicated rack mounts",
                                     "Grizl SL 8", "Max. Top Load: 12kg", "12 + 9 + 9"),
            "accessoires-axe": ("8-10Nm", "Tighten to 10Nm.", "hand tight", "Tighten to 5Nm.", "Loctite 270",
                                "Add Assembly Grease", "Do NOT apply grease to the UDH hanger or the UDH bolt threads.",
                                "Do NOT apply grease to the UDH hanger inner threads", "35Nm", "9mm Flat",
                                "Flat 2mm", "Cone 8mm"),
            "accessoires-rack": ("safe to use on carbon seat posts and split seat posts", "We can't confirm a perfect fit"),
            "accessoires-gardeboue": ("29″ x 2.25″ (700C x 55mm)", "29 x 2.4", "55\xa0mm"),
            "accessoires-sacs": ("Max. Top Load: 12kg", "12 + 9 + 9", "16″", "17 inches (320mm max width)",
                                 "Max 320 MM", "M5x10MM Low Head Screw", "M5x12MM Countersunk Screw",
                                 "All Tailfin bike bags are 100% waterproof", "The main compartment is 100% waterproof."),
            "accessoires-feu": ("Seatpost Mimic Light Mount", "Garmin Seat Rail Kit", "Lever-lock adapter",
                                "le plus près possible de la selle", "250", "underside of the top deck at the rear",
                                "as long as you don't use a Top Bag", "pendant 4\xa0secondes", "pendant 2\xa0secondes"),
            "accessoires-charge": ("You can use a pressure washer on your bikepacking bags",
                                   "Do not clean your Canyon with a strong water or steam jet from a short distance.",
                                   "2-year guarantee", "5 Years for Hard Components", "Axles and Adaptors 5 Years"),
        }
        for ident, mots in attendu.items():
            with self.subTest(ident):
                notes = self.notes(ident, "Contradiction")
                self.assertTrue(notes, ident)
                texte = " ".join(texte_de(n) for n in notes)
                for mot in mots:
                    self.assertIn(mot, texte, mot)
                for n in notes:
                    self.assertTrue(dit_ce_qui_s_applique(texte_de(n)), texte_de(n)[:160])
        self.assertGreaterEqual(sum(len(self.notes(a.id, "Contradiction")) for a in self.ch.ateliers), 19)
        # La contradiction 16 (une limite Canyon d'un autre vélo, citée par le brouillon) se dit sans sa valeur : la
        # charge admise fait partie de la question à Canyon.
        materiel = self.texte_atelier("accessoires-materiel")
        for mot in ("charge admise", "un autre vélo et un autre porte-bagages", "n'est pas une source de ce site"):
            self.assertIn(mot, materiel, mot)

    def test_a_verifier_au_montage(self):
        # 5.1 : la liste « À vérifier au montage » du relevé, entière, à cocher, point par point.
        section = self.par_id["accessoires-materiel"].section
        (liste,) = dom.selectionner(section, "ul.check")
        self.assertEqual(liste.get("data-key"), "accessoires-montage")
        (bouton,) = dom.selectionner(section, "button.btn-reset")
        self.assertEqual(bouton.get("data-reset"), "accessoires-montage")
        points = dom.selectionner(liste, "li")
        self.assertEqual(len(points), 15)
        for n, li in enumerate(points, 1):
            self.assertEqual(dom.selectionner(li, "input")[0].get("id"), f"ck-accessoires-montage-{n}")
            self.assertTrue(dom.selectionner(li, "span.verif"), texte_de(li)[:80])
        tout = " ".join(texte_de(li) for li in points)
        for mot in ("question écrite à Canyon", "charge admise", "marquage «\xa0UDH\xa0»", "rondelle de cadre",
                    "pas de jour entre la butée de vis B et la plaque", "sens du filetage", "12\xa0mm", "8\xa0mm",
                    "graisse", "M12 x 1.0", "plat ou conique", "centré", "rallonge", "à la main sans forcer",
                    "This plastic cover on the frame must be removed", "toute sa course", "BT-DN320", "sacoche droite",
                    "45\xa0mm", "porte-bagages chargé", "SP100 VCLS 2.1", "MIN", "pannier mounts",
                    "Gen 2 Top Bag (Jan 2026+)", "V2 de 2026", "pince X", "crochet bas", "Empreintes", "vis J",
                    "1, 1,5, 2, 3 et 8\xa0Nm", "clé Canyon", "insert «\xa0G\xa0»", "250", "1\xa0200\xa0mm",
                    "droit vers l'arrière", "rien ne cache le feu", "avec quoi tu liras le radar"):
            self.assertIn(mot, tout, mot)
        # Chaque point du relevé a sa ligne : autant de points que la section « À vérifier au montage », le modèle du
        # Varia, choisi le 1/11, en moins, et le radar en plus.
        releve = self.releve_section("## À vérifier au montage", "## Écarts avec le brouillon")
        self.assertEqual(len(re.findall(r"^- \*\*", releve, re.M)), 15)

    def test_couples_hors_outils(self):
        # 1, 1,5, 2, 3 et 8 Nm : aucun outil de Lamine ne les couvre. Chaque ligne qui en porte un le dit et renvoie à la
        # clé Canyon du carton, à lire sur l'outil ; la Proposition de 5.1 ne donne aucune valeur.
        vues = 0
        for texte in [texte_de(l) for l in self.lignes()] + aria_labels(self.section):
            if HORS_OUTILS_5.search(texte):
                vues += 1
                bas = texte.lower()
                self.assertIn("aucun de tes outils", bas, texte[:160])
                self.assertIn("clé canyon", bas, texte[:160])
        self.assertGreaterEqual(vues, 14)
        for permis in ("10\xa0Nm", "25\xa0Nm", "8-10\xa0Nm", "5\xa0Nm", "1\xa0200\xa0mm", "6\xa0Nm", "0,3\xa0m"):
            self.assertIsNone(HORS_OUTILS_5.search(permis), permis)
        for refuse in ("à 8\xa0Nm", "« 3\xa0Nm »", "1,5\xa0Nm", "1\xa0Nm", "2\xa0Nm"):
            self.assertIsNotNone(HORS_OUTILS_5.search(refuse), refuse)
        (prop,) = self.notes("accessoires-materiel", "Proposition\xa0: si la clé Canyon ne suffit pas")
        self.assertIsNone(re.search(r"\d", texte_de(prop)), texte_de(prop))
        for mot in ("ne serre pas au jugé", "Tailfin", "atelier", "en route", "hand tight", "à la maison"):
            self.assertIn(mot, texte_de(prop), mot)
        self.assertIn('href="#accessoires-axe-roue"', prop.html())

    def test_couples(self):
        # Le tableau des couples du chapitre (résumé « couples », en 5.1) : chaque couple à appliquer, une ligne par vis,
        # avec son outil et sa source ; aucun autre span.nm dans le chapitre.
        (resume,) = self.ch.resumes["couples"]
        self.assertTrue(any(p is self.par_id["accessoires-materiel"].section for p in ancetres(resume)))
        lignes = dom.selectionner(resume, "tbody > tr")
        couples = [[texte_de(nm) for nm in dom.selectionner(tr, "span.nm")] for tr in lignes]
        self.assertEqual(couples, [["25\xa0Nm"], ["10\xa0Nm"], ["8\xa0Nm"], ["8\xa0Nm"], ["6\xa0Nm"], ["5\xa0Nm"],
                                   ["5\xa0Nm"], ["5\xa0Nm"], ["3\xa0Nm"], ["2\xa0Nm"], ["1,5\xa0Nm"], ["1\xa0Nm"]])
        for tr in lignes:
            sources = [a for a in dom.selectionner(tr, "a.src") if "parktool.com" not in a.get("href")]
            self.assertTrue(sources, texte_de(tr)[:80])
        self.assertEqual({texte_de(e) for e in dom.selectionner(self.section, "span.nm")}, {c for (c,) in couples})
        (udh,) = [tr for tr in lignes if "25\xa0Nm" in texte_de(tr)]
        for mot in ("filetage à gauche", "12\xa0mm", "8\xa0mm", "TW-6.2", "non publié"):
            self.assertIn(mot, texte_de(udh), mot)
        # Une ligne que couvre l'ATD-1.2 donne son cran ; celles que rien ne couvre le disent.
        for tr in lignes:
            outil = texte_de(dom.selectionner(tr, "td")[2])
            if outil.startswith("ATD-1.2"):
                self.assertRegex(outil, r"cran (?:5|6)")
            elif not outil.startswith("TW-6.2"):
                self.assertTrue(outil.startswith("Aucun de tes outils"), outil)
        self.assertIn("pictogramme", texte_de(self.par_id["accessoires-materiel"].section))

    def test_feu_rearvue_820(self):
        # Le RearVue 820, choisi le 1/11 : sur le support Tailfin, par l'attache quart de tour du manuel Garmin ; sa
        # charge et son appairage d'après Garmin ; sa place d'après le service client Tailfin.
        pose = self.corps("accessoires-feu", "Pose le feu")
        for mot in ("Alignez les languettes de l'arrière de l'appareil", "dans le sens des aiguilles d'une montre",
                    "quart de tour", "insert «\xa0G\xa0»", "déduction"):
            self.assertIn(mot, pose, mot)
        charge = self.corps("accessoires-feu", "Charge")
        for mot in ("Retirez le capuchon étanche", "USB-C", "Après 15\xa0minutes de recharge", "jusqu'à 2,5\xa0heures",
                    "Universal Serial Bus"):
            self.assertIn(mot, charge, mot)
        couple = self.corps("accessoires-feu", "Couple")
        for mot in ("0,3\xa0m", "pendant 2\xa0secondes", "Capteurs > Ajouter capteur > Tout rechercher", "à préciser",
                    "application Varia", "10\xa0m de tout autre capteur Bluetooth"):
            self.assertIn(mot, couple, mot)
        self.assertNotIn("Ajouter le capteur", self.texte_complet())
        self.assertIn("essuyez soigneusement le port USB", charge)
        (place,) = self.notes("accessoires-feu", "Contradiction\xa0: la place du feu")
        for mot in (SERVICE_CLIENT, "as long as you don't use a Top Bag", "CargoPack", "support Tailfin",
                    "le plus près possible de la selle"):
            self.assertIn(mot, texte_de(place), mot)
        hrefs = [a.get("href") for a in dom.selectionner(self.par_id["accessoires-feu"].section, "a.src")]
        self.assertTrue(any("Varia_RearVue_820" in h for h in hrefs))

    def test_ordinateur_dans_l_etui(self):
        # L'étui et son ordinateur, sans modèle : la plus petite des tailles publiées s'applique, dans sa housse.
        (note,) = self.notes("accessoires-sacs", "Contradiction\xa0: la taille de l'ordinateur")
        for mot in ("16″", "17 inches (320mm max width)", "Max 320 MM", "16\xa0pouces", "320\xa0mm", "housse",
                    SERVICE_CLIENT, "please refer to our assembly guides"):
            self.assertIn(mot, texte_de(note), mot)
        self.assertTrue(dit_ce_qui_s_applique(texte_de(note)))
        etui = self.corps("accessoires-sacs", "Étui\xa0: glisse ton ordinateur")
        for mot in ("ton ordinateur", "housse", "protective case", "non publiée"):
            self.assertIn(mot, etui, mot)

    def test_pas_a_pas_securite(self):
        # Le mode pas à pas ne montre que le titre et le corps des étapes : chaque avertissement est dans le corps de
        # l'étape qui en a besoin.
        for ident, consignes in {
            "accessoires-axe": {
                "Dépose l'axe arrière": ("levier de frein",),
                "Serre l'adaptateur à 25\xa0Nm": ("A reversible (left-hand and right-hand thread) torque wrench MUST be used",
                                                 "levier du cliquet à gauche"),
                "Contrôle la patte": ("Confirm the hanger has not moved", "ne roule pas"),
                # M4 et R4 : le filetage à graisser est le filetage extérieur de l'embout, d'après la notice 2025.
                "Pose la roue et introduis l'axe": ("ARRÊTEZ IMMÉDIATEMENT", "N'UTILISEZ AUCUN OUTIL",
                                                    "Graisse d'abord le filetage extérieur de l'embout, côté transmission",
                                                    "«\xa0Grease. Do not add thread-lock.\xa0»",
                                                    "Do not add thread-locker to external thread of threaded section.",
                                                    "Add Assembly Grease", "Apply grease only to the thru axle threads"),
                "Serre l'axe par la gauche": ("NE PAS TROP SERRER",),
                "Roue\xa0: dévisse l'axe par la droite": ("RETRAIT INCORRECT", "levier de frein")},
            "accessoires-rack": {
                "Pose les pattes sur les bouts de l'axe": ("both pins are engaged and secure",),
                "Contrôle le côté droit": ("Your fingers can be seriously injured if caught", "ne roule pas"),
                "Ferme la sangle": ("Avoid over-tightening the strap", "ne roule pas chargé")},
            "accessoires-sacs": {
                "Sac\xa0: pose-le sur le plateau": ("you shouldn't have any of the pins left showing", "LIFT TO CHECK"),
                "Sacoches\xa0: accroche-les": ("ne touche ni le dérailleur ni la chaîne",)},
            "accessoires-feu": {
                "Contrôle le feu": ("tester l'appareil de jour, dans un environnement sûr", "rien ne cache le feu",
                                    "entre 250 et 1\xa0200\xa0mm au-dessus de la route")},
        }.items():
            for debut, mots in consignes.items():
                corps = self.corps(ident, debut)
                for mot in mots:
                    self.assertIn(normaliser(mot), corps, f"{ident}, {debut} : {mot}")

    def test_etapes_lisibles(self):
        # Une étape tient sur un écran du mode pas à pas : au plus 1 600 caractères de corps, et du français autour des
        # citations anglaises (au moins 40 lettres hors citations et liens).
        self.assertEqual({a.id: len(a.etapes) for a in self.ch.ateliers if a.etapes},
                         {"accessoires-axe": 16, "accessoires-rack": 14, "accessoires-gardeboue": 4,
                          "accessoires-sacs": 13, "accessoires-feu": 6})
        for a in self.ch.ateliers:
            for li in dom.selectionner(a.section, "ol.steps > li"):
                titre = texte_de(dom.selectionner(li, "p.st-t")[0])
                with self.subTest(f"{a.num} : {titre}"):
                    corps = [e for e in elements(li) if "st-t" not in e.classes()]
                    self.assertLessEqual(len(" ".join(texte_de(e) for e in corps)), 1600)
                    copie = dom.analyser("".join(e.html() for e in corps))
                    for lien in dom.selectionner(copie, "a.src"):
                        lien.retirer()
                    francais = re.sub(r"[^A-Za-zÀ-ÿ]", "", re.sub(r"«[^»]*»", "", copie.texte()))
                    self.assertGreaterEqual(len(francais), 40)

    # Chaque renvoi à une étape, dans tout le chapitre : l'atelier qui le porte, le passage, l'atelier visé, et le début
    # du titre de chaque étape visée.
    RENVOIS = (
        ("accessoires-axe", "tu en as besoin à l'étape 3", "accessoires-axe", {3: "Lis l'appui"}),
        ("accessoires-axe", "l'entretoise à l'étape 10", "accessoires-axe", {10: "Choisis l'entretoise"}),
        ("accessoires-axe", "appui conique (étape 3)", "accessoires-axe", {3: "Lis l'appui"}),
        ("accessoires-axe", "reprends l'embout (étape 9)", "accessoires-axe", {9: "Visse l'embout"}),
        ("accessoires-axe", "et l'entretoise (étape 10)", "accessoires-axe", {10: "Choisis l'entretoise"}),
        ("accessoires-axe", "à la main (étape 11)", "accessoires-axe", {11: "Pose la roue et introduis l'axe"}),
        ("accessoires-axe", "à la TW-6.2 (étape 12)", "accessoires-axe", {12: "Serre l'axe par la gauche"}),
        ("accessoires-axe", "comme à l'étape 12", "accessoires-axe", {12: "Serre l'axe par la gauche"}),
        ("accessoires-rack", "le plus bas possible (étape 10)", "accessoires-rack", {10: "Ferme la sangle"}),
        ("accessoires-rack", "le collier bas sur la tige (étape 10)", "accessoires-rack", {10: "Ferme la sangle"}),
        ("accessoires-gardeboue", "roue tournée à la main (étape 4)", "accessoires-gardeboue", {4: "Contrôle le passage"}),
        ("accessoires-sacs", "à l'envers de l'étape 4", "accessoires-sacs", {4: "Sac\xa0: pose-le sur le plateau"}),
        ("accessoires-sacs", "à l'envers de l'étape 8", "accessoires-sacs", {8: "Sacoches\xa0: accroche-les"}),
    )

    def test_renvois_aux_etapes(self):
        for source, passage, cible, visees in self.RENVOIS:
            with self.subTest(passage):
                self.assertIn(passage, self.texte_atelier(source))
                titres = [normaliser(t) for t, _ in self.etapes_de(cible)]
                for n, debut in visees.items():
                    self.assertLessEqual(n, len(titres))
                    self.assertTrue(titres[n - 1].startswith(debut), f"étape {n} de {cible} : « {titres[n - 1]} »")
        motif = re.compile(r"\bétapes? \d+(?!\.\d|\d)(?: (?:et|à) \d+)?")
        for a in self.ch.ateliers:
            # Les numéros d'étape des notices Tailfin (« étape 3 de la notice ») ne sont pas des renvois du site.
            texte = re.sub(r"\bétapes? \d+(?: (?:et|à) \d+)? de (?:la|sa) notice", "", self.texte_atelier(a.id))
            texte = re.sub(r"\b(?:son|ses|leur|leurs) étapes? \d+(?: (?:et|à) \d+)?", "", texte)
            self.assertEqual(len(motif.findall(texte)), len([r for r in self.RENVOIS if r[0] == a.id]),
                             f"{a.id} : {motif.findall(texte)}")

    def test_outils_de_lamine(self):
        outils = {a.id: " ".join(a.outils) for a in self.ch.ateliers}
        for ident, mots in {"accessoires-axe": ("TW-6.2", "12\xa0mm", "5\xa0mm", "8\xa0mm", "clé Canyon", "graisse"),
                            "accessoires-rack": ("ATD-1.2", "T25", "2\xa0mm", "2,5\xa0mm", "4\xa0mm", "5\xa0mm",
                                                 "clé Canyon"),
                            "accessoires-gardeboue": ("clé Canyon",),
                            "accessoires-sacs": ("ATD-1.2", "clé Canyon", "vis livrées"),
                            "accessoires-feu": ("ATD-1.2", "USB-C", "RearVue 820")}.items():
            for mot in mots:
                self.assertIn(mot, outils[ident], f"{ident} : {mot}")

    def test_typographie(self):
        attributs = [normaliser(e.get(nom)) for nom in ("aria-label", "data-de", "data-vers")
                     for e in dom.selectionner(self.section, f"[{nom}]")]
        texte = re.sub(r"<[^>]*>", " | ", self.source) + " | " + " | ".join(attributs)
        self.assertIsNone(re.search("[—–]", self.source))
        # « ATD-1.2 s'arrête » n'est pas une valeur en secondes : l'apostrophe ferme le motif.
        motif = r".{0,40}\d (?:Nm|mm|cm|km|kg|g|h|s|L|m|%|pouces?|heures?|minutes?|secondes?)(?![\w·'])"
        self.assertIsNone(re.search(motif, texte), re.search(motif, texte))
        self.assertIsNone(re.search(r".{0,30}[^\s|] [:;?!»]", texte), re.search(r".{0,30}[^\s|] [:;?!»]", texte))
        self.assertIsNone(re.search(r".{0,30}« ", texte), re.search(r".{0,30}« ", texte))
        self.assertIsNone(re.search(r"\d \d{3}\b", texte), re.search(r".{0,30}\d \d{3}\b", texte))
        self.assertNotIn("&nbsp;", self.source)
        self.assertNotIn("N·m", self.source)
        self.assertNotIn("’", self.source)  # apostrophes droites

    def test_abreviations_par_page(self):
        verifier_abreviations(self, self.ch.ateliers, {
            "UDH": "Universal Derailleur Hanger", "PDF": "Portable Document Format", "FAQ": "foire aux questions",
            "QSG": "guide de démarrage Canyon", "USB": "Universal Serial Bus", "MTB": "mountain bike",
            "VTT": "vélo tout terrain", "UTA": "Universal Thru Axle", "SR": "Speed Release",
            "Di2": "vitesses électroniques Shimano"}, sans_titre=True)

    def test_garde_boue_sous_l_arceau(self):  # M1 de la revue finale
        # Notice V6, p.8 : la vis de 3 Nm traverse le garde-boue par-dessous et entre sous l'arceau B. Le garde-boue est
        # donc sous l'arceau, au-dessus de la roue : une lecture du dessin, dite comme telle.
        intro = " ".join(texte_de(p) for p in elements(self.par_id["accessoires-gardeboue"].section) if p.tag == "p")
        for texte in (intro, self.corps("accessoires-gardeboue", "Avant tout"),
                      self.corps("accessoires-gardeboue", "Pose le garde-boue sous l'arceau")):
            for mot in ("sous l'arceau", "au-dessus de la roue", "lu sur le dessin de la page 8"):
                self.assertIn(mot, texte, mot)
        self.assertNotIn("au-dessus de l'arceau", normaliser(self.source))
        self.assertNotIn("au-dessus de l'arceau", self.releve)
        self.assertIn("sous l'arceau B, au-dessus de la roue", self.releve_section("### 3.8", "### 3.9"))

    def test_nettoyage_du_feu(self):  # M2 de la revue finale
        # Le manuel du RearVue 820 n'a aucune consigne de nettoyage : non publié ; celle d'un autre Varia est une lecture.
        (li,) = [li for li in dom.selectionner(self.par_id["accessoires-charge"].section, "li")
                 if texte_de(li).startswith("Ton feu.")]
        for mot in ("Le manuel de ton RearVue 820 ne donne pas de consigne de nettoyage", "non publiée",
                    "comme lecture", "un autre Varia", "rincez l'appareil sous l'eau courante"):
            self.assertIn(mot, texte_de(li), mot)
        self.assertNotIn("propre manuel prime", self.texte_complet())
        self.assertIn("aucune consigne de nettoyage", self.releve_section("### 5.5", "## 6."))

    def test_pose_generale_du_rearvue(self):  # M3 de la revue finale
        # Les règles générales de la p.5 du manuel du RearVue 820 valent pour tout support : rien à déduire. L'avis du
        # support de tige reste comme précision.
        oriente = self.corps("accessoires-feu", "Oriente le support")
        for mot in ("Assurez-vous que l'appareil n'interfère pas avec le bon fonctionnement de votre vélo.",
                    "Installez l'appareil Varia™ RearVue 820 parallèlement à l'axe longitudinal du véhicule.",
                    "Assurez-vous que la surface du support est perpendiculaire à la route.",
                    "Assurez-vous que l'appareil est orienté droit vers l'arrière",
                    "Vous devez installer la surface du support perpendiculairement au sol"):
            self.assertIn(mot, oriente, mot)
        self.assertNotIn("déduction", oriente)
        (case,) = [li for li in dom.selectionner(self.par_id["accessoires-materiel"].section, "ul.check > li")
                   if texte_de(li).startswith("Support du feu")]
        for mot in ("parallèle à l'axe du vélo", "sans gêner le bon fonctionnement du vélo", "perpendiculaire à la route"):
            self.assertIn(mot, texte_de(case), mot)
        regles = self.releve_section("### 5.2 Le poser", "### 5.3")
        self.assertNotIn("Tailfin et Garmin ne parlent pas du cas", regles)
        self.assertIn("valent pour tout support", regles)

    def test_version_du_porte_bagages(self):  # M5 et M6 de la revue finale
        # La réponse du service client dit que le Journey Rack vient avec « pannier mounts », à confirmer sur la pièce ;
        # la patte va dans le sens de « Gen 2 », sans le confirmer.
        (tr,) = [tr for tr in dom.selectionner(self.par_id["accessoires-materiel"].section, "tbody > tr")
                 if texte_de(tr).startswith("Porte-bagages")]
        for mot in ("«\xa0The Journey Rack comes with pannier mounts designed for our 22L panniers\xa0»", SERVICE_CLIENT,
                    "à confirmer sur la pièce"):
            self.assertIn(mot, texte_de(tr), mot)
        (li,) = [li for li in dom.selectionner(self.par_id["accessoires-materiel"].section, "ul > li")
                 if texte_de(li).startswith("Le vérificateur de Tailfin.")]
        for mot in ("Ta patte va dans ce sens", "Grizl CF | R126-01 | 2027", SERVICE_CLIENT, "une déduction de ce site"):
            self.assertIn(mot, texte_de(li), mot)
        self.assertNotIn("le confirme", texte_de(li))

    def test_releve_sans_date_de_commande(self):  # M8 de la revue finale
        self.assertNotIn("Pre-Order", self.releve)
        self.assertNotIn("Shipping", self.releve)
        self.assertIn("l'adaptateur est annoncé en précommande", self.releve)

    def test_duree_d_appui_du_rct715(self):  # forme, revue finale
        # Le RCT715 a son propre manuel, distinct de celui du RearVue 820.
        (note,) = self.notes("accessoires-feu", "Contradiction\xa0: la durée d'appui")
        self.assertIn("Pour un autre Varia, le RCT715, son manuel donne deux durées", texte_de(note))
        self.assertNotIn("même manuel", self.texte_complet())
        self.assertNotIn("Même manuel Garmin", self.releve)
        self.assertIn("**Durée d'appui pour coupler le RCT715.** Manuel du RCT715 :", self.releve)

    def test_texte_conserve(self):
        verifier_texte_conserve(self, self.ch.ateliers)


if __name__ == "__main__":
    unittest.main()
