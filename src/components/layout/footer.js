import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG, hasValidWhatsAppNumber } from '../../data/site-config.js';
import { strawberryIcon, chatIcon } from '../ui/icons.js';
import { t, withLanguage } from '../../i18n/i18n.js';

export function createFooter() {
  const footer = createElement('footer', { class: 'site-footer' });
  const container = createElement('div', { class: 'container footer-container' });

  const brand = createElement('div', { class: 'footer-brand' });
  const logo = createElement('a', {
    class: 'footer-logo',
    href: withLanguage('index.html')
  });
  const logoMark = createElement('span', {
    class: 'logo-mark',
    'aria-hidden': 'true'
  });
  logoMark.innerHTML = strawberryIcon(34);
  logo.append(logoMark, createElement('span', { class: 'logo-wordmark' }, [SITE_CONFIG.brandName]));

  const tagline = createElement('p', { class: 'footer-tagline' }, [
    t('footer.tagline')
  ]);
  const demoNote = createElement('p', { class: 'footer-demo' }, [t('demo.note')]);

  brand.appendChild(logo);
  brand.appendChild(tagline);
  brand.appendChild(demoNote);

  const links = createElement('div', { class: 'footer-links' });
  const linksTitle = createElement('h2', { class: 'footer-col-title' }, [t('footer.links')]);
  const linksList = createElement('ul', { class: 'footer-links-list' });

  [
    { text: t('nav.home'), href: withLanguage('index.html') },
    { text: t('nav.sizes'), href: withLanguage('index.html#tamanos') },
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

  const business = createElement('div', { class: 'footer-business' });
  business.appendChild(createElement('h2', { class: 'footer-business-title' }, [
    t('footer.businessTitle')
  ]));
  business.appendChild(createElement('p', { class: 'footer-business-text' }, [
    t('footer.businessText')
  ]));

  if (hasValidWhatsAppNumber()) {
    const number = SITE_CONFIG.contact.whatsappNumber.trim();
    const message = encodeURIComponent(t('whatsapp.developerMessage'));
    const cta = createElement('a', {
      class: 'btn btn-secondary',
      href: `https://wa.me/${number}?text=${message}`,
      target: '_blank',
      rel: 'noopener noreferrer'
    });
    const ctaIcon = createElement('span', {
      class: 'btn-icon',
      'aria-hidden': 'true'
    });
    ctaIcon.innerHTML = chatIcon(18);
    cta.append(ctaIcon, createElement('span', {}, [t('footer.businessCta')]));
    business.appendChild(cta);
  }

  container.appendChild(brand);
  container.appendChild(links);
  container.appendChild(business);

  const bottom = createElement('div', { class: 'container footer-bottom' });
  bottom.appendChild(createElement('p', {}, [
    t('footer.copyright', {
      year: new Date().getFullYear(),
      brand: SITE_CONFIG.brandName,
      note: t('demo.note')
    })
  ]));
  bottom.appendChild(createElement('p', { class: 'footer-note' }, [
    t('portfolio.badge')
  ]));

  footer.appendChild(container);
  footer.appendChild(bottom);

  return footer;
}

export default createFooter;
