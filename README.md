# Berry Club

Experiencia frontend de portafolio para una marca ficticia de fresas con crema. Incluye portada editorial, personalizador de producto, carrito persistente, página de carrito, resumen de WhatsApp y una interfaz bilingüe español/inglés.

> **Demo de portafolio.** Berry Club, sus precios y sus fotografías comerciales son ficticios.

## Funcionalidades

- **Carrito multiproducto persistente**: agrega varias configuraciones, cambia cantidades, duplica, edita o elimina líneas y vacía el carrito con confirmación.
- **Configuraciones independientes**: se combinan solo las líneas idénticas. Cambiar el tamaño, los complementos o la cantidad de una línea no altera las demás.
- **Edición exacta**: cada línea del carrito enlaza a `pedido.html?edit=<lineId>` y guarda los cambios únicamente en esa línea.
- **Cálculo centralizado**: los precios viven en centavos enteros; cada subtotal se calcula como precio unitario por cantidad.
- **Persistencia segura**: el carrito sobrevive a recargas mediante `localStorage`, con versión, validación, recuperación ante datos corruptos y tolerancia a fallos de almacenamiento.
- **Página de carrito dedicada**: imágenes, precios, cantidades, acciones por línea, resumen y un estado vacío sin total monetario.
- **Contador exacto**: el encabezado y la barra móvil muestran unidades totales, no la cantidad de líneas.
- **WhatsApp demostrativo**: modal previo con resumen completo, aviso de portafolio y protección contra destinatarios no configurados.
- **Bilingüe ES/EN**: toda la interfaz, los modales, los estados, los metadatos y los mensajes generados cambian de idioma. La preferencia se conserva en la URL y en `localStorage`.
- **Barra móvil del carrito**: visible solo con unidades y fuera de la página del carrito; respeta `safe-area-inset-bottom`.
- **Acceso directo a Productos**: botón circular **P** junto al carrito que enlaza a `pedido.html` y conserva el idioma activo en móvil y escritorio.
- **Resiliencia visual**: esqueletos, carga diferida de imágenes, alternativa controlada, reintento y aviso de conexión perdida.
- **Accesibilidad**: navegación por teclado, foco atrapado y devuelto en modales, etiquetas ARIA, mensajes de estado y controles táctiles de al menos 44 × 44 px.
- **Sin framework ni build**: HTML semántico, CSS modular y JavaScript vanilla con módulos ES.

## Arquitectura

```text
Configuración del producto
        ↓
createCartLine() + precios en centavos
        ↓
CartContext  ⇄  localStorage (berry-club-cart, versión 1)
        ↓
Header · barra móvil · página del carrito · mensaje de WhatsApp
```

Puntos clave:

- `src/context/cart-context.js` mantiene las líneas en memoria y notifica a cada vista.
- `src/services/cart-pricing.js` define el esquema de línea, recalcula precios desde el catálogo y aplica los límites.
- `src/services/cart-operations.js` concentra agregar, editar, cambiar cantidad, duplicar, eliminar y vaciar.
- `src/services/cart-storage.js` lee y escribe sin confiar en los datos guardados.
- `src/services/whatsapp-service.js` separa la generación del mensaje de la apertura de WhatsApp.
- `src/i18n/` contiene los diccionarios, los metadatos y el cambio de idioma.

### Límites

- Máximo **30 líneas** por carrito.
- Máximo **20 unidades** por línea.
- Máximo resultante: **600 unidades**.
- Cantidades inválidas se normalizan a un valor seguro entre 1 y 20.

### Persistencia

- Carrito: `berry-club-cart`, con formato `{ version: 1, lines: [...] }`.
- Idioma: `berry-club-language` (`es` o `en`).
- Los precios de presentación se recalculan desde `sizes.js` y `extras.js` al leer el carrito.
- Un registro corrupto o incompatible se descarta sin bloquear la aplicación.
- El carrito es local al navegador: no se sincroniza entre pestañas ni dispositivos.

## Estructura del proyecto

```text
berry-club/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── assets/          # Asignación de recursos visuales
│   ├── components/
│   │   ├── layout/      # Encabezado, pie, selector de idioma
│   │   ├── sections/    # Portada, escena, beneficios, tamaños
│   │   └── ui/          # Botones, modales, barra de carrito, estados de imagen
│   ├── context/         # Estado del pedido y del carrito
│   ├── data/            # Tamaños, complementos, producto y configuración
│   ├── hooks/           # Suscripciones reutilizables
│   ├── i18n/            # Diccionarios ES/EN, metadatos e idioma activo
│   ├── pages/           # Inicializadores de portada, pedido y carrito
│   ├── services/        # Precios, operaciones, persistencia, portapapeles y WhatsApp
│   ├── styles/          # CSS modular
│   ├── utils/           # DOM, moneda, validación, URL, imágenes y scroll
│   ├── app.js           # Enrutado y ciclo de vida por página
│   └── main.js          # Punto de entrada
├── tests/
│   └── cart.test.mjs    # Pruebas unitarias con node:test
├── index.html           # Portada
├── pedido.html          # Personalizador
├── carrito.html         # Carrito
└── README.md
```

## Cómo ejecutar

El proyecto usa módulos ES, por lo que debe servirse por HTTP; abrir los HTML con `file://` no funciona.

### Python

```bash
cd berry-club
python3 -m http.server 8000
```

Abrir `http://localhost:8000/`.

### Node.js

```bash
npm install -g http-server
cd berry-club
http-server -p 8000
```

### VS Code

Abre la carpeta `berry-club` con la extensión Live Server y visita la URL que indique la extensión.

## Pruebas

Las pruebas unitarias no requieren dependencias externas:

```bash
node --test tests/cart.test.mjs
```

Resultado actual: **13 pruebas aprobadas**. Cubren precios, totales recalculados, combinación de configuraciones, límite por línea, límite de líneas, edición, duplicado, eliminación, persistencia, recuperación de datos corruptos y generación del mensaje de WhatsApp.

Comprobación opcional de sintaxis:

```bash
for file in $(find src tests -name '*.js' -o -name '*.mjs'); do
  node --check "$file"
done
```

### Verificación en navegador

Se verificó el flujo completo en Chromium con viewport móvil de 390 px:

- Alta de dos configuraciones, combinación de líneas idénticas y persistencia tras recarga.
- Cambio de cantidades, duplicado, eliminación y edición exacta de una línea.
- Modal de WhatsApp, foco, cierre y retorno de foco.
- Cambio ES/EN con carrito y recarga.
- Confirmación de vaciado, cancelación, estado vacío y recarga.
- Acceso directo a Productos con etiquetas ES/EN, destino `pedido.html?lang=es|en` y navegación desde portada, personalizador y carrito.
- Ausencia del botón «Compartir mi combinación» en el personalizador.
- Sin errores inesperados en consola.

Matriz responsive comprobada: **320, 360, 390, 430, 431, 768, 769, 920, 921, 1024 y 1440 px**, sin desbordamiento horizontal. El botón **P** se verificó en portada, personalizador y carrito, en ambos idiomas y en móvil y escritorio. También se probaron 600 unidades en 30 líneas, carrito con 30 líneas, recuperación de almacenamiento corrupto, fallback y reintento de imágenes, aviso sin conexión y enlaces internos.

## Personalización

### Precios

Los importes se guardan en centavos.

`src/data/sizes.js`:

```javascript
{
  id: 'clasico',
  label: 'Clásico',
  description: 'El equilibrio perfecto',
  priceCents: 350 // $3.50
}
```

`src/data/extras.js`:

```javascript
{
  id: 'chocolate',
  label: 'Chocolate',
  description: 'Sirope de chocolate',
  priceCents: 50 // +$0.50
}
```

Al añadir un complemento nuevo en `EXTRAS`, el selector y el cálculo se actualizan automáticamente. Reutiliza un `id` estable y añade su traducción en `src/i18n/es.js` y `src/i18n/en.js`.

### Límites del carrito

Edita `MAX_CART_LINES` y `MAX_LINE_QUANTITY` en `src/services/cart-pricing.js`. Si cambias esos límites, actualiza también las pruebas y, si corresponde, la documentación visible.

### Fotografías

Las imágenes están en `public/images/`:

- `strawberry-hero.webp` y `strawberry-hero-hd.webp`: escena de portada en dos resoluciones.
- `strawberry-classic.webp`: presentación y tamaño Mini.
- `strawberry-toppings.webp`: tamaño Clásico.
- `strawberry-chocolate.webp`: tamaño Grande.

La asignación está en `PRODUCT.sizeImages` dentro de `src/data/products.js`. La fotografía principal del personalizador cambia con el tamaño; los complementos no alteran la imagen.

La portada usa `srcset` para escoger entre la versión de 768 px y la HD. Si sustituyes las imágenes, conserva una proporción horizontal similar y exporta ambos tamaños. La fotografía original editable se conserva como `Postre flotante de fresa y crema.png`.

### Idiomas y metadatos

- Textos: `src/i18n/es.js` y `src/i18n/en.js`.
- Detección y persistencia: `src/i18n/i18n.js`.
- Metadatos iniciales: `<head>` de `index.html`, `pedido.html` y `carrito.html`.
- El idioma puede fijarse con `?lang=es` o `?lang=en`.



## Responsive y accesibilidad

- La barra inferior del carrito se muestra hasta 768 px y nunca en la página del carrito.
- El contenido reserva espacio inferior para que la barra no tape el pie de página.
- El CTA del encabezado se oculta en pantallas muy estrechas y en el rango 769–920 px, donde la navegación reaparece antes de que todo quepa junto al botón P.
- La página de pedido no muestra CTA de encabezado porque la acción principal está en el formulario.
- Los controles principales del carrito y los modales mantienen un área táctil mínima de 44 × 44 px.
- Los modales atrapan el foco, cierran con Escape o clic exterior y devuelven el foco al control de origen.
- `prefers-reduced-motion` desactiva las animaciones de la escena y del total.


## Licencia

Proyecto demostrativo de portafolio. La marca, los textos comerciales y los precios son ficticios.
