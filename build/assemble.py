#!/usr/bin/env python3
"""Assemble le site Atelier Grizl à partir des fragments de src/parts.

Seuls les lots « validé » ou « en relecture » de build/lots.json sont publiés.

Sorties :
  dist/site/      site autonome (document HTML complet, three.js local) pour le serveur
  dist/artifact/  page sans squelette HTML pour l'aperçu Claude (three.js depuis jsDelivr)

Usage : python3 build/assemble.py [--target site|artifact|all]
"""
import argparse
import collections
import datetime
import html
import json
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path

from gabarit import PUBLIES, carte_imports, donnees_zones, lire, lire_zones

RACINE = Path(__file__).resolve().parent.parent
SRC = RACINE / "src"
DIST = RACINE / "dist"
TITRE = "<title>Atelier Grizl</title>\n"  # 00-head n'a plus de <title> : le gabarit met celui de chaque page
# Ateliers : les section.atelier des chapitres, que js/scene/app.js ouvre dans la fiche de leur zone.
TYPES_ATELIER = ("comprendre", "entretenir", "regler", "remplacer")
GESTES = (".a-dem", ".kit", "ol.steps")  # obligatoires, sauf pour « comprendre » qui n'en a aucun
BLOCS = {".a-dem": (None, "a-dem"), ".kit": (None, "kit"), "ol.steps": ("ol", "steps"),
         "ul.media": ("ul", "media"), "p.a-video": ("p", "a-video")}


def badge(lot):
    classe = "lot-badge ok" if lot["statut"] == "validé" else "lot-badge"
    return f'<p class="{classe}">Lot {lot["lot"]} · {html.escape(lot["statut"])}</p>'


def construire_corps(config):
    lots = config["lots"]
    publies = [l for l in lots if l["statut"] in PUBLIES]
    a_venir = [l for l in lots if l["statut"] not in PUBLIES]

    nav = ['<nav class="chapnav" aria-label="Chapitres">', "  <ul>"]
    for lot in publies:
        if lot.get("categorie"):
            categorie = lot["categorie"]
            nav.append(f'    <li><a href="#{categorie["id"]}">{html.escape(categorie["menu"])}</a></li>')
    nav += ["  </ul>", "</nav>"]

    prochains = ""
    if a_venir:
        lignes = "\n".join(
            f'    <li><span>Lot {l["lot"]} · {html.escape(l["titre"])}</span><span>{html.escape(l["statut"])}</span></li>'
            for l in a_venir
        )
        prochains = (
            '<div class="wrap">\n  <p class="eyebrow">Prochains lots</p>\n'
            f'  <ul class="lots">\n{lignes}\n  </ul>\n</div>\n'
        )

    chapitres = []
    for lot in publies:
        for nom in lot["parts"]:
            fragment = lire(nom)
            # Statut du lot affiché au-dessus du numéro de chapitre
            fragment = re.sub(r'(<p class="ch-num">)', badge(lot) + r"\1", fragment, count=0)
            chapitres.append(fragment)

    corps = lire("05-top") + prochains + "\n".join(nav) + '\n<main class="wrap">\n' + "\n".join(chapitres) + "\n</main>\n"

    # Les liens internes vers un chapitre pas encore publié deviennent du texte simple
    ids = set(re.findall(r'\sid="([^"]+)"', corps))
    def lien_interne(m):
        cible, texte = m.group(2), m.group(3)
        return m.group(0) if cible in ids else f'<span class="muted">{texte}</span>'
    corps = re.sub(r'<a ([^>]*?)href="#([^"]+)"[^>]*>(.*?)</a>', lien_interne, corps, flags=re.S)

    modeles = []
    for lot in publies:
        for m in lot["modeles"]:
            if f'data-model="{m}"' in corps and (SRC / "js" / "models" / f"m-{m}.js").exists():
                modeles.append(m)
    return corps, modeles, publies


def pied(config, modeles, cible):
    date = datetime.date.today().isoformat()
    version = f'{config["version"]} du {date}'
    # La visionneuse et les modèles sont des scripts classiques ; la scène est un module ES (chemin identique dans les deux cibles).
    dossier = "js/" if cible == "site" else ""
    scripts = [donnees_zones(), carte_imports(cible), f'<script src="{dossier}viewer.js"></script>']
    scripts += [f'<script src="{dossier}m-{m}.js"></script>' for m in modeles]
    scripts.append('<script type="module" src="js/scene/app.js"></script>')
    return lire("99-foot").replace("<!--SCRIPTS-->", "\n".join(scripts)).replace("<!--VERSION-->", html.escape(version))


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
    """Chaque atelier a les blocs de son type et une zone de zones.json ; chaque zone a au moins un atelier publié."""
    erreurs = []
    ateliers = relever_ateliers(texte)
    for s in ateliers:
        nom = f'atelier {s.get("id") or "sans id"}'
        zone, type_, blocs = s.get("data-zone"), s.get("data-type"), s["blocs"]
        if not s.get("id"):
            erreurs.append(f"{nom} : app.js ne peut pas l'ouvrir")
        if zone not in zones:
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


def controles(texte):
    erreurs = []
    tirets = len(re.findall("[—–]", texte))
    if tirets:
        erreurs.append(f"{tirets} tiret(s) cadratin ou demi-cadratin")
    ids = re.findall(r'\sid="([^"]+)"', texte)
    doublons = [i for i, n in collections.Counter(ids).items() if n > 1]
    if doublons:
        erreurs.append("id en double : " + ", ".join(doublons[:10]))
    erreurs += controle_ateliers(texte, [z["id"] for z in lire_zones()])
    return erreurs


def ecrire_site(config, corps, modeles):
    sortie = DIST / "site"
    if sortie.exists():
        shutil.rmtree(sortie)
    (sortie / "js").mkdir(parents=True)
    page = (
        '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + TITRE + lire("00-head") + "</head>\n<body>\n" + corps + pied(config, modeles, "site") + "</body>\n</html>\n"
    )
    (sortie / "index.html").write_text(page, encoding="utf-8")
    shutil.copy(SRC / "js" / "viewer.js", sortie / "js" / "viewer.js")
    for m in modeles:
        shutil.copy(SRC / "js" / "models" / f"m-{m}.js", sortie / "js" / f"m-{m}.js")
    shutil.copytree(SRC / "scene", sortie / "js" / "scene")
    vendor = sortie / "vendor" / "three"
    shutil.copytree(RACINE / "vendor" / "three", vendor, ignore=shutil.ignore_patterns("LICENSE"))
    shutil.copy(RACINE / "vendor" / "three" / "LICENSE", vendor / "LICENSE.txt")
    return page


def ecrire_artifact(config, corps, modeles):
    sortie = DIST / "artifact"
    if sortie.exists():
        shutil.rmtree(sortie)
    sortie.mkdir(parents=True)
    page = TITRE + lire("00-head") + corps + pied(config, modeles, "artifact")
    (sortie / "index.html").write_text(page, encoding="utf-8")
    shutil.copy(SRC / "js" / "viewer.js", sortie / "viewer.js")
    for m in modeles:
        shutil.copy(SRC / "js" / "models" / f"m-{m}.js", sortie / f"m-{m}.js")
    shutil.copytree(SRC / "scene", sortie / "js" / "scene")
    return page


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--target", choices=("site", "artifact", "all"), default="all")
    args = p.parse_args()
    config = json.loads((RACINE / "build" / "lots.json").read_text(encoding="utf-8"))
    corps, modeles, publies = construire_corps(config)
    pages = []
    if args.target in ("site", "all"):
        pages.append(("site", ecrire_site(config, corps, modeles)))
    if args.target in ("artifact", "all"):
        pages.append(("artifact", ecrire_artifact(config, corps, modeles)))
    print("Lots publiés : " + ", ".join(f'{l["lot"]} ({l["statut"]})' for l in publies))
    print("Modèles 3D : " + (", ".join(modeles) or "aucun"))
    ko = False
    for nom, page in pages:
        err = controles(page)
        print(f"{nom} : {len(page.encode('utf-8'))} octets" + ("" if not err else " ; " + " ; ".join(err)))
        ko = ko or bool(err)
    sys.exit(1 if ko else 0)


if __name__ == "__main__":
    main()
