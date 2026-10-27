import { createElement } from '../../utils/dom.js';
import { SITE_CONFIG } from '../../data/site-config.js';
import { t, withLanguage } from '../../i18n/i18n.js';

// Alterna la posición vertical del texto para que la composición respire.
const SLIDE_ALIGNMENT = ['center', 'upper', 'lower', 'center', 'center'];

export function createHero() {
  const section = createElement('section', {
    class: 'hero immersive-hero',
    id: 'inicio',
    'aria-labelledby': 'hero-title'
  });

  const slides = SITE_CONFIG.home.slides;

  slides.forEach((slide, index) => {
    const slideEl = createElement('article', {
      class: [
        'hero-slide',
        `hero-slide--${SLIDE_ALIGNMENT[index] || 'center'}`,
        index === 0 ? 'is-active' : ''
      ],
      'data-slide-index': String(index)
    });

    const content = createElement('div', { class: 'hero-slide-content' });

    const meta = createElement('div', { class: 'hero-slide-meta' });
    const counter = createElement('span', { class: 'hero-slide-counter' }, [
      `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
    ]);
    const eyebrow = createElement('span', { class: 'hero-badge' }, [
      t(`home.slides.${slide.id}.eyebrow`)
    ]);
    meta.appendChild(counter);
    meta.appendChild(eyebrow);

    const titleTag = index === 0 ? 'h1' : 'h2';
    const titleAttributes = { class: 'hero-slide-title' };
    if (index === 0) titleAttributes.id = 'hero-title';
    const title = createElement(titleTag, titleAttributes, [
      t(`home.slides.${slide.id}.title`)
    ]);

    content.appendChild(meta);
    content.appendChild(title);

    if (slide.description) {
      content.appendChild(createElement('p', { class: 'hero-slide-desc' }, [
        t(`home.slides.${slide.id}.description`)
      ]));
    }

    if (slide.cta) {
      const actions = createElement('div', { class: 'hero-slide-actions' });
      const link = createElement('a', {
        class: 'btn btn-primary',
        href: withLanguage(slide.cta.href)
      }, [t('cta.build')]);
      actions.appendChild(link);
      content.appendChild(actions);
    }

    slideEl.appendChild(content);

    if (index === 0) {
      const scrollCue = createElement('div', {
        class: 'hero-scroll-cue',
        'aria-hidden': 'true'
      });
      scrollCue.appendChild(createElement('span', { class: 'hero-scroll-line' }));
      slideEl.appendChild(scrollCue);
    }

    section.appendChild(slideEl);
  });

  const progress = createElement('div', {
    class: 'hero-progress',
    'aria-hidden': 'true'
  });
  const progressBar = createElement('span', { class: 'hero-progress-bar' });
  progress.appendChild(progressBar);
  section.appendChild(progress);
  section.progressBar = progressBar;

  return section;
}

export function updateHeroProgress(section, progress) {
  if (!section || !section.progressBar) return;
  const clamped = Math.max(0, Math.min(1, progress));
  section.progressBar.style.transform = `scaleY(${Math.max(0.015, clamped)})`;
}

/**
 * Marca la diapositiva centrada. No oculta contenido:
 * las secciones siguen siendo accesibles mientras se desplazan.
 */
export function setActiveSlide(section, activeIndex) {
  if (!section) return;
  const slides = section.querySelectorAll('.hero-slide');
  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === activeIndex);
  });
}

export default createHero;
