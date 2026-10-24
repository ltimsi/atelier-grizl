#!/usr/bin/env python3
"""Assemble le site Atelier Grizl à partir des fragments de src/parts.

Seuls les lots « validé » ou « en relecture » de build/lots.json sont publiés. build/pages.py fait les pages, une par
adresse, et build/gabarit.py les habille (menu, fil d'Ariane, recherche, pied, scripts). Chaque page est le fichier
index.html de son dossier et tous ses liens sont relatifs : le même site marche à la racine d'un serveur, dans un
sous-dossier et dans l'aperçu Claude.

Sorties :
  dist/site/      site autonome pour le serveur : documents HTML complets, three.js local dans vendor/three/
  dist/artifact/  la même arborescence pour l'aperçu Claude : la page d'accueil sans squelette HTML (l'hôte pose le
                  sien), three.js depuis jsDelivr

Dans les deux, les scripts sont aux mêmes chemins : js/recherche.js (l'index de la recherche), js/site.js,
js/references.js, js/viewer.js, js/m-<modèle>.js et js/scene/.

Contrôles, qui font sortir le script en 1 :
  - chaque atelier des chapitres sources a les blocs de son type et une zone de zones.json (un atelier « comprendre »
    peut n'en avoir aucune), et chaque zone a au moins un atelier publié ;
  - chaque page est sans tiret cadratin ni demi-cadratin et sans id en double ;
  - chaque lien, script et fichier qu'une page appelle existe, ancre comprise.

Usage : python3 build/assemble.py [--target site|artifact|all]
"""
import argparse
import collections
import json
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote

from dom import analyser, selectionner
from gabarit import PUBLIES, document, lire, lire_zones
from pages import chapitres_publies, index_recherche, toutes_les_pages

RACINE = Path(__file__).resolve().parent.parent
SRC = RACINE / "src"
DIST = RACINE / "dist"
CIBLES = ("site", "artifact")
# Ateliers : les section.atelier des chapitres sources.
TYPES_ATELIER = ("comprendre", "entretenir", "regler", "remplacer")
GESTES = (".a-dem", ".kit", "ol.steps")  # obligatoires, sauf pour « comprendre » qui n'en a aucun
BLOCS = {".a-dem": (None, "a-dem"), ".kit": (None, "kit"), "ol.steps": ("ol", "steps"),
         "ul.media": ("ul", "media"), "p.a-video": ("p", "a-video")}
# Les adresses complètes qu'une page peut appeler. Toute autre adresse est relative à la page.
SCHEMAS = ("http:", "https:", "mailto:", "data:")
_SCHEMA = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
RESERVES = ("js", "vendor")  # dossiers des fichiers copiés, qu'aucune page ne peut prendre


# ---------------------------------------------------------------------------------------------------------------
# Contrôles des chapitres sources
# ---------------------------------------------------------------------------------------------------------------

class _Ateliers(HTMLParser):
    """Relève les section.atelier d'une page : leurs attributs et les blocs d'atelier qu'elles contiennent."""

    def __init__(self):
        super().__init__()
        self.ateliers, self._pile = [], []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if tag == "section":
            atelier = None
            if "atelier" in classes:
                atelier = {**a, "blocs": set()}
                self.ateliers.append(atelier)
            self._pile.append(atelier)
            return
        ouverts = [s for s in self._pile if s is not None]
        if ouverts:
            ouverts[-1]["blocs"].update(nom for nom, (balise, classe) in BLOCS.items()
                                        if classe in classes and balise in (None, tag))

    def handle_endtag(self, tag):
        if tag == "section" and self._pile:
            self._pile.pop()


def relever_ateliers(texte):
    lecteur = _Ateliers()
    lecteur.feed(texte)
    lecteur.close()
    return lecteur.ateliers


def controle_ateliers(texte, zones):
    """Chaque atelier a les blocs de son type et une zone de zones.json ; chaque zone a au moins un atelier publié.

    Seul un atelier « comprendre » peut n'avoir aucune zone (pas de data-zone, ou data-zone vide) : une fiche à lire
    ne vise aucune pièce du vélo. Une zone écrite doit exister dans zones.json, quel que soit le type."""
    erreurs = []
    ateliers = relever_ateliers(texte)
    for s in ateliers:
        nom = f'atelier {s.get("id") or "sans id"}'
        zone, type_, blocs = s.get("data-zone") or None, s.get("data-type"), s["blocs"]
        if not s.get("id"):
            erreurs.append(f"{nom} : app.js ne peut pas l'ouvrir")
        if zone not in zones and not (zone is None and type_ == "comprendre"):
            erreurs.append(f"{nom} : data-zone « {zone or ''} » absente de src/scene/zones.json")
        if type_ not in TYPES_ATELIER:
            erreurs.append(f"{nom} : data-type « {type_ or ''} » inconnu (comprendre, entretenir, regler ou remplacer)")
        elif type_ == "comprendre":
            erreurs += [f"{nom} : {b} en trop (type comprendre)" for b in GESTES if b in blocs]
        else:
            erreurs += [f"{nom} : {b} manquant (type {type_})" for b in GESTES if b not in blocs]
        if not blocs & {"ul.media", "p.a-video"}:
            erreurs.append(f"{nom} : ni ul.media ni p.a-video")
        if type_ == "remplacer" and not (s.get("data-de") and s.get("data-vers")):
            erreurs.append(f"{nom} : data-de et data-vers obligatoires (type remplacer)")
    erreurs += [f"zone « {z} » sans atelier publié" for z in zones if not any(s.get("data-zone") == z for s in ateliers)]
    return erreurs


def textes_sources(config):
    """Les fragments des lots publiés, à la suite : ce que controle_ateliers relit."""
    return "\n".join(lire(nom) for lot in config["lots"] if lot["statut"] in PUBLIES for nom in lot["parts"])


# ---------------------------------------------------------------------------------------------------------------
# Contrôles des pages
# ---------------------------------------------------------------------------------------------------------------

def controles(texte):
    """Les erreurs d'une page générée : tirets cadratins ou demi-cadratins, ids en double."""
    erreurs = []
    tirets = len(re.findall("[\u2014\u2013]", texte))
    if tirets:
        erreurs.append(f"{tirets} tiret(s) cadratin ou demi-cadratin")
    ids = re.findall(r'\sid="([^"]+)"', texte)
    doublons = [i for i, n in collections.Counter(ids).items() if n > 1]
    if doublons:
        erreurs.append("id en double : " + ", ".join(doublons[:10]))
    return erreurs


def _resoudre(depuis, chemin):
    """Le chemin, relatif à la racine du site, que vise `chemin` écrit dans la page `depuis` : il finit par « / »
    s'il désigne un dossier, et vaut "" pour la racine. None s'il sort du site."""
    segments = [s for s in depuis.split("/") if s]
    morceaux = chemin.split("/")
    dossier = morceaux[-1] in ("", ".", "..")
    for morceau in morceaux:
        if morceau in ("", "."):
            continue
        if morceau == "..":
            if not segments:
                return None
            segments.pop()
        else:
            segments.append(morceau)
    cible = "/".join(segments)
    return cible + "/" if dossier and cible else cible


def _probleme(depuis, adresse, pages, fichiers, ids):
    """Ce qui ne va pas avec une adresse href ou src de la page `depuis`, ou None si elle mène quelque part."""
    if adresse.startswith("#"):
        return None if adresse[1:] in ids[depuis] else "ancre absente de la page"
    if adresse.lower().startswith(SCHEMAS):
        return None
    if adresse.startswith("/"):
        return "chemin absolu, il doit être relatif à la page"
    if _SCHEMA.match(adresse):
        return "adresse d'un type non prévu"
    chemin, _, ancre = adresse.partition("#")
    cible = _resoudre(depuis, unquote(chemin.split("?")[0]))
    if cible is None:
        return "mène hors du site"
    if cible == "" or cible.endswith("/"):
        page = cible
    elif cible == "index.html" or cible.endswith("/index.html"):
        page = cible.removesuffix("index.html")
    elif cible in fichiers:
        return None
    elif cible + "/" in pages:
        return "page sans « / » final"
    else:
        return "fichier absent"
    if page not in pages:
        return "page absente"
    if ancre and ancre not in ids[page]:
        return f"ancre absente de la page {page or 'accueil'}"
    return None


def _carte_d_imports(depuis, script, fichiers):
    """Les erreurs d'une carte d'imports : chaque adresse relative mène à un fichier copié (ou, pour un préfixe en
    « / », à un dossier qui en contient). Une adresse sans « ./ » ni « ../ » serait ignorée par Chromium."""
    try:
        imports = json.loads(script.interieur()).get("imports", {})
    except ValueError:
        return ["carte d'imports illisible"]
    erreurs = []
    for nom, adresse in imports.items():
        if adresse.lower().startswith(SCHEMAS):
            continue
        if not adresse.startswith(("./", "../")):
            erreurs.append(f"carte d'imports « {nom} » : « {adresse} » ne commence ni par ./ ni par ../")
            continue
        cible = _resoudre(depuis, adresse)
        if cible is None:
            erreurs.append(f"carte d'imports « {nom} » : « {adresse} » mène hors du site")
        elif cible.endswith("/") and not any(f.startswith(cible) for f in fichiers):
            erreurs.append(f"carte d'imports « {nom} » : dossier « {adresse} » absent")
        elif not cible.endswith("/") and cible not in fichiers:
            erreurs.append(f"carte d'imports « {nom} » : fichier « {adresse} » absent")
    return erreurs


def liens_casses(pages: dict[str, str], fichiers: set[str]) -> list[str]:
    """Les liens du site qui ne mènent nulle part. `pages` donne le HTML de chaque page par chemin ("", "freins/"),
    `fichiers` les autres fichiers écrits, relatifs à la racine du site (« js/site.js »).

    Chaque href ou src relatif (ni « #… » ni http:, https:, mailto:, data:) doit mener à une page générée (« …/ »
    donne « …/index.html ») ou à un fichier copié, et son ancre « #id » doit exister dans la page visée. Un href
    « #id » seul doit exister dans la même page. Une adresse qui commence par « / » est refusée. Les adresses de la
    carte d'imports sont vérifiées aussi. Le contenu des scripts n'est pas lu comme du HTML."""
    arbres = {chemin: analyser(texte) for chemin, texte in pages.items()}
    ids = {chemin: {e.get("id") for e in selectionner(arbre, "[id]")} for chemin, arbre in arbres.items()}
    erreurs = []
    for chemin, arbre in arbres.items():
        nom = chemin or "accueil"
        for attribut in ("href", "src"):
            for element in selectionner(arbre, f"[{attribut}]"):
                adresse = element.get(attribut) or ""
                probleme = _probleme(chemin, adresse, pages, fichiers, ids)
                if probleme:
                    erreurs.append(f"{nom} : {attribut} « {adresse} » : {probleme}")
        for script in selectionner(arbre, 'script[type="importmap"]'):
            erreurs += [f"{nom} : {e}" for e in _carte_d_imports(chemin, script, fichiers)]
    return erreurs


# ---------------------------------------------------------------------------------------------------------------
# Écriture
# ---------------------------------------------------------------------------------------------------------------

def modeles_des_pages(pages):
    """Les pièces 3D que les pages appellent, dans l'ordre et sans doublon."""
    return list(dict.fromkeys(m for page in pages for m in page.scripts.get("modeles") or []))


def script_recherche(index):
    """js/recherche.js : l'index de la recherche, une entrée par ligne. « < » est écrit \\u003c, comme dans les
    blocs JSON des pages."""
    lignes = ",\n".join("  " + json.dumps(e, ensure_ascii=False).replace("<", "\\u003c") for e in index)
    return f"window.RECHERCHE = [\n{lignes}\n];\n"


def ecrire(cible, sortie, config, pages, chapitres):
    """Écrit la cible « site » ou « artifact » dans le dossier `sortie`, vidé d'abord. Rend le HTML de chaque page par
    chemin, et l'ensemble des fichiers écrits, relatifs à `sortie` (« js/site.js », « freins/index.html »).

    Un modèle 3D sans fichier n'est pas copié : liens_casses signale alors le script absent."""
    if sortie.exists():
        shutil.rmtree(sortie)
    sortie.mkdir(parents=True)
    rendues = {}
    for page in pages:
        if page.chemin in rendues or page.chemin.split("/")[0] in RESERVES:
            raise ValueError(f"adresse « {page.chemin} » déjà prise")
        texte = document(page, config, chapitres, cible)
        dossier = sortie / page.chemin
        dossier.mkdir(parents=True, exist_ok=True)
        (dossier / "index.html").write_text(texte, encoding="utf-8")
        rendues[page.chemin] = texte

    js = sortie / "js"
    js.mkdir(exist_ok=True)
    (js / "recherche.js").write_text(script_recherche(index_recherche(config, chapitres)), encoding="utf-8")
    for nom in ("viewer.js", "site.js", "references.js"):
        shutil.copy(SRC / "js" / nom, js / nom)
    for modele in modeles_des_pages(pages):
        source = SRC / "js" / "models" / f"m-{modele}.js"
        if source.exists():
            shutil.copy(source, js / source.name)
    shutil.copytree(SRC / "scene", js / "scene", ignore=shutil.ignore_patterns(".DS_Store"))
    if cible == "site":
        vendor = sortie / "vendor" / "three"
        shutil.copytree(RACINE / "vendor" / "three", vendor, ignore=shutil.ignore_patterns("LICENSE", ".DS_Store"))
        shutil.copy(RACINE / "vendor" / "three" / "LICENSE", vendor / "LICENSE.txt")

    fichiers = {f.relative_to(sortie).as_posix() for f in sortie.rglob("*") if f.is_file()}
    return rendues, fichiers


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--target", choices=("site", "artifact", "all"), default="all")
    args = p.parse_args()
    config = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
    publies = [l for l in config["lots"] if l["statut"] in PUBLIES]
    print("Lots publiés : " + ", ".join(f'{l["lot"]} ({l["statut"]})' for l in publies))

    erreurs = controle_ateliers(textes_sources(config), [z["id"] for z in lire_zones()])
    if erreurs:
        print("Ateliers sources : " + " ; ".join(erreurs))
        sys.exit(1)

    chapitres = chapitres_publies(config)
    pages = toutes_les_pages(config)
    print("Modèles 3D : " + (", ".join(modeles_des_pages(pages)) or "aucun"))
    ko = False
    for cible in CIBLES if args.target == "all" else (args.target,):
        sortie = DIST / cible
        rendues, fichiers = ecrire(cible, sortie, config, pages, chapitres)
        err = [f"{chemin or 'accueil'} : {e}" for chemin, texte in rendues.items() for e in controles(texte)]
        err += liens_casses(rendues, fichiers)
        taille = sum((sortie / f).stat().st_size for f in fichiers)
        print(f"{cible} : {len(rendues)} pages, {taille} octets en tout" + ("" if not err else " ; " + " ; ".join(err)))
        ko = ko or bool(err)
    sys.exit(1 if ko else 0)


if __name__ == "__main__":
    main()
