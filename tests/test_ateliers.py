"""Tests de build/ateliers.py : le chapitre Freins relu en ateliers, puis les deux colonnes de la page d'un atelier,
étapes et blocs repliés dans des <details>, sans texte perdu ni contenu caché."""
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
        self.assertEqual((p.de, p.vers), ("Plaquettes d’origine L05A-RF", "Shimano L05A-RF neuves"))
        self.assertEqual(p.demonter, "La roue.")
        self.assertEqual(len(p.outils), 10)
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
        self.assertEqual(len(cases), 10)

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


if __name__ == "__main__":
    unittest.main()
