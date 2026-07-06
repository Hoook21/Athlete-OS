# Fitness Coach

Lokale PWA aus dem Claude Artifact.

## Start

```bash
npm run start
```

Die App laeuft dann auf Port `5175`.

## Strava Live-Sync

Die App kann Strava serverseitig per OAuth verbinden. Dafuer im Strava-Developer-Dashboard eine App anlegen und als Callback setzen:

```text
http://<host>:5175/api/strava/callback
```

Dann den Server mit Zugangsdaten starten:

```bash
STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... npm run start
```

In der App erscheint danach `Strava verbinden`. Nach dem OAuth-Login speichert der Server das Token lokal unter `data/strava-token.json`, refreshed es automatisch und liefert die aktuellen Aktivitaeten ueber `/api/strava/snapshot`. Ohne Credentials oder Verbindung nutzt die App weiter den statischen Snapshot als Fallback.

## Speicher

- Recovery-Werte werden pro Datum lokal gespeichert.
- Primaer nutzt die App IndexedDB.
- Falls IndexedDB nicht verfuegbar ist, faellt sie auf localStorage zurueck.
- Export/Import erzeugt bzw. liest JSON-Backups.
- Wenn die App ueber den lokalen Node-Server laeuft, synchronisiert sie automatisch ein Backup nach `data/backup.json`.
- Beim Start laedt die App dieses Server-Backup wieder ein und fuehrt es mit dem lokalen Speicher zusammen.

## Grenzen

- Wetter wird live von Open-Meteo (api.open-meteo.com) fuer Wewer/Paderborn geladen; bei Fehler greift ein sicherer Fallback.
- Strava-Daten werden live geladen, sobald `STRAVA_CLIENT_ID`/`STRAVA_CLIENT_SECRET` gesetzt sind und Strava einmal verbunden wurde. Ohne Verbindung bleibt der statische Snapshot aus dem Artifact aktiv.
- Das automatische Backup funktioniert nur, wenn der Mac/VM-Server erreichbar ist; fuer externen Zugriff braeuchte es spaeter eine Cloud-/Domain-Loesung.
