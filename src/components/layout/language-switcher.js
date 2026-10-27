import { createElement } from '../../utils/dom.js';
import { getLanguage, setLanguage, t } from '../../i18n/i18n.js';

function createLanguageButton(language, label, accessibleLabel) {
  const isActive = getLanguage() === language;
  const button = createElement('button', {
    type: 'button',
    class: `language-option${isActive ? ' is-active' : ''}`,
    'aria-pressed': String(isActive),
    'aria-label': accessibleLabel,
    lang: language
  }, [label]);

  button.addEventListener('click', () => {
    setLanguage(language);
  });

  return button;
}

/**
 * Selector ES | EN del encabezado. Usa botones nativos para que funcione con
 * teclado, lectores de pantalla y controles táctiles sin depender de JS de terceros.
 */
export function createLanguageSwitcher() {
  const group = createElement('div', {
    class: 'language-switch',
    role: 'group',
    'aria-label': t('language.label')
  });

  const spanish = createLanguageButton('es', 'ES', t('language.switchToSpanish'));
  const divider = createElement('span', { class: 'language-divider', 'aria-hidden': 'true' }, ['|']);
  const english = createLanguageButton('en', 'EN', t('language.switchToEnglish'));

  group.append(spanish, divider, english);
  return group;
}

export default createLanguageSwitcher;
