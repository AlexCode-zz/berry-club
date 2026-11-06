import { createElement } from '../../utils/dom.js';
import { t } from '../../i18n/i18n.js';

// Banda de caramelo entre la portada y la carta. Es decorativa: el texto
// repetido no aporta información nueva, así que se oculta a lectores de pantalla.
export function createMarquee() {
  const band = createElement('div', {
    class: 'marquee',
    'aria-hidden': 'true'
  });
  const track = createElement('div', { class: 'marquee-track' });
  const phrase = t('home.marquee');

  for (let groupIndex = 0; groupIndex < 2; groupIndex += 1) {
    const group = createElement('div', { class: 'marquee-group' });

    for (let itemIndex = 0; itemIndex < 4; itemIndex += 1) {
      group.appendChild(createElement('span', { class: 'marquee-item' }, [phrase]));
      group.appendChild(createElement('span', { class: 'marquee-star' }, ['✦']));
    }

    track.appendChild(group);
  }

  band.appendChild(track);
  return band;
}

export default createMarquee;
