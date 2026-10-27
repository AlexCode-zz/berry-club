export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

/**
 * Interpola un conjunto de estados (keyframes) según un progreso de 0 a 1.
 * `stops` es un array de objetos numéricos con las mismas claves.
 */
export function sampleKeyframes(stops, progress) {
  if (!Array.isArray(stops) || stops.length === 0) return {};
  if (stops.length === 1) return { ...stops[0] };
  
  const clamped = clamp(progress, 0, 1);
  const segments = stops.length - 1;
  const position = clamped * segments;
  const index = Math.min(Math.floor(position), segments - 1);
  const localProgress = position - index;
  
  const from = stops[index];
  const to = stops[index + 1];
  const result = {};
  
  Object.keys(from).forEach(key => {
    const start = from[key];
    const end = to[key];
    result[key] = typeof start === 'number' && typeof end === 'number'
      ? lerp(start, end, localProgress)
      : start;
  });
  
  return result;
}

/**
 * Ejecuta un callback como máximo una vez por frame mientras se hace scroll.
 * No bloquea el desplazamiento nativo y libera los listeners con destroy().
 */
export function createScrollAnimation({ onUpdate, target = window }) {
  let frameId = null;
  let ticking = false;
  
  function frame() {
    if (typeof onUpdate === 'function') {
      onUpdate({
        scrollY: window.scrollY || window.pageYOffset,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      });
    }
    ticking = false;
  }
  
  function schedule() {
    if (ticking) return;
    ticking = true;
    frameId = window.requestAnimationFrame(frame);
  }
  
  target.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  
  // Primer render sin esperar al scroll
  frame();
  
  return {
    refresh: schedule,
    destroy() {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };
}
