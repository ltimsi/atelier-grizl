"""Tests de build/dom.py : l'arbre HTML qui relit les fragments de src/parts à l'identique, puis permet de
sélectionner, retirer et déplacer des blocs sans toucher au texte."""
import sys
import unittest
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import dom  # noqa: E402

PARTS = sorted((RACINE / "src" / "parts").glob("*.html"))
FREINS = (RACINE / "src" / "parts" / "20-freins.html").read_text(encoding="utf-8")


class AllerRetour(unittest.TestCase):
    def test_aller_retour_exact(self):
        self.assertTrue(PARTS, "aucun fragment dans src/parts")
        for chemin in PARTS:
            with self.subTest(chemin.name):
                texte = chemin.read_text(encoding="utf-8")
                self.assertEqual(dom.analyser(texte).html(), texte)

    def test_vides_et_autofermants(self):
        for texte in ('<br>', '<input type="checkbox" id="c">', '<path d="M0,1"/>', '<br/>', '<hr class="x" />'):
            with self.subTest(texte):
                self.assertEqual(dom.analyser(texte).html(), texte)
        # Un élément vide ne contient rien : le texte qui suit reste frère, pas enfant.
        p = dom.analyser('<p>un<br>deux<input id="c">trois</p>').enfants[0]
        self.assertEqual([getattr(e, "tag", "texte") for e in p.enfants], ["texte", "br", "texte", "input", "texte"])
        self.assertEqual(p.enfants[1].enfants, [])
        self.assertEqual(p.enfants[3].get("id"), "c")

    def test_cas_tordus_a_l_identique(self):
        # Ce que le source n'a pas besoin de contenir aujourd'hui, mais que l'arbre ne doit pas abîmer.
        cas = [
            "A &amp; B &nbsp;&#160;&#xA0; &copy sans point-virgule, un & seul, un < seul",
            "<!doctype html>\n<!-- un commentaire -->\n<?php echo 1 ?>",
            "<P CLASS=x>Texte</P >",
            "<ul><li>a<li>b</ul>",
            "<p>reste</p></div></html>",
            '<script>if (a < b && c) { x = "</b>"; }</script>',
            "<style>a>b{color:red}</style>",
            "<svg><title>A &amp; B</title><path d='M0,1' /></svg>",
            "<a href='x' data-k = \"v\" hidden>lien</a>",
            "<ul>\n  <li>x</li>\n</ul>\n\n",
            '<p>fin <b class="x',
            "",
        ]
        for texte in cas:
            with self.subTest(texte):
                self.assertEqual(dom.analyser(texte).html(), texte)

    def test_entites_gardees_brutes(self):
        p = dom.analyser("<p>A &amp; B&nbsp;C &#233;</p>").enfants[0]
        self.assertEqual(p.interieur(), "A &amp; B&nbsp;C &#233;")
        # Un seul nœud de texte, pas un morceau par entité.
        self.assertEqual(len(p.enfants), 1)


class Elements(unittest.TestCase):
    def test_attributs_et_classes(self):
        racine = dom.analyser('<p class="a b" id="x">t</p>')
        self.assertIsNone(racine.tag)
        p = racine.enfants[0]
        self.assertEqual(p.classes(), ["a", "b"])
        self.assertEqual(p.get("id"), "x")
        self.assertIsNone(p.get("absent"))
        p.set("id", "y")
        self.assertEqual(p.html(), '<p class="a b" id="y">t</p>')

    def test_set_ajoute_et_ecrit_un_attribut_sans_valeur(self):
        details = dom.analyser("<details><summary>s</summary></details>").enfants[0]
        details.set("open", None)
        details.set("data-n", 'a "b" & c')
        self.assertEqual(details.html(), '<details open data-n="a &quot;b&quot; &amp; c"><summary>s</summary></details>')
        self.assertEqual(details.get("data-n"), 'a "b" & c')

    def test_balise_intacte_tant_qu_on_ne_touche_pas_aux_attributs(self):
        # Majuscules, guillemets simples et espaces de la source gardés, jusqu'à la première modification.
        a = dom.analyser("<A  HREF='x?a=1&b=2'  Hidden >lien</A>").enfants[0]
        self.assertEqual(a.get("href"), "x?a=1&b=2")
        self.assertEqual(a.html(), "<A  HREF='x?a=1&b=2'  Hidden >lien</A>")
        a.attrs.append(("rel", "nofollow"))
        self.assertEqual(a.html(), '<A href="x?a=1&amp;b=2" hidden rel="nofollow">lien</A>')

    def test_element_cree_a_la_main(self):
        div = dom.Element("div", [("class", "colonne")])
        div.ajouter(dom.Texte("a &amp; b"))
        div.ajouter(dom.Commentaire("<!--c-->"))
        self.assertEqual(div.html(), '<div class="colonne">a &amp; b<!--c--></div>')

    def test_texte(self):
        p = dom.analyser("<p>Serre à <span class=\"nm\">40&nbsp;Nm</span> .</p>").enfants[0]
        self.assertEqual(p.texte(), "Serre à 40 Nm .")
        # Les blancs de mise en page se réduisent, les commentaires ne comptent pas, les entités se décodent.
        q = dom.analyser("<p>\n  Un  <b>mot</b>\t<!-- non -->&amp;\n deux\n</p>").enfants[0]
        self.assertEqual(q.texte(), "Un mot & deux")

    def test_interieur(self):
        div = dom.analyser('<div id="d"><p>un</p><p>deux</p></div>').enfants[0]
        self.assertEqual(div.interieur(), "<p>un</p><p>deux</p>")


class Selection(unittest.TestCase):
    def test_selection(self):
        r = dom.analyser(FREINS)
        self.assertEqual(len(dom.selectionner(r, "section.atelier")), 8)
        self.assertEqual(len(dom.selectionner(r, "ol.steps > li")), 41)

    def test_formes_acceptees(self):
        r = dom.analyser(
            '<div id="a" class="x y"><p class="x">1</p><p data-k="v" hidden>2</p>'
            '<ul class="x y"><li class="x">3</li></ul></div><p>4</p>'
        )
        textes = lambda sel: [e.texte() for e in dom.selectionner(r, sel)]  # noqa: E731
        self.assertEqual(textes("p"), ["1", "2", "4"])
        self.assertEqual([e.tag for e in dom.selectionner(r, ".x")], ["div", "p", "ul", "li"])
        self.assertEqual([e.tag for e in dom.selectionner(r, "p.x")], ["p"])
        self.assertEqual([e.tag for e in dom.selectionner(r, "ul.x.y")], ["ul"])
        self.assertEqual([e.tag for e in dom.selectionner(r, ".y.x")], ["div", "ul"])
        self.assertEqual(textes("[hidden]"), ["2"])
        self.assertEqual(textes('p[data-k="v"]'), ["2"])
        self.assertEqual(textes('p[data-k="autre"]'), [])
        self.assertEqual([e.tag for e in dom.selectionner(r, "div > p")], ["p", "p"])
        self.assertEqual([e.tag for e in dom.selectionner(r, "div>ul")], ["ul"])
        self.assertEqual([e.tag for e in dom.selectionner(r, ".y > li")], ["li"])

    def test_descendance_directe_seulement(self):
        r = dom.analyser("<ol><li>a<ul><li>b</li></ul></li></ol>")
        self.assertEqual([e.texte() for e in dom.selectionner(r, "ol > li")], ["ab"])
        self.assertEqual(len(dom.selectionner(r, "li")), 2)

    def test_ordre_du_document(self):
        r = dom.analyser('<div><p id="1"><b id="2"></b></p><p id="3"></p></div><b id="4"></b>')
        self.assertEqual([e.get("id") for e in dom.selectionner(r, "p")], ["1", "3"])
        self.assertEqual([e.get("id") for e in dom.selectionner(r, "b")], ["2", "4"])

    def test_la_racine_n_est_pas_son_propre_descendant(self):
        r = dom.analyser('<div class="a"><div class="a"></div></div>')
        div = r.enfants[0]
        self.assertEqual(len(dom.selectionner(r, "div.a")), 2)
        self.assertEqual(len(dom.selectionner(div, "div.a")), 1)

    def test_selecteur_non_gere(self):
        r = dom.analyser("<p></p>")
        for selecteur in ("", "a b", "a > b > c", "> p", "p >", "#id", "p:first-child", "*"):
            with self.subTest(selecteur):
                with self.assertRaises(ValueError):
                    dom.selectionner(r, selecteur)


class Deplacements(unittest.TestCase):
    def test_deplacer(self):
        r = dom.analyser('<div id="a"><p>un</p><p>deux</p></div><div id="b"></div>')
        a, b = dom.selectionner(r, "div")
        p = a.enfants[0]
        p.retirer()
        self.assertIsNone(p.parent)
        self.assertEqual(a.html(), '<div id="a"><p>deux</p></div>')
        b.ajouter(p)
        self.assertIs(p.parent, b)
        self.assertEqual(b.html(), '<div id="b"><p>un</p></div>')
        self.assertEqual(r.html(), '<div id="a"><p>deux</p></div><div id="b"><p>un</p></div>')

    def test_inserer_detache_d_abord_l_ancien_parent(self):
        r = dom.analyser('<div id="a"><p>un</p></div><div id="b"><i>x</i></div>')
        a, b = dom.selectionner(r, "div")
        p = a.enfants[0]
        b.inserer(0, p)
        self.assertEqual(a.enfants, [])
        self.assertIs(p.parent, b)
        self.assertEqual(b.html(), '<div id="b"><p>un</p><i>x</i></div>')

    def test_retirer_sans_parent_ne_fait_rien(self):
        p = dom.Element("p")
        p.retirer()
        self.assertIsNone(p.parent)

    def test_envelopper_un_bloc(self):
        # Le geste que les chapitres vont faire : mettre un bloc dans un <details> sans toucher à son texte.
        r = dom.analyser("<ol><li>Pose&nbsp;la roue.</li></ol>")
        li = dom.selectionner(r, "ol > li")[0]
        details = dom.fragment("<details><summary>Étape 1</summary></details>")[0]
        parent = li.parent
        i = parent.enfants.index(li)
        li.retirer()
        details.ajouter(li)
        parent.inserer(i, details)
        self.assertEqual(r.html(), "<ol><details><summary>Étape 1</summary><li>Pose&nbsp;la roue.</li></details></ol>")

    def test_fragment(self):
        noeuds = dom.fragment('texte <b>gras</b><!--c--><br>')
        self.assertEqual([type(n).__name__ for n in noeuds], ["Texte", "Element", "Commentaire", "Element"])
        self.assertTrue(all(n.parent is None for n in noeuds))
        self.assertEqual("".join(n.html() for n in noeuds), 'texte <b>gras</b><!--c--><br>')
        div = dom.Element("div")
        for n in noeuds:
            div.ajouter(n)
        self.assertEqual(div.html(), '<div>texte <b>gras</b><!--c--><br></div>')
        self.assertEqual(dom.fragment(""), [])


if __name__ == "__main__":
    unittest.main()
