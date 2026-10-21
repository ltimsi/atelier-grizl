# Déploiement sur le serveur Hetzner

Le site est un conteneur nginx qui sert les fichiers statiques de `dist/site/`, assemblés pendant la construction de l'image (`deploy/Dockerfile`). Le conteneur n'écoute que sur `127.0.0.1`, au port `PORT` de `.env` : 3013 sur le serveur actuel. Devant lui, nginx installé sur l'hôte sert de reverse proxy, avec un vhost par site et un certificat Let's Encrypt obtenu par certbot en mode webroot. Le site est publié sur un sous-domaine, noté ici `atelier.<ton-domaine>`.

```
navigateur -> HTTPS -> nginx de l'hôte (vhost atelier.<ton-domaine>) -> HTTP -> 127.0.0.1:3013 -> conteneur (nginx, port 80)
```

## Pourquoi 127.0.0.1 plutôt que tous les ports

Docker ouvre ses ports publiés en passant devant les règles du pare-feu ufw. Un `ports: "3013:80"` classique serait joignable en HTTP simple depuis Internet, même si ufw le bloque. En écoutant sur `127.0.0.1`, le conteneur n'est joignable que par le reverse proxy, qui ajoute le HTTPS.

## Ce que sert le conteneur

La configuration est dans `deploy/nginx.conf`.

- Chaque page est un dossier et son `index.html` : `/freins/plaquettes/` sert `freins/plaquettes/index.html`. Une adresse de dossier sans barre finale, comme `/freins`, renvoie vers `/freins/` par une redirection relative (`absolute_redirect off`), qui garde le HTTPS du proxy.
- Tous les `.html` et tous les `.js` sont servis avec `Cache-Control: no-cache` (`expires -1`). Le navigateur les revalide à chaque chargement : après une mise à jour, une page ne garde jamais les adresses ni les modules d'une version précédente.
- Les en-têtes de sécurité (politique de contenu, `nosniff`, pas d'iframe) sont posés pour tout le site.

## Première installation

1. Choisis un port libre sur le serveur. `ss -ltn` liste ceux qui sont pris. Le site utilise 3013 aujourd'hui.
2. Sur ton ordinateur, dans le dépôt, fais une archive du commit relu et copie-la sur le serveur :

   ```sh
   git archive --format=tar.gz --prefix=atelier-grizl/ -o atelier-grizl.tar.gz <commit>
   scp atelier-grizl.tar.gz <serveur>:
   ```

3. Sur le serveur, en SSH :

   ```sh
   tar -xzf atelier-grizl.tar.gz       # crée ~/atelier-grizl
   cd atelier-grizl
   cp .env.example .env                # BIND_IP=127.0.0.1, et PORT= le port choisi (3013)
   docker compose up -d --build
   docker compose ps                   # le service doit être « healthy »
   curl -sI http://127.0.0.1:3013/ | head -1   # HTTP/1.1 200 OK
   ```

## Brancher le sous-domaine sur nginx

1. Crée l'entrée DNS de `atelier.<ton-domaine>` vers l'IP du serveur (un enregistrement A par sous-domaine).
2. Écris le vhost dans `/etc/nginx/sites-enabled/`, d'abord avec son seul bloc du port 80, celui qui laisse passer le défi de certbot. Puis `sudo nginx -t && sudo systemctl reload nginx`.
3. Demande le certificat en mode webroot :

   ```sh
   sudo certbot certonly --webroot -w /var/www/html -d atelier.<ton-domaine>
   ```

   certbot le renouvelle seul. Un hook de déploiement de certbot recharge nginx après chaque renouvellement.
4. Ajoute le bloc du port 443, puis `sudo nginx -t && sudo systemctl reload nginx`.

Le vhost suit ce modèle :

```nginx
server {
    listen 80;
    server_name atelier.<ton-domaine>;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://$host$request_uri; }
}
server {
    listen 443 ssl;
    server_name atelier.<ton-domaine>;
    ssl_certificate     /etc/letsencrypt/live/atelier.<ton-domaine>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/atelier.<ton-domaine>/privkey.pem;
    location / {
        proxy_pass http://127.0.0.1:3013;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Vérifier

```sh
ss -tlnp | grep 3013                                               # une seule ligne : 127.0.0.1:3013, jamais 0.0.0.0
curl -sI http://127.0.0.1:3013/freins/plaquettes/ | head -1        # HTTP/1.1 200 OK
curl -sI http://127.0.0.1:3013/freins | grep -i '^location'        # Location: /freins/
curl -sI http://127.0.0.1:3013/js/site.js | grep -i cache-control  # Cache-Control: no-cache
```

Puis ouvre `https://atelier.<ton-domaine>/` sur ton ordinateur et sur ton téléphone. Un ancien favori comme `https://atelier.<ton-domaine>/#freins-plaquettes` doit arriver sur la page de l'atelier 2.3.

## Mettre à jour après une relecture

Le serveur n'a pas de clone du dépôt : on y copie une archive du commit relu. On l'extrait dans un dossier neuf, pour qu'aucun fichier retiré du dépôt ne reste derrière, et on garde `.env`, qui n'est pas dans l'archive (Git l'ignore).

```sh
# sur ton ordinateur, dans le dépôt
git archive --format=tar.gz --prefix=atelier-grizl.neuf/ -o atelier-grizl.tar.gz <commit>
scp atelier-grizl.tar.gz <serveur>:

# sur le serveur
tar -xzf atelier-grizl.tar.gz
cp atelier-grizl/.env atelier-grizl.neuf/
rm -rf atelier-grizl.avant
mv atelier-grizl atelier-grizl.avant && mv atelier-grizl.neuf atelier-grizl
cd atelier-grizl && docker compose up -d --build
```

Le dossier garde son nom, `atelier-grizl` : Docker Compose reconnaît le même projet et remplace le conteneur. `atelier-grizl.avant` garde la version d'avant. Refais ensuite les vérifications du dessus.

## Revenir à la version d'avant

```sh
mv atelier-grizl atelier-grizl.annulee && mv atelier-grizl.avant atelier-grizl
cd atelier-grizl && docker compose up -d --build
```

Pour une version plus ancienne, fais l'archive de son commit ou de l'étiquette de son lot (`lot-1`…) et suis « Mettre à jour ».

## Plus tard : accès par VPN seulement

Mets l'adresse de l'interface WireGuard dans `.env` (`BIND_IP=` suivi du résultat de `ip -4 addr show wg0`), retire le sous-domaine du reverse proxy, puis relance `docker compose up -d`.
