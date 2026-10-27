import { createElement } from '../../utils/dom.js';
import { SIZES } from '../../data/sizes.js';
import { formatCurrency } from '../../utils/currency.js';
import { createButton } from '../ui/button.js';
import { t, withLanguage } from '../../i18n/i18n.js';

export function createProductShowcase() {
  const section = createElement('section', {
    class: 'sizes-section',
    id: 'tamanos',
    tabindex: '-1',
    'aria-labelledby': 'sizes-title'
  });
  const container = createElement('div', { class: 'container' });

  const title = createElement('h2', { class: 'section-title', id: 'sizes-title' }, [
    t('home.showcase.title')
  ]);
  const subtitle = createElement('p', { class: 'section-subtitle' }, [
    t('home.showcase.subtitle')
  ]);

  const grid = createElement('div', { class: 'sizes-grid' });

  SIZES.forEach(size => {
    const card = createElement('article', { class: 'size-card' });
    const name = createElement('h3', { class: 'size-card-title' }, [t(`sizes.${size.id}.label`)]);
    const desc = createElement('p', { class: 'size-card-desc' }, [t(`sizes.${size.id}.description`)]);
    const price = createElement('div', { class: 'size-card-price' }, [formatCurrency(size.priceCents)]);

    const btn = createButton({
      text: t('cta.select'),
      variant: 'primary',
      onClick: () => {
        const target = new URL(withLanguage('pedido.html'), window.location.href);
        target.searchParams.set('tamano', size.id);
        window.location.href = `${target.pathname}${target.search}${target.hash}`;
      }
    });

    card.appendChild(name);
    card.appendChild(desc);
    card.appendChild(price);
    card.appendChild(btn);
    grid.appendChild(card);
  });

  container.appendChild(title);
  container.appendChild(subtitle);
  container.appendChild(grid);

  section.appendChild(container);

  return section;
}

export default createProductShowcase;
