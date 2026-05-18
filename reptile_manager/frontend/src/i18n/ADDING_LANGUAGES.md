# Neue Sprache hinzufügen

So einfach geht's:

## Schritt 1 – Übersetzungsdatei erstellen

`src/i18n/es.js` anlegen und an `de.js` orientieren:

```js
export default {
  nav: {
    dashboard: 'Inicio',
    animals: 'Animales',
    // ...
  },
  // alle anderen Schlüssel aus de.js ergänzen
}
```

Fehlende Schlüssel fallen automatisch auf Deutsch zurück (fallbackLocale: 'de').

## Schritt 2 – In index.js registrieren

```js
import es from './es'

export const languages = {
  de: { name: 'Deutsch',  flag: '🇩🇪' },
  en: { name: 'English',  flag: '🇬🇧' },
  es: { name: 'Español',  flag: '🇪🇸' },  // <-- neu
}

const i18n = createI18n({
  // ...
  messages: { de, en, es },  // <-- hier auch
})
```

## Fertig

Die neue Sprache erscheint automatisch in der Sprachauswahl unter Einstellungen.
