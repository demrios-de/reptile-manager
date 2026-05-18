import { createI18n } from 'vue-i18n'
import de from './de'
import en from './en'

/*
 * Weitere Sprachen hinzufügen:
 *
 * 1. Neue Datei anlegen: src/i18n/es.js  (an de.js orientieren)
 * 2. Hier importieren:   import es from './es'
 * 3. In 'languages' eintragen mit Name und Flagge
 * 4. In 'messages' eintragen
 *
 * Fertig – die Sprachauswahl in den Einstellungen erscheint automatisch.
 */

export const languages = {
  de: { name: 'Deutsch',  flag: '🇩🇪' },
  en: { name: 'English',  flag: '🇬🇧' },
  // Beispiele für weitere Sprachen:
  // es: { name: 'Español', flag: '🇪🇸' },
  // fr: { name: 'Français', flag: '🇫🇷' },
  // nl: { name: 'Nederlands', flag: '🇳🇱' },
}

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'de',
  fallbackLocale: 'de',
  messages: { de, en },
})

export default i18n

export function setLocale(lang) {
  if (!languages[lang]) return
  i18n.global.locale.value = lang
  localStorage.setItem('locale', lang)
  document.documentElement.lang = lang
}

export function currentLocale() {
  return i18n.global.locale.value
}
