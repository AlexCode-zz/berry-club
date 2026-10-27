import { createElement } from '../../utils/dom.js';
import { createImageSkeleton, setRegionBusy } from './skeleton.js';
import { createRetryButton } from './retry-button.js';
import { t } from '../../i18n/i18n.js';

const SLOW_LOAD_THRESHOLD = 5000;

function addCacheBuster(src, attempt) {
  if (!src) return src;
  try {
    const url = new URL(src, window.location.href);
    url.searchParams.set('berry-retry', `${Date.now()}-${attempt}`);
    return `${url.pathname}${url.search}`;
  } catch (error) {
    return src;
  }
}

function removeElement(element) {
  if (element && element.parentNode) element.parentNode.removeChild(element);
}

/**
 * Gestiona el ciclo de vida visual de una imagen:
 * skeleton -> imagen cargada, o fallback -> placeholder permanente con reintento.
 * No reasigna la misma URL automáticamente y nunca deja un icono roto.
 */
export function setupImageState(img, {
  container,
  fallbackSrc = '',
  label = '',
  skeletonClass = '',
  compact = false,
  allowRetry = true,
  slowThreshold = SLOW_LOAD_THRESHOLD
} = {}) {
  if (!img) return null;
  if (img._berryImageState) return img._berryImageState;

  const host = container || img.parentElement;
  if (!host) return null;

  host.classList.add('image-state-host');
  const skeleton = createImageSkeleton([
    'image-loading-skeleton',
    compact ? 'is-compact' : '',
    skeletonClass
  ].filter(Boolean).join(' '));
  host.appendChild(skeleton);

  const status = createElement('span', {
    class: ['image-status', compact ? 'sr-only' : ''].filter(Boolean).join(' '),
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'true'
  });
  host.appendChild(status);

  const controller = new AbortController();
  let originalSrc = img.getAttribute('src') || '';
  let originalFallbackSrc = fallbackSrc;
  let fallbackApplied = false;
  let loading = false;
  let retrying = false;
  let retryAttempt = 0;
  let slowTimer = null;
  let statusTimer = null;
  let errorElement = null;
  let pendingRetryResolve = null;
  let disposed = false;

  function clearTimers() {
    if (slowTimer) window.clearTimeout(slowTimer);
    if (statusTimer) window.clearTimeout(statusTimer);
    slowTimer = null;
    statusTimer = null;
  }

  function setStatus(message, { clearAfter = 0 } = {}) {
    if (disposed) return;
    if (statusTimer) {
      window.clearTimeout(statusTimer);
      statusTimer = null;
    }
    status.textContent = message || '';
    if (message && clearAfter > 0) {
      statusTimer = window.setTimeout(() => {
        status.textContent = '';
        statusTimer = null;
      }, clearAfter);
    }
  }

  function showSkeleton() {
    skeleton.hidden = false;
    skeleton.classList.remove('is-hidden');
    host.classList.add('is-image-loading');
    host.classList.remove('is-image-broken');
    setRegionBusy(host, true);
  }

  function hideSkeleton() {
    skeleton.classList.add('is-hidden');
    host.classList.remove('is-image-loading');
    setRegionBusy(host, false);
  }

  function startSlowTimer() {
    if (slowTimer) window.clearTimeout(slowTimer);
    if (!loading) return;
    slowTimer = window.setTimeout(() => {
      if (loading && !disposed) setStatus(t('loading.slow'));
    }, slowThreshold);
  }

  function removeErrorPlaceholder() {
    removeElement(errorElement);
    errorElement = null;
    host.classList.remove('is-image-broken');
    img.removeAttribute('aria-hidden');
  }

  function finishRetry() {
    if (!pendingRetryResolve) return;
    const resolve = pendingRetryResolve;
    pendingRetryResolve = null;
    resolve();
  }

  function markLoaded({ viaRetry = false } = {}) {
    if (disposed) return;
    loading = false;
    clearTimers();
    hideSkeleton();
    removeErrorPlaceholder();
    img.classList.remove('is-broken');
    img.classList.add('is-loaded');
    if (viaRetry) {
      setStatus(t('loading.retrySuccess'), { clearAfter: 4000 });
    } else if (status.textContent === t('loading.slow')) {
      setStatus('');
    }
    retrying = false;
    finishRetry();
  }

  function showErrorPlaceholder() {
    if (disposed) return;
    loading = false;
    retrying = false;
    clearTimers();
    hideSkeleton();
    img.classList.add('is-broken');
    img.classList.remove('is-loaded');
    img.setAttribute('aria-hidden', 'true');
    host.classList.add('is-image-broken');

    removeElement(errorElement);

    const fallback = createElement('span', {
      class: ['image-fallback', compact ? 'is-compact' : ''].filter(Boolean).join(' '),
      role: 'group',
      'aria-label': t('loading.unavailable')
    });
    fallback.appendChild(createElement('span', {
      class: 'image-fallback-icon',
      'aria-hidden': 'true'
    }, ['×']));
    fallback.appendChild(createElement('span', {
      class: 'image-fallback-title'
    }, [t('loading.unavailable')]));

    if (!compact && allowRetry) {
      fallback.appendChild(createElement('span', {
        class: 'image-fallback-desc'
      }, [t('loading.unavailableDescription')]));
    }

    if (allowRetry) {
      const retry = createRetryButton({
        className: compact ? 'is-compact' : '',
        onRetry: retryLoad
      });
      fallback.appendChild(retry);
    }

    host.appendChild(fallback);
    errorElement = fallback;
    setStatus(t('loading.retryFailed'));
    finishRetry();
  }

  function applyFallback() {
    const currentSrc = img.getAttribute('src') || '';
    if (
      originalFallbackSrc &&
      !fallbackApplied &&
      originalFallbackSrc !== currentSrc
    ) {
      fallbackApplied = true;
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('src', originalFallbackSrc);
      loading = true;
      showSkeleton();
      startSlowTimer();
      console.warn(
        `[Berry Club] No se pudo cargar la imagen "${label || img.alt || 'sin descripción'}". ` +
        `Se usará la alternativa "${originalFallbackSrc}".`
      );
      return;
    }

    console.error(
      `[Berry Club] La imagen "${label || img.alt || 'sin descripción'}" no se pudo cargar` +
      `${currentSrc ? ` (${currentSrc})` : ''}. Revisa la ruta en public/images/.`
    );
    showErrorPlaceholder();
  }

  function retryLoad() {
    if (disposed || retrying) return Promise.resolve();
    if (!originalSrc && !originalFallbackSrc) return Promise.resolve();

    retrying = true;
    retryAttempt += 1;
    fallbackApplied = false;
    removeErrorPlaceholder();
    showSkeleton();
    img.classList.remove('is-broken');
    img.classList.remove('is-loaded');
    img.removeAttribute('aria-hidden');
    setStatus('');
    loading = true;

    const retryPromise = new Promise(resolve => {
      pendingRetryResolve = resolve;
    });

    const source = originalSrc || originalFallbackSrc;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.setAttribute('src', addCacheBuster(source, retryAttempt));
    startSlowTimer();
    return retryPromise;
  }

  function handleLoad() {
    if (disposed) return;
    if (retrying) {
      markLoaded({ viaRetry: true });
      return;
    }
    markLoaded();
  }

  function handleError() {
    if (disposed) return;
    applyFallback();
  }

  img.addEventListener('load', handleLoad, { signal: controller.signal });
  img.addEventListener('error', handleError, { signal: controller.signal });

  function beginSource(src, nextFallbackSrc) {
    // Cancela la espera de un reintento anterior si el usuario cambia de tamaño
    // mientras la imagen aún está cargando.
    finishRetry();
    originalSrc = src || originalSrc;
    if (nextFallbackSrc !== undefined) originalFallbackSrc = nextFallbackSrc || '';
    fallbackApplied = false;
    retrying = false;
    retryAttempt = 0;
    loading = true;
    clearTimers();
    removeErrorPlaceholder();
    showSkeleton();
    img.classList.remove('is-loaded', 'is-broken');
    img.removeAttribute('aria-hidden');
    setStatus('');
    if (src) {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('src', src);
      startSlowTimer();
    }
  }

  const api = {
    updateSource(src, options = {}) {
      if (disposed) return;
      const nextFallback = options.fallbackSrc !== undefined ? options.fallbackSrc : originalFallbackSrc;
      if (options.label) label = options.label;
      if (img.getAttribute('src') === src && img.classList.contains('is-loaded')) return;
      beginSource(src, nextFallback);
    },
    retry: retryLoad,
    dispose() {
      disposed = true;
      finishRetry();
      clearTimers();
      controller.abort();
      removeErrorPlaceholder();
      removeElement(skeleton);
      removeElement(status);
      host.classList.remove('image-state-host', 'is-image-loading', 'is-image-broken');
      delete img._berryImageState;
    }
  };

  img._berryImageState = api;

  if (img.complete && img.naturalWidth > 0) {
    markLoaded();
  } else {
    loading = Boolean(img.getAttribute('src'));
    showSkeleton();
    if (loading) startSlowTimer();
  }

  return api;
}

export function updateImageSource(img, src, options = {}) {
  if (!img) return;
  if (img._berryImageState) {
    img._berryImageState.updateSource(src, options);
    return;
  }
  if (options.fallbackSrc) img.dataset.fallbackSrc = options.fallbackSrc;
  img.setAttribute('src', src);
}

export default setupImageState;
