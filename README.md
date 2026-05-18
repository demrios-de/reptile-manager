# 🦎 Reptile Manager

Ein selbst gehostetes Haltungsmanagement-Tool für Reptilien — als Home Assistant Add-on.

Ich hab das für mich selbst gebaut, weil mir keine bestehende Lösung gefallen hat die sowohl in HA integrierbar ist als auch offline läuft. Wer seine Haltung gerne dokumentiert und HA nutzt, wird damit hoffentlich genauso gut klarkommen.

---

## Installation über HA Add-on Store (empfohlen)

### Option A — Ein-Klick (My Home Assistant)

[![Repository hinzufügen](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fdemrios-de%2Freptile-manager)

Klick auf den Badge öffnet Home Assistant direkt mit vorausgefüllter Repository-URL.

### Option B — Manuell

1. HA → **Einstellungen → Add-ons → Add-on Store**
2. Oben rechts **⋮ → Repositories**
3. URL eintragen und hinzufügen:
   ```
   https://github.com/demrios-de/reptile-manager
   ```
4. Seite neu laden → **Reptile Manager** erscheint im Store
5. Installieren → Konfigurieren → Starten

### Nach der Installation

Unter **Konfiguration** im Add-on:

| Option | Bedeutung |
|---|---|
| `admin_username` | Login-Benutzername |
| `admin_password` | Login-Passwort (bitte ändern!) |
| `api_url` | Leer lassen oder `http://HA-IP:8000/api` bei Netzwerkfehlern |

Das Add-on erscheint dann automatisch in der HA-Sidebar.

---

## Manuelle Installation (ohne Repository)

Für alle die lieber SSH/Samba nutzen:

1. Dieses Repo als ZIP herunterladen → Ordner `reptile_manager` nach `/addons/` kopieren
2. HA → Add-on Store → **⋮ → Lokale Add-ons neu laden**
3. Reptile Manager installieren

---

## Was es kann

- **Tierverwaltung** — Art, Morph, Geschlecht, Herkunft, Foto, eigene Tiernummer (ID)
- **Fütterungsprotokoll** — Futterart, -größe, Anzahl, live/TK, Akzeptanz
- **Individuelle Fütterungserinnerung** — Schwellwert pro Tier konfigurierbar, deaktivierbar
- **Häutungsprotokoll** — Vollständigkeit, Blauphase, Notizen  
- **Zucht** — Paare, Eiablage, Gelegegröße; Nachzucht direkt aus Zuchtereignis anlegen (auch 50+ Tiere)
- **Status** — Aktiv / Inaktiv / Verkauft
- **Haltungsbedingungen** — Temperatur, Luftfeuchtigkeit, Terrariengröße, Substrat, UV
- **Stammbaum** — Eltern-Kind-Beziehungen mit visueller Darstellung
- **Schild-Generator** — druckfertige Schilder (PNG, 300 dpi) inkl. Tierfoto, QR-Code, Haltungsinfos
- **Home Assistant Integration** — Webhooks bei Ereignissen, REST-Sensoren, Sidebar-Eintrag
- **Mehrsprachig** — Deutsch und Englisch, weitere Sprachen einfach ergänzbar

---

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

---

## Tech-Stack

| Komponente | Technologie |
|---|---|
| Backend | FastAPI (Python 3.12) |
| Datenbank | SQLite (persistent in `/data/`) |
| Frontend | Vue 3 + Tailwind CSS |
| Hosting | Docker (HA Supervisor) |

---

## Weitere Sprache hinzufügen

Anleitung in [`reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md`](reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md)

---

## Entwicklung

```bash
# Backend
cd reptile_manager/backend
pip install -r requirements.txt
DATABASE_URL=sqlite:///./dev.db uvicorn app.main:app --reload

# Frontend
cd reptile_manager/frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

---

## Mitmachen

Issues und PRs willkommen. Anleitung in [CONTRIBUTING.md](.github/CONTRIBUTING.md).

## Lizenz

[MIT](LICENSE) — demrios-de
