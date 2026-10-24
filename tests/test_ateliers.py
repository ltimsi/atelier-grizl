"""Tests de build/ateliers.py : le chapitre Freins relu en ateliers, puis les deux colonnes de la page d'un atelier,
étapes et blocs repliés dans des <details>, sans texte perdu ni contenu caché."""
import re
import sys
import unittest
from pathlib import Path

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
        for a in self.chapitre.ateliers:
            with self.subTest(a.slug):
                gauche, droite = self.cols[a.slug]
                sortie = dom.analyser(gauche + droite)
                # Le numéro et la copie du premier couple, ajoutés au résumé d'une étape, s'intercalent entre son
                # titre et son corps : ce sont des libellés d'interface, retirés avant de comparer.
                for ajout in dom.selectionner(sortie, "summary > span.st-n") + dom.selectionner(sortie, "summary > span.nm"):
                    ajout.retirer()
                texte = sortie.texte()
                for selecteur in ("p", "li", "h4", "td", "b", "summary", "figcaption"):
                    for e in dom.selectionner(a.section, selecteur):
                        self.assertIn(e.texte(), texte, f"{selecteur} : {e.texte()[:60]}")


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


def lignes_de(racine):
    """Chaque ligne de `racine` : l'élément de LIGNES le plus haut, pris en entier (une étape avec son titre et son
    corps, une ligne de tableau avec ses cellules), dans l'ordre du document."""
    trouvees = []

    def parcourir(element):
        for enfant in elements(element):
            if enfant.tag in LIGNES:
                trouvees.append(enfant)
            else:
                parcourir(enfant)
    parcourir(racine)
    return trouvees


def aria_labels(racine):
    return [normaliser(e.get("aria-label")) for e in dom.selectionner(racine, "[aria-label]")]


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
        vues = set()
        for a in self.ch.ateliers:
            for ligne in lignes_de(a.section):
                qsg = [s for s in dom.selectionner(ligne, "a.src") if QSG in s.get("href")]
                if not (qsg and dom.selectionner(ligne, "span.nm")):
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
        # Les jetons personnels de Lamine (cotes, pressions, étude de position) ne sont jamais écrits dans un fichier
        # suivi par git : ils sont lus dans brouillons/jetons-personnels.txt, hors du dépôt, quand il existe.
        texte = self.texte_complet().replace("\u00a0", " ")
        html = self.source.replace("\u00a0", " ")
        for absent in ("CHF", "\u20ac", "/Users/", "ltimsi", "file:"):
            self.assertNotIn(absent, texte, absent)
            self.assertNotIn(absent, html, absent)
        if JETONS.exists():
            jetons = [l.strip() for l in JETONS.read_text(encoding="utf-8").splitlines()
                      if l.strip() and not l.lstrip().startswith("#")]
            self.assertTrue(jetons)
            for n, absent in enumerate(jetons, 1):
                # Le message ne répète pas le jeton : seul son rang dans le fichier.
                self.assertFalse(absent in texte or absent in html, f"jeton personnel n°{n} de {JETONS.name}")
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
            "montage-roues": ("12x148", "4\xa0bar", "3,0\xa0bar", "DT SWISS", "levier"),  # axes et pression
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
        # Une étape à 2, 2,5 ou 7 Nm nomme la clé Canyon dès son titre, que reprend la boîte des couples.
        for a in self.ch.ateliers:
            for e in a.etapes:
                if any(HORS_OUTILS.search(c) for c in e.couples):
                    self.assertIn("clé Canyon", e.titre, e.titre)
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
        for a in self.ch.ateliers:
            with self.subTest(a.id):
                gauche, droite = ateliers.colonnes(a)
                sortie = dom.analyser(gauche + droite)
                for ajout in dom.selectionner(sortie, "summary > span.st-n") + dom.selectionner(sortie, "summary > span.nm"):
                    ajout.retirer()
                texte = sortie.texte()
                for selecteur in ("p", "li", "h4", "td", "b", "summary", "figcaption"):
                    for e in dom.selectionner(a.section, selecteur):
                        self.assertIn(e.texte(), texte, f"{selecteur} : {e.texte()[:60]}")


if __name__ == "__main__":
    unittest.main()
