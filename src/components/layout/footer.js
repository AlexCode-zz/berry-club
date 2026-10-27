import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG } from '../../data/site-config.js';
import { t, withLanguage } from '../../i18n/i18n.js';

export function createFooter() {
  const footer = createElement('footer', { class: 'site-footer' });
  const container = createElement('div', { class: 'container footer-container' });

  const brand = createElement('div', { class: 'footer-brand' });
  const logo = createElement('div', { class: 'footer-logo' }, [SITE_CONFIG.brandName]);
  const demoNote = createElement('p', { class: 'footer-demo' }, [t('demo.note')]);
  const portfolioBadge = createElement('p', { class: 'footer-portfolio' }, [
    t('portfolio.badge')
  ]);
  brand.appendChild(logo);
  brand.appendChild(demoNote);
  brand.appendChild(portfolioBadge);

  const links = createElement('div', { class: 'footer-links' });
  const linksTitle = createElement('div', { class: 'footer-links-title' }, [t('footer.links')]);
  const linksList = createElement('ul', { class: 'footer-links-list' });

  [
    { text: t('nav.home'), href: withLanguage('index.html') },
    { text: t('nav.customize'), href: withLanguage('pedido.html') },
    { text: t('cart.open'), href: withLanguage('carrito.html') }
  ].forEach(item => {
    const li = createElement('li');
    const link = createElement('a', { href: item.href }, [item.text]);
    li.appendChild(link);
    linksList.appendChild(li);
  });

  links.appendChild(linksTitle);
  links.appendChild(linksList);

  container.appendChild(brand);
  container.appendChild(links);

  const bottom = createElement('div', { class: 'footer-bottom' });
  bottom.appendChild(createElement('p', {}, [
    t('footer.copyright', {
      year: new Date().getFullYear(),
      brand: SITE_CONFIG.brandName,
      note: t('demo.note')
    })
  ]));

  footer.appendChild(container);
  footer.appendChild(bottom);

  return footer;
}

export default createFooter;
