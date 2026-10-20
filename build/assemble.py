#!/usr/bin/env python3
"""Assemble le site Atelier Grizl à partir des fragments de src/parts.

Seuls les lots « validé » ou « en relecture » de build/lots.json sont publiés.

Sorties :
  dist/site/      site autonome (document HTML complet, three.js local) pour le serveur
  dist/artifact/  page sans squelette HTML pour l'aperçu Claude (three.js depuis cdnjs)

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
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SRC = RACINE / "src"
DIST = RACINE / "dist"
PUBLIES = ("validé", "en relecture")
THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"


def lire(nom):
    return (SRC / "parts" / f"{nom}.html").read_text(encoding="utf-8")


def badge(lot):
    classe = "lot-badge ok" if lot["statut"] == "validé" else "lot-badge"
    return f'<p class="{classe}">Lot {lot["lot"]} · {html.escape(lot["statut"])}</p>'


def construire_corps(config):
    lots = config["lots"]
    publies = [l for l in lots if l["statut"] in PUBLIES]
    a_venir = [l for l in lots if l["statut"] not in PUBLIES]

    nav = ['<nav class="chapnav" aria-label="Chapitres">', "  <ul>"]
    for lot in publies:
        for ident, libelle in lot["nav"]:
            nav.append(f'    <li><a href="#{ident}">{html.escape(libelle)}</a></li>')
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
    if cible == "site":
        scripts = ['<script src="vendor/three.min.js"></script>', '<script src="js/viewer.js"></script>']
        scripts += [f'<script src="js/m-{m}.js"></script>' for m in modeles]
    else:
        scripts = [f'<script src="{THREE_CDN}"></script>', '<script src="viewer.js"></script>']
        scripts += [f'<script src="m-{m}.js"></script>' for m in modeles]
    return lire("99-foot").replace("<!--SCRIPTS-->", "\n".join(scripts)).replace("<!--VERSION-->", html.escape(version))


def controles(texte):
    erreurs = []
    tirets = len(re.findall("[—–]", texte))
    if tirets:
        erreurs.append(f"{tirets} tiret(s) cadratin ou demi-cadratin")
    ids = re.findall(r'\sid="([^"]+)"', texte)
    doublons = [i for i, n in collections.Counter(ids).items() if n > 1]
    if doublons:
        erreurs.append("id en double : " + ", ".join(doublons[:10]))
    return erreurs


def ecrire_site(config, corps, modeles):
    sortie = DIST / "site"
    if sortie.exists():
        shutil.rmtree(sortie)
    (sortie / "js").mkdir(parents=True)
    (sortie / "vendor").mkdir()
    page = (
        '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + lire("00-head") + "</head>\n<body>\n" + corps + pied(config, modeles, "site") + "</body>\n</html>\n"
    )
    (sortie / "index.html").write_text(page, encoding="utf-8")
    shutil.copy(SRC / "js" / "viewer.js", sortie / "js" / "viewer.js")
    for m in modeles:
        shutil.copy(SRC / "js" / "models" / f"m-{m}.js", sortie / "js" / f"m-{m}.js")
    shutil.copy(RACINE / "vendor" / "three" / "three.min.js", sortie / "vendor" / "three.min.js")
    shutil.copy(RACINE / "vendor" / "three" / "LICENSE", sortie / "vendor" / "three-LICENSE.txt")
    return page


def ecrire_artifact(config, corps, modeles):
    sortie = DIST / "artifact"
    if sortie.exists():
        shutil.rmtree(sortie)
    sortie.mkdir(parents=True)
    page = lire("00-head") + corps + pied(config, modeles, "artifact")
    (sortie / "index.html").write_text(page, encoding="utf-8")
    shutil.copy(SRC / "js" / "viewer.js", sortie / "viewer.js")
    for m in modeles:
        shutil.copy(SRC / "js" / "models" / f"m-{m}.js", sortie / f"m-{m}.js")
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
