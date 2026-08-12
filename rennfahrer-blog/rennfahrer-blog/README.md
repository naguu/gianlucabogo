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

**2. Domain eintragen**

In `nginx/default.conf` den Platzhalter `deine-domain.ch` bei `server_name` durch die eigene Domain ersetzen.

**3. Container bauen und starten**

Im Projektordner:

```
docker compose up -d --build
```

Das startet zwei Container:

- `api`, die Node/Express-API, Daten liegen als Volumes unter `server/data` und `server/uploads` und bleiben damit auch bei einem Neubau des Containers erhalten.
- `web`, ein Nginx, der die gebaute Angular-Seite ausliefert und `/api/` sowie `/uploads/` intern an `api` weiterreicht.

Die Seite ist danach über Port 8080 auf dem Server erreichbar (`http://server-ip:8080`). Läuft auf dem Server bereits ein eigener Reverse Proxy für die Domain und für HTTPS, diesen einfach auf Port 8080 dieses Containers zeigen lassen. Läuft sonst nichts auf dem Server, kann in `docker-compose.yml` bei der Portangabe des `web`-Service `8080:80` auch direkt zu `80:80` geändert werden.

**Wichtig zu HTTPS:** Das Session-Cookie wird nur dann als `secure` markiert, wenn in `server/.env` `NODE_ENV=production` gesetzt ist. Ein `secure`-Cookie wird vom Browser ausschliesslich über HTTPS gesendet. Steht vor diesem Setup ein Reverse Proxy mit gültigem Zertifikat (z. B. via Certbot), `NODE_ENV=production` setzen. Läuft die Seite testweise nur über HTTP, `NODE_ENV=development` lassen (Standard in `.env.example`), sonst schlägt der Login fehl, weil das Cookie den Browser nie verlässt. Für den echten Betrieb sollte aber immer HTTPS vor der Seite stehen und `NODE_ENV=production` gesetzt sein.

## Inhalte pflegen

Im Adminbereich (`/admin`, nach Login mit dem Passwort aus `.env`) lassen sich Name, Kurzinfo, Bio, Portraitfoto und Hero-Foto des Fahrers anpassen, neue Beiträge mit Titel, Text, Datum und mehreren Bildern erstellen, und bestehende Beiträge löschen. Alle Inhalte landen in `server/data/posts.json`, Bilder in `server/uploads/`.

Die Laufbandzeile im Startbereich, die Erfolge im Werdegang, die Partner-Sektion und die Kontakt-Sektion sind bewusst nicht Teil des Adminbereichs (kein alltäglicher Änderungsbedarf) und werden direkt im Template unter `client/src/app/pages/home/home.component.html` angepasst.

Das Showreel-Video liegt als feste Datei unter `client/public/assets/video/`, ein neues Video dort austauschen (gleicher Dateiname oder Pfad in `home.component.html` anpassen).
