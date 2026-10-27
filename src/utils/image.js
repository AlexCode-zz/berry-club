/**
 * Utilidades para cargar imágenes con una alternativa válida y dejar rastro
 * en consola si un recurso falla. No sustituye todas las imágenes por una
 * sola: cada imagen declara su propio fallback.
 */

export function setImageSource(img, src, { fallbackSrc, label } = {}) {
  if (!img || !src) return;
  
  if (fallbackSrc) {
    img.dataset.fallbackSrc = fallbackSrc;
  }
  if (label) {
    img.dataset.imageLabel = label;
  }
  
  // Evita reintentar la misma imagen en cada actualización (por ejemplo, al
  // cambiar un complemento). Un fallback ya aplicado se conserva.
  if (img.dataset.requestedSrc === src) return;
  img.dataset.requestedSrc = src;
  img.dataset.fallbackApplied = 'false';
  img.classList.remove('is-broken');
  
  if (img.getAttribute('src') !== src) {
    img.setAttribute('src', src);
  }
}

export function attachImageFallback(img, { fallbackSrc, label } = {}) {
  if (!img) return;
  
  if (fallbackSrc) img.dataset.fallbackSrc = fallbackSrc;
  if (label) img.dataset.imageLabel = label;
  
  img.addEventListener('load', () => {
    img.classList.remove('is-broken');
  });
  
  img.addEventListener('error', () => {
    const label = img.dataset.imageLabel || img.alt || 'sin descripción';
    const fallback = img.dataset.fallbackSrc;
    const fallbackApplied = img.dataset.fallbackApplied === 'true';
    const currentSrc = img.getAttribute('src');
    const failedSrc = img.currentSrc || currentSrc;
    const hasSrcset = img.hasAttribute('srcset');
    
    if (fallback && !fallbackApplied && (hasSrcset || currentSrc !== fallback)) {
      img.dataset.fallbackApplied = 'true';
      console.warn(
        `[Berry Club] No se pudo cargar la imagen "${label}" (${failedSrc}). ` +
        `Se usará la alternativa "${fallback}".`
      );
      // srcset puede seguir apuntando al recurso que falló.
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('src', fallback);
      return;
    }
    
    console.error(
      `[Berry Club] La imagen "${label}" no se pudo cargar` +
      `${currentSrc ? ` (${currentSrc})` : ''}. Revisa la ruta en public/images/.`
    );
    img.classList.add('is-broken');
  });
}
