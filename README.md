# 🦎 Reptile Manager

**[Deutsch](#deutsch) | [English](#english)**

---

<a name="deutsch"></a>
## Deutsch

Ein selbst gehostetes Haltungsmanagement-Tool für Reptilien — als Home Assistant Add-on.

Ich hab das für mich selbst gebaut, weil mir keine bestehende Lösung gefallen hat die sowohl in HA integrierbar ist als auch offline läuft. Wer seine Haltung gerne dokumentiert und HA nutzt, wird damit hoffentlich genauso gut klarkommen.

### Installation über HA Add-on Store (empfohlen)

**Option A — Ein-Klick:**

[![Repository hinzufügen](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fdemrios-de%2Freptile-manager)

**Option B — Manuell:**

1. HA → **Einstellungen → Add-ons → Add-on Store**
2. Oben rechts **⋮ → Repositories**
3. URL eintragen:
   ```
   https://github.com/demrios-de/reptile-manager
   ```
4. Seite neu laden → **Reptile Manager** erscheint im Store
5. Installieren → Konfigurieren → Starten

### Manuelle Installation (ohne Repository)

1. Dieses Repo als ZIP herunterladen → Ordner `reptile_manager` nach `/addons/` kopieren
2. HA → Add-on Store → **⋮ → Lokale Add-ons neu laden**
3. Reptile Manager installieren

### Konfiguration

| Option | Bedeutung |
|---|---|
| `admin_username` | Login-Benutzername |
| `admin_password` | Login-Passwort (bitte ändern!) |
| `api_url` | Leer lassen oder `http://HA-IP:8000/api` bei Netzwerkfehlern |

### Was es kann

- **Tierverwaltung** — Art, Morph, Geschlecht, Herkunft, Foto, eigene Tiernummer
- **Fütterungsprotokoll** — Futterart, -größe, Anzahl, live/TK, Akzeptanz
- **Individuelle Fütterungserinnerung** — Schwellwert pro Tier, deaktivierbar
- **Häutungsprotokoll** — Vollständigkeit, Blauphase, Notizen
- **Zucht** — Paare, Eiablage, Gelegegröße; Nachzucht direkt anlegen (auch 50+ Tiere)
- **Status** — Aktiv / Inaktiv / Verkauft
- **Haltungsbedingungen** — Temperatur, Luftfeuchtigkeit, Terrariengröße, Substrat, UV
- **Stammbaum** — Eltern-Kind-Beziehungen mit visueller Darstellung
- **Schild-Generator** — druckfertige Schilder (PNG, 300 dpi) inkl. Tierfoto, QR-Code
- **Home Assistant Integration** — Webhooks, REST-Sensoren, Sidebar-Eintrag
- **Mehrsprachig** — Deutsch und Englisch, weitere Sprachen einfach ergänzbar

### HA Sensoren

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

### Datenspeicherung

```
/mnt/data/supervisor/addons/data/local_reptile_manager/
├── reptile.db      ← Datenbank
├── uploads/        ← Tierfotos
└── .secret_key     ← JWT-Schlüssel
```

Backup:
```bash
cp /mnt/data/supervisor/addons/data/local_reptile_manager/reptile.db \
   ~/reptile-backup-$(date +%Y%m%d).db
```

### Neue Sprache hinzufügen

Anleitung in [`reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md`](reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md)

### Mitmachen

Issues und PRs willkommen — Anleitung in [CONTRIBUTING.md](.github/CONTRIBUTING.md).

### Lizenz

[MIT](LICENSE) — demrios-de

---

<a name="english"></a>
## English

A self-hosted reptile husbandry management tool — as a Home Assistant Add-on.

I built this because I couldn't find anything that was both properly integrated with HA and worked fully offline. If you like keeping records of your animals and use Home Assistant, this might be useful to you too.

### Installation via HA Add-on Store (recommended)

**Option A — One-click:**

[![Add Repository](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Fdemrios-de%2Freptile-manager)

**Option B — Manual:**

1. HA → **Settings → Add-ons → Add-on Store**
2. Top right **⋮ → Repositories**
3. Enter URL:
   ```
   https://github.com/demrios-de/reptile-manager
   ```
4. Reload page → **Reptile Manager** appears in the store
5. Install → Configure → Start

### Manual installation (without repository)

1. Download this repo as ZIP → copy folder `reptile_manager` to `/addons/`
2. HA → Add-on Store → **⋮ → Reload local add-ons**
3. Install Reptile Manager

### Configuration

| Option | Description |
|---|---|
| `admin_username` | Login username |
| `admin_password` | Login password (please change!) |
| `api_url` | Leave empty or set `http://HA-IP:8000/api` if network errors occur |

### Features

- **Animal management** — species, morph, sex, origin, photo, custom tracking ID
- **Feeding log** — prey type, size, count, live/frozen, acceptance
- **Individual feeding reminders** — configurable threshold per animal, can be disabled
- **Shedding log** — completeness, blue phase, notes
- **Breeding** — pairs, egg laying, clutch size; add offspring directly (50+ at once)
- **Status** — Active / Inactive / Sold
- **Husbandry conditions** — temperature, humidity, enclosure size, substrate, UV
- **Family tree** — parent-child relationships with visual display
- **Label generator** — print-ready labels (PNG, 300 dpi) with animal photo and QR code
- **Home Assistant integration** — webhooks, REST sensors, sidebar entry
- **Multilingual** — German and English, more languages easily added

### HA Sensors

```yaml
# configuration.yaml
sensor:
  - platform: rest
    resource: http://YOUR_SERVER:8000/api/ha/sensors
    scan_interval: 300
    name: reptile_manager_data
    json_attributes:
      - summary
      - animals

template:
  - sensor:
      - name: "Reptiles active"
        state: "{{ state_attr('sensor.reptile_manager_data', 'summary')['active_animals'] | default(0) }}"
        unit_of_measurement: "animals"
        icon: mdi:snake
      - name: "Reptiles not fed"
        state: "{{ state_attr('sensor.reptile_manager_data', 'summary')['animals_not_fed'] | default(0) }}"
        unit_of_measurement: "animals"
        icon: mdi:food-off
```

### Data storage

```
/mnt/data/supervisor/addons/data/local_reptile_manager/
├── reptile.db      ← database
├── uploads/        ← animal photos
└── .secret_key     ← JWT key
```

Backup:
```bash
cp /mnt/data/supervisor/addons/data/local_reptile_manager/reptile.db \
   ~/reptile-backup-$(date +%Y%m%d).db
```

### Adding a new language

See [`reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md`](reptile_manager/frontend/src/i18n/ADDING_LANGUAGES.md)

### Contributing

Issues and PRs welcome — see [CONTRIBUTING.md](.github/CONTRIBUTING.md).

### License

[MIT](LICENSE) — demrios-de
