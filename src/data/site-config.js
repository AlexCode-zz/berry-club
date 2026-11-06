export const SITE_CONFIG = {
  brandName: 'Berry Club',
  currency: 'USD',
  locale: 'es-US',
  demo: {
    isDemo: true,
    note: 'Demo de portafolio. Marca y precios ficticios.'
  },
  contact: {
    // Contacto del desarrollador para el CTA comercial del portafolio.
    whatsappNumber: '76599530', // CONFIGURAR: Número internacional sin + ni espacios, ej: 1234567890
    whatsappMessage: '¡Hola! Vi tu demo de fresas con crema y me gustaría una página web para mi negocio. ¿Podemos conversar sobre mi proyecto?',
    // Destinatario del flujo de pedidos. Se deja vacío deliberadamente:
    // no se inventa un número comercial para la demo.
    orderWhatsappNumber: '76599530'
  },
  meta: {
    title: 'Berry Club | Fresas con crema personalizadas',
    description: 'Crea tu vaso de fresas con crema a tu gusto. Elige tamaño, complementos y prepara un resumen de demostración.',
    ogImage: 'public/images/strawberry-hero.webp'
  },
  // Textos de la portada. Modificar aquí sin tocar los componentes.
  home: {
    slides: [
      {
        id: 'presentacion',
        eyebrow: 'Fresas con crema',
        title: 'Fresas con crema, recién hechas.',
        description: 'Fresa fría, crema batida al momento y tus complementos favoritos. Así de simple, así de bueno.',
        cta: { href: 'pedido.html' }
      },
      {
        id: 'frescura',
        eyebrow: 'Frescura',
        title: 'La fresa se nota.',
        description: 'Fruta seleccionada cada mañana, firme y brillante, nunca escondida bajo el azúcar.'
      },
      {
        id: 'cremosidad',
        eyebrow: 'Cremosidad',
        title: 'Crema batida al momento.',
        description: 'Textura suave y ligera. La cucharada que sostiene todo lo demás.'
      },
      {
        id: 'personalizacion',
        eyebrow: 'A tu manera',
        title: 'Tu vaso, tus reglas.',
        description: 'Elige tamaño, suma complementos y arma la combinación que se te antoje.',
        cta: { href: 'pedido.html' }
      },
      {
        id: 'cierre',
        eyebrow: 'Berry Club',
        title: 'El antojo ya tiene nombre.',
        description: 'Elige tu tamaño y llévate el antojo a tu manera.',
        cta: { href: 'pedido.html' }
      }
    ],
    showcaseTitle: 'Elige tu tamaño',
    showcaseSubtitle: 'Tres medidas. La misma receta, recién batida.',
    benefits: [
      {
        id: 'fresas',
        title: 'Fresa',
        description: 'Fruta firme y fría, elegida cada mañana.'
      },
      {
        id: 'crema',
        title: 'Crema',
        description: 'Batida al momento. Suave, fría, sin atajos.'
      },
      {
        id: 'complementos',
        title: 'Complementos',
        description: 'Chocolate, galleta, granola. Tú armas el resto.'
      }
    ]
  }
};

export function hasValidWhatsAppNumber() {
  const number = SITE_CONFIG.contact.whatsappNumber;
  return typeof number === 'string' && number.trim().length > 0 && /^\d{8,15}$/.test(number.trim());
}

export function hasValidOrderWhatsAppNumber() {
  const number = SITE_CONFIG.contact.orderWhatsappNumber;
  return typeof number === 'string' && number.trim().length > 0 && /^\d{8,15}$/.test(number.trim());
}
