/**
 * Iconos de línea dibujados a mano para Berry Club.
 * Se devuelven como HTML para poder insertarlos en componentes creados con
 * createElement sin añadir dependencias ni fuentes de iconos.
 */

const SVG_OPEN = (size, className = '') => (
  `<svg class="icon-svg${className ? ` ${className}` : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`
);

export function strawberryIcon(size = 24, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M12 20.7c-3.9 0-7.1-3.2-7.1-7.2 0-2.5 1.6-4.2 3.5-4.9 1.3-.5 2.5-.3 3.6.4 1.1-.7 2.3-.9 3.6-.4 1.9.7 3.5 2.4 3.5 4.9 0 4-3.2 7.2-7.1 7.2Z"/>
    <path d="M12 9V6.2"/>
    <path d="M12 8.8C10.8 6.3 8.6 5.2 6.3 5.5c.5 2.3 2.6 3.5 5.7 3.3Z" fill="currentColor" stroke="none"/>
    <path d="M12 8.8c1.2-2.5 3.4-3.6 5.7-3.3-.5 2.3-2.6 3.5-5.7 3.3Z" fill="currentColor" stroke="none"/>
    <circle cx="9.2" cy="12.2" r=".65" fill="currentColor" stroke="none"/>
    <circle cx="13.1" cy="11.4" r=".65" fill="currentColor" stroke="none"/>
    <circle cx="11" cy="15.1" r=".65" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="14.9" r=".65" fill="currentColor" stroke="none"/>
    <circle cx="8.5" cy="16.2" r=".65" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="18" r=".65" fill="currentColor" stroke="none"/>
  </svg>`;
}

export function creamIcon(size = 24, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M8.2 17.4h7.6l-1 3.1a1.8 1.8 0 0 1-1.7 1.2h-2.2a1.8 1.8 0 0 1-1.7-1.2l-1-3.1Z"/>
    <path d="M7.6 17.4c0-2.2 1.9-3.6 4.4-3.6s4.4 1.4 4.4 3.6"/>
    <path d="M9.3 13.8c0-1.6 1.1-2.7 2.7-2.7s2.7 1.1 2.7 2.7"/>
    <path d="M10.7 11.1c0-1.2.6-2 1.3-2s1.3.8 1.3 2"/>
  </svg>`;
}

export function sprinklesIcon(size = 24, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M6.4 7.2h2.8M13.4 6.1h2.3M18.1 8.9h1.4M5.4 12.3h2.3M9.8 11h2.8M16.3 12.8h2.3M7.3 17.4h2.5M12.8 16.9h2.2M18.3 18.9h1.2" stroke-width="2.3"/>
  </svg>`;
}

/**
 * Vaso de perfil para la carta de tamaños. La altura cambia el formato.
 */
export function cupIcon(height = 64, className = '') {
  const width = Math.round(height * 0.75);
  return `<svg class="cup-svg${className ? ` ${className}` : ''}" width="${width}" height="${height}" viewBox="0 0 48 64" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M10 22h28l-3.4 33.7a5.1 5.1 0 0 1-5.1 4.8H18.5a5.1 5.1 0 0 1-5.1-4.8L10 22Z"/>
    <path d="M10 22c0-6.7 5.6-11.4 14-11.4S38 15.3 38 22"/>
    <path d="M10 30.5h28"/>
    <path d="M17 38.5h3.2M25.5 38.5h3.2M20.5 46.5h3.2M28 46.5h3.2"/>
    <circle cx="16.5" cy="55.5" r="1" fill="currentColor" stroke="none"/>
    <circle cx="31.5" cy="55.5" r="1" fill="currentColor" stroke="none"/>
  </svg>`;
}

export function cartIcon(size = 20, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 7H6.2"/>
    <circle cx="10" cy="20" r="1.2"/>
    <circle cx="17.5" cy="20" r="1.2"/>
  </svg>`;
}

export function chatIcon(size = 20, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M20.4 11.4c0 4.3-3.8 7.8-8.4 7.8-1.4 0-2.8-.3-3.9-1L3.6 19l1.5-4a7.4 7.4 0 0 1-1.5-3.6c0-4.3 3.8-7.8 8.4-7.8s8.4 3.5 8.4 7.8Z"/>
    <path d="M8.6 8.2c.3 2.6 2.3 4.6 4.9 4.9"/>
  </svg>`;
}

export function arrowIcon(size = 18, className = '') {
  return `${SVG_OPEN(size, className)}
    <path d="M4 12h15"/>
    <path d="m13 6 6 6-6 6"/>
  </svg>`;
}
