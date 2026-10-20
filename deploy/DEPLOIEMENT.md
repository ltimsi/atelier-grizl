# Déploiement sur le serveur Hetzner

Le site est un conteneur nginx qui sert des fichiers statiques. Par défaut, il n'écoute que sur `127.0.0.1:8088` : c'est le reverse proxy déjà en place sur le serveur qui le publie sur un sous-domaine, en HTTPS.

## Pourquoi 127.0.0.1 plutôt que tous les ports

Docker ouvre ses ports publiés en passant devant les règles du pare-feu ufw. Un `ports: "8088:80"` classique serait joignable en HTTP simple depuis Internet, même si ufw le bloque. En écoutant sur `127.0.0.1`, le conteneur n'est joignable que par le reverse proxy, qui ajoute le HTTPS.

## Première installation

Sur le serveur, en SSH :

```sh
git clone https://github.com/ltimsi/atelier-grizl.git
cd atelier-grizl
cp .env.example .env          # BIND_IP=127.0.0.1, PORT=8088 : à garder tels quels
docker compose up -d --build
docker compose ps             # le service doit être « healthy »
curl -sI http://127.0.0.1:8088 | head -1   # HTTP/1.1 200 OK
```

## Brancher le sous-domaine sur le reverse proxy

Crée d'abord l'entrée DNS du sous-domaine (par exemple `atelier.ton-domaine.ch`) vers l'IP du serveur. Ensuite, selon ton reverse proxy :

- **Caddy** (Caddyfile) :
  ```
  atelier.ton-domaine.ch {
      reverse_proxy 127.0.0.1:8088
  }
  ```
- **Nginx Proxy Manager** : nouveau Proxy Host, domaine `atelier.ton-domaine.ch`, schéma `http`, hôte `127.0.0.1` (ou l'IP de la passerelle Docker si NPM tourne lui-même dans Docker), port `8088`, puis l'onglet SSL avec un certificat Let's Encrypt.
- **Traefik** : le plus simple est de brancher le conteneur sur le réseau Docker de Traefik et d'ajouter ses étiquettes ; envoie-moi ta configuration et je te prépare le bloc exact.

## Vérifier

```sh
ss -tlnp | grep 8088          # une seule ligne : 127.0.0.1:8088, jamais 0.0.0.0
```

Puis ouvre `https://atelier.ton-domaine.ch` depuis ton téléphone.

## Mettre à jour après un lot validé

```sh
cd atelier-grizl
git pull
docker compose up -d --build
```

## Revenir à un lot précédent

```sh
git checkout lot-1            # étiquette du lot voulu
docker compose up -d --build
git checkout main             # pour revenir à la dernière version
```

## Plus tard : accès par VPN seulement

Mets l'adresse de l'interface WireGuard dans `.env` (`BIND_IP=` suivi du résultat de `ip -4 addr show wg0`), retire le sous-domaine du reverse proxy, puis relance `docker compose up -d`.
