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
        eyebrow: 'UN ANTOJO QUE SE DISFRUTA',
        title: 'Un momento dulce, cucharada a cucharada.',
        description: 'Fresas, crema y tus complementos favoritos. Crea una combinación a tu gusto.'
      },
      {
        id: 'frescura',
        eyebrow: 'FRESCURA',
        title: 'Fresas que se roban todas las miradas.',
        description: 'Color, brillo y textura en cada capa. El producto se queda contigo mientras el resto se desplaza.'
      },
      {
        id: 'cremosidad',
        eyebrow: 'CREMOSIDAD',
        title: 'Capas de sabor. Una cucharada perfecta.',
        description: 'Crema batida artesanal que abraza cada fresa. Una textura pensada para disfrutarse despacio.'
      },
      {
        id: 'personalizacion',
        eyebrow: 'A TU MANERA',
        title: 'Hazlo a tu manera.',
        description: 'Elige tu tamaño y añade tus complementos favoritos.'
      },
      {
        id: 'cierre',
        eyebrow: 'BERRY CLUB',
        title: 'Tu próximo antojo empieza aquí.'
      }
    ],
    showcaseTitle: 'Elige tu tamaño',
    showcaseSubtitle: 'Personaliza tu experiencia a tu gusto',
    benefits: [
      {
        id: 'fresas',
        title: 'Fresas',
        description: 'Fresas frescas seleccionadas para cada vaso.'
      },
      {
        id: 'crema',
        title: 'Crema',
        description: 'Crema batida artesanal, suave y cremosa.'
      },
      {
        id: 'complementos',
        title: 'Complementos',
        description: 'Elige entre una variedad de toppings para personalizarlo.'
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
