# 🦎 Reptile Manager

Ein selbst gehostetes Haltungsmanagement-Tool für Reptilien — als Home Assistant Add-on.

Ich hab das für mich selbst gebaut, weil mir keine bestehende Lösung gefallen hat die sowohl in HA integrierbar ist als auch offline läuft. Wer seine Haltung gerne dokumentiert und HA nutzt, wird damit hoffentlich genauso gut klarkommen.

## Was es kann

- **Tierverwaltung** — Art, Morph, Geschlecht, Herkunft, Foto, eigene Tiernummer
- **Fütterungsprotokoll** — Futterart, -größe, Anzahl, live/TK, Akzeptanz; individuelle Warnschwelle pro Tier
- **Häutungsprotokoll** — Vollständigkeit, Blauphase, Notizen
- **Zucht** — Paare, Eiablage, Gelegegröße; Nachzucht direkt aus dem Zuchtereignis anlegen (auch 50+ Tiere auf einmal)
- **Haltungsbedingungen** — Temperatur, Luftfeuchtigkeit, Terrariengröße, Substrat, UV
- **Stammbaum** — Eltern-Kind-Beziehungen mit visueller Darstellung
- **Schild-Generator** — Schilder zum Ausdrucken (PNG, 300 dpi), inkl. QR-Code und Foto
- **Home Assistant Integration** — Webhooks bei Ereignissen, REST-Sensor-Endpunkt, State-Push pro Tier
- **Mehrsprachig** — Deutsch und Englisch

## Installation (Home Assistant Add-on)

### Lokal (entwickeln/testen)

1. Ordner `reptile_manager` nach `/addons/` auf dem HA-Host kopieren (SSH oder Samba)
2. HA → Einstellungen → Add-ons → Add-on Store → ⋮ → Lokale Add-ons neu laden
3. „Reptile Manager" installieren (Build dauert 2–5 min)
4. Unter **Konfiguration** einstellen:
   - `admin_username` / `admin_password` — Login-Daten
   - `api_url` — falls Netzwerkfehler auftreten: `http://HA-IP:8000/api`
5. Starten — erscheint in der HA-Sidebar

### Daten

Alles liegt persistent in `/data/` des Add-ons (HA verwaltet das automatisch):
```
/data/reptile.db     — SQLite-Datenbank
/data/uploads/       — Tierfotos
/data/.secret_key    — Auto-generierter JWT-Schlüssel
```

## Home Assistant Sensoren

```yaml
# configuration.yaml
sensor:
  - platform: rest
    resource: http://DEIN_SERVER:8000/api/ha/sensors
    scan_interval: 300
    name: reptile_manager_data
    json_attributes:
      - summary
      - animals

template:
  - sensor:
      - name: "Reptilien aktiv"
        state: "{{ state_attr('sensor.reptile_manager_data', 'summary')['active_animals'] | default(0) }}"
        unit_of_measurement: "Tiere"
        icon: mdi:snake

      - name: "Reptilien nicht gefüttert"
        state: "{{ state_attr('sensor.reptile_manager_data', 'summary')['animals_not_fed'] | default(0) }}"
        unit_of_measurement: "Tiere"
        icon: mdi:food-off
```

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Datenbank | SQLite (persistent in `/data/`) |
| Frontend | Vue 3 + Tailwind CSS |
| Hosting | Docker (HA Supervisor) |

## Entwicklung ohne Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
DATABASE_URL=sqlite:///./reptile.db uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Backup

```bash
# Sicherung
cp /data/addons/data/local_reptile_manager/reptile.db ~/backup-reptile.db

# Oder per SSH
scp root@homeassistant:/data/addons/data/local_reptile_manager/reptile.db .
```

## Mitmachen

Pull Requests und Issues sind willkommen. Wer Übersetzungen für weitere Sprachen beitragen möchte — die Locale-Dateien liegen in `frontend/src/i18n/`.

## Lizenz

MIT — details in [LICENSE](LICENSE)
