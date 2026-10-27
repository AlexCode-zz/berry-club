import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG } from '../../data/site-config.js';
import { t } from '../../i18n/i18n.js';

export function createBenefits() {
  const section = createElement('section', {
    class: 'benefits',
    'aria-labelledby': 'benefits-title'
  });
  const container = createElement('div', { class: 'container' });

  const title = createElement('h2', { class: 'section-title', id: 'benefits-title' }, [
    t('home.benefits.title')
  ]);

  const grid = createElement('div', { class: 'benefits-grid' });

  SITE_CONFIG.home.benefits.forEach(benefit => {
    const card = createElement('article', { class: 'benefit-card' });
    const h3 = createElement('h3', { class: 'benefit-title' }, [
      t(`home.benefits.${benefit.id}.title`)
    ]);
    const p = createElement('p', { class: 'benefit-desc' }, [
      t(`home.benefits.${benefit.id}.description`)
    ]);
    card.appendChild(h3);
    card.appendChild(p);
    grid.appendChild(card);
  });

  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);

  return section;
}

export default createBenefits;
