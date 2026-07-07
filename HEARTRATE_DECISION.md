# Herzfrequenz-Integration: Entscheidung zur Belastungsberechnung

## Was implementiert wurde

- `buildStravaSnapshot()` liest `has_heartrate`, `average_heartrate` und `max_heartrate` aus jeder Strava-Aktivität.
- Im Snapshot wird pro Aktivität `summary.heartrate: { avg?, max? }` übergeben. Fehlen HF-Daten, bleibt das Objekt leer (`{}`) – es wird keine `0` angezeigt.
- UI zeigt Ø/Max-HF pro Aktivität und einen kleinen HF-Überblick über die letzten Aktivitäten im Dashboard.

## Warum HF nicht direkt in Fitness/Load eingerechnet wird

Eine sinnvolle HF-basierte Belastung braucht entweder
1. **relative Effort/Strava Suffer Score** – ist bereits primärer Load-Faktor in `activityLoad()`;
2. eine **TRIMP-ähnliche Metrik** – die braucht zuverlässige persönliche HF-Zonen (Ruhepuls, maxHF/LT) und pro-Aktivität-Zeit in Zonen. `average_heartrate` allein reicht dafür nicht stabil.

Da im Snapshot nur Durchschnitts- und Max-HF verfügbar sind, ohne Zone-Zeit oder persönliche Zonen, wäre eine TRIMP-Heuristik unsicher und könnte den bestehenden CTL/ATL-Trend verfälschen.

## Vorgehen

- **Jetzt:** HF-Daten sichtbar machen, Struktur vorbereiten.
- **Später:** Sobald genug Aktivitäten mit HF vorliegen, kann aus `avg/max` pro Sportart eine empirische HF-Zone abgeleitet und als zusätzlicher Load-Faktor (z. B. Gewichtung) ergänzt werden. Dazu ist aber weiterer Code/Test nötig.

## Datenschutz

- HF-Werte werden nicht geloggt.
- Alles bleibt lokal im Snapshot/Backup, keine Weitergabe.
