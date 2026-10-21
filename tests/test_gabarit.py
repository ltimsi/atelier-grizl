"""Tests de build/gabarit.py : lots.json, adresses relatives, menu, fil d'Ariane, liens entre pages, carte d'imports et
document complet (site) ou fragment (page d'accueil de l'aperçu Claude)."""
import json
import posixpath
import re
import sys
import unittest
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RACINE / "build"))

import ateliers  # noqa: E402
import gabarit  # noqa: E402

CONFIG = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
CHAPITRES = {"freins": ateliers.relever_chapitre((RACINE / "src" / "parts" / "20-freins.html").read_text(encoding="utf-8"))}
SLUGS = ["systeme", "disques", "plaquettes", "rodage", "centrage", "controles", "purge", "securite"]
A_VENIR = ["montage", "tubeless", "transmission", "accessoires", "revision"]
REFERENCES = ["composants", "outils", "couples", "approche", "sources"]
TOUS_LES_SCRIPTS = dict(zones=True, liens=True, three=True, modeles=["caliper"], app=True, references=True,
                        garde_fou=True)


def page(chemin="", titre="Atelier Grizl", **reste):
    return gabarit.Page(chemin=chemin, titre=titre, **reste)


def resoudre(depuis, href):
    """La page (dossier, sans « / » final) que vise un lien relatif écrit dans la page `depuis`."""
    cible = posixpath.normpath(posixpath.join(depuis, href.split("#")[0]))
    return "" if cible == "." else cible


def liens(html):
    return re.findall(r'<a\b[^>]*?\bhref="([^"]*)"', html)


class TestLots(unittest.TestCase):
    def lot(self, numero):
        return next(l for l in CONFIG["lots"] if l["lot"] == numero)

    def test_categories(self):
        attendu = {1: ("freins", "Freins"), 2: ("montage", "Montage à la livraison"),
                   3: ("tubeless", "Pneus et tubeless"), 4: ("transmission", "Transmission"),
                   5: ("accessoires", "Accessoires des trajets"), 6: ("revision", "Révision et couples")}
        for numero, (ident, menu) in attendu.items():
            self.assertEqual(self.lot(numero)["categorie"], {"id": ident, "menu": menu}, f"lot {numero}")
        self.assertNotIn("categorie", self.lot(0))

    def test_nav_disparu(self):
        for lot in CONFIG["lots"]:
            self.assertNotIn("nav", lot, f"lot {lot['lot']}")

    def test_prevu(self):
        self.assertNotIn("prevu", self.lot(0))
        self.assertNotIn("prevu", self.lot(1))
        self.assertEqual(self.lot(2)["prevu"], [
            "Monter le vélo sorti du carton : cintre, roue avant, selle, contrôles avant la première sortie.",
            "Monter les pédales PD-ME700 et les cales SPD.",
            "Reporter ta position sur le Grizl : la forme de cet atelier sera décidée au lot 2."])
        self.assertEqual(self.lot(3)["prevu"], [
            "Passer les pneus en tubeless : valves, liquide, pompe à réservoir.",
            "Crevaisons."])
        self.assertEqual(self.lot(4)["prevu"], [
            "Chaîne : usure, nettoyage, lubrification.",
            "Réglage du dérailleur.",
            "Kit montée : plateau GRX de 38 dents, cassette SLX 10-51, dérailleur RD-RX822-SGS, chaîne CN-M7100."])
        self.assertEqual(self.lot(5)["prevu"], [
            "Porte-bagages Ortlieb Quick-Rack L.",
            "Garde-boue Canyon DEFEND.",
            "Éclairage Knog Blinder et sonnette Knog Oi Luxe.",
            "Porte-bidons et support d'antivol."])
        self.assertEqual(self.lot(6)["prevu"], [
            "Ma révision : ce qu'il faut contrôler et quand, avec uniquement des intervalles publiés.",
            "Aide-mémoire des couples des lots validés."])

    def test_statuts_inchanges(self):
        self.assertEqual([(l["lot"], l["statut"]) for l in CONFIG["lots"]],
                         [(0, "en relecture"), (1, "en relecture")] + [(n, "à faire") for n in range(2, 7)])


class TestAdresses(unittest.TestCase):
    def test_base(self):
        self.assertEqual(gabarit.base(""), "")
        self.assertEqual(gabarit.base("freins/"), "../")
        self.assertEqual(gabarit.base("freins/plaquettes/"), "../../")

    def test_relatif(self):
        cas = [("", "", "./"), ("", "freins/", "freins/"), ("", "freins/plaquettes/", "freins/plaquettes/"),
               ("freins/", "", "../"), ("freins/", "freins/", "./"), ("freins/", "freins/purge/", "purge/"),
               ("freins/purge/", "freins/plaquettes/", "../plaquettes/"), ("freins/purge/", "freins/", "../"),
               ("freins/purge/", "", "../../"), ("freins/purge/", "outils/", "../../outils/"),
               ("freins/purge/", "freins/purge/", "./")]
        for depuis, vers, attendu in cas:
            self.assertEqual(gabarit.relatif(depuis, vers), attendu, f"{depuis!r} vers {vers!r}")


class TestMenu(unittest.TestCase):
    def menu(self, chemin, categorie=None):
        return gabarit.menu(CONFIG, CHAPITRES, page(chemin, categorie=categorie))

    def test_menu_courant(self):
        m = self.menu("freins/plaquettes/", "freins")
        self.assertTrue(m.startswith('<nav class="nav"'), m[:60])
        self.assertEqual(m.count('aria-current="page"'), 1)
        self.assertIn('<a href="./" aria-current="page"><span class="num">2.3</span>Changer les plaquettes</a>', m)
        self.assertEqual(re.findall(r'<span class="num">(2\.\d)</span>', m), [f"2.{n}" for n in range(1, 9)])
        self.assertIn('<a href="../../">Mon vélo</a>', m)
        self.assertIn('<a href="../">Freins<span class="cnt">8</span></a>', m)
        self.assertIn('<a class="soon" href="../../transmission/">Transmission<span class="cnt">lot 4</span></a>', m)

    def test_menu_replie(self):
        m = self.menu("outils/")
        self.assertNotIn('class="sub-nav"', m)
        self.assertNotIn('<span class="num">', m)
        self.assertIn('<a href="./" aria-current="page">Outils</a>', m)
        self.assertEqual(m.count('aria-current="page"'), 1)
        # La catégorie dépliée est celle de la page, pas une autre.
        self.assertNotIn('class="sub-nav"', self.menu("transmission/", "transmission"))

    def test_menu_categorie(self):
        m = self.menu("freins/", "freins")
        self.assertIn('<a href="./" aria-current="page">Freins<span class="cnt">8</span></a>', m)
        self.assertIn('<a href="plaquettes/"><span class="num">2.3</span>Changer les plaquettes</a>', m)
        self.assertIn('<a href="../">Mon vélo</a>', m)

    def test_menu_racine(self):
        m = self.menu("")
        self.assertIn('<a href="./" aria-current="page">Mon vélo</a>', m)
        self.assertEqual(m.count('aria-current="page"'), 1)
        self.assertIn('<a href="freins/">Freins<span class="cnt">8</span></a>', m)
        self.assertIn('<a class="soon" href="montage/">Montage à la livraison<span class="cnt">lot 2</span></a>', m)

    def test_menu_a_venir_courant(self):
        m = self.menu("transmission/", "transmission")
        self.assertIn('<a class="soon" href="./" aria-current="page">Transmission<span class="cnt">lot 4</span></a>', m)
        self.assertEqual(m.count('aria-current="page"'), 1)

    def test_groupes(self):
        m = self.menu("")
        libelles = re.findall(r'<div class="label">([^<]*)</div>', m)
        self.assertEqual(libelles, ["Ateliers", "Références"])
        # Mon vélo, puis les catégories publiées, puis celles à venir dans l'ordre des lots, puis les références.
        self.assertEqual(liens(m), ["./", "freins/"] + [f"{c}/" for c in A_VENIR] + [f"{r}/" for r in REFERENCES])
        reference = m[m.index("Références"):]
        textes = re.findall(r">([^<]+)</a>", reference)
        self.assertEqual(textes, ["Composants d'origine", "Outils", "Couples de serrage", "Ce qui est approché",
                                  "Sources"])

    def test_liens_relatifs_qui_menent_aux_bonnes_pages(self):
        cibles = ["", "freins"] + [f"freins/{s}" for s in SLUGS] + A_VENIR + REFERENCES
        for chemin, categorie in [("", None), ("freins/", "freins"), ("freins/plaquettes/", "freins"),
                                  ("montage/", "montage"), ("approche/", None)]:
            m = self.menu(chemin, categorie)
            hrefs = liens(m)
            for href in hrefs:
                self.assertFalse(href.startswith(("/", "#", "http")), f"{chemin} : {href}")
                self.assertIn(resoudre(chemin, href), cibles, f"{chemin} : {href}")
            attendu = {"", "freins"} | set(A_VENIR) | set(REFERENCES)
            if categorie == "freins":
                attendu |= {f"freins/{s}" for s in SLUGS}
            self.assertEqual({resoudre(chemin, h) for h in hrefs}, attendu, chemin)

    def test_echappement(self):
        config = json.loads(json.dumps(CONFIG))
        config["lots"][1]["categorie"]["menu"] = "Freins & <disques>"
        m = gabarit.menu(config, CHAPITRES, page("outils/"))
        self.assertIn("Freins &amp; &lt;disques&gt;", m)

    def test_chapitre_absent(self):
        with self.assertRaises(ValueError):
            gabarit.menu(CONFIG, {}, page(""))


class TestFilAriane(unittest.TestCase):
    def test_fil(self):
        p = page("freins/plaquettes/", fil=[("Ateliers", None), ("Freins", "freins/"),
                                           ("2.3 Changer les plaquettes", None)])
        f = gabarit.fil_ariane(p)
        self.assertEqual(f, '<nav class="crumbs" aria-label="Fil d’Ariane"><span>Ateliers</span>'
                            '<span class="sep" aria-hidden="true">/</span><a href="../">Freins</a>'
                            '<span class="sep" aria-hidden="true">/</span>'
                            '<span aria-current="page">2.3 Changer les plaquettes</span></nav>')

    def test_racine(self):
        f = gabarit.fil_ariane(page("", fil=[("Mon vélo", None)]))
        self.assertEqual(f, '<nav class="crumbs" aria-label="Fil d’Ariane"><span aria-current="page">Mon vélo</span></nav>')

    def test_dernier_maillon_lie(self):
        # Un dernier maillon qui a une adresse reste un lien : seul un maillon sans adresse est « la page ».
        f = gabarit.fil_ariane(page("freins/", fil=[("Ateliers", None), ("Freins", "freins/")]))
        self.assertIn('<a href="./">Freins</a>', f)
        self.assertNotIn("aria-current", f)

    def test_echappement(self):
        f = gabarit.fil_ariane(page("outils/", fil=[("Outils & <pièces>", None)]))
        self.assertIn("Outils &amp; &lt;pièces&gt;", f)


class TestReecrireLiens(unittest.TestCase):
    ANCRES = {"freins": "freins/", "freins-plaquettes": "freins/plaquettes/", "freins-pl-2": "freins/plaquettes/",
              "freins-purge": "freins/purge/", "freins-pl-5": "freins/purge/"}

    def reecrire(self, html, chemin):
        return gabarit.reecrire_liens(html, chemin, self.ANCRES)

    def test_reecrire_liens(self):
        self.assertEqual(self.reecrire('<a href="#freins-plaquettes">Plaquettes</a>', "freins/purge/"),
                         '<a href="../plaquettes/">Plaquettes</a>')
        self.assertEqual(self.reecrire('<a href="#freins-pl-2">planche</a>', "freins/purge/"),
                         '<a href="../plaquettes/#freins-pl-2">planche</a>')
        self.assertEqual(self.reecrire('<a href="#montage">Chapitre 1</a>', "freins/purge/"),
                         '<span class="muted">Chapitre 1</span>')
        self.assertEqual(self.reecrire('<a href="#freins">Freins</a>', ""), '<a href="freins/">Freins</a>')

    def test_autres_attributs_gardes(self):
        self.assertEqual(self.reecrire('<a class="src" href="#freins-pl-2" title="x">p. 2</a>', "freins/purge/"),
                         '<a class="src" href="../plaquettes/#freins-pl-2" title="x">p. 2</a>')

    def test_inconnu_texte_garde(self):
        html = '<a class="src" href="#montage">le <b>montage</b>\nde la roue</a>'
        self.assertEqual(self.reecrire(html, ""), '<span class="muted">le <b>montage</b>\nde la roue</span>')

    def test_plusieurs_liens_sur_une_ligne(self):
        html = '<p><a href="#freins">A</a> et <a href="#montage">B</a> et <a href="#freins-purge">C</a></p>'
        self.assertEqual(self.reecrire(html, "freins/rodage/"),
                         '<p><a href="../">A</a> et <span class="muted">B</span> et <a href="../purge/">C</a></p>')

    def test_liens_laisses_tels_quels(self):
        for html in ('<a href="https://www.shimano.com/#freins">Shimano</a>', '<a href="mailto:a@b.fr">écrire</a>',
                     '<a href="#">haut</a>', '<a href="../plaquettes/">déjà relatif</a>',
                     '<a data-href="#montage">pas un lien</a>', "<p>#montage</p>", '<a name="x">ancre</a>'):
            self.assertEqual(self.reecrire(html, "freins/purge/"), html)

    def test_meme_page(self):
        # Une ancre de la page même reste une ancre simple.
        self.assertEqual(self.reecrire('<a href="#freins-pl-2">planche</a>', "freins/plaquettes/"),
                         '<a href="#freins-pl-2">planche</a>')
        # Le lien vers la page elle-même (id de l'atelier) n'a pas d'ancre.
        self.assertEqual(self.reecrire('<a href="#freins-plaquettes">ici</a>', "freins/plaquettes/"),
                         '<a href="./">ici</a>')
        self.assertEqual(self.reecrire('<a href="#freins">ici</a>', "freins/"), '<a href="./">ici</a>')

    def test_tout_en_relatif(self):
        for chemin in ("", "freins/", "freins/purge/"):
            html = "".join(f'<a href="#{i}">x</a>' for i in self.ANCRES)
            for href in liens(self.reecrire(html, chemin)):
                self.assertFalse(href.startswith("/"), href)


class TestCarteImports(unittest.TestCase):
    def test_carte_imports(self):
        profonde = gabarit.carte_imports("site", "freins/plaquettes/")
        self.assertIn('type="importmap"', profonde)
        self.assertIn('"three": "../../vendor/three/three.module.min.js"', profonde)
        self.assertIn('"three/addons/": "../../vendor/three/addons/"', profonde)
        racine = gabarit.carte_imports("site", "")
        self.assertIn('"three": "./vendor/three/three.module.min.js"', racine)
        self.assertIn('"three/addons/": "./vendor/three/addons/"', racine)
        categorie = gabarit.carte_imports("site", "freins/")
        self.assertIn('"three": "../vendor/three/three.module.min.js"', categorie)

    def test_carte_imports_artifact(self):
        for chemin in ("", "freins/plaquettes/"):
            carte = gabarit.carte_imports("artifact", chemin)
            self.assertIn('"three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"', carte)
            self.assertIn('"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"', carte)

    def test_jamais_un_nom_nu(self):
        # Chromium ignore une adresse qui ne commence ni par « ./ », « ../ », « / » ni par un schéma.
        for cible in ("site", "artifact"):
            for chemin in ("", "freins/", "freins/plaquettes/"):
                carte = json.loads(re.search(r"<script[^>]*>(.*)</script>", gabarit.carte_imports(cible, chemin), re.S).group(1))
                for adresse in carte["imports"].values():
                    self.assertRegex(adresse, r"^(\./|\.\./|https://)", f"{cible} {chemin} {adresse}")


class TestDocument(unittest.TestCase):
    def doc(self, chemin, cible="site", **reste):
        p = page(chemin, titre=reste.pop("titre", "Freins"), contenu=reste.pop("contenu", "<h1>Freins</h1>"),
                 fil=reste.pop("fil", [("Mon vélo", None)]), **reste)
        return gabarit.document(p, CONFIG, CHAPITRES, cible)

    def test_document_artifact(self):
        racine = self.doc("", "artifact", titre="Atelier Grizl")
        for interdit in ("<!doctype", "<!DOCTYPE", "<html", "<head>", "<body"):
            self.assertFalse(interdit in racine, "présent : " + interdit)
        self.assertTrue(racine.startswith("<title>Atelier Grizl</title>"), racine[:80])
        self.assertIn('<div class="app" data-base="">', racine)
        deux = self.doc("freins/", "artifact")
        self.assertTrue(deux.startswith("<!doctype html>\n<html lang=\"fr\">"), deux[:60])
        for attendu in ("<head>", "</head>", "<body>", "</body>", "</html>"):
            self.assertIn(attendu, deux)

    def test_document_site(self):
        for chemin in ("", "freins/"):
            d = self.doc(chemin)
            self.assertTrue(d.startswith("<!doctype html>\n<html lang=\"fr\">"), chemin)
            self.assertIn('<meta charset="utf-8">', d)
            self.assertIn('<meta name="viewport"', d)
            self.assertLess(d.index("<meta charset"), d.index("<title>"))
            self.assertLess(d.index("</head>"), d.index("<body>"))
            self.assertTrue(d.rstrip().endswith("</html>"))

    def test_titre(self):
        self.assertIn("<title>Atelier Grizl</title>", self.doc("", titre="Atelier Grizl"))
        self.assertIn("<title>Freins · Atelier Grizl</title>", self.doc("freins/"))
        self.assertIn("<title>Centrer l'étrier &amp; purger · Atelier Grizl</title>",
                      self.doc("freins/centrage/", titre="Centrer l'étrier & purger"))
        # Un seul <title> par page, et la tête ne le porte plus.
        self.assertEqual(self.doc("freins/").count("<title>"), 1)
        self.assertNotIn("<title>", (RACINE / "src" / "parts" / "00-head.html").read_text(encoding="utf-8"))

    def test_squelette(self):
        d = self.doc("freins/plaquettes/", categorie="freins", fil=[("Ateliers", None), ("Freins", "freins/")],
                     contenu='<h1 id="titre">Changer les plaquettes</h1>')
        self.assertIn('<div class="app" data-base="../../">', d)
        # Le lien d'évitement en tête de .app, avant le menu, vers le contenu de la page.
        ordre = ['<div class="app" data-base="../../">\n<a class="evitement" href="#contenu">Aller au contenu</a>\n'
                 '<aside class="side" id="side"', '<nav class="nav"', '<header class="top">',
                 '<button class="menu-btn" id="menu-btn"', '<nav class="crumbs"', '<input id="recherche"',
                 '<div class="results" id="resultats"', '<main class="page" id="contenu">', '<h1 id="titre">', "</main>",
                 '<footer class="wrap footer">']
        positions = [d.find(o) for o in ordre]
        self.assertNotIn(-1, positions, [o for o, p in zip(ordre, positions) if p < 0])
        self.assertEqual(positions, sorted(positions))
        self.assertIn('aria-controls="side"', d)
        self.assertIn('aria-expanded="false"', d)
        self.assertRegex(d, r'<input id="recherche" type="search" [^>]*aria-label="Chercher"')
        self.assertRegex(d, r'<div class="results" id="resultats" hidden></div>')
        self.assertIn('<a href="./" aria-current="page"><span class="num">2.3</span>', d.replace("\n", ""))

    def test_pied(self):
        d = self.doc("")
        self.assertIn("Atelier Grizl, guide d'atelier personnel", d)
        self.assertIn(f'Version {CONFIG["version"]} du ', d)
        self.assertNotIn("<!--VERSION-->", d)
        self.assertNotIn("<!--SCRIPTS-->", d)
        self.assertIn("Lots 0 et 1 en relecture.", d)

    def test_scripts_minimaux(self):
        d = self.doc("freins/plaquettes/")
        self.assertIn('<script src="../../js/recherche.js"></script>', d)
        self.assertIn('<script type="module" src="../../js/site.js"></script>', d)
        self.assertLess(d.index("js/recherche.js"), d.index("js/site.js"))
        for absent in ("zones-data", "liens-data", "importmap", "viewer.js", "m-caliper.js", "scene/app.js",
                       "references.js", "hasAttribute('data-app')"):
            self.assertNotIn(absent, d)

    def test_scripts_complets(self):
        d = self.doc("freins/plaquettes/", scripts=TOUS_LES_SCRIPTS)
        for attendu in ('<script src="../../js/recherche.js"></script>',
                        '<script type="module" src="../../js/site.js"></script>',
                        '<script src="../../js/viewer.js"></script>',
                        '<script src="../../js/m-caliper.js"></script>',
                        '<script type="module" src="../../js/scene/app.js"></script>',
                        '<script type="module" src="../../js/references.js"></script>',
                        '<script type="application/json" id="zones-data">',
                        '<script type="application/json" id="liens-data">',
                        '"three": "../../vendor/three/three.module.min.js"'):
            self.assertIn(attendu, d)
        # La carte d'imports passe avant le premier module, et la visionneuse avant la scène qui la lance.
        self.assertLess(d.index('type="importmap"'), d.index('type="module"'))
        self.assertLess(d.index("js/viewer.js"), d.index("js/m-caliper.js"))
        self.assertLess(d.index("js/m-caliper.js"), d.index("js/scene/app.js"))
        # Le garde-fou est un script classique placé après la scène.
        garde = d.index("hasAttribute('data-app')")
        self.assertGreater(garde, d.index("js/scene/app.js"))
        self.assertGreater(garde, d.index("js/references.js"))
        self.assertEqual(d.count("<script"), d.count("</script>"))

    def test_scripts_a_la_racine(self):
        d = self.doc("", scripts=dict(zones=True, three=True, app=True, garde_fou=True))
        self.assertIn('<script src="js/recherche.js"></script>', d)
        self.assertIn('<script type="module" src="js/scene/app.js"></script>', d)
        self.assertIn('"three": "./vendor/three/three.module.min.js"', d)
        self.assertNotIn("viewer.js", d)

    def test_artifact_scripts(self):
        d = self.doc("", "artifact", titre="Atelier Grizl", scripts=dict(three=True, app=True))
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js", d)
        self.assertIn('<script type="module" src="js/scene/app.js"></script>', d)
        self.assertLess(d.index('type="importmap"'), d.index('type="module"'))
        profonde = self.doc("freins/plaquettes/", "artifact", scripts=dict(three=True, app=True))
        self.assertIn("https://cdn.jsdelivr.net/npm/three@0.160.0/", profonde)
        self.assertIn('<script type="module" src="../../js/scene/app.js"></script>', profonde)

    def test_donnees_json(self):
        d = self.doc("", scripts=dict(zones=True, liens=True))
        zones = re.search(r'<script type="application/json" id="zones-data">(.*?)</script>', d, re.S)
        attendu = json.loads((RACINE / "src" / "scene" / "zones.json").read_text(encoding="utf-8"))
        self.assertEqual(json.loads(zones.group(1)), attendu)
        anciens = json.loads(re.search(r'<script type="application/json" id="liens-data">(.*?)</script>', d, re.S).group(1))
        self.assertEqual(anciens["freins"], "freins/")
        self.assertEqual(anciens["freins-plaquettes"], "freins/plaquettes/")
        self.assertEqual(anciens["freins-pl-2"], "freins/plaquettes/#freins-pl-2")

    def test_garde_fou(self):
        d = self.doc("", scripts=dict(garde_fou=True))
        debut = d.index("hasAttribute('data-app')")
        garde = d[d.rfind("<script>", 0, debut):d.index("</script>", debut)]
        for morceau in ("DOMContentLoaded", "sans-rendu", "AtelierViewer.start()", "scene-alerte"):
            self.assertIn(morceau, garde)
        self.assertIn("La page n’a pas pu se charger en entier. Les ateliers restent accessibles par le menu et par "
                      "« Où intervenir ».", garde)
        for ancien in ("#fiche", "'fiche'", "chips", "chapnav", "atelier-grizl:checks"):
            self.assertNotIn(ancien, garde)

    def test_script_inconnu(self):
        # Une faute de frappe dans une clé ne doit pas faire perdre un script sans rien dire.
        with self.assertRaises(ValueError):
            self.doc("", scripts=dict(garde_fou_=True))

    def test_etat_des_lots(self):
        config = json.loads(json.dumps(CONFIG))
        config["lots"][1]["statut"] = "validé"
        pied = gabarit.document(page("outils/", "Outils"), config, CHAPITRES, "site")
        self.assertIn("Lot 1 validé. Lot 0 en relecture. Les catégories en pointillés", pied)
        config["lots"][0]["statut"] = "validé"
        pied = gabarit.document(page("outils/", "Outils"), config, CHAPITRES, "site")
        self.assertIn("Lots 0 et 1 validés. Les catégories en pointillés", pied)

    def test_aucun_tiret_long(self):
        for chemin, cible in [("", "site"), ("freins/plaquettes/", "site"), ("", "artifact")]:
            d = self.doc(chemin, cible, categorie="freins", scripts=TOUS_LES_SCRIPTS)
            self.assertIsNone(re.search("[\u2014\u2013]", d), f"{chemin} {cible}")

    def test_ids_uniques(self):
        d = self.doc("freins/plaquettes/", categorie="freins", scripts=TOUS_LES_SCRIPTS)
        ids = re.findall(r'\sid="([^"]+)"', d)
        self.assertEqual(sorted(set(i for i in ids if ids.count(i) > 1)), [])


class TestLiensAnciens(unittest.TestCase):
    def test_anciens_ids(self):
        liens_anciens = gabarit.liens_anciens(CONFIG, CHAPITRES)
        self.assertEqual(liens_anciens["freins"], "freins/")
        self.assertEqual(liens_anciens["freins-h"], "freins/#freins-h")
        for slug in SLUGS:
            self.assertEqual(liens_anciens[f"freins-{slug}"], f"freins/{slug}/")
        self.assertEqual(liens_anciens["freins-pl-2"], "freins/plaquettes/#freins-pl-2")
        self.assertEqual(liens_anciens["freins-mk-5"], "freins/purge/#freins-mk-5")
        self.assertEqual(liens_anciens["ck-freins-apres-3"], "freins/controles/#ck-freins-apres-3")
        # Chaque ancien id de src/parts/20-freins.html a une nouvelle adresse.
        source = (RACINE / "src" / "parts" / "20-freins.html").read_text(encoding="utf-8")
        for ident in re.findall(r'\sid="([^"]+)"', source):
            self.assertIn(ident, liens_anciens)

    def test_pas_de_chemin_absolu(self):
        for adresse in gabarit.liens_anciens(CONFIG, CHAPITRES).values():
            self.assertFalse(adresse.startswith("/"), adresse)


class TestFragments(unittest.TestCase):
    def lire(self, nom):
        return (RACINE / "src" / "parts" / f"{nom}.html").read_text(encoding="utf-8")

    def test_pied_garde_fou_seul(self):
        pied = self.lire("99-foot")
        self.assertEqual(pied.count("<!--SCRIPTS-->"), 1)
        self.assertEqual(pied.count("<!--VERSION-->"), 1)
        for ancien in ("'fiche'", "'chips'", "#fiche", "#chips", "chapnav", "atelier-grizl:checks", "data-reset",
                       "IntersectionObserver"):
            self.assertNotIn(ancien, pied)
        self.assertIn("La page n’a pas pu se charger en entier. Les ateliers restent accessibles par le menu et par "
                      "« Où intervenir ».", pied)

    def test_fragments_sans_tiret_long(self):
        for nom in ("00-head", "99-foot"):
            self.assertIsNone(re.search("[\u2014\u2013]", self.lire(nom)), nom)
        texte = (RACINE / "build" / "lots.json").read_text(encoding="utf-8")
        self.assertIsNone(re.search("[\u2014\u2013]", texte))


if __name__ == "__main__":
    unittest.main()
