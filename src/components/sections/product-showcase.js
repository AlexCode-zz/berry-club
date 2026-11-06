import { createElement } from '../../utils/dom.js';
import { SIZES } from '../../data/sizes.js';
import { formatCurrency } from '../../utils/currency.js';
import { createButton } from '../ui/button.js';
import { cupIcon } from '../ui/icons.js';
import { t, withLanguage } from '../../i18n/i18n.js';

const CUP_HEIGHTS = {
  mini: 54,
  clasico: 70,
  grande: 88
};

export function createProductShowcase() {
  const section = createElement('section', {
    class: 'sizes-section',
    id: 'tamanos',
    tabindex: '-1',
    'aria-labelledby': 'sizes-title'
  });
  const container = createElement('div', { class: 'container' });

  const head = createElement('div', { class: 'section-head' });
  const copy = createElement('div', { class: 'section-head-copy' });
  const kicker = createElement('p', { class: 'section-kicker' }, [
    t('home.showcase.kicker')
  ]);
  const title = createElement('h2', { class: 'section-title', id: 'sizes-title' }, [
    t('home.showcase.title')
  ]);
  const subtitle = createElement('p', { class: 'section-subtitle' }, [
    t('home.showcase.subtitle')
  ]);

  copy.appendChild(kicker);
  copy.appendChild(title);
  copy.appendChild(subtitle);
  head.appendChild(copy);

  const menu = createElement('div', { class: 'sizes-menu' });

  SIZES.forEach((size) => {
    const isPopular = size.id === 'clasico';
    const row = createElement('article', {
      class: ['size-row', isPopular ? 'size-row--popular' : '']
    });

    const media = createElement('div', {
      class: 'size-row-media',
      'aria-hidden': 'true'
    });
    media.innerHTML = cupIcon(CUP_HEIGHTS[size.id] || 64);

    const copyEl = createElement('div', { class: 'size-row-copy' });
    const heading = createElement('div', { class: 'size-row-heading' });
    const name = createElement('h3', { class: 'size-row-title' }, [
      t(`sizes.${size.id}.label`)
    ]);
    heading.appendChild(name);

    if (isPopular) {
      heading.appendChild(createElement('span', { class: 'size-row-tag' }, [
        t('home.showcase.popular')
      ]));
    }

    const desc = createElement('p', { class: 'size-row-desc' }, [
      t(`sizes.${size.id}.description`)
    ]);
    copyEl.appendChild(heading);
    copyEl.appendChild(desc);

    const price = createElement('div', { class: 'size-row-price' });
    price.appendChild(createElement('span', { class: 'size-row-price-label' }, [
      t('home.showcase.priceLabel')
    ]));
    price.appendChild(createElement('span', { class: 'size-row-price-value' }, [
      formatCurrency(size.priceCents)
    ]));

    const btn = createButton({
      text: t('cta.select'),
      variant: 'primary',
      className: 'size-row-btn',
      onClick: () => {
        const target = new URL(withLanguage('pedido.html'), window.location.href);
        target.searchParams.set('tamano', size.id);
        window.location.href = `${target.pathname}${target.search}${target.hash}`;
      }
    });

    row.appendChild(media);
    row.appendChild(copyEl);
    row.appendChild(price);
    row.appendChild(btn);
    menu.appendChild(row);
  });

  container.appendChild(head);
  container.appendChild(menu);
  section.appendChild(container);

  return section;
}

export default createProductShowcase;
