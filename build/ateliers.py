"""Les ateliers d'un chapitre, pour les pages du site.

Relit un chapitre de src/parts (par exemple 20-freins.html) en données : ses ateliers, avec leurs outils, leurs étapes
et les couples de ces étapes, et les résumés que la page de la catégorie reprend (attributs data-resume). Puis
prépare les deux colonnes de la page d'un atelier :
  à gauche   le texte, chaque étape repliée dans un <details> ; dans une fiche « comprendre », chaque bloc aussi
  à droite   les figures, ce qu'il faut démonter, la liste « Il te faut » à cocher, les couples de l'atelier, la vidéo

Aucun texte du chapitre n'est réécrit : les blocs sont déplacés ou enveloppés, et seuls des libellés d'interface
s'ajoutent (numéro d'étape, titre de la boîte des couples). Sans JavaScript, tout reste lisible : aucun attribut
hidden, et un <details> s'ouvre d'un clic.

Seule la bibliothèque standard est utilisée.
"""
from dataclasses import dataclass

from dom import Element, Texte, analyser, fragment, selectionner

VIDEO = ("Vidéo", "Vidéos")  # intitulés du h4 qui annonce les vidéos d'un atelier
_BLANCS = " \t\n\r\f"


@dataclass
class Etape:
    titre: str
    couples: list[str]  # textes des span.nm du corps de l'étape, dans l'ordre et sans doublon


@dataclass
class Atelier:
    id: str
    slug: str  # l'id sans le préfixe « <chapitre>- », qui donne l'adresse de la page
    num: str  # « 2.3 »
    titre: str  # « Changer les plaquettes »
    type: str
    zone: str
    de: str | None
    vers: str | None
    demonter: str | None  # texte du p de .a-dem
    outils: list[str]  # textes des li de .kit
    etapes: list[Etape]  # tous les ol.steps > li, y compris ceux d'un <details>
    blocs: list[str]  # fiche « comprendre » : titres de ses blocs repliables
    modeles: list[str]  # valeurs de data-model
    section: Element  # la section.atelier dans l'arbre du chapitre, jamais modifiée


@dataclass
class Chapitre:
    id: str
    tete: Element  # le header.ch-head
    ateliers: list[Atelier]
    resumes: dict[str, list[Element]]  # par valeur de data-resume


def relever_chapitre(texte: str) -> Chapitre:
    """Le chapitre d'un fragment de src/parts : sa section.chapter, ses ateliers et ses résumés."""
    chapitre = _premier(analyser(texte), "section.chapter")
    if chapitre is None or not chapitre.get("id"):
        raise ValueError("aucune section.chapter avec un id")
    ident = chapitre.get("id")
    tete = _premier(chapitre, "header.ch-head")
    if tete is None:
        raise ValueError(f"chapitre {ident} : header.ch-head absent")
    resumes = {}
    for element in selectionner(chapitre, "[data-resume]"):
        resumes.setdefault(element.get("data-resume"), []).append(element)
    ateliers = [_relever_atelier(s, ident) for s in selectionner(chapitre, "section.atelier")]
    return Chapitre(ident, tete, ateliers, resumes)


def _relever_atelier(section, chapitre):
    ident = section.get("id") or ""
    if not ident.startswith(chapitre + "-"):
        raise ValueError(f"atelier « {ident} » : l'id ne commence pas par « {chapitre}- »")
    h3 = next((e for e in _elements(section) if e.tag == "h3"), None)
    num, _, titre = (h3.texte() if h3 is not None else "").partition(" ")
    if not titre:
        raise ValueError(f"atelier {ident} : pas de h3 « numéro titre »")
    a_demonter = _premier(section, ".a-dem")
    demonter = _premier(a_demonter, "p") if a_demonter is not None else None
    kit = _premier(section, ".kit")
    etapes = []
    for li in selectionner(section, "ol.steps > li"):
        titre_etape, _, couples = _decouper_etape(li)
        etapes.append(Etape(titre_etape.texte(), [nm.texte() for nm in couples]))
    type_ = section.get("data-type")
    return Atelier(
        id=ident,
        slug=ident[len(chapitre) + 1:],
        num=num,
        titre=titre,
        type=type_,
        zone=section.get("data-zone"),
        de=section.get("data-de"),
        vers=section.get("data-vers"),
        demonter=demonter.texte() if demonter is not None else None,
        outils=[li.texte() for li in selectionner(kit, "li")] if kit is not None else [],
        etapes=etapes,
        # Les titres sont ceux que colonnes() met dans les résumés : on replie une copie pour les lire.
        blocs=_replier_blocs(_copie(section)) if type_ == "comprendre" else [],
        modeles=[e.get("data-model") for e in selectionner(section, "[data-model]")],
        section=section,
    )


def colonnes(a: Atelier) -> tuple[str, str]:
    """Le HTML de la colonne de gauche et celui de la colonne de droite de la page de l'atelier `a`.

    Travaille sur une copie de la section : `a.section` reste intacte pour les autres pages. Le h3 ne passe dans
    aucune colonne (le gabarit en fait le h1 de la page). La droite est vide quand rien n'y passe.
    """
    section = _copie(a.section)
    h3 = next((e for e in _elements(section) if e.tag == "h3"), None)
    if h3 is not None:
        _detacher(h3)

    droite = []
    figures = [_detacher(f) for f in selectionner(section, "figure")]
    if figures:
        # Sans JavaScript, les figures restent empilées ; data-onglets demande des onglets quand il y en a plusieurs.
        boite = _gabarit('<div class="figures" data-onglets></div>' if len(figures) > 1 else '<div class="figures"></div>')
        for figure in figures:
            boite.ajouter(Texte("\n"))
            boite.ajouter(figure)
        boite.ajouter(Texte("\n"))
        droite.append(boite.html())

    couples = _replier_etapes(section)
    if a.type == "comprendre":
        _replier_blocs(section)
    else:
        demonter = _premier(section, ".a-dem")
        if demonter is not None:
            droite.append(_detacher(demonter).html())
        kit = _premier(section, ".kit")
        if kit is not None:
            _cocher_kit(kit, a.id)
            droite.append(_detacher(kit).html())
        if couples:
            droite.append(_boite_couples(couples))
        droite += [_detacher(e).html() for e in _video(section)]

    return section.interieur().strip(_BLANCS), "\n".join(droite)


def _replier_etapes(section):
    """Chaque li d'un ol.steps devient un li.step qui tient sur une ligne : un <details> dont le résumé donne le
    numéro, le titre et le premier couple de l'étape, et dont le corps est dans div.st-b.

    Rend les étapes qui ont un couple, pour la boîte des couples : (numéro, HTML du titre, span.nm distincts)."""
    avec_couples = []
    for ol in selectionner(section, "ol.steps"):
        for n, li in enumerate((e for e in _elements(ol) if e.tag == "li"), 1):
            titre, corps, couples = _decouper_etape(li)
            details = _gabarit('<details><summary><span class="st-n"></span><span class="st-t"></span></summary>'
                               '<div class="st-b"></div></details>')
            resume, boite = _elements(details)
            numero, titre_resume = _elements(resume)
            numero.ajouter(Texte(str(n)))
            for noeud in list(titre.enfants):
                titre_resume.ajouter(noeud)
            if couples:
                resume.ajouter(_copie(couples[0]))
                avec_couples.append((n, titre_resume.interieur(), [_copie(nm) for nm in couples]))
            for noeud in corps:
                boite.ajouter(noeud)
            titre.retirer()
            li.ajouter(details)
            li.set("class", " ".join(li.classes() + ["step"]))
    return avec_couples


def _decouper_etape(li):
    """Le p.st-t d'un li d'ol.steps, les nœuds de son corps (tout le reste) et les span.nm distincts de ce corps."""
    titre = next((e for e in _elements(li) if e.tag == "p" and "st-t" in e.classes()), None)
    if titre is None:
        raise ValueError("étape sans p.st-t : " + li.texte()[:60])
    corps = [n for n in li.enfants if n is not titre]
    couples, vus = [], set()
    for noeud in corps:
        if isinstance(noeud, Element):
            for nm in ([noeud] if _est_nm(noeud) else []) + selectionner(noeud, "span.nm"):
                if nm.texte() not in vus:
                    vus.add(nm.texte())
                    couples.append(nm)
    return titre, corps, couples


def _est_nm(element):
    return element.tag == "span" and "nm" in element.classes()


def _boite_couples(etapes):
    """La boîte « Couples de l’atelier » : une ligne par étape, son numéro et son titre exact, puis ses couples."""
    lignes = "".join(
        f'\n<li><span class="ca-etape">Étape {n} · {titre}</span> ' + " ".join(nm.html() for nm in couples) + "</li>"
        for n, titre, couples in etapes
    )
    return f'<div class="couples-atelier"><h4>Couples de l’atelier</h4><ul>{lignes}\n</ul></div>'


def _cocher_kit(kit, atelier):
    """La liste « Il te faut » devient une liste à cocher, comme celle de 2.6 : chaque li reçoit sa case, d'id
    ck-<atelier>-kit-<n>, et la liste la clé kit-<atelier>. Le texte de chaque outil passe tel quel dans un span."""
    for ul in selectionner(kit, "ul"):
        ul.set("class", " ".join([c for c in ul.classes() if c != "chips"] + ["check"]))
        ul.set("data-key", f"kit-{atelier}")
    for n, li in enumerate(selectionner(kit, "li"), 1):
        label = _gabarit(f'<label><input type="checkbox" id="ck-{atelier}-kit-{n}"><span></span></label>')
        libelle = _elements(label)[1]
        for noeud in list(li.enfants):
            libelle.ajouter(noeud)
        li.ajouter(label)


def _video(section):
    """Le dernier h4 « Vidéo » ou « Vidéos » enfant direct de la section, et le ul.media ou p.a-video qui le suit."""
    enfants = _elements(section)
    for k in range(len(enfants) - 1, -1, -1):
        titre = enfants[k]
        if titre.tag == "h4" and titre.texte() in VIDEO:
            suite = enfants[k + 1] if k + 1 < len(enfants) else None
            if suite is not None and ((suite.tag == "ul" and "media" in suite.classes())
                                      or (suite.tag == "p" and "a-video" in suite.classes())):
                return [titre, suite]
            return []
    return []


def _replier_blocs(section):
    """Fiche « comprendre » : la découpe en blocs courts, sur place.

    Chaque h4 enfant direct de la section, et chaque div.check-head, ouvre un details.bloc qui va jusqu'à la limite
    suivante ; son résumé est le texte du h4, et le reste d'un check-head (son bouton) passe en tête du corps. Un h4
    « Vidéo » ou « Vidéos » est une limite qui n'ouvre pas de bloc : il reste visible avec ce qui le suit, comme ce
    qui précède la première limite. Le premier bloc est ouvert. Puis chaque div.flow > div.q devient un details.q :
    son résumé est le texte du b, le reste forme le corps.

    Rend les titres des blocs et ceux des details.q qui ne sont dans aucun bloc, dans l'ordre du document."""
    limites = [e for e in _elements(section) if e.tag == "h4" or (e.tag == "div" and "check-head" in e.classes())]
    premier = True
    for k, limite in enumerate(limites):
        tete = limite if limite.tag == "h4" else next((e for e in _elements(limite) if e.tag == "h4"), None)
        if tete is None:
            raise ValueError("div.check-head sans h4")
        if tete.texte() in VIDEO:
            continue
        debut = section.enfants.index(limite) + 1
        fin = section.enfants.index(limites[k + 1]) if k + 1 < len(limites) else len(section.enfants)
        contenu = section.enfants[debut:fin]
        while contenu and _blanc(contenu[-1]):  # les blancs de fin restent entre les blocs
            contenu.pop()
        bloc = _gabarit('<details class="bloc"><summary></summary><div class="bloc-b"></div></details>')
        resume, corps = _elements(bloc)
        if premier:
            bloc.set("open", None)
            premier = False
        for noeud in list(tete.enfants):
            resume.ajouter(noeud)
        for noeud in [n for n in limite.enfants if n is not tete] + contenu:
            corps.ajouter(noeud)
        section.inserer(section.enfants.index(limite), bloc)
        limite.retirer()

    for q in selectionner(section, "div.flow > div.q"):
        titre = next((e for e in _elements(q) if e.tag == "b"), None)
        if titre is None:
            raise ValueError("div.q sans b : " + q.texte()[:60])
        details = _gabarit('<details class="q"><summary></summary><div class="q-b"></div></details>')
        resume, corps = _elements(details)
        for noeud in list(titre.enfants):
            resume.ajouter(noeud)
        for noeud in [n for n in q.enfants if n is not titre]:
            corps.ajouter(noeud)
        q.parent.inserer(q.parent.enfants.index(q), details)
        q.retirer()

    titres = []
    for details in selectionner(section, "details"):
        if "bloc" in details.classes() or ("q" in details.classes() and not _dans_un_bloc(details)):
            titres.append(_elements(details)[0].texte())
    return titres


def _dans_un_bloc(element):
    parent = element.parent
    while parent is not None:
        if parent.tag == "details" and "bloc" in parent.classes():
            return True
        parent = parent.parent
    return False


def _elements(parent):
    """Les enfants qui sont des éléments, sans les blancs de mise en page ni les commentaires."""
    return [e for e in parent.enfants if isinstance(e, Element)]


def _premier(racine, selecteur):
    trouves = selectionner(racine, selecteur)
    return trouves[0] if trouves else None


def _copie(element):
    """Un double exact de l'élément, hors de tout arbre."""
    return next(e for e in analyser(element.html()).enfants if isinstance(e, Element))


def _gabarit(texte):
    """L'élément d'un fragment complet, balise fermante comprise (fragment("<div>") n'en aurait pas)."""
    return fragment(texte)[0]


def _blanc(noeud):
    return isinstance(noeud, Texte) and not noeud.brut.strip(_BLANCS)


def _detacher(noeud):
    """Retire le nœud de son parent, avec les blancs de mise en page juste avant lui. Rend le nœud."""
    parent = noeud.parent
    if parent is not None:
        i = parent.enfants.index(noeud)
        if i and _blanc(parent.enfants[i - 1]):
            parent.enfants[i - 1].retirer()
    noeud.retirer()
    return noeud
