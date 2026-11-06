import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG } from '../../data/site-config.js';
import { strawberryIcon, creamIcon, sprinklesIcon } from '../ui/icons.js';
import { t } from '../../i18n/i18n.js';

const BENEFIT_ICONS = {
  fresas: strawberryIcon,
  crema: creamIcon,
  complementos: sprinklesIcon
};

export function createBenefits() {
  const section = createElement('section', {
    class: 'benefits',
    'aria-labelledby': 'benefits-title'
  });
  const container = createElement('div', { class: 'container' });

  const head = createElement('div', { class: 'section-head' });
  const copy = createElement('div', { class: 'section-head-copy' });

  const title = createElement('h2', { class: 'section-title', id: 'benefits-title' }, [
    t('home.benefits.title')
  ]);
  const subtitle = createElement('p', { class: 'section-subtitle' }, [
    t('home.benefits.subtitle')
  ]);

  copy.appendChild(title);
  copy.appendChild(subtitle);
  head.appendChild(copy);

  const grid = createElement('div', { class: 'benefits-grid' });

  SITE_CONFIG.home.benefits.forEach((benefit) => {
    const card = createElement('article', {
      class: ['benefit-card', `benefit-card--${benefit.id}`]
    });

    const icon = createElement('div', {
      class: 'benefit-icon',
      'aria-hidden': 'true'
    });
    const iconFn = BENEFIT_ICONS[benefit.id] || strawberryIcon;
    icon.innerHTML = iconFn(52);

    const h3 = createElement('h3', { class: 'benefit-title' }, [
      t(`home.benefits.${benefit.id}.title`)
    ]);
    const p = createElement('p', { class: 'benefit-desc' }, [
      t(`home.benefits.${benefit.id}.description`)
    ]);

    card.appendChild(icon);
    card.appendChild(h3);
    card.appendChild(p);
    grid.appendChild(card);
  });

  container.appendChild(head);
  container.appendChild(grid);
  section.appendChild(container);

  return section;
}

export default createBenefits;
