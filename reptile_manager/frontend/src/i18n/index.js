import { ref } from 'vue'
import de from './de'
import en from './en'

/*
 * Eigene Mini-i18n — kein externes Paket nötig.
 *
 * Neue Sprache hinzufügen:
 * 1. src/i18n/es.js anlegen (an de.js orientieren)
 * 2. Hier importieren: import es from './es'
 * 3. In 'messages' und 'languages' eintragen
 */

const messages = { de, en }

export const languages = {
  de: { name: 'Deutsch',  flag: '🇩🇪' },
  en: { name: 'English',  flag: '🇬🇧' },
}

export const locale = ref(localStorage.getItem('locale') || 'de')

function get(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

export function setLocale(lang) {
  if (!languages[lang]) return
  locale.value = lang
  localStorage.setItem('locale', lang)
  document.documentElement.lang = lang
}

export function useI18n() {
  function t(key) {
    // Accessing locale.value makes Vue track reactivity automatically
    return get(messages[locale.value], key)
        ?? get(messages.de, key)
        ?? key
  }
  return { t, locale }
}

// Dummy Vue plugin — keeps import in main.js harmless
export default { install() {} }
