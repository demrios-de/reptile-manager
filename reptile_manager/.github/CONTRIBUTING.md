# Beitragen

Danke für dein Interesse. PRs und Issues sind willkommen.

## Entwicklungsumgebung aufsetzen

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

DATABASE_URL=sqlite:///./dev.db \
FIRST_ADMIN_USERNAME=admin \
FIRST_ADMIN_PASSWORD=admin123 \
SECRET_KEY=dev-key-not-for-production \
uvicorn app.main:app --reload
```

API dann unter http://localhost:8000/api/docs

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

## Neue Sprache hinzufügen

Anleitung in `frontend/src/i18n/ADDING_LANGUAGES.md`

## Code-Stil

Nichts Besonderes – Python mit Typhinweisen wo es Sinn ergibt, Vue 3 Composition API.
Commits beschreiben was sich geändert hat, nicht warum (das geht in die PR-Beschreibung).

## Was gerne gesehen wird

- Bugfixes mit Reproduktionsschritten im Issue
- Übersetzungen (fehlende Sprachen oder Korrekturen)
- Verbesserungen die ich selbst wahrscheinlich irgendwann gebraucht hätte

## Was eher nicht passt

- Komplette Architekturumbauten ohne vorherige Diskussion
- Abhängigkeiten die nur für ein kleines Feature gebraucht werden
