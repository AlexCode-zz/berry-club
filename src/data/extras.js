export const EXTRAS = [
  {
    id: 'chocolate',
    label: 'Chocolate',
    description: 'Sirope de chocolate',
    priceCents: 50
  },
  {
    id: 'leche-condensada',
    label: 'Leche condensada',
    description: 'Dulzura cremosa',
    priceCents: 40
  },
  {
    id: 'galleta-triturada',
    label: 'Galleta triturada',
    description: 'Crujiente y casero',
    priceCents: 50
  },
  {
    id: 'oreo-triturada',
    label: 'Oreo triturada',
    description: 'Irresistible',
    priceCents: 60
  },
  {
    id: 'granola',
    label: 'Granola',
    description: 'Textura crujiente',
    priceCents: 40
  },
  {
    id: 'crema-extra',
    label: 'Crema extra',
    description: 'Más cremosidad',
    priceCents: 75
  }
];

export function getExtraById(id) {
  return EXTRAS.find(extra => extra.id === id);
}

export function getExtrasByIds(ids = []) {
  return ids.map(id => getExtraById(id)).filter(Boolean);
}
