"""Arbre HTML fidèle pour build/assemble.py.

Relit un fragment HTML écrit à la main et le rend octet pour octet tant qu'on n'y touche pas : balises, espaces,
entités, commentaires, majuscules et guillemets du source restent tels quels. On peut alors y retirer, déplacer et
envelopper des blocs sans jamais réécrire un texte.

L'arbre suit les balises écrites, sans en inventer : une balise fermante absente reste absente, une balise fermante
sans ouvrante est gardée comme un Commentaire (donc hors du texte).

Seule la bibliothèque standard est utilisée.
"""
import re
from html import unescape
from html.parser import HTMLParser

# Éléments vides HTML : pas de contenu, pas de balise fermante.
VIDES = frozenset("area br col embed hr img input link meta source track wbr".split())
_BLANCS = re.compile(r"[ \t\n\r\f]+")
_NOM_BALISE = re.compile(r"<([^\s/>]+)")


class Noeud:
    """Ce que les trois sortes de nœuds ont en commun : un parent, un retrait et une sortie en HTML."""

    def __init__(self):
        self.parent = None

    def html(self):
        sortie = []
        self._ecrire(sortie)
        return "".join(sortie)

    def retirer(self):
        """Détache le nœud de son parent. Sans parent, ne fait rien."""
        if self.parent is not None:
            self.parent.enfants.remove(self)
            self.parent = None


class Texte(Noeud):
    """Du texte, tel qu'il est écrit dans le source : les entités (&nbsp;, &#233;) ne sont pas décodées."""

    def __init__(self, brut):
        super().__init__()
        self.brut = brut

    def _ecrire(self, sortie):
        sortie.append(self.brut)


class Commentaire(Noeud):
    """Tout ce qui n'est ni balise ni texte, délimiteurs compris : `<!--x-->`, `<!doctype html>`, `<?pi?>`,
    ou une balise fermante qui n'a pas d'ouvrante."""

    def __init__(self, brut):
        super().__init__()
        self.brut = brut

    def _ecrire(self, sortie):
        sortie.append(self.brut)


class Element(Noeud):
    """Une balise et ce qu'elle contient. La racine d'un document a `tag` à None.

    `attrs` garde les noms en minuscules et les valeurs décodées, dans l'ordre du source. Tant que `attrs` n'a pas
    changé (par `set()` ou à la main), la balise ouvrante est rendue comme dans le source. Une fois changée, elle est
    réécrite d'après `attrs` : le nom de la balise garde sa casse du source, les noms d'attributs sont en minuscules.
    """

    def __init__(self, tag, attrs=None, *, ouvrante=None, fermante=None, autofermant=False):
        """`ouvrante` et `fermante` sont les balises brutes du source. `fermante` vaut "" quand le source n'en a
        pas, et None pour un élément créé à la main, qui reçoit alors `</tag>`."""
        super().__init__()
        self.tag = tag
        self.attrs = list(attrs or [])
        self.enfants = []
        self._ouvrante = ouvrante
        self._attrs_source = list(self.attrs)
        self._fermante = fermante
        self._autofermant = autofermant

    def get(self, nom):
        """La valeur décodée de l'attribut, ou None s'il est absent ou écrit sans valeur."""
        nom = nom.lower()
        for n, valeur in self.attrs:
            if n == nom:
                return valeur
        return None

    def set(self, nom, valeur):
        """Change l'attribut sur place, ou l'ajoute à la fin. `valeur` à None l'écrit sans valeur (`open`)."""
        nom = nom.lower()
        for i, (n, _) in enumerate(self.attrs):
            if n == nom:
                self.attrs[i] = (n, valeur)
                return
        self.attrs.append((nom, valeur))

    def classes(self):
        return (self.get("class") or "").split()

    def interieur(self):
        sortie = []
        for enfant in self.enfants:
            enfant._ecrire(sortie)
        return "".join(sortie)

    def texte(self):
        """Le texte lu par un visiteur : entités décodées (une espace insécable le reste), commentaires
        ignorés, blancs de mise en page réduits à une espace, extrémités rognées."""
        return _BLANCS.sub(" ", unescape("".join(_textes(self)))).strip(" ")

    def inserer(self, i, noeud):
        """Met le nœud à la place `i`, après l'avoir détaché de son ancien parent. Si c'est un enfant de cet
        élément, `i` compte les enfants une fois le nœud retiré."""
        noeud.retirer()
        noeud.parent = self
        self.enfants.insert(i, noeud)

    def ajouter(self, noeud):
        self.inserer(len(self.enfants), noeud)

    def _sans_contenu(self):
        return self.tag in VIDES or self._autofermant

    def _balise_ouvrante(self):
        if self._ouvrante is not None and self.attrs == self._attrs_source:
            return self._ouvrante
        nom_balise = _NOM_BALISE.match(self._ouvrante).group(1) if self._ouvrante else self.tag
        morceaux = [f"<{nom_balise}"]
        for nom, valeur in self.attrs:
            if valeur is None:
                morceaux.append(f" {nom}")
            else:
                morceaux.append(f' {nom}="{valeur.replace("&", "&amp;").replace(chr(34), "&quot;")}"')
        morceaux.append("/>" if self._autofermant else ">")
        return "".join(morceaux)

    def _ecrire(self, sortie):
        if self.tag is None:
            for enfant in self.enfants:
                enfant._ecrire(sortie)
            return
        sortie.append(self._balise_ouvrante())
        if self._sans_contenu():
            return
        for enfant in self.enfants:
            enfant._ecrire(sortie)
        sortie.append(f"</{self.tag}>" if self._fermante is None else self._fermante)


def _textes(element):
    """Les textes bruts des descendants, dans l'ordre du document."""
    for enfant in element.enfants:
        if isinstance(enfant, Texte):
            yield enfant.brut
        elif isinstance(enfant, Element):
            yield from _textes(enfant)


class _Constructeur(HTMLParser):
    """Construit l'arbre. Le source exact de chaque morceau est lu dans `updatepos`, pas rebâti à partir de ce
    que les gestionnaires reçoivent : html.parser appelle `updatepos(i, j)` après chaque morceau qu'il reconnaît,
    avec ses bornes dans `rawdata`. Ainsi `&copy` sans point-virgule, `</p >` ou `<!--x--!>` reviennent tels quels,
    et un morceau que l'analyseur laisse tomber (balise coupée à la fin du source) devient du texte."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.racine = Element(None)
        self._pile = [self.racine]  # éléments ouverts, du plus extérieur au plus intérieur
        self._vu = None  # ce que le gestionnaire vient de reconnaître, en attendant le source exact

    # Les gestionnaires notent seulement la sorte de morceau. Le texte, les entités et les références
    # numériques n'en ont pas besoin : sans note, le morceau est du texte.
    def handle_starttag(self, tag, attrs):
        self._vu = ("ouvrante", tag, attrs)

    def handle_startendtag(self, tag, attrs):
        self._vu = ("autofermante", tag, attrs)

    def handle_endtag(self, tag):
        self._vu = ("fermante", tag, None)

    def handle_comment(self, data):
        self._vu = ("autre", None, None)

    handle_decl = handle_pi = unknown_decl = handle_comment

    def updatepos(self, i, j):
        source = self.rawdata[i:j]
        vu, self._vu = self._vu, None
        if source:
            self._ajouter_morceau(vu, source)
        return super().updatepos(i, j)

    def _ajouter_morceau(self, vu, source):
        genre, tag, attrs = vu or ("texte", None, None)
        courant = self._pile[-1]
        if genre in ("ouvrante", "autofermante"):
            element = Element(tag, attrs, ouvrante=source, fermante="", autofermant=genre == "autofermante")
            courant.ajouter(element)
            if genre == "ouvrante" and tag not in VIDES:
                self._pile.append(element)
        elif genre == "fermante":
            # Ferme l'élément ouvert le plus proche de ce nom. Ceux qu'il contient encore restent sans balise
            # fermante, comme dans le source.
            for k in range(len(self._pile) - 1, 0, -1):
                if self._pile[k].tag == tag:
                    self._pile[k]._fermante = source
                    del self._pile[k:]
                    return
            courant.ajouter(Commentaire(source))
        elif genre == "autre":
            courant.ajouter(Commentaire(source))
        elif courant.enfants and isinstance(courant.enfants[-1], Texte):
            courant.enfants[-1].brut += source
        else:
            courant.ajouter(Texte(source))


def analyser(texte):
    """L'arbre d'un document ou d'un fragment. La racine a `tag` à None et `html()` rend `texte` à l'identique."""
    constructeur = _Constructeur()
    constructeur.feed(texte)
    constructeur.close()
    return constructeur.racine


def fragment(texte):
    """Les nœuds de premier niveau d'un bout de HTML, sans parent, à insérer dans un arbre."""
    racine = analyser(texte)
    noeuds = racine.enfants
    racine.enfants = []
    for noeud in noeuds:
        noeud.parent = None
    return noeuds


# Un sélecteur simple : balise facultative, classes, attributs. Ex. `ol`, `.steps`, `ol.steps`, `p[hidden]`.
_SIMPLE = re.compile(r'([A-Za-z][\w-]*)?((?:\.[\w-]+)*)((?:\[[\w:-]+(?:="[^"]*")?\])*)')
_CLASSE = re.compile(r"\.([\w-]+)")
_ATTRIBUT = re.compile(r'\[([\w:-]+)(?:="([^"]*)")?\]')


def _condition(simple):
    correspondance = _SIMPLE.fullmatch(simple)
    if not simple or correspondance is None:
        raise ValueError(f"sélecteur non géré : {simple!r}")
    balise, classes, attributs = correspondance.groups()
    balise = balise.lower() if balise else None
    classes = set(_CLASSE.findall(classes))
    attributs = [(m[1].lower(), m[2]) for m in _ATTRIBUT.finditer(attributs)]

    def convient(element):
        if balise is not None and element.tag != balise:
            return False
        if not classes <= set(element.classes()):
            return False
        for nom, valeur in attributs:
            if valeur is None:
                if all(n != nom for n, _ in element.attrs):
                    return False
            elif element.get(nom) != valeur:
                return False
        return True

    return convient


def _descendants(element):
    for enfant in element.enfants:
        if isinstance(enfant, Element):
            yield enfant
            yield from _descendants(enfant)


def selectionner(racine, selecteur):
    """Les descendants de `racine` qui correspondent au sélecteur, dans l'ordre du document.

    Formes acceptées : `tag`, `.classe`, `tag.classe`, `tag.classe1.classe2`, `[attr]`, `tag[attr="valeur"]`, et une
    descendance directe d'un seul niveau, `a > b`. Toute autre forme lève ValueError.
    """
    morceaux = [m.strip() for m in selecteur.split(">")]
    if len(morceaux) > 2:
        raise ValueError(f"une seule descendance directe est gérée : {selecteur!r}")
    cible = _condition(morceaux[-1])
    parent = _condition(morceaux[0]) if len(morceaux) == 2 else None
    return [e for e in _descendants(racine) if cible(e) and (parent is None or parent(e.parent))]
