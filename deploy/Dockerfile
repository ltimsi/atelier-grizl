# Étape 1 : assemblage du site à partir des fragments (Python seul, sans dépendance)
FROM python:3.12-alpine AS build
WORKDIR /app
COPY build ./build
COPY src ./src
COPY vendor ./vendor
RUN python3 build/assemble.py --target site

# Étape 2 : service des fichiers statiques
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/site /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
