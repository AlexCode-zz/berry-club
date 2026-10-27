const IMAGES = {
  hero: 'public/images/strawberry-hero.webp',
  heroHd: 'public/images/strawberry-hero-hd.webp',
  classic: 'public/images/strawberry-classic.webp',
  chocolate: 'public/images/strawberry-chocolate.webp',
  toppings: 'public/images/strawberry-toppings.webp'
};

export const PRODUCT = {
  id: 'strawberry-cream',
  name: 'Fresas con crema',
  shortName: 'Berry Club',
  description: 'Fresas frescas con crema batida artesanal y tus complementos favoritos.',
  images: IMAGES,
  // Asignación exacta de fotografía por tamaño. Mini reutiliza la clásica.
  sizeImages: {
    mini: IMAGES.classic,
    clasico: IMAGES.toppings,
    grande: IMAGES.chocolate
  },
  alt: 'Vaso transparente con fresas frescas y crema batida'
};
