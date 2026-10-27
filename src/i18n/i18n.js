import { es } from './es.js';
import { en } from './en.js';

const DICTIONARIES = { es, en };
const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'berry-club-language';
const listeners = new Set();

let currentLanguage = DEFAULT_LANGUAGE;
let initialized = false;

function canUseStorage() {
  try {
    const probe = '__berry_storage_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch (error) {
    return false;
  }
}

function readStoredLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function persistLanguage(language) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {
    // El idioma sigue funcionando en memoria aunque el almacenamiento no esté disponible.
  }
}

function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

function getPathValue(object, path) {
  return String(path)
    .split('.')
    .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), object);
}

function interpolate(value, vars) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => (
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  ));
}

/**
 * Devuelve una cadena traducida. Si una clave falta en el idioma activo,
 * usa el español como respaldo para no mostrar una etiqueta vacía.
 */
export function t(key, vars = {}) {
  const dictionary = DICTIONARIES[currentLanguage] || DICTIONARIES[DEFAULT_LANGUAGE];
  const value = getPathValue(dictionary, key) ?? getPathValue(DICTIONARIES[DEFAULT_LANGUAGE], key);

  if (value === undefined) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[i18n] Missing translation: ${key}`);
    }
    return key;
  }

  return interpolate(value, vars);
}

export function getLanguage() {
  return currentLanguage;
}

/**
 * Selecciona la clave singular o plural según el número indicado.
 */
export function tCount(singularKey, pluralKey, count, vars = {}) {
  return t(Number(count) === 1 ? singularKey : pluralKey, { ...vars, count });
}

export function getLocale() {
  return currentLanguage === 'en' ? 'en-US' : 'es-US';
}

export function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

function getPageId() {
  const declaredPage = document.body?.dataset?.page;
  if (declaredPage === 'home' || declaredPage === 'order' || declaredPage === 'cart') {
    return declaredPage;
  }

  const path = window.location.pathname;
  if (path.endsWith('carrito.html') || path.endsWith('/carrito')) return 'cart';
  return path.endsWith('pedido.html') || path.endsWith('/pedido') ? 'order' : 'home';
}

function updateMetaTag(selector, content) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute('content', content);
}

export function applyDocumentLanguage() {
  if (typeof document === 'undefined') return;

  const pageId = getPageId();
  document.documentElement.lang = currentLanguage;
  document.documentElement.dataset.lang = currentLanguage;
  document.title = t(`meta.${pageId}.title`);

  const description = t(`meta.${pageId}.description`);
  updateMetaTag('meta[name="description"]', description);
  updateMetaTag('meta[property="og:title"]', t(`meta.${pageId}.title`));
  updateMetaTag('meta[property="og:description"]', description);
}

export function setLanguage(language, { persist = true, updateUrl = true, emit = true } = {}) {
  const nextLanguage = normalizeLanguage(language);
  const changed = nextLanguage !== currentLanguage;

  currentLanguage = nextLanguage;

  if (persist) persistLanguage(currentLanguage);

  if (updateUrl && window.history?.replaceState) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', currentLanguage);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch (error) {
      // Si el navegador no permite modificar la URL, el idioma sigue activo en memoria.
    }
  }

  applyDocumentLanguage();

  if (changed && emit) {
    listeners.forEach((listener) => {
      try {
        listener(currentLanguage);
      } catch (error) {
        console.error('[i18n] Language listener failed', error);
      }
    });
  }

  return currentLanguage;
}

export function initI18n() {
  if (initialized) {
    applyDocumentLanguage();
    return currentLanguage;
  }

  initialized = true;

  let urlLanguage = null;
  try {
    urlLanguage = new URL(window.location.href).searchParams.get('lang');
  } catch (error) {
    urlLanguage = null;
  }

  const storedLanguage = readStoredLanguage();
  const initialLanguage = isSupportedLanguage(urlLanguage)
    ? urlLanguage
    : (isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE);

  currentLanguage = initialLanguage;

  // La URL de un enlace compartido tiene prioridad y también se conserva.
  if (isSupportedLanguage(urlLanguage) || isSupportedLanguage(storedLanguage)) {
    persistLanguage(initialLanguage);
  }

  // Un `lang` inválido no debe quedar en la URL contradiciendo el idioma activo.
  if (urlLanguage !== null && !isSupportedLanguage(urlLanguage) && window.history?.replaceState) {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', initialLanguage);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    } catch (error) {
      // La interfaz ya está en el idioma correcto aunque la URL no se pueda limpiar.
    }
  }

  applyDocumentLanguage();
  return currentLanguage;
}

export function subscribeToLanguage(listener) {
  if (typeof listener !== 'function') return () => {};
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Añade el idioma actual a un enlace interno para conservarlo incluso cuando
 * localStorage no esté disponible. No modifica enlaces externos ni anclas.
 */
export function withLanguage(href) {
  if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return href;

  try {
    const url = new URL(href, window.location.href);
    url.searchParams.set('lang', currentLanguage);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (error) {
    return href;
  }
}

export function hasStorage() {
  return canUseStorage();
}
