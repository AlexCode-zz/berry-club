import { createHeader } from '../components/layout/header.js';
import { createFooter } from '../components/layout/footer.js';
import { createHero, updateHeroProgress, setActiveSlide } from '../components/sections/hero.js';
import { createBenefits } from '../components/sections/benefits.js';
import { createProductShowcase } from '../components/sections/product-showcase.js';
import { createProductScene, applyProductState } from '../components/sections/product-scene.js';
import { createCartBar } from '../components/ui/cart-bar.js';
import { createScrollAnimation, sampleKeyframes, clamp } from '../utils/scroll-animation.js';

// Estados de la escena a lo largo de las cinco secciones de la portada.
// x/y se expresan en unidades de viewport (vw/vh) para mantener la composición.
// La escala parte por debajo del tamaño anterior para enseñar el vaso completo.
// El desplazamiento es deliberadamente corto: conserva profundidad sin
// descubrir los bordes de la fotografía.
const SCENE_KEYFRAMES = [
  { x: 0, y: 0, scale: 0.86, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1 },
  { x: -0.2, y: -0.2, scale: 0.89, rotateX: 0.4, rotateY: 0.6, rotateZ: 0.2, opacity: 1 },
  { x: -0.25, y: 0.15, scale: 0.92, rotateX: -0.4, rotateY: 1.1, rotateZ: -0.2, opacity: 1 },
  { x: 0.25, y: 0, scale: 0.89, rotateX: 0.3, rotateY: -0.9, rotateZ: 0.15, opacity: 1 },
  { x: 0, y: -0.15, scale: 0.86, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1 }
];

const REDUCED_MOTION_STATE = {
  x: 0, y: 0, scale: 0.86, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1
};

export function initHomePage() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = '';
  
  const header = createHeader();
  app.appendChild(header);
  
  // Capa fija: la fotografía del producto vive detrás del contenido en todo el recorrido.
  const productScene = createProductScene();
  document.body.appendChild(productScene);
  
  const main = document.createElement('main');
  main.className = 'home-main';
  
  const hero = createHero();
  main.appendChild(hero);
  main.appendChild(createBenefits());
  main.appendChild(createProductShowcase());
  app.appendChild(main);
  
  const footer = createFooter();
  app.appendChild(footer);

  const cartBar = createCartBar();
  app.appendChild(cartBar.element);
  
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slideCount = hero.querySelectorAll('.hero-slide').length;
  let activeSlide = -1;
  let metrics = { heroTop: 0, heroHeight: 0, slideHeight: 1 };
  let lastWidth = 0;
  let lastHeight = 0;
  
  function getDocumentTop(element) {
    let top = 0;
    let node = element;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent;
    }
    return top;
  }
  
  function measure(viewportWidth, viewportHeight) {
    if (viewportWidth === lastWidth && viewportHeight === lastHeight) return;
    lastWidth = viewportWidth;
    lastHeight = viewportHeight;
    
    // offsetTop es relativo al offsetParent, así que se acumula hasta el documento.
    metrics = {
      heroTop: getDocumentTop(hero),
      heroHeight: hero.offsetHeight,
      slideHeight: hero.offsetHeight / slideCount
    };
  }
  
  function render({ scrollY, viewportHeight, viewportWidth }) {
    measure(viewportWidth, viewportHeight);
    
    const { heroTop, heroHeight, slideHeight } = metrics;
    const scrollRange = Math.max(heroHeight - slideHeight, 1);
    const progress = clamp((scrollY - heroTop) / scrollRange, 0, 1);
    
    // La escena se mueve con interpolación suave entre estados.
    if (reducedMotionQuery.matches) {
      applyProductState(productScene, REDUCED_MOTION_STATE);
    } else {
      const state = sampleKeyframes(SCENE_KEYFRAMES, progress);
      applyProductState(productScene, {
        x: (state.x * viewportWidth) / 100,
        y: (state.y * viewportHeight) / 100,
        scale: state.scale,
        rotateX: state.rotateX,
        rotateY: state.rotateY,
        rotateZ: state.rotateZ,
        opacity: state.opacity
      });
    }
    
    updateHeroProgress(hero, progress);
    hero.classList.toggle(
      'is-complete',
      scrollY > heroTop + heroHeight - viewportHeight * 0.15
    );
    
    // La diapositiva activa es la que cruza el centro de la ventana.
    const viewportCenter = scrollY + viewportHeight / 2;
    const index = clamp(
      Math.floor((viewportCenter - heroTop) / Math.max(slideHeight, 1)),
      0,
      slideCount - 1
    );
    
    if (index !== activeSlide) {
      activeSlide = index;
      setActiveSlide(hero, index);
    }
  }
  
  const scrollAnimation = createScrollAnimation({ onUpdate: render });

  const handleReducedMotionChange = () => {
    window.dispatchEvent(new Event('resize'));
  };
  
  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  }

  return () => {
    scrollAnimation.destroy();
    if (typeof header.destroy === 'function') header.destroy();
    if (typeof cartBar.destroy === 'function') cartBar.destroy();
    if (typeof reducedMotionQuery.removeEventListener === 'function') {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    }
    if (productScene.parentNode) productScene.remove();
  };
}

export default initHomePage;
