# Rennfahrer Blog, Angular + Node

Öffentliche Seite als Angular-SPA, Adminbereich als geschützte Angular-Route, kleines Node/Express-Backend als JSON-API. Keine Datenbank, alle Inhalte liegen in `server/data/posts.json`, Bilder in `server/uploads/`.

## Projektstruktur

```
client/     Angular-App (öffentliche Seite + Adminbereich)
server/     Node/Express-API (Login, Profil, Beiträge, Bild-Upload)
nginx/      Nginx-Konfiguration für den Produktivbetrieb
```

## Wie die Absicherung funktioniert

Der Adminbereich (`/admin`) ist über einen Angular `AuthGuard` geschützt, der clientseitig verhindert, dass die Seite ohne Anmeldung angezeigt wird. Der eigentliche Schutz passiert aber auf dem Server: Login läuft über `POST /api/login` gegen ein Passwort aus der Server-Umgebungsvariable `ADMIN_PASSWORD`, danach setzt der Server ein signiertes, `httpOnly`-Session-Cookie. Jeder schreibende Endpunkt (`PUT /api/profile`, `POST /api/posts`, `DELETE /api/posts/:id`) prüft dieses Cookie serverseitig, unabhängig vom Angular-Code. Es gibt keine Datenbank, nur die Session hält der Node-Prozess im Speicher.

## Lokale Entwicklung ohne Docker

Voraussetzung: Node.js (getestet mit v22/v24) und npm.

**1. Server**

```
cd server
cp .env.example .env
# .env öffnen und ADMIN_PASSWORD sowie SESSION_SECRET setzen
npm install
npm run dev
```

Die API läuft danach auf `http://localhost:3000`.

**2. Client**

In einem zweiten Terminal:

```
cd client
npm install
npm start
```

Die Seite läuft auf `http://localhost:4200`. Der Angular-Dev-Server leitet `/api/*` und `/uploads/*` automatisch an die Node-API auf Port 3000 weiter (siehe `client/proxy.conf.json`), Login-Cookies funktionieren dadurch auch lokal ganz normal.

Der Adminbereich liegt unter `http://localhost:4200/admin`, das Passwort ist das aus `server/.env`.

## Produktivbetrieb mit Docker

Voraussetzung: Docker und das Docker Compose Plugin.

**1. Umgebungsvariablen setzen**

```
cd server
cp .env.example .env
```

`.env` öffnen und mindestens `ADMIN_PASSWORD` und `SESSION_SECRET` auf sichere, zufällige Werte setzen.

**2. Container bauen und starten**

Im Projektordner:

```
docker compose up -d --build
```

Das startet zwei Container:

- `api`, die Node/Express-API, Daten liegen als Volumes unter `server/data` und `server/uploads` und bleiben damit auch bei einem Neubau des Containers erhalten.
- `web`, ein Nginx, der die gebaute Angular-Seite ausliefert und `/api/` sowie `/uploads/` intern an `api` weiterreicht. Dieser Container macht selbst kein TLS und kennt keine Domain (`server_name _;`) — das Routing nach Domain und die HTTPS-Terminierung übernimmt der vorgeschaltete Reverse Proxy auf dem Host (z. B. Nginx Proxy Manager, Traefik, Caddy).

**3. Mit dem vorgeschalteten Reverse Proxy verbinden**

Standardmäßig bindet `docker-compose.yml` den `web`-Container nur an `127.0.0.1:8080`, also nicht direkt aus dem Internet erreichbar. Den Reverse Proxy als Ziel auf `http://127.0.0.1:8080` zeigen lassen.

Läuft der Reverse Proxy selbst als Docker-Container, ist ein gemeinsames Docker-Netzwerk oft praktischer als der Port auf dem Host — siehe die auskommentierte Alternative direkt in `docker-compose.yml` beim `web`-Service.

Wichtig: Der Reverse Proxy muss beim Weiterreichen an `web` den Header `X-Forwarded-Proto: https` setzen (Nginx Proxy Manager, Traefik und Caddy tun das standardmäßig). Der interne `web`-Container reicht diesen Header unverändert an die API weiter (`nginx/default.conf`), und `server/src/index.js` vertraut zwei Proxy-Hops (`app.set('trust proxy', 2)`: Reverse Proxy + `web`-Container).

**Wichtig zu HTTPS:** Das Session-Cookie wird nur dann als `secure` markiert, wenn in `server/.env` `NODE_ENV=production` gesetzt ist. Ein `secure`-Cookie wird vom Browser ausschliesslich über HTTPS gesendet. Da der Reverse Proxy TLS terminiert, hier `NODE_ENV=production` setzen. Läuft die Seite testweise nur über HTTP ohne Proxy davor, `NODE_ENV=development` lassen (Standard in `.env.example`), sonst schlägt der Login fehl, weil das Cookie den Browser nie verlässt.

## Inhalte pflegen

Im Adminbereich (`/admin`, nach Login mit dem Passwort aus `.env`) lassen sich Name, Kurzinfo, Bio, Portraitfoto und Hero-Foto des Fahrers anpassen, neue Beiträge mit Titel, Text, Datum und mehreren Bildern erstellen, und bestehende Beiträge löschen. Alle Inhalte landen in `server/data/posts.json`, Bilder in `server/uploads/`.

Die Laufbandzeile im Startbereich, die Erfolge im Werdegang, die Partner-Sektion und die Kontakt-Sektion sind bewusst nicht Teil des Adminbereichs (kein alltäglicher Änderungsbedarf) und werden direkt im Template unter `client/src/app/pages/home/home.component.html` angepasst.

Das Showreel-Video liegt als feste Datei unter `client/public/assets/video/`, ein neues Video dort austauschen (gleicher Dateiname oder Pfad in `home.component.html` anpassen).
