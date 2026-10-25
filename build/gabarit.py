"""Le gabarit commun des pages du site Atelier Grizl.

Habille le contenu d'une page de la même façon partout : tête (00-head), menu des catégories à gauche, barre du haut
(bouton « Menu », fil d'Ariane, recherche), pied (99-foot) et scripts. Réécrit aussi les liens « #id » du contenu en
adresses relatives vers la page qui porte l'id.

Chaque page est un dossier et son index.html. Une page se désigne par son chemin, sans « / » au début : "" pour la
racine, "freins/", "freins/plaquettes/". Tous les liens écrits ici sont relatifs à la page courante, jamais « /... »,
pour que le même site marche à la racine d'un serveur, dans un sous-dossier et dans l'aperçu Claude.

Seule la bibliothèque standard est utilisée.
"""
import datetime
import html
import json
import re
from dataclasses import dataclass, field
from pathlib import Path

from ateliers import Chapitre
from dom import selectionner

RACINE = Path(__file__).resolve().parent.parent
SRC = RACINE / "src"
NOM = "Atelier Grizl"
# Seuls les lots « validé » ou « en relecture » de build/lots.json sont publiés.
PUBLIES = ("validé", "en relecture")
THREE_VERSION = "0.160.0"
THREE_CDN = f"https://cdn.jsdelivr.net/npm/three@{THREE_VERSION}/"
# Les pages de référence du menu : (dossier, libellé), dans l'ordre du menu.
REFERENCES = (("composants", "Composants d'origine"), ("outils", "Outils"), ("couples", "Couples de serrage"),
              ("approche", "Ce qui est approché"), ("sources", "Sources"))
SCRIPTS = ("zones", "liens", "three", "modeles", "app", "references", "garde_fou")


@dataclass
class Page:
    """Une page du site, prête à être habillée par `document`."""

    chemin: str  # "", "freins/", "freins/plaquettes/"...
    titre: str  # le titre de la page ; <title> en fait « <titre> · Atelier Grizl », ou « Atelier Grizl » à la racine
    fil: list[tuple[str, str | None]] = field(default_factory=list)  # fil d'Ariane : (libellé, chemin ou None)
    contenu: str = ""  # le HTML de main.page
    categorie: str | None = None  # id de la catégorie dont le menu déplie les ateliers
    # Scripts à ajouter, par clé (toutes facultatives) :
    #   zones       bloc JSON des zones du vélo, lu par js/scene/app.js
    #   liens       bloc JSON des anciennes ancres de la racine, lu par js/site.js
    #   three       carte d'imports de three.js
    #   modeles     pièces 3D de la page (js/viewer.js puis un js/m-<modèle>.js par pièce)
    #   app         js/scene/app.js, la scène 3D
    #   references  js/references.js, les pages « Ce qui est approché » et « Sources »
    #   garde_fou   le script de 99-foot qui prend le relais quand js/scene/app.js ne démarre pas : il le dit à
    #               l'accueil, et lance la visionneuse des pièces 3D, qui affiche alors son message
    scripts: dict = field(default_factory=dict)


def lire(nom):
    """Un fragment de src/parts."""
    return (SRC / "parts" / f"{nom}.html").read_text(encoding="utf-8")


def lire_zones():
    return json.loads((SRC / "scene" / "zones.json").read_text(encoding="utf-8"))


def _echapper(texte):
    return html.escape(texte, quote=False)


def _json(donnees, **options):
    """Du JSON à mettre dans un <script type="application/json"> : aucune chaîne ne peut fermer la balise."""
    return json.dumps(donnees, ensure_ascii=False, **options).replace("<", "\\u003c")


# ---------------------------------------------------------------------------------------------------------------
# Adresses relatives
# ---------------------------------------------------------------------------------------------------------------

def base(chemin: str) -> str:
    """Le chemin pour remonter à la racine depuis la page `chemin` : "" à la racine, "../" par dossier sinon."""
    return "../" * chemin.count("/")


def relatif(depuis: str, vers: str) -> str:
    """L'adresse de la page `vers` écrite dans la page `depuis`, la plus courte : "./" pour la page même."""
    a, b = depuis.split("/")[:-1], vers.split("/")[:-1]
    commun = 0
    while commun < min(len(a), len(b)) and a[commun] == b[commun]:
        commun += 1
    morceaux = [".."] * (len(a) - commun) + b[commun:]
    return "/".join(morceaux) + "/" if morceaux else "./"


def _lien(page, chemin, contenu, classe=None):
    """Un lien du menu vers la page `chemin` ; celui de la page courante porte aria-current="page"."""
    classe = f' class="{classe}"' if classe else ""
    courant = ' aria-current="page"' if chemin == page.chemin else ""
    return f'<a{classe} href="{relatif(page.chemin, chemin)}"{courant}>{contenu}</a>'


# ---------------------------------------------------------------------------------------------------------------
# Menu, fil d'Ariane
# ---------------------------------------------------------------------------------------------------------------

def numero_de_chapitre(lot: dict) -> int:
    """Le numéro du chapitre d'un lot : le premier chiffre du nom de son premier fragment (« 11-montage » : chapitre 1,
    « 20-freins » : chapitre 2), comme le p.ch-num du chapitre l'écrit. Sans fragment numéroté, le numéro du lot."""
    m = re.match(r"(\d)", lot["parts"][0]) if lot.get("parts") else None
    return int(m.group(1)) if m else lot["lot"]


def categories(config: dict) -> tuple[list[dict], list[dict]]:
    """Les lots qui ont une catégorie : les publiés, dans l'ordre de leurs chapitres (le chapitre 1, Montage, avant le
    chapitre 2, Freins, quel que soit l'ordre des lots), puis ceux à venir, dans l'ordre des lots."""
    avec = [l for l in config["lots"] if l.get("categorie")]
    publies = sorted((l for l in avec if l["statut"] in PUBLIES), key=numero_de_chapitre)
    return publies, [l for l in avec if l["statut"] not in PUBLIES]


_categories = categories


def menu(config: dict, chapitres: dict[str, Chapitre], page: Page) -> str:
    """Le menu des catégories (nav.nav) vu depuis `page`. `chapitres` donne le chapitre de chaque catégorie publiée,
    par id de catégorie. La catégorie de `page.categorie` déplie la liste de ses ateliers."""
    publies, a_venir = _categories(config)
    lignes = ['<nav class="nav" aria-label="Catégories et références">',
              '  <div class="nav-g">' + _lien(page, "", "Mon vélo") + "</div>",
              '  <div class="nav-g">', '    <div class="label">Ateliers</div>']
    for lot in publies:
        categorie = lot["categorie"]
        chapitre = chapitres.get(categorie["id"])
        if chapitre is None:
            raise ValueError(f"lot {lot['lot']} : pas de chapitre pour la catégorie « {categorie['id']} »")
        nombre = f'<span class="cnt">{len(chapitre.ateliers)}</span>'
        lignes.append("    " + _lien(page, f"{categorie['id']}/", _echapper(categorie["menu"]) + nombre))
        if page.categorie == categorie["id"]:
            lignes.append('    <div class="sub-nav">')
            for a in chapitre.ateliers:
                libelle = f'<span class="num">{_echapper(a.num)}</span>{_echapper(a.titre)}'
                lignes.append("      " + _lien(page, f"{categorie['id']}/{a.slug}/", libelle))
            lignes.append("    </div>")
    for lot in a_venir:
        categorie = lot["categorie"]
        libelle = _echapper(categorie["menu"]) + f'<span class="cnt">lot {lot["lot"]}</span>'
        lignes.append("    " + _lien(page, f"{categorie['id']}/", libelle, "soon"))
    lignes += ["  </div>", '  <div class="nav-g">', '    <div class="label">Références</div>']
    lignes += ["    " + _lien(page, f"{dossier}/", _echapper(libelle)) for dossier, libelle in REFERENCES]
    lignes += ["  </div>", "</nav>"]
    return "\n".join(lignes)


def fil_ariane(page: Page) -> str:
    """Le fil d'Ariane de `page` (nav.crumbs). Un maillon sans chemin est un simple texte ; le dernier, s'il n'a pas
    de chemin, est la page courante."""
    maillons = []
    for i, (libelle, chemin) in enumerate(page.fil):
        if chemin is not None:
            maillons.append(f'<a href="{relatif(page.chemin, chemin)}">{_echapper(libelle)}</a>')
        elif i == len(page.fil) - 1:
            maillons.append(f'<span aria-current="page">{_echapper(libelle)}</span>')
        else:
            maillons.append(f"<span>{_echapper(libelle)}</span>")
    separateur = '<span class="sep" aria-hidden="true">/</span>'
    return '<nav class="crumbs" aria-label="Fil d’Ariane">' + separateur.join(maillons) + "</nav>"


# ---------------------------------------------------------------------------------------------------------------
# Liens entre pages
# ---------------------------------------------------------------------------------------------------------------

_LIEN_INTERNE = re.compile(r'<a\b([^>]*?\s)href="#([^"]+)"([^>]*)>(.*?)</a>', re.S)


def _id_de_page(chemin):
    """L'id que le fragment source donne à la section d'une page : "freins/plaquettes/" est celle de « freins-plaquettes »."""
    return "-".join(chemin.strip("/").split("/")) if chemin else None


def reecrire_liens(html: str, chemin: str, ancres: dict[str, str]) -> str:
    """Dans le HTML de la page `chemin`, chaque lien « #id » mène à la page qui porte l'id (`ancres` : id vers chemin
    de page). L'adresse est relative, suivie de « #id », sauf pour l'id de la page elle-même (atelier ou chapitre) et
    pour une ancre de la page courante, qui reste « #id ». Un id inconnu ne mène nulle part : le lien devient un
    texte (span.muted). Les autres liens (externes, mailto, déjà relatifs) ne sont pas touchés."""
    def remplacer(m):
        avant, ident, apres, texte = m.groups()
        page = ancres.get(ident)
        if page is None:
            return f'<span class="muted">{texte}</span>'
        propre = ident == _id_de_page(page)
        if page == chemin and not propre:
            return m.group(0)
        adresse = relatif(chemin, page) + ("" if propre else f"#{ident}")
        return f'<a{avant}href="{adresse}"{apres}>{texte}</a>'
    return _LIEN_INTERNE.sub(remplacer, html)


def _section_du_chapitre(chapitre):
    """La section.chapter d'un chapitre : l'ancêtre de son en-tête."""
    noeud = chapitre.tete.parent
    while noeud.parent is not None and "chapter" not in noeud.classes():
        noeud = noeud.parent
    return noeud


def liens_anciens(config: dict, chapitres: dict[str, Chapitre]) -> dict[str, str]:
    """Pour chaque id des chapitres publiés, l'adresse (relative à la racine) de la page qui le porte aujourd'hui :
    l'ancienne page unique avait « #freins-pl-2 », il est maintenant sur « freins/plaquettes/#freins-pl-2 ».
    js/site.js s'en sert pour envoyer un ancien favori vers la bonne page."""
    adresses = {}
    for lot in _categories(config)[0]:
        ident = lot["categorie"]["id"]
        chapitre = chapitres[ident]
        # Ce qui n'est dans aucun atelier (en-tête, résumés) est sur la page de la catégorie.
        for element in selectionner(_section_du_chapitre(chapitre), "[id]"):
            adresses[element.get("id")] = f"{ident}/#{element.get('id')}"
        adresses[chapitre.id] = f"{ident}/"
        for a in chapitre.ateliers:
            for element in selectionner(a.section, "[id]"):
                adresses[element.get("id")] = f"{ident}/{a.slug}/#{element.get('id')}"
            adresses[a.id] = f"{ident}/{a.slug}/"
    return adresses


# ---------------------------------------------------------------------------------------------------------------
# Scripts
# ---------------------------------------------------------------------------------------------------------------

def carte_imports(cible: str, chemin: str = "") -> str:
    """Bloc <script type="importmap"> qui associe « three » et « three/addons/ » aux fichiers de three.js, vu depuis
    la page `chemin`. Cible « site » : three.js embarqué dans vendor/three/. Sinon : jsDelivr."""
    if cible == "site":
        # « ./ » ou « ../ » est obligatoire : sans lui, le navigateur prend l'adresse pour un nom nu et ignore la ligne.
        racine = base(chemin) or "./"
        imports = {"three": racine + "vendor/three/three.module.min.js", "three/addons/": racine + "vendor/three/addons/"}
    else:
        imports = {"three": THREE_CDN + "build/three.module.min.js", "three/addons/": THREE_CDN + "examples/jsm/"}
    return '<script type="importmap">\n' + json.dumps({"imports": imports}, indent=2) + "\n</script>"


def donnees_zones():
    """Bloc <script type="application/json" id="zones-data"> : le contenu de src/scene/zones.json, lu par app.js."""
    return f'<script type="application/json" id="zones-data">\n{_json(lire_zones(), indent=2)}\n</script>'


def donnees_liens(config, chapitres):
    """Bloc <script type="application/json" id="liens-data"> : `liens_anciens`, lu par js/site.js."""
    return f'<script type="application/json" id="liens-data">\n{_json(liens_anciens(config, chapitres), indent=1)}\n</script>'


def _scripts(page, config, chapitres, cible):
    """Les scripts de la page. La carte d'imports passe avant tout module, sinon le navigateur l'ignore. Les scripts
    classiques (recherche, visionneuse, pièces) viennent avant les modules (site, scène, références), qui s'exécutent
    une fois la page lue. Le garde-fou vient en dernier : il doit voir si la scène a démarré."""
    voulus = page.scripts
    inconnus = sorted(set(voulus) - set(SCRIPTS))
    if inconnus:
        raise ValueError(f"page « {page.chemin} » : scripts inconnus : {', '.join(inconnus)}")
    dossier = base(page.chemin) + "js/"
    blocs = []
    if voulus.get("zones"):
        blocs.append(donnees_zones())
    if voulus.get("liens"):
        blocs.append(donnees_liens(config, chapitres))
    if voulus.get("three"):
        blocs.append(carte_imports(cible, page.chemin))
    blocs.append(f'<script src="{dossier}recherche.js"></script>')
    if voulus.get("modeles"):
        blocs.append(f'<script src="{dossier}viewer.js"></script>')
        blocs += [f'<script src="{dossier}m-{m}.js"></script>' for m in voulus["modeles"]]
    blocs.append(f'<script type="module" src="{dossier}site.js"></script>')
    if voulus.get("app"):
        blocs.append(f'<script type="module" src="{dossier}scene/app.js"></script>')
    if voulus.get("references"):
        blocs.append(f'<script type="module" src="{dossier}references.js"></script>')
    if voulus.get("garde_fou"):
        blocs.append(_pied()[1].strip())
    return "\n".join(blocs)


# ---------------------------------------------------------------------------------------------------------------
# Document
# ---------------------------------------------------------------------------------------------------------------

def _pied():
    """99-foot en deux : le pied de page, puis le garde-fou. La marque <!--SCRIPTS--> les sépare."""
    pied, _, garde_fou = lire("99-foot").partition("<!--SCRIPTS-->")
    return pied, garde_fou


def _liste_de_lots(numeros):
    if len(numeros) == 1:
        return f"Lot {numeros[0]}"
    return "Lots " + ", ".join(map(str, numeros[:-1])) + f" et {numeros[-1]}"


def _etat_des_lots(config):
    """Sous le menu : les lots publiés avec leur statut, puis ce que veulent dire les catégories en pointillés."""
    phrases = []
    for statut in PUBLIES:
        numeros = [l["lot"] for l in config["lots"] if l["statut"] == statut]
        if numeros:
            accord = "validés" if statut == "validé" and len(numeros) > 1 else statut
            phrases.append(f"{_liste_de_lots(numeros)} {accord}.")
    if _categories(config)[1]:
        phrases.append("Les catégories en pointillés arrivent avec les lots suivants.")
    return " ".join(phrases)


def _titre(page):
    return NOM if not page.chemin or page.titre == NOM else f"{page.titre} · {NOM}"


# L'id du contenu de chaque page (main.page), que vise le lien d'évitement « Aller au contenu ».
CONTENU = "contenu"


def _application(page, config, chapitres):
    """Le corps de la page : le lien d'évitement, le menu à gauche, puis barre du haut, contenu et pied. Le lien
    d'évitement, caché tant qu'il n'a pas le focus, est le premier arrêt de Tab : il saute le menu et la barre du haut."""
    pied = _pied()[0].strip().replace("<!--VERSION-->", _echapper(f'{config["version"]} du {datetime.date.today().isoformat()}'))
    return "\n".join([
        f'<div class="app" data-base="{base(page.chemin)}">',
        f'<a class="evitement" href="#{CONTENU}">Aller au contenu</a>',
        '<aside class="side" id="side" aria-label="Menu">',
        '<div class="brand">',
        '  <div class="label">Grizl CF 8 Di2 · M · Floating Violet</div>',
        f'  <div class="name">{NOM}</div>',
        "</div>",
        menu(config, chapitres, page),
        f'<div class="side-foot">{_echapper(_etat_des_lots(config))}</div>',
        "</aside>",
        '<div class="main">',
        '<header class="top">',
        '<button class="menu-btn" id="menu-btn" type="button" aria-controls="side" aria-expanded="false">Menu</button>',
        fil_ariane(page),
        '<div class="search">',
        '<input id="recherche" type="search" placeholder="Chercher un atelier, une pièce, un outil" '
        'autocomplete="off" aria-label="Chercher">',
        '<div class="results" id="resultats" hidden></div>',
        "</div>",
        "</header>",
        f'<main class="page" id="{CONTENU}">',
        page.contenu,
        "</main>",
        pied,
        "</div>",
        "</div>",
    ])


def document(page: Page, config: dict, chapitres: dict[str, Chapitre], cible: str) -> str:
    """La page complète. Cible « site » : un document HTML. Cible « artifact » : la page d'accueil est un fragment
    sans squelette (l'hôte de l'aperçu Claude pose le sien), les autres pages sont des documents complets."""
    tete = f"<title>{_echapper(_titre(page))}</title>\n" + lire("00-head")
    corps = _application(page, config, chapitres) + "\n" + _scripts(page, config, chapitres, cible) + "\n"
    if cible == "artifact" and not page.chemin:
        return tete + corps
    return (
        '<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        + tete + "</head>\n<body>\n" + corps + "</body>\n</html>\n"
    )
