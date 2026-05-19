# 🦎 Reptile Manager — Home Assistant Add-on

## Installation als lokales Add-on

### Schritt 1 — Dateien auf den HA-Host kopieren

Verbinde dich per SSH oder Samba mit deiner HA-Instanz und kopiere den
Ordner `reptile_manager` in das lokale Add-on Verzeichnis:

```
/addons/
└── reptile_manager/     ← dieser Ordner
    ├── config.yaml
    ├── Dockerfile
    ├── run.sh
    ├── supervisord.conf
    ├── nginx.conf
    ├── backend/
    └── frontend/
```

**Per SCP:**
```bash
scp -r reptile-manager-addon/ root@homeassistant.local:/addons/reptile_manager
```

**Per Samba:** `\\homeassistant\addons\` → Ordner `reptile_manager` anlegen und Inhalt reinkopieren.

---

### Schritt 2 — Add-on installieren

1. HA Frontend → **Einstellungen → Add-ons → Add-on Store**
2. Oben rechts: **⋮ → Lokale Add-ons neu laden**
3. Jetzt erscheint **Reptile Manager** unter „Lokale Add-ons"
4. Anklicken → **Installieren** (Build dauert 2–5 Minuten)

---

### Schritt 3 — Konfigurieren

Nach der Installation → Reiter **Konfiguration**:

| Option | Beschreibung | Standard |
|---|---|---|
| `admin_username` | Login-Benutzername | `admin` |
| `admin_password` | Login-Passwort | `admin123` |
| `secret_key` | JWT Secret (leer = wird automatisch generiert) | *(leer)* |

→ **Speichern** → **Starten**

---

### Schritt 4 — Öffnen

- **Sidebar**: Reptile Manager erscheint automatisch in der HA-Sidebar (Ingress)
- **Direkt**: `http://homeassistant.local:8099`

---

## Datenspeicherung

Alle Daten liegen persistent in `/data/` des Add-ons (HA verwaltet das automatisch):

```
/data/
├── reptile.db       ← SQLite Datenbank
├── uploads/         ← Tierfotos
│   └── animals/
└── .secret_key      ← Auto-generierter JWT Key
```

## Update

Bei einem Update einfach die Dateien in `/addons/reptile_manager/` ersetzen
und das Add-on **Neu bauen** → **Neu starten**.

## Home Assistant Sensoren

Der Endpunkt `/api/ha/sensors` ist öffentlich (kein Login nötig), damit HA ihn
pollen kann. In `configuration.yaml`:

```yaml
rest:
  - resource: http://localhost:8099/api/ha/sensors
    scan_interval: 300
    sensor:
      - name: "Reptilien gesamt"
        value_template: "{{ value_json.summary.active_animals }}"
        icon: mdi:snake
      - name: "Reptilien nicht gefüttert (7d)"
        value_template: "{{ value_json.summary.animals_not_fed_7days }}"
        icon: mdi:food-off
```
