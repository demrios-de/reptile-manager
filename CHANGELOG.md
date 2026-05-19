# Changelog

## [1.1.1] – 2025-06-01

### Fixed
- Login page was inaccessible after update (removed vue-i18n dependency, replaced with custom implementation requiring no external package)
- Printing labels on A4 generated 5 blank pages + 1 with content (print CSS completely rewritten)
- Breeding page showed blank screen when opening the form (females() function was missing after refactoring)
- Feeding reminder showed warning even when disabled for that animal
- AnimalBulkCreate schema was defined before AnimalCreate causing Pydantic v2 startup errors
- Removed duplicate frontend files that prevented clean Vite builds

### Improved
- Label generator: two separate print buttons (label size / on A4)
- Label generator: QR code target now selectable — Browser, HA Companion App (opens directly to animal), or custom link
- Language selector now a dropdown with flags instead of a simple toggle

---

## [1.1.0] – 2025-05-28

### Added
- Husbandry conditions per animal (temperature, humidity, enclosure size, substrate, UV)
- Label generator: animal photo on label
- Label generator: husbandry conditions selectable for label
- Animal status: Active / Inactive / Sold
- Animal tracking ID (auto-assigned, manually overridable)
- Multilingual UI: German and English, additional languages easy to add
- Bulk offspring creation from breeding event (1–500 animals at once)
- Per-animal feeding reminder with individual threshold, can be disabled
- Dashboard: click on warning opens overview of animals with overdue feedings
- Mobile design: sidebar as overlay, responsive tables
- Editing an animal no longer accidentally overwrites existing uploaded photos
- HA YAML configuration updated to modern sensor structure

### Fixed
- Breeding page crashed when a parent animal had been deleted
- Photo not displayed after upload (URL resolution for direct API port)
- Sex dropdown showed garbled characters instead of options

---

## [1.0.0] – 2025-05-20

Initial release.

### Features
- Animal management with photo, morph, origin, parents
- Feeding log (prey type, size, acceptance)
- Shedding log (completeness, blue phase)
- Breeding (pairs, egg laying, clutch size)
- Family tree view
- Label generator (PNG, QR code, 8 color themes)
- Home Assistant integration (webhooks, REST sensors)
- JWT authentication
