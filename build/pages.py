"""Les pages du site Atelier Grizl, une par adresse.

Chaque constructeur rend une `Page` du gabarit (build/gabarit.py) : son chemin, son titre, son fil d'Ariane, le HTML de
son contenu, la catégorie que le menu déplie et ses scripts. `toutes_les_pages` les fait toutes, dans l'ordre du menu,
puis réécrit les liens « #id » de chaque contenu vers la page qui porte l'id.

  ""                   Mon vélo : le contenu de 05-top, où trois marques reçoivent « Où intervenir », les pièces
                       d'origine à remplacer et toutes les catégories
  <catégorie>/         une catégorie publiée : en-tête du chapitre, ordre du jour J, filtres, une carte par atelier,
                       couples sur le côté
  <catégorie>/<slug>/  un atelier : en-tête, barre des étapes, ses deux colonnes, l'atelier précédent et le suivant
  <id>/                une catégorie à venir : son lot et ce qui y est prévu
  composants/, outils/, couples/, approche/, sources/   les références

Le texte des ateliers passe tel quel (build/ateliers.py le découpe sans le réécrire). Seuls s'y ajoutent des libellés
d'interface et des copies tirées des ateliers eux-mêmes : titre, pastilles, faits des cartes, liens.

Tous les liens écrits ici sont relatifs à la page qui les porte. Seule la bibliothèque standard est utilisée.
"""
import html
import unicodedata

from ateliers import Atelier, Chapitre, colonnes, relever_chapitre
from dom import Element, analyser, fragment, selectionner
from gabarit import (NOM, PUBLIES, REFERENCES, Page, categories, lire, lire_zones, numero_de_chapitre, reecrire_liens,
                     relatif)

TYPES = {"comprendre": "Comprendre", "remplacer": "Remplacer", "regler": "Régler", "entretenir": "Entretenir"}
FILTRES = ("tout", "comprendre", "remplacer", "regler", "entretenir")  # boutons de la page d'une catégorie
# Les marques de 05-top que le build remplace (la tâche 6 les pose) ; une marque absente est ignorée.
MARQUES = ("<!--OU-INTERVENIR-->", "<!--A-REMPLACER-->", "<!--CATEGORIES-->")
MANUELS = "freins-securite"  # l'atelier des manuels, vers lequel la page Sources renvoie
# Les ateliers du montage qui listent ses manuels : Canyon (1.2), Canyon et DT Swiss (1.5), Shimano (1.6 et 1.7).
MANUELS_MONTAGE = ("montage-deballer", "montage-roues", "montage-pedales", "montage-di2")
# La barre des étapes d'un atelier ; js/site.js fait marcher ses deux boutons.
BARRE_ETAPES = ('<div class="etapes-barre"><button type="button" class="btn" id="tout-deplier">Tout déplier</button>'
                '<button type="button" class="btn pri" id="pas-a-pas">Mode pas à pas</button></div>')
LIBELLES = dict(REFERENCES)  # dossier de chaque page de référence vers son libellé du menu
PIECE = "Pièce d’origine"  # genre des entrées de la recherche tirées de composants.html


def _e(texte):
    return html.escape(texte, quote=False)


def _attr(texte):
    return html.escape(texte, quote=True)


def _nombre(n, mot):
    """« 1 étape », « 10 étapes »."""
    return f"{n} {mot}" + ("s" if n > 1 else "")


def _cle(texte):
    """Clé de tri alphabétique : sans accents ni majuscules (« Étrier » se range avec « etrier »)."""
    decompose = unicodedata.normalize("NFKD", texte)
    return "".join(c for c in decompose if not unicodedata.combining(c)).casefold(), texte


# ---------------------------------------------------------------------------------------------------------------
# Lots, chapitres, zones
# ---------------------------------------------------------------------------------------------------------------

def _publie(lot):
    return lot["statut"] in PUBLIES


def _lots(config):
    """Les lots qui ont une catégorie : publiés, dans l'ordre de leurs chapitres, puis à venir, dans l'ordre des lots
    (gabarit.categories)."""
    return categories(config)


def chapitres_publies(config: dict) -> dict[str, Chapitre]:
    """Le chapitre de chaque catégorie publiée, par id de catégorie, dans l'ordre des chapitres (Montage, chapitre 1,
    avant Freins, chapitre 2), comme le menu.

    Chaque fragment d'un lot publié doit être le chapitre de la catégorie du lot : un fragment sans page ferait perdre
    son texte en silence, il lève donc ValueError."""
    chapitres = {}
    for lot in sorted(config["lots"], key=numero_de_chapitre):
        if not _publie(lot):
            continue
        categorie = lot.get("categorie")
        for nom in lot["parts"]:
            chapitre = relever_chapitre(lire(nom))
            if categorie is None or chapitre.id != categorie["id"] or chapitre.id in chapitres:
                raise ValueError(f"lot {lot['lot']} : le fragment {nom} (chapitre « {chapitre.id} ») n'a pas de page")
            chapitres[chapitre.id] = chapitre
        if categorie is not None and categorie["id"] not in chapitres:
            raise ValueError(f"lot {lot['lot']} : aucun fragment n'a le chapitre « {categorie['id']} »")
    return chapitres


def _chemin(chapitre, a):
    """L'adresse de la page d'un atelier, depuis la racine : « freins/plaquettes/ »."""
    return f"{chapitre.id}/{a.slug}/"


def _zone(ident):
    """Le numéro (l'ordre de src/scene/zones.json, celui des pastilles) et le nom d'une zone."""
    for n, zone in enumerate(lire_zones(), 1):
        if zone["id"] == ident:
            return n, zone["nom"]
    raise ValueError(f"zone « {ident} » absente de src/scene/zones.json")


def _zone_de(a):
    """Le numéro et le nom de la zone d'un atelier, ou None s'il n'en a pas (une fiche « comprendre » du Montage)."""
    return _zone(a.zone) if a.zone is not None else None


def _type(a):
    if a.type not in TYPES:
        raise ValueError(f"atelier {a.id} : type « {a.type} » inconnu")
    return TYPES[a.type]


def _pastille(a):
    return f'<span class="pill t-{_attr(a.type)}">{_type(a)}</span>'


def _couples(a):
    """Les couples des étapes d'un atelier, dans l'ordre et sans doublon."""
    return list(dict.fromkeys(c for etape in a.etapes for c in etape.couples))


def _nom(chapitre):
    """Le titre d'un chapitre : le h2 de son en-tête."""
    titres = selectionner(chapitre.tete, "h2")
    return titres[0].texte() if titres else chapitre.id


def _atelier_de(chapitre, element) -> Atelier | None:
    """L'atelier dont la section contient `element`."""
    parent = element.parent
    while parent is not None:
        for a in chapitre.ateliers:
            if a.section is parent:
                return a
        parent = parent.parent
    return None


def badge(lot):
    """Le badge d'un lot : « Lot 1 · en relecture », ou « Lot 4 · à venir » pour un lot pas encore publié."""
    if not _publie(lot):
        return f'<p class="lot-badge soon">Lot {lot["lot"]} · à venir</p>'
    classe = "lot-badge ok" if lot["statut"] == "validé" else "lot-badge"
    return f'<p class="{classe}">Lot {lot["lot"]} · {_e(lot["statut"])}</p>'


# ---------------------------------------------------------------------------------------------------------------
# Mon vélo
# ---------------------------------------------------------------------------------------------------------------

def cartes_des_zones(chapitres: dict[str, Chapitre], zones: list[dict]) -> str:
    """« Où intervenir » : une carte par zone du vélo, avec son numéro, son bouton et ses ateliers publiés en liens
    (numéro, titre, type). Les liens partent de la racine. Un atelier sans zone n'est dans aucune carte."""
    cartes = []
    for n, zone in enumerate(zones, 1):
        ident = _attr(zone["id"])
        lignes = [f'<li><a href="{_chemin(c, a)}"><span class="num">{_e(a.num)}</span><span class="t">{_e(a.titre)}</span>'
                  f'<span class="ty">{_type(a)}</span></a></li>'
                  for c in chapitres.values() for a in c.ateliers if a.zone == zone["id"]]
        liste = ["<ul>", *lignes, "</ul>"] if lignes else ['<p class="muted">Pas encore d’atelier publié.</p>']
        cartes.append("\n".join([
            f'<div class="zone-carte" data-zone="{ident}">',
            f'<div class="zone-h"><span class="zone-n">{n}</span>'
            f'<button type="button" class="zone-btn" data-zone="{ident}">{_e(zone["nom"])}</button></div>',
            *liste,
            "</div>",
        ]))
    return "\n".join(cartes)


def pieces_a_remplacer(chapitres: dict[str, Chapitre]) -> str:
    """« D’origine, puis à monter » : une ligne par atelier « remplacer », la pièce à monter à la place de la pièce
    d'origine, avec le lien vers l'atelier."""
    lignes = [f'<li><span class="vers">{_e(a.vers)}</span> <span class="de">à la place de : {_e(a.de)}</span> '
              f'<a class="go" href="{_chemin(c, a)}"><span class="num">{_e(a.num)}</span> {_e(a.titre)}</a></li>'
              for c in chapitres.values() for a in c.ateliers if a.type == "remplacer" and a.de and a.vers]
    return "\n".join(['<ul class="a-remplacer">', *lignes, "</ul>"])


def cartes_des_categories(config: dict, chapitres: dict[str, Chapitre]) -> str:
    """« Toutes les catégories » : une carte par catégorie, publiée (son nombre d'ateliers) ou à venir (la première
    chose prévue dans son lot)."""
    publies, a_venir = _lots(config)
    cartes = []
    for lot in publies:
        categorie = lot["categorie"]
        nombre = _nombre(len(chapitres[categorie["id"]].ateliers), "atelier")
        cartes.append(f'<a class="cat" href="{_attr(categorie["id"])}/"><span class="label">Lot {lot["lot"]} · '
                      f'{_e(lot["statut"])}</span><h3>{_e(categorie["menu"])}</h3><p>{nombre}</p></a>')
    for lot in a_venir:
        categorie = lot["categorie"]
        prevu = f'<p>{_e(lot["prevu"][0])}</p>' if lot.get("prevu") else ""
        cartes.append(f'<a class="cat soon" href="{_attr(categorie["id"])}/"><span class="label">Lot {lot["lot"]} · '
                      f'à venir</span><h3>{_e(categorie["menu"])}</h3>{prevu}</a>')
    return "\n".join(['<div class="cats">', *cartes, "</div>"])


def page_accueil(config: dict, chapitres: dict[str, Chapitre], zones: list[dict]) -> Page:
    """Mon vélo : le contenu de 05-top, ses marques remplacées par les trois blocs ci-dessus."""
    contenu = lire("05-top")
    blocs = dict(zip(MARQUES, (lambda: cartes_des_zones(chapitres, zones), lambda: pieces_a_remplacer(chapitres),
                               lambda: cartes_des_categories(config, chapitres))))
    for marque, bloc in blocs.items():
        if marque in contenu:
            contenu = contenu.replace(marque, bloc())
    return Page(chemin="", titre=NOM, fil=[("Mon vélo", None)], contenu=contenu,
                scripts=dict(zones=True, liens=True, three=True, app=True, garde_fou=True))


# ---------------------------------------------------------------------------------------------------------------
# Catégories et ateliers
# ---------------------------------------------------------------------------------------------------------------

def _faits(a):
    """Les faits d'une carte : pièce changée, ce qu'il faut démonter, étapes, couples, ou les blocs d'une fiche."""
    faits = []
    if a.de and a.vers:
        faits.append(("Change", f"{_e(a.de)} → {_e(a.vers)}"))
    if a.demonter:
        faits.append(("Démonter", _e(a.demonter)))
    if a.etapes:
        faits.append(("Étapes", str(len(a.etapes))))
    couples = _couples(a)
    if couples:
        faits.append(("Couples", " ".join(f'<span class="nm">{_e(c)}</span>' for c in couples)))
    if a.type == "comprendre" and a.blocs:
        faits.append(("Fiche", _nombre(len(a.blocs), "bloc") + " à lire"))
    if not faits:
        return ""
    return '<dl class="faits">' + "".join(f"<dt>{titre}</dt><dd>{valeur}</dd>" for titre, valeur in faits) + "</dl>"


def _tete_de_categorie(tete):
    """Le ch-head d'un chapitre recopié pour la page de sa catégorie : son premier h2 y devient le h1 de la page,
    avec les mêmes attributs et le même contenu. Le chapitre source garde son h2."""
    copie = analyser(tete.html())
    titres = selectionner(copie, "h2")
    if titres:
        h2 = titres[0]
        h1 = Element("h1", h2.attrs)
        for noeud in list(h2.enfants):
            h1.ajouter(noeud)
        h2.parent.inserer(h2.parent.enfants.index(h2), h1)
        h2.retirer()
    return copie.html()


def _carte(chapitre, a):
    zone = _zone_de(a)
    return "\n".join([
        f'<a class="carte" data-type="{_attr(a.type)}" href="{relatif(chapitre.id + "/", _chemin(chapitre, a))}">',
        f'<span class="carte-h"><span class="num">{_e(a.num)}</span>{_pastille(a)}</span>',
        f"<h3>{_e(a.titre)}</h3>",
        *([f'<span class="zone">Zone {zone[0]} · {_e(zone[1])}</span>'] if zone else []),
        _faits(a),
        "</a>",
    ])


def page_categorie(lot: dict, chapitre: Chapitre) -> Page:
    """La page d'une catégorie publiée : le badge du lot et l'en-tête du chapitre, l'ordre du jour J (résumé
    « ordre »), les filtres par type, une carte par atelier, et les couples (résumé « couples ») sur le côté."""
    categorie = lot["categorie"]
    if categorie["id"] != chapitre.id:
        raise ValueError(f"catégorie « {categorie['id']} » : le chapitre a l'id « {chapitre.id} »")
    boutons = [f'<button type="button" data-type="{t}" aria-pressed="{"true" if t == "tout" else "false"}">'
               f'{"Tout" if t == "tout" else TYPES[t]}</button>' for t in FILTRES]
    gauche = [e.html() for e in chapitre.resumes.get("ordre", [])] + [
        '<div class="filtres" role="group" aria-label="Filtrer les ateliers par type">', *boutons, "</div>",
        '<div class="cartes">', *(_carte(chapitre, a) for a in chapitre.ateliers), "</div>",
    ]
    couples = [e.html() for e in chapitre.resumes.get("couples", [])]
    cote = ['<aside class="categorie-cote" aria-label="Couples de serrage">', "<h2>Couples de serrage</h2>", *couples,
            "</aside>"] if couples else []
    contenu = "\n".join([
        f'<div class="categorie" id="{_attr(chapitre.id)}">',
        '<div class="categorie-tete">', badge(lot), _tete_de_categorie(chapitre.tete), "</div>",
        '<div class="categorie-cols">', '<div class="categorie-gauche">', *gauche, "</div>", *cote, "</div>",
        "</div>",
    ])
    return Page(chemin=f"{chapitre.id}/", titre=categorie["menu"], fil=[("Ateliers", None), (categorie["menu"], None)],
                contenu=contenu, categorie=chapitre.id)


def avec_barre_des_etapes(gauche: str) -> str:
    """La colonne de gauche avec la barre des étapes juste au-dessus de ses étapes : avant le premier ol.steps, ou
    avant le bloc de premier niveau qui le contient (les étapes de la purge sont dans un <details>), pour que la barre
    reste visible quand ce bloc est replié. Sans ol.steps, la colonne ne change pas."""
    racine = analyser(gauche)
    etapes = selectionner(racine, "ol.steps")
    if not etapes:
        return gauche
    bloc = etapes[0]
    while bloc.parent is not racine:
        bloc = bloc.parent
    i = racine.enfants.index(bloc)
    for noeud in reversed(fragment(BARRE_ETAPES + "\n")):
        racine.inserer(i, noeud)
    return racine.html()


def page_atelier(chapitre: Chapitre, i: int, nom: str | None = None) -> Page:
    """La page du i-ème atelier du chapitre. `nom` est le libellé de la catégorie dans le fil d'Ariane (par défaut,
    le titre du chapitre).

    Un article.atelier porte l'id et les data- de la section source. Dedans : l'en-tête (numéro et, si l'atelier en a
    une, zone ; h1, pastilles du type, du nombre d'étapes et de ce qu'il faut démonter, pièce d'origine et pièce à
    monter), puis les colonnes de `colonnes()`, avec la barre des étapes juste au-dessus des étapes de la colonne de
    gauche s'il y en a. Un atelier sans zone n'a ni « Zone N » ni data-zone.
    Sans rien à droite, une seule colonne. Après l'article : l'atelier précédent et le suivant. Une pièce 3D charge
    three.js, la visionneuse et son modèle, et le garde-fou de 99-foot : si js/scene/app.js ne démarre pas, il lance
    la visionneuse, qui dit dans la boîte de la pièce que la 3D n'a pas pu se charger."""
    a = chapitre.ateliers[i]
    chemin = _chemin(chapitre, a)
    gauche, droite = colonnes(a)
    zone = _zone_de(a)

    pastilles = [_pastille(a)]
    if a.etapes:
        pastilles.append(f'<span class="pill">{_nombre(len(a.etapes), "étape")}</span>')
    if a.type == "comprendre" and a.blocs:
        pastilles.append(f'<span class="pill">{_nombre(len(a.blocs), "bloc")} à lire</span>')
    if a.demonter:
        pastilles.append(f'<span class="pill">À démonter : {_e(a.demonter)}</span>')
    numero = f"Atelier {_e(a.num)}" + (f" · Zone {zone[0]}, {_e(zone[1])}" if zone else "")
    tete = ['<header class="atelier-tete">', f'<p class="atelier-num">{numero}</p>',
            f"<h1>{_e(a.titre)}</h1>", '<div class="pills">' + "".join(pastilles) + "</div>"]
    if a.de and a.vers:
        tete.append(f'<p class="de-vers"><span class="k">D’origine</span> <span class="v">{_e(a.de)}</span> '
                    f'<span class="k">À monter</span> <span class="v">{_e(a.vers)}</span></p>')
    tete.append("</header>")

    if a.etapes:
        gauche = avec_barre_des_etapes(gauche)
    if droite:
        cols = ['<div class="atelier-cols">', '<div class="atelier-gauche">', gauche, "</div>",
                '<aside class="atelier-droite">', droite, "</aside>", "</div>"]
    else:
        cols = ['<div class="atelier-cols une-colonne">', '<div class="atelier-gauche">', gauche, "</div>", "</div>"]

    voisins = []
    for classe, libelle, j in (("prec", "Précédent", i - 1), ("suiv", "Suivant", i + 1)):
        if 0 <= j < len(chapitre.ateliers):
            v = chapitre.ateliers[j]
            voisins.append(f'<a class="{classe}" href="{relatif(chemin, _chemin(chapitre, v))}"><span class="label">'
                           f"{libelle}</span><span>{_e(v.num)} {_e(v.titre)}</span></a>")

    attributs = [("class", "atelier"), ("id", a.id), ("data-zone", a.zone), ("data-type", a.type),
                 ("data-de", a.de), ("data-vers", a.vers)]
    ouvrante = "<article " + " ".join(f'{k}="{_attr(v)}"' for k, v in attributs if v) + ">"
    contenu = "\n".join([ouvrante, *tete, *cols, "</article>",
                         '<nav class="precsuiv" aria-label="Atelier précédent et suivant">' + "".join(voisins) + "</nav>"])

    titre = f"{a.num} {a.titre}"
    modeles = list(dict.fromkeys(a.modeles))
    return Page(chemin=chemin, titre=titre, fil=[("Ateliers", None), (nom or _nom(chapitre), f"{chapitre.id}/"),
                                                 (titre, None)],
                contenu=contenu, categorie=chapitre.id,
                scripts=dict(three=True, app=True, modeles=modeles, garde_fou=True) if modeles else {})


def page_a_venir(lot: dict) -> Page:
    """La page d'une catégorie à venir : son lot et ce qui y est prévu."""
    categorie = lot["categorie"]
    contenu = ['<header class="page-h">', badge(lot), f'<h1>{_e(categorie["menu"])}</h1>',
               f'<p class="lead">Cette catégorie arrive avec le lot {lot["lot"]}. Elle aura la même forme que les '
               "catégories publiées : une carte par atelier, puis une page par atelier.</p>", "</header>"]
    if lot.get("prevu"):
        contenu += ['<section class="a-venir">', "<h2>Prévu</h2>", '<ul class="prevu">',
                    *(f"<li>{_e(p)}</li>" for p in lot["prevu"]), "</ul>", "</section>"]
    return Page(chemin=f'{categorie["id"]}/', titre=categorie["menu"],
                fil=[("Ateliers", None), (categorie["menu"], None)], contenu="\n".join(contenu),
                categorie=categorie["id"])


# ---------------------------------------------------------------------------------------------------------------
# Références
# ---------------------------------------------------------------------------------------------------------------

def _reference(dossier, contenu, **reste):
    libelle = LIBELLES[dossier]
    return Page(chemin=f"{dossier}/", titre=libelle, fil=[("Références", None), (libelle, None)], contenu=contenu,
                **reste)


def _en_tete(titre, chapeau):
    return "\n".join(['<header class="page-h">', f"<h1>{_e(titre)}</h1>", f'<p class="lead">{chapeau}</p>',
                      "</header>"])


def page_composants() -> Page:
    """Composants d'origine : src/parts/composants.html tel quel."""
    return _reference("composants", lire("composants"))


def page_outils(chapitres: dict[str, Chapitre]) -> Page:
    """Outils : chaque outil distinct des listes « Il te faut » des ateliers publiés, par ordre alphabétique, suivi
    des liens vers les ateliers qui en ont besoin."""
    outils = {}
    for chapitre in chapitres.values():
        for a in chapitre.ateliers:
            for outil in a.outils:
                ateliers = outils.setdefault(outil, [])
                if all(b is not a for _, b in ateliers):
                    ateliers.append((chapitre, a))
    lignes = []
    for outil in sorted(outils, key=_cle):
        liens = " ".join(f'<a href="{relatif("outils/", _chemin(c, a))}"><span class="num">{_e(a.num)}</span> '
                         f"{_e(a.titre)}</a>" for c, a in outils[outil])
        lignes.append(f'<li><span class="outil">{_e(outil)}</span> <span class="o-ateliers">{liens}</span></li>')
    contenu = [_en_tete("Outils", "Chaque outil des listes « Il te faut » des ateliers, avec les ateliers qui en ont "
                                  "besoin. Utile pour préparer ton établi.")]
    contenu += ['<ul class="outils">', *lignes, "</ul>"] if lignes else ['<p class="muted">Aucun outil pour l’instant.</p>']
    return _reference("outils", "\n".join(contenu))


def page_couples(chapitres: dict[str, Chapitre]) -> Page:
    """Couples de serrage : les tableaux « couples » des chapitres publiés, une section par catégorie, chacun avec un
    renvoi vers l'atelier où il est écrit."""
    sections = []
    for chapitre in chapitres.values():
        resumes = chapitre.resumes.get("couples", [])
        if not resumes:
            continue
        morceaux = ['<section class="couples-cat">', f"<h2>{_e(_nom(chapitre))}</h2>"]
        for resume in resumes:
            a = _atelier_de(chapitre, resume)
            if a is not None:
                morceaux.append(f'<p class="origine">Tiré de l’atelier <a href="{relatif("couples/", _chemin(chapitre, a))}">'
                                f"{_e(a.num)} {_e(a.titre)}</a>.</p>")
            morceaux.append(resume.html())
        morceaux.append("</section>")
        sections.append("\n".join(morceaux))
    if not sections:
        sections = ['<p class="muted">Aucun tableau de couples publié pour l’instant.</p>']
    entete = _en_tete("Couples de serrage", "Les tableaux de couples des catégories publiées, regroupés par catégorie.")
    return _reference("couples", "\n".join([entete, *sections]))


def _page_js(dossier, ident, chapeau):
    """Une page remplie par js/references.js : un en-tête et son conteneur. La phrase du conteneur reste si le script
    ne tourne pas (JavaScript coupé, fichier absent) ; le script la remplace."""
    contenu = "\n".join([_en_tete(LIBELLES[dossier], chapeau), f'<div id="{ident}">',
                         '<p class="muted">Cette liste a besoin de JavaScript pour s’afficher.</p>', "</div>"])
    return _reference(dossier, contenu, scripts=dict(references=True))


def page_approche() -> Page:
    """Ce qui est approché : la liste du bouton de la scène, sur sa page (#approche-page, rempli par
    js/references.js)."""
    return _page_js("approche", "approche-page",
                    "La liste du bouton « Ce qui est approché » de la scène. Pour chaque pièce : les documents suivis, "
                    "les formes approchées et ce qui reste à vérifier à la livraison.")


def page_sources(chapitres: dict[str, Chapitre] | None = None) -> Page:
    """Sources : le registre des documents officiels de la 3D (#sources-page, rempli par js/references.js) et des
    renvois vers les manuels des ateliers : ceux des freins (l'atelier MANUELS) et ceux du montage (MANUELS_MONTAGE).
    Le libellé d'un renvoi est le numéro et le titre de son atelier ; un atelier non publié n'a pas de renvoi."""
    chapeau = ("Les documents officiels qui ont servi à dessiner le vélo et ses pièces en 3D, avec ce que chacun "
               "justifie.")

    def lien(chapitre, a):
        return f'<a href="{relatif("sources/", _chemin(chapitre, a))}">{_e(a.num)} {_e(a.titre)}</a>'
    for chapitre in (chapitres or {}).values():
        montage = []
        for a in chapitre.ateliers:
            if a.id == MANUELS:
                chapeau += f" Les manuels des freins sont dans l’atelier {lien(chapitre, a)}."
            elif a.id in MANUELS_MONTAGE:
                montage.append(lien(chapitre, a))
        if montage:
            liste = montage[0] if len(montage) == 1 else ", ".join(montage[:-1]) + " et " + montage[-1]
            chapeau += f" Les manuels du montage sont dans {'l’atelier' if len(montage) == 1 else 'les ateliers'} {liste}."
    return _page_js("sources", "sources-page", chapeau)


# ---------------------------------------------------------------------------------------------------------------
# Tout le site
# ---------------------------------------------------------------------------------------------------------------

def ancres(pages: list[Page]) -> dict[str, str]:
    """Pour chaque id des contenus, le chemin de la page qui le porte. Si un id est sur plusieurs pages (un bloc
    recopié, un bouton d'interface), la première page de la liste l'emporte."""
    trouvees = {}
    for page in pages:
        for element in selectionner(analyser(page.contenu), "[id]"):
            if element.get("id"):
                trouvees.setdefault(element.get("id"), page.chemin)
    return trouvees


def toutes_les_pages(config: dict) -> list[Page]:
    """Toutes les pages, dans l'ordre du menu : Mon vélo, chaque catégorie publiée suivie de ses ateliers, les
    catégories à venir, les références. Les liens « #id » de chaque contenu sont réécrits vers la page qui porte l'id
    (les pages d'atelier d'abord : un résumé recopié sur la page de la catégorie garde l'adresse de son atelier), et
    l'id d'une catégorie à venir vers sa page."""
    chapitres = chapitres_publies(config)
    publies, a_venir = _lots(config)
    pages = [page_accueil(config, chapitres, lire_zones())]
    ateliers = []
    for lot in publies:
        chapitre = chapitres[lot["categorie"]["id"]]
        pages.append(page_categorie(lot, chapitre))
        for i in range(len(chapitre.ateliers)):
            ateliers.append(page_atelier(chapitre, i, lot["categorie"]["menu"]))
            pages.append(ateliers[-1])
    pages += [page_a_venir(lot) for lot in a_venir]
    references = {"composants": page_composants, "outils": lambda: page_outils(chapitres),
                  "couples": lambda: page_couples(chapitres), "approche": page_approche, "sources": lambda: page_sources(chapitres)}
    pages += [references[dossier]() for dossier, _ in REFERENCES]

    chemins = [p.chemin for p in pages]
    doublons = sorted({c for c in chemins if chemins.count(c) > 1})
    if doublons:
        raise ValueError("deux pages à la même adresse : " + ", ".join(doublons))
    table = ancres(ateliers + [p for p in pages if all(p is not q for q in ateliers)])
    # Une catégorie à venir n'a pas encore de contenu, mais sa page existe : « #tubeless » mène à « tubeless/ ». Un id
    # qui n'est sur aucune page reste un texte.
    for lot in a_venir:
        table.setdefault(lot["categorie"]["id"], f'{lot["categorie"]["id"]}/')
    for page in pages:
        page.contenu = reecrire_liens(page.contenu, page.chemin, table)
    return pages


# ---------------------------------------------------------------------------------------------------------------
# Recherche
# ---------------------------------------------------------------------------------------------------------------

def _pieces_d_origine():
    """Une entrée par ligne des tableaux de composants.html, et une par accessoire livré. Le texte d'une ligne réunit
    ses cases, sauf le repère (a, b, c) de la géométrie ; l'adresse mène à la section de la ligne."""
    entrees = []
    for section in selectionner(analyser(lire("composants")), "section.composants"):
        adresse = f"composants/#{section.get('id')}"
        for tableau in selectionner(section, "table"):
            gardees = [k for k, th in enumerate(selectionner(tableau, "th")) if th.texte() != "Repère"]
            for ligne in selectionner(tableau, "tbody > tr"):
                cases = [td.texte() for td in selectionner(ligne, "td")]
                texte = " · ".join(cases[k] for k in gardees if k < len(cases) and cases[k])
                entrees.append({"k": PIECE, "t": texte, "u": adresse})
        entrees += [{"k": PIECE, "t": li.texte(), "u": adresse} for li in selectionner(section, "ul.accessoires > li")]
    return entrees


def index_recherche(config: dict, chapitres: dict[str, Chapitre]) -> list[dict]:
    """L'index que lit la recherche de js/site.js : des entrées {"k": genre, "t": texte, "u": adresse depuis la
    racine}. Dans l'ordre : les catégories publiées, les ateliers, leurs étapes, leurs outils, les pièces d'origine,
    puis les catégories à venir et ce qui y est prévu."""
    publies, a_venir = _lots(config)
    ateliers = [(c, a) for c in chapitres.values() for a in c.ateliers]
    entrees = [{"k": "Catégorie", "t": l["categorie"]["menu"], "u": f'{l["categorie"]["id"]}/'} for l in publies]
    entrees += [{"k": f"Atelier {a.num}", "t": a.titre, "u": _chemin(c, a)} for c, a in ateliers]
    entrees += [{"k": f"Étape · {a.num}", "t": e.titre, "u": _chemin(c, a)} for c, a in ateliers for e in a.etapes]
    entrees += [{"k": f"Outil · {a.num}", "t": o, "u": _chemin(c, a)} for c, a in ateliers for o in a.outils]
    entrees += _pieces_d_origine()
    for lot in a_venir:
        genre, adresse = f'Lot {lot["lot"]} · à venir', f'{lot["categorie"]["id"]}/'
        entrees += [{"k": genre, "t": t, "u": adresse} for t in [lot["categorie"]["menu"], *lot.get("prevu", [])]]
    return entrees
