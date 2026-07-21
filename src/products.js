/** Catálogo de supermercado español con envases diferenciados */

export const CATEGORIES = [
  {
    id: 'frutas', name: 'Frutas',
    subs: [
      { id: 'citricos', name: 'Cítricos' },
      { id: 'tropicales', name: 'Tropicales' },
      { id: 'frutos-rojos', name: 'Frutos rojos' },
      { id: 'otras-frutas', name: 'Otras frutas' },
    ],
  },
  {
    id: 'verduras', name: 'Verduras',
    subs: [
      { id: 'hoja', name: 'Hoja verde' },
      { id: 'tuberculos', name: 'Tubérculos' },
      { id: 'hortalizas', name: 'Hortalizas' },
      { id: 'hierbas', name: 'Hierbas' },
    ],
  },
  {
    id: 'lacteos', name: 'Lácteos',
    subs: [
      { id: 'leches', name: 'Leches' },
      { id: 'vegetales', name: 'Bebidas vegetales' },
      { id: 'yogures', name: 'Yogures' },
      { id: 'quesos', name: 'Quesos' },
      { id: 'mantequillas', name: 'Mantequillas' },
      { id: 'postres', name: 'Postres' },
      { id: 'natas', name: 'Natas y kéfir' },
      { id: 'huevos', name: 'Huevos' },
    ],
  },
  {
    id: 'carne', name: 'Carne',
    subs: [
      { id: 'pollo', name: 'Pollo / pavo' },
      { id: 'vacuno', name: 'Vacuno' },
      { id: 'cerdo', name: 'Cerdo' },
      { id: 'otras-carnes', name: 'Otras' },
    ],
  },
  {
    id: 'pescado', name: 'Pescado',
    subs: [
      { id: 'pescado-fresco', name: 'Pescado' },
      { id: 'marisco', name: 'Marisco' },
      { id: 'elaborados-pescado', name: 'Elaborados' },
    ],
  },
  {
    id: 'charcuteria', name: 'Charcutería',
    subs: [
      { id: 'jamones', name: 'Jamones' },
      { id: 'embutidos', name: 'Embutidos' },
      { id: 'loncheados', name: 'Loncheados' },
    ],
  },
  {
    id: 'panaderia', name: 'Panadería',
    subs: [
      { id: 'pan', name: 'Pan' },
      { id: 'bolleria', name: 'Bollería' },
      { id: 'tortillas-pan', name: 'Tortillas' },
    ],
  },
  {
    id: 'desayuno', name: 'Desayuno',
    subs: [
      { id: 'cereales', name: 'Cereales' },
      { id: 'untables', name: 'Untables' },
      { id: 'cafe-te', name: 'Café y té' },
      { id: 'zumos-desayuno', name: 'Zumos' },
    ],
  },
  {
    id: 'despensa', name: 'Despensa',
    subs: [
      { id: 'arroz-pasta', name: 'Arroz y pasta' },
      { id: 'legumbres', name: 'Legumbres' },
      { id: 'aceites', name: 'Aceites y vinagres' },
      { id: 'harinas', name: 'Harinas y azúcar' },
      { id: 'frutos-secos', name: 'Frutos secos' },
      { id: 'caldos', name: 'Caldos' },
    ],
  },
  {
    id: 'conservas', name: 'Conservas',
    subs: [
      { id: 'pescado-lata', name: 'Pescado' },
      { id: 'vegetales-lata', name: 'Vegetales' },
      { id: 'frutas-lata', name: 'Frutas' },
    ],
  },
  {
    id: 'salsas', name: 'Salsas',
    subs: [
      { id: 'salsas-mesa', name: 'Salsas' },
      { id: 'especias', name: 'Especias' },
    ],
  },
  {
    id: 'congelados', name: 'Congelados',
    subs: [
      { id: 'congelado-salado', name: 'Salado' },
      { id: 'helados', name: 'Helados' },
      { id: 'congelado-verdura', name: 'Verdura / fruta' },
    ],
  },
  {
    id: 'bebidas', name: 'Bebidas',
    subs: [
      { id: 'agua', name: 'Agua' },
      { id: 'refrescos', name: 'Refrescos' },
      { id: 'zumos-bebida', name: 'Zumos' },
      { id: 'alcohol', name: 'Alcohol' },
    ],
  },
  {
    id: 'snacks', name: 'Snacks',
    subs: [
      { id: 'aperitivos', name: 'Aperitivos' },
      { id: 'dulces', name: 'Dulces' },
      { id: 'chocolates', name: 'Chocolate' },
    ],
  },
  { id: 'platos', name: 'Platos listos', subs: [{ id: 'preparados', name: 'Preparados' }] },
  {
    id: 'bebe', name: 'Bebé',
    subs: [
      { id: 'alimentacion-bebe', name: 'Alimentación' },
      { id: 'cuidado-bebe', name: 'Cuidado' },
    ],
  },
  { id: 'mascotas', name: 'Mascotas', subs: [{ id: 'mascota', name: 'Todo' }] },
  {
    id: 'limpieza', name: 'Limpieza',
    subs: [
      { id: 'ropa-limpieza', name: 'Ropa' },
      { id: 'hogar-limpieza', name: 'Hogar' },
    ],
  },
  {
    id: 'higiene', name: 'Higiene',
    subs: [
      { id: 'corporal', name: 'Corporal' },
      { id: 'bucal', name: 'Bucal' },
      { id: 'farmacia', name: 'Farmacia' },
    ],
  },
  { id: 'hogar', name: 'Hogar', subs: [{ id: 'casa', name: 'Casa' }] },
]

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id)
}

/** Colores típicos de bricks de leche en España (Pascual / Asturiana / Puleva) */
const LECHE = {
  entera: { type: 'carton', color: '#c62828', label: 'ENT', liquid: '#fff8e7', stripe: '#ffffff' },
  semi: { type: 'carton', color: '#2e7d32', label: 'SEMI', liquid: '#fffde7', stripe: '#ffffff' },
  desnatada: { type: 'carton', color: '#1565c0', label: 'DES', liquid: '#f5f9ff', stripe: '#ffffff' },
  calcio: { type: 'carton', color: '#00897b', label: 'Ca+', liquid: '#e0f2f1', stripe: '#ffffff' },
  sinLactosa: { type: 'carton', color: '#7b1fa2', label: '0%L', liquid: '#f3e5f5', stripe: '#ffffff' },
  fresca: { type: 'bottle', color: '#29b6f6', cap: '#0277bd', liquid: '#e1f5fe', label: 'F' },
  avena: { type: 'carton', color: '#a1887f', label: 'AV', liquid: '#efebe9', stripe: '#ffe0b2' },
  almendras: { type: 'carton', color: '#f48fb1', label: 'ALM', liquid: '#fce4ec', stripe: '#fff8e1' },
  soja: { type: 'carton', color: '#9ccc65', label: 'SOJA', liquid: '#f1f8e9', stripe: '#ffffff' },
  coco: { type: 'carton', color: '#4dd0e1', label: 'COCO', liquid: '#e0f7fa', stripe: '#ffffff' },
  arroz: { type: 'carton', color: '#ffcc80', label: 'ARR', liquid: '#fff8e1', stripe: '#ffffff' },
  avellana: { type: 'carton', color: '#8d6e63', label: 'AVL', liquid: '#efebe9', stripe: '#d7ccc8' },
}

const items = {
  frutas: [
    e('🍎', 'Manzanas'),
    e('🍏', 'Manzanas verdes'),
    e('🍌', 'Plátanos'),
    e('🍌', 'Plátanos canarios'),
    e('🍊', 'Naranjas'),
    e('🍊', 'Naranjas para zumo'),
    e('🍊', 'Mandarinas'),
    e('🍋', 'Limones'),
    e('🍋', 'Limas'),
    e('🍇', 'Uvas blancas'),
    e('🍇', 'Uvas negras'),
    e('🍓', 'Fresas'),
    e('🫐', 'Arándanos'),
    e('🫐', 'Frambuesas'),
    e('🫐', 'Moras'),
    e('🥝', 'Kiwis'),
    e('🍑', 'Melocotones'),
    e('🍑', 'Nectarinas'),
    e('🍑', 'Albaricoques'),
    e('🥭', 'Mangos'),
    e('🍍', 'Piña'),
    e('🍉', 'Sandía'),
    e('🍈', 'Melón piel de sapo'),
    e('🍈', 'Melón galia'),
    e('🍐', 'Peras conferencia'),
    e('🍐', 'Peras ercolini'),
    e('🍒', 'Cerezas'),
    e('🥥', 'Coco'),
    e('🥑', 'Aguacates'),
    e('🍅', 'Tomates'),
    e('🍅', 'Tomates pera'),
    e('🍅', 'Tomates cherry'),
    e('🍅', 'Tomates raf'),
    e('🫒', 'Aceitunas'),
    e('🍇', 'Pasas'),
    e('🍊', 'Pomelos'),
    e('🍌', 'Plátano macho'),
    e('🥝', 'Chirimoya'),
    e('🥭', 'Papaya'),
    e('🍈', 'Higos'),
    e('🍇', 'Granada'),
    e('🍑', 'Ciruelas'),
    e('🍏', 'Caquis'),
  ],

  verduras: [
    e('🥬', 'Lechuga iceberg'),
    e('🥬', 'Lechuga romana'),
    e('🥗', 'Ensalada mixta'),
    e('🥦', 'Brócoli'),
    e('🥦', 'Coliflor'),
    e('🥒', 'Pepino'),
    e('🥕', 'Zanahorias'),
    e('🧅', 'Cebollas'),
    e('🧅', 'Cebolla morada'),
    e('🧄', 'Ajo'),
    e('🥔', 'Patatas'),
    e('🥔', 'Patatas nuevas'),
    e('🍠', 'Boniatos'),
    e('🌶️', 'Pimientos rojos'),
    e('🫑', 'Pimientos verdes'),
    e('🌶️', 'Pimientos tricolor'),
    e('🌽', 'Maíz dulce'),
    e('🍆', 'Berenjena'),
    e('🍄', 'Champiñones'),
    e('🍄', 'Setas shiitake'),
    e('🫛', 'Guisantes'),
    e('🫘', 'Judías verdes'),
    e('🥬', 'Repollo'),
    e('🥬', 'Espinacas'),
    e('🥬', 'Acelgas'),
    e('🥬', 'Rúcula'),
    e('🥬', 'Canónigos'),
    e('🌱', 'Brotes de soja'),
    e('🌿', 'Perejil'),
    e('🌿', 'Cilantro'),
    e('🌿', 'Albahaca'),
    e('🧅', 'Puerros'),
    e('🥬', 'Apio'),
    e('🫒', 'Espárragos verdes'),
    e('🫒', 'Espárragos blancos'),
    e('🥕', 'Remolacha'),
    e('🎃', 'Calabaza'),
    e('🥒', 'Calabacín'),
    e('🌶️', 'Guindillas'),
    e('🫚', 'Jengibre'),
    e('🥔', 'Nabos'),
    e('🥬', 'Endivias'),
    e('🧅', 'Chalotas'),
    e('🌿', 'Romero'),
    e('🌿', 'Tomillo'),
    e('🌿', 'Menta'),
    e('🥬', 'Coles de Bruselas'),
    e('🥬', 'Borraja'),
    e('🧅', 'Cebolletas'),
  ],

  lacteos: [
    // Bricks de leche — código de color español
    p('🥛', 'Leche entera', LECHE.entera),
    p('🥛', 'Leche semidesnatada', LECHE.semi),
    p('🥛', 'Leche desnatada', LECHE.desnatada),
    p('🥛', 'Leche semidesnatada calcio', LECHE.calcio),
    p('🥛', 'Leche sin lactosa', LECHE.sinLactosa),
    p('🥛', 'Leche sin lactosa semidesnatada', {
      type: 'carton', color: '#8e24aa', label: '0%L', liquid: '#f3e5f5', stripe: '#ce93d8',
    }),
    p('🥛', 'Leche fresca entera', LECHE.fresca),
    p('🥛', 'Leche fresca semidesnatada', {
      type: 'bottle', color: '#66bb6a', cap: '#2e7d32', liquid: '#e8f5e9', label: 'F',
    }),
    p('🥛', 'Leche de avena', LECHE.avena),
    p('🥛', 'Leche de almendras', LECHE.almendras),
    p('🥛', 'Leche de soja', LECHE.soja),
    p('🥛', 'Leche de coco', LECHE.coco),
    p('🥛', 'Leche de arroz', LECHE.arroz),
    p('🥛', 'Leche de avellana', LECHE.avellana),
    p('🥛', 'Leche condensada', {
      type: 'can', color: '#5d4037', top: '#d7ccc8', label: 'COND',
    }),
    p('🥛', 'Leche evaporada', {
      type: 'can', color: '#78909c', top: '#cfd8dc', label: 'EVAP',
    }),
    p('🥛', 'Leche en polvo', {
      type: 'can', color: '#90a4ae', top: '#eceff1', label: 'POL',
    }),

    // Mantequillas / grasas
    p('🧈', 'Mantequilla', {
      type: 'bar', color: '#f9a825', wrap: '#fff59d', label: 'MAN',
    }),
    p('🧈', 'Mantequilla sin sal', {
      type: 'bar', color: '#ffb300', wrap: '#fffde7', label: 'S/S',
    }),
    p('🧈', 'Margarina', {
      type: 'tub', color: '#fdd835', lid: '#fbc02d', label: 'MAR',
    }),
    p('🧈', 'Margarina light', {
      type: 'tub', color: '#dce775', lid: '#c0ca33', label: 'LIT',
    }),

    // Quesos — cada uno con su color/forma
    p('🧀', 'Queso fresco', {
      type: 'tub', color: '#fffde7', lid: '#e0e0e0', label: 'FRE',
    }),
    p('🧀', 'Queso fresco batido', {
      type: 'tub', color: '#ffffff', lid: '#b3e5fc', label: 'BAT',
    }),
    p('🧀', 'Queso rallado', {
      type: 'bag', color: '#ffb74d', label: 'RAL',
    }),
    p('🧀', 'Queso cheddar', {
      type: 'bar', color: '#ef6c00', wrap: '#ffe0b2', label: 'CHD',
    }),
    p('🧀', 'Queso gouda', {
      type: 'bar', color: '#fbc02d', wrap: '#fff9c4', label: 'GOU',
    }),
    p('🧀', 'Queso manchego', {
      type: 'bar', color: '#d4a017', wrap: '#fff3e0', label: 'MAN',
    }),
    p('🧀', 'Queso manchego curado', {
      type: 'bar', color: '#bf360c', wrap: '#fbe9e7', label: 'CUR',
    }),
    p('🧀', 'Mozzarella', {
      type: 'bag', color: '#fafafa', label: 'MOZ',
    }),
    p('🧀', 'Mozzarella light', {
      type: 'bag', color: '#e3f2fd', label: 'LIT',
    }),
    p('🧀', 'Queso de cabra', {
      type: 'bar', color: '#eceff1', wrap: '#cfd8dc', label: 'CAB',
    }),
    p('🧀', 'Queso azul', {
      type: 'bar', color: '#5c6bc0', wrap: '#e8eaf6', label: 'AZUL',
    }),
    p('🧀', 'Queso crema', {
      type: 'tub', color: '#fff8e1', lid: '#ffe082', label: 'CRM',
    }),
    p('🧀', 'Queso para untar', {
      type: 'tub', color: '#fff3e0', lid: '#ffcc80', label: 'UNT',
    }),
    p('🧀', 'Queso en lonchas', {
      type: 'bag', color: '#ffe082', label: 'LON',
    }),
    p('🧀', 'Queso fundido lonchas', {
      type: 'bag', color: '#ffd54f', label: 'FUN',
    }),
    p('🧀', 'Ricotta', {
      type: 'tub', color: '#fafafa', lid: '#eeeeee', label: 'RIC',
    }),
    p('🧀', 'Parmesano', {
      type: 'bar', color: '#fff8e1', wrap: '#ffe0b2', label: 'PAR',
    }),
    p('🧀', 'Grana Padano', {
      type: 'bar', color: '#ffe0b2', wrap: '#ffecb3', label: 'GPA',
    }),
    p('🧀', 'Feta', {
      type: 'tub', color: '#e3f2fd', lid: '#90caf9', label: 'FET',
    }),
    p('🧀', 'Queso brie', {
      type: 'bar', color: '#fffde7', wrap: '#f0f4c3', label: 'BRI',
    }),
    p('🧀', 'Queso camembert', {
      type: 'bar', color: '#f5f5f5', wrap: '#d7ccc8', label: 'CAM',
    }),
    p('🧀', 'Queso emmental', {
      type: 'bar', color: '#ffca28', wrap: '#fff59d', label: 'EMM',
    }),
    p('🧀', 'Queso provolone', {
      type: 'bar', color: '#ffb300', wrap: '#ffe082', label: 'PRO',
    }),
    p('🧀', 'Queso tetilla', {
      type: 'bar', color: '#ffe082', wrap: '#fff8e1', label: 'TET',
    }),
    p('🧀', 'Queso idiazábal', {
      type: 'bar', color: '#6d4c41', wrap: '#d7ccc8', label: 'IDI',
    }),
    p('🧀', 'Burgos / fresco oveja', {
      type: 'tub', color: '#fafafa', lid: '#bcaaa4', label: 'BUR',
    }),

    // Yogures
    p('🥛', 'Yogur natural', {
      type: 'pot', color: '#ffffff', foil: '#bdbdbd', fill: '#fffde7', label: 'NAT',
    }),
    p('🥛', 'Yogur natural azucarado', {
      type: 'pot', color: '#ffffff', foil: '#ffcc80', fill: '#fff8e1', label: 'AZU',
    }),
    p('🥛', 'Yogur griego', {
      type: 'pot', color: '#ffffff', foil: '#5d4037', fill: '#fffaf0', label: 'GRI',
    }),
    p('🥛', 'Yogur griego miel', {
      type: 'pot', color: '#ffffff', foil: '#f9a825', fill: '#fff8e1', label: 'MIEL',
    }),
    p('🥛', 'Yogur de fresa', {
      type: 'pot', color: '#ffffff', foil: '#e53935', fill: '#fce4ec', label: 'FRE',
    }),
    p('🥛', 'Yogur de limón', {
      type: 'pot', color: '#ffffff', foil: '#fdd835', fill: '#fffde7', label: 'LIM',
    }),
    p('🥛', 'Yogur de melocotón', {
      type: 'pot', color: '#ffffff', foil: '#fb8c00', fill: '#fff3e0', label: 'MEL',
    }),
    p('🥛', 'Yogur de frutas del bosque', {
      type: 'pot', color: '#ffffff', foil: '#8e24aa', fill: '#f3e5f5', label: 'BOS',
    }),
    p('🥛', 'Yogur líquido', {
      type: 'bottle', color: '#ec407a', cap: '#ad1457', liquid: '#fce4ec', label: 'LIQ',
    }),
    p('🥛', 'Yogur líquido fresa', {
      type: 'bottle', color: '#e53935', cap: '#b71c1c', liquid: '#ffcdd2', label: 'FRE',
    }),
    p('🥛', 'Yogur sin lactosa', {
      type: 'pot', color: '#ffffff', foil: '#7b1fa2', fill: '#f3e5f5', label: '0%L',
    }),
    p('🥛', 'Yogur bifidus', {
      type: 'pot', color: '#ffffff', foil: '#43a047', fill: '#e8f5e9', label: 'BIF',
    }),
    p('🥛', 'Yogur proteico', {
      type: 'pot', color: '#ffffff', foil: '#1565c0', fill: '#e3f2fd', label: 'PRO',
    }),
    p('🥛', 'Yogur de soja', {
      type: 'pot', color: '#f1f8e9', foil: '#7cb342', fill: '#f9fbe7', label: 'SOJ',
    }),
    p('🥛', 'Skyr', {
      type: 'pot', color: '#ffffff', foil: '#0277bd', fill: '#e1f5fe', label: 'SKY',
    }),

    // Postres lácteos
    p('🍮', 'Natillas', {
      type: 'pot', color: '#fff8e1', foil: '#6d4c41', fill: '#ffe0b2', label: 'NAT',
    }),
    p('🍮', 'Natillas de chocolate', {
      type: 'pot', color: '#efebe9', foil: '#3e2723', fill: '#5d4037', label: 'CHO',
    }),
    p('🍮', 'Flan', {
      type: 'pot', color: '#fff3e0', foil: '#ef6c00', fill: '#ffe0b2', label: 'FLA',
    }),
    p('🍮', 'Flan de huevo', {
      type: 'pot', color: '#fffde7', foil: '#f9a825', fill: '#ffecb3', label: 'HUE',
    }),
    p('🍨', 'Cuajada', {
      type: 'pot', color: '#fafafa', foil: '#90a4ae', fill: '#eceff1', label: 'CUA',
    }),
    p('🍮', 'Arroz con leche', {
      type: 'pot', color: '#fffde7', foil: '#8d6e63', fill: '#fff8e1', label: 'ARR',
    }),
    p('🍮', 'Mousse de chocolate', {
      type: 'pot', color: '#efebe9', foil: '#4e342e', fill: '#6d4c41', label: 'MOU',
    }),

    // Natas
    p('🥛', 'Nata para cocinar', {
      type: 'carton', color: '#eceff1', label: 'COC', liquid: '#fafafa', stripe: '#b0bec5',
    }),
    p('🥛', 'Nata para montar', {
      type: 'carton', color: '#fce4ec', label: 'MON', liquid: '#fff', stripe: '#f48fb1',
    }),
    p('🥛', 'Nata montada spray', {
      type: 'bottle', color: '#f8bbd0', cap: '#ad1457', liquid: '#ffffff', label: 'SP',
    }),
    p('🥛', 'Kéfir', {
      type: 'bottle', color: '#80cbc4', cap: '#00695c', liquid: '#e0f2f1', label: 'KEF',
    }),
    p('🥛', 'Kéfir de fresa', {
      type: 'bottle', color: '#ef9a9a', cap: '#c62828', liquid: '#ffebee', label: 'FRE',
    }),

    // Huevos
    p('🥚', 'Huevos M', {
      type: 'eggbox', color: '#fff8e1', egg: '#ffe0b2', label: 'M',
    }),
    p('🥚', 'Huevos L', {
      type: 'eggbox', color: '#fff3e0', egg: '#ffcc80', label: 'L',
    }),
    p('🥚', 'Huevos XL', {
      type: 'eggbox', color: '#ffe0b2', egg: '#ffb74d', label: 'XL',
    }),
    p('🥚', 'Huevos camperos', {
      type: 'eggbox', color: '#e8f5e9', egg: '#d7ccc8', label: 'CAM',
    }),
    p('🥚', 'Huevos ecológicos', {
      type: 'eggbox', color: '#c8e6c9', egg: '#a1887f', label: 'ECO',
    }),
    p('🥚', 'Claras de huevo', {
      type: 'carton', color: '#e3f2fd', label: 'CLA', liquid: '#ffffff', stripe: '#90caf9',
    }),
  ],

  carne: [
    p('🍗', 'Pollo entero', { type: 'tray', color: '#fff3e0', meat: '#ef9a9a', label: 'POL' }),
    p('🍗', 'Pechuga de pollo', { type: 'tray', color: '#fff8e1', meat: '#ffcdd2', label: 'PEC' }),
    p('🍗', 'Muslos de pollo', { type: 'tray', color: '#ffe0b2', meat: '#e57373', label: 'MUS' }),
    p('🍗', 'Alitas de pollo', { type: 'tray', color: '#ffecb3', meat: '#ef5350', label: 'ALI' }),
    p('🍗', 'Contramuslos de pollo', { type: 'tray', color: '#fff3e0', meat: '#e53935', label: 'CON' }),
    p('🥩', 'Ternera', { type: 'tray', color: '#ffebee', meat: '#b71c1c', label: 'TER' }),
    p('🥩', 'Filetes de ternera', { type: 'tray', color: '#ffcdd2', meat: '#c62828', label: 'FIL' }),
    p('🥩', 'Carne picada ternera', { type: 'tray', color: '#ef9a9a', meat: '#8d1b1b', label: 'PIC' }),
    p('🥩', 'Carne picada mixta', { type: 'tray', color: '#ffccbc', meat: '#bf360c', label: 'MIX' }),
    p('🥩', 'Carne picada pollo', { type: 'tray', color: '#fff3e0', meat: '#e57373', label: 'P.P' }),
    p('🥩', 'Estofado de ternera', { type: 'tray', color: '#ffcdd2', meat: '#ad1457', label: 'EST' }),
    p('🥩', 'Cerdo', { type: 'tray', color: '#fce4ec', meat: '#ec407a', label: 'CER' }),
    p('🥩', 'Lomo de cerdo', { type: 'tray', color: '#f8bbd0', meat: '#d81b60', label: 'LOM' }),
    p('🥩', 'Costillas de cerdo', { type: 'tray', color: '#f48fb1', meat: '#c2185b', label: 'COS' }),
    p('🥩', 'Chuletas de cerdo', { type: 'tray', color: '#fce4ec', meat: '#ad1457', label: 'CHU' }),
    p('🥩', 'Solomillo de cerdo', { type: 'tray', color: '#f3e5f5', meat: '#8e24aa', label: 'SOL' }),
    p('🍖', 'Cordero', { type: 'tray', color: '#efebe9', meat: '#6d4c41', label: 'COR' }),
    p('🍖', 'Chuletas de cordero', { type: 'tray', color: '#d7ccc8', meat: '#5d4037', label: 'CHU' }),
    p('🦃', 'Pavo', { type: 'tray', color: '#e8eaf6', meat: '#7986cb', label: 'PAV' }),
    p('🦃', 'Pechuga de pavo', { type: 'tray', color: '#e3f2fd', meat: '#5c6bc0', label: 'PEC' }),
    p('🥩', 'Conejo', { type: 'tray', color: '#fafafa', meat: '#bcaaa4', label: 'CON' }),
    p('🥩', 'Hamburguesas vacuno', { type: 'tray', color: '#ffcdd2', meat: '#b71c1c', label: 'HAM' }),
    p('🥩', 'Hamburguesas pollo', { type: 'tray', color: '#fff3e0', meat: '#ef5350', label: 'H.P' }),
    p('🥩', 'Albóndigas', { type: 'tray', color: '#ffccbc', meat: '#d84315', label: 'ALB' }),
    p('🥩', 'Pinchos morunos', { type: 'tray', color: '#ffe0b2', meat: '#e65100', label: 'PIN' }),
    p('🍗', 'Nuggets de pollo', { type: 'bag', color: '#ffb74d', label: 'NUG' }),
    p('🥩', 'Entrecot', { type: 'tray', color: '#ffcdd2', meat: '#880e4f', label: 'ENT' }),
  ],

  pescado: [
    p('🐟', 'Salmón', { type: 'tray', color: '#ffe0b2', meat: '#ff7043', label: 'SAL' }),
    p('🐟', 'Salmón ahumado', { type: 'bag', color: '#ff8a65', label: 'AHU' }),
    p('🐟', 'Merluza', { type: 'tray', color: '#e3f2fd', meat: '#90caf9', label: 'MER' }),
    p('🐟', 'Bacalao', { type: 'tray', color: '#e8eaf6', meat: '#9fa8da', label: 'BAC' }),
    p('🐟', 'Bacalao desalado', { type: 'bag', color: '#c5cae9', label: 'DES' }),
    p('🐟', 'Atún fresco', { type: 'tray', color: '#ffcdd2', meat: '#c62828', label: 'ATU' }),
    p('🐟', 'Dorada', { type: 'tray', color: '#e0f7fa', meat: '#4dd0e1', label: 'DOR' }),
    p('🐟', 'Lubina', { type: 'tray', color: '#e0f2f1', meat: '#80cbc4', label: 'LUB' }),
    p('🐟', 'Sardinas frescas', { type: 'tray', color: '#e3f2fd', meat: '#64b5f6', label: 'SAR' }),
    p('🐟', 'Caballa', { type: 'tray', color: '#e8eaf6', meat: '#7986cb', label: 'CAB' }),
    p('🐟', 'Trucha', { type: 'tray', color: '#fce4ec', meat: '#f06292', label: 'TRU' }),
    p('🐟', 'Rape', { type: 'tray', color: '#f3e5f5', meat: '#ba68c8', label: 'RAP' }),
    p('🐟', 'Pez espada', { type: 'tray', color: '#e8eaf6', meat: '#5c6bc0', label: 'ESP' }),
    p('🐟', 'Boquerones', { type: 'tray', color: '#e1f5fe', meat: '#29b6f6', label: 'BOQ' }),
    p('🐠', 'Pescadilla', { type: 'tray', color: '#e3f2fd', meat: '#42a5f5', label: 'PES' }),
    p('🍤', 'Gambas', { type: 'tray', color: '#ffebee', meat: '#ef5350', label: 'GAM' }),
    p('🦐', 'Langostinos', { type: 'tray', color: '#fce4ec', meat: '#e53935', label: 'LAN' }),
    p('🦐', 'Gambas cocidas', { type: 'bag', color: '#ef9a9a', label: 'COC' }),
    p('🦑', 'Calamar', { type: 'tray', color: '#eceff1', meat: '#90a4ae', label: 'CAL' }),
    p('🦑', 'Pulpo', { type: 'tray', color: '#f3e5f5', meat: '#8e24aa', label: 'PUL' }),
    p('🦞', 'Bogavante', { type: 'tray', color: '#ffebee', meat: '#c62828', label: 'BOG' }),
    p('🦪', 'Mejillones', { type: 'bag', color: '#455a64', label: 'MEJ' }),
    p('🦪', 'Almejas', { type: 'bag', color: '#607d8b', label: 'ALM' }),
    p('🦪', 'Ostras', { type: 'tray', color: '#cfd8dc', meat: '#78909c', label: 'OST' }),
    p('🐚', 'Berberechos', { type: 'can', color: '#546e7a', top: '#b0bec5', label: 'BER' }),
    p('🐟', 'Surimi', { type: 'bag', color: '#ef5350', label: 'SUR' }),
    p('🐟', 'Varitas de pescado', { type: 'box', color: '#42a5f5', label: 'VAR' }),
  ],

  charcuteria: [
    p('🥓', 'Jamón serrano', { type: 'bag', color: '#c62828', label: 'SER' }),
    p('🥓', 'Jamón ibérico', { type: 'bag', color: '#4e342e', label: 'IBE' }),
    p('🥓', 'Jamón york', { type: 'bag', color: '#f8bbd0', label: 'YOR' }),
    p('🥓', 'Jamón cocido extra', { type: 'bag', color: '#ef9a9a', label: 'COC' }),
    p('🥓', 'Bacon', { type: 'bag', color: '#e57373', label: 'BAC' }),
    p('🥓', 'Panceta', { type: 'bag', color: '#ec407a', label: 'PAN' }),
    p('🌭', 'Salchichas frescas', { type: 'tray', color: '#ffe0b2', meat: '#e57373', label: 'SAL' }),
    p('🌭', 'Salchichas frankfurt', { type: 'bag', color: '#ffcc80', label: 'FRA' }),
    p('🌭', 'Salchichas de pollo', { type: 'bag', color: '#fff59d', label: 'POL' }),
    p('🥓', 'Chorizo', { type: 'bar', color: '#d84315', wrap: '#ffccbc', label: 'CHO' }),
    p('🥓', 'Chorizo ibérico', { type: 'bar', color: '#bf360c', wrap: '#ffab91', label: 'IBE' }),
    p('🥓', 'Salchichón', { type: 'bar', color: '#5d4037', wrap: '#d7ccc8', label: 'SAL' }),
    p('🥓', 'Lomo embuchado', { type: 'bar', color: '#8d6e63', wrap: '#efebe9', label: 'LOM' }),
    p('🥓', 'Mortadela', { type: 'bag', color: '#f8bbd0', label: 'MOR' }),
    p('🥓', 'Pavo en lonchas', { type: 'bag', color: '#b39ddb', label: 'PAV' }),
    p('🥓', 'Pollo en lonchas', { type: 'bag', color: '#ffab91', label: 'POL' }),
    p('🥓', 'Fuet', { type: 'bar', color: '#6d4c41', wrap: '#bcaaa4', label: 'FUE' }),
    p('🥓', 'Sobrasada', { type: 'tub', color: '#e64a19', lid: '#bf360c', label: 'SOB' }),
    p('🥓', 'Morcilla', { type: 'bar', color: '#212121', wrap: '#616161', label: 'MOR' }),
    p('🥓', 'Cecina', { type: 'bag', color: '#4e342e', label: 'CEC' }),
  ],

  panaderia: [
    e('🍞', 'Pan de molde blanco'),
    e('🍞', 'Pan de molde integral'),
    e('🍞', 'Pan de molde sin corteza'),
    e('🍞', 'Pan de centeno'),
    e('🍞', 'Pan de semillas'),
    e('🥖', 'Baguette'),
    e('🥖', 'Barra de pan'),
    e('🥖', 'Barra rústica'),
    e('🫓', 'Pan pita'),
    e('🫓', 'Tortillas de trigo'),
    e('🫓', 'Tortillas de maíz'),
    e('🥯', 'Bagels'),
    e('🥐', 'Croissants'),
    e('🥐', 'Croissants de mantequilla'),
    e('🧁', 'Magdalenas'),
    e('🍰', 'Bizcocho'),
    e('🍩', 'Donuts'),
    e('🍪', 'Galletas María'),
    e('🍞', 'Pan de hamburguesa'),
    e('🍞', 'Pan de hot dog'),
    e('🫓', 'Wraps'),
    e('🍞', 'Pan rallado'),
    e('🍞', 'Pan tostado'),
    e('🥐', 'Napolitanas'),
    e('🧁', 'Palmeras'),
    e('🍞', 'Chapata'),
    e('🫓', 'Focaccia'),
    e('🍞', 'Pan de pueblo'),
    e('🍞', 'Pan sin gluten'),
  ],

  desayuno: [
    p('🥣', 'Cereales chocolate', { type: 'box', color: '#5d4037', label: 'CHO' }),
    p('🥣', 'Cereales miel', { type: 'box', color: '#f9a825', label: 'MIE' }),
    p('🥣', 'Corn flakes', { type: 'box', color: '#ff9800', label: 'COR' }),
    p('🥣', 'Avena', { type: 'box', color: '#a1887f', label: 'AVE' }),
    p('🥣', 'Muesli', { type: 'box', color: '#8d6e63', label: 'MUE' }),
    p('🥣', 'Granola', { type: 'box', color: '#6d4c41', label: 'GRA' }),
    p('🥜', 'Crema de cacahuete', { type: 'jar', color: '#d7ccc8', lid: '#8d6e63', label: 'CAC' }),
    p('🍯', 'Miel', { type: 'jar', color: '#f9a825', lid: '#ef6c00', label: 'MIEL' }),
    p('🍓', 'Mermelada de fresa', { type: 'jar', color: '#e53935', lid: '#b71c1c', label: 'FRE' }),
    p('🍑', 'Mermelada de melocotón', { type: 'jar', color: '#fb8c00', lid: '#ef6c00', label: 'MEL' }),
    p('🍊', 'Mermelada de naranja', { type: 'jar', color: '#ff9800', lid: '#e65100', label: 'NAR' }),
    p('🫐', 'Mermelada de frutos rojos', { type: 'jar', color: '#8e24aa', lid: '#4a148c', label: 'ROJ' }),
    p('🍫', 'Crema de cacao', { type: 'jar', color: '#5d4037', lid: '#3e2723', label: 'CAC' }),
    p('☕', 'Café molido', { type: 'bag', color: '#4e342e', label: 'MOL' }),
    p('☕', 'Café en cápsulas', { type: 'box', color: '#3e2723', label: 'CAP' }),
    p('☕', 'Café soluble', { type: 'jar', color: '#6d4c41', lid: '#ffd54f', label: 'SOL' }),
    p('☕', 'Café descafeinado', { type: 'bag', color: '#795548', label: 'DES' }),
    p('🍵', 'Té negro', { type: 'box', color: '#37474f', label: 'NEG' }),
    p('🍵', 'Té verde', { type: 'box', color: '#558b2f', label: 'VER' }),
    p('🍵', 'Manzanilla', { type: 'box', color: '#fdd835', label: 'MAN' }),
    p('🍵', 'Infusiones surtido', { type: 'box', color: '#26a69a', label: 'INF' }),
    p('🍫', 'Cacao en polvo', { type: 'can', color: '#4e342e', top: '#d7ccc8', label: 'CAC' }),
    p('🥛', 'Batido de cacao', { type: 'carton', color: '#5d4037', label: 'BAT', liquid: '#efebe9', stripe: '#ffcc80' }),
    p('🥞', 'Harina para tortitas', { type: 'box', color: '#ffb74d', label: 'TOR' }),
    p('🥞', 'Sirope de arce', { type: 'bottle', color: '#bf360c', cap: '#5d4037', liquid: '#e65100', label: 'ARC' }),
    p('🧃', 'Zumo de naranja', { type: 'carton', color: '#fb8c00', label: 'NAR', liquid: '#ffe0b2', stripe: '#fff' }),
    p('🧃', 'Zumo de piña', { type: 'carton', color: '#fdd835', label: 'PIÑ', liquid: '#fff9c4', stripe: '#fff' }),
    p('🧃', 'Zumo multifrutas', { type: 'carton', color: '#e53935', label: 'MUL', liquid: '#ffcdd2', stripe: '#fff' }),
  ],

  despensa: [
    p('🍚', 'Arroz redondo', { type: 'bag', color: '#fff8e1', label: 'RED' }),
    p('🍚', 'Arroz largo', { type: 'bag', color: '#fffde7', label: 'LAR' }),
    p('🍚', 'Arroz integral', { type: 'bag', color: '#d7ccc8', label: 'INT' }),
    p('🍚', 'Arroz basmati', { type: 'bag', color: '#ffe0b2', label: 'BAS' }),
    p('🍝', 'Espaguetis', { type: 'box', color: '#ffcc80', label: 'ESP' }),
    p('🍝', 'Macarrones', { type: 'box', color: '#ffb74d', label: 'MAC' }),
    p('🍝', 'Tallarines', { type: 'box', color: '#ffa726', label: 'TAL' }),
    p('🍝', 'Placas lasaña', { type: 'box', color: '#ff9800', label: 'LAS' }),
    p('🍝', 'Pasta integral', { type: 'box', color: '#a1887f', label: 'INT' }),
    p('🍝', 'Pasta sin gluten', { type: 'box', color: '#81c784', label: 'S/G' }),
    p('🍜', 'Fideos', { type: 'bag', color: '#ffe082', label: 'FID' }),
    p('🍜', 'Ramen', { type: 'bag', color: '#ef5350', label: 'RAM' }),
    p('🫘', 'Lentejas', { type: 'bag', color: '#6d4c41', label: 'LEN' }),
    p('🫘', 'Garbanzos', { type: 'bag', color: '#d7ccc8', label: 'GAR' }),
    p('🫘', 'Alubias blancas', { type: 'bag', color: '#fafafa', label: 'ALU' }),
    p('🫘', 'Alubias pintas', { type: 'bag', color: '#a1887f', label: 'PIN' }),
    p('🫘', 'Soja texturizada', { type: 'bag', color: '#c5e1a5', label: 'SOJ' }),
    p('🌾', 'Harina de trigo', { type: 'bag', color: '#fff8e1', label: 'HAR' }),
    p('🌾', 'Harina integral', { type: 'bag', color: '#d7ccc8', label: 'INT' }),
    p('🌾', 'Harina de maíz', { type: 'bag', color: '#fff176', label: 'MAI' }),
    p('🧁', 'Harina de repostería', { type: 'bag', color: '#f8bbd0', label: 'REP' }),
    p('🍬', 'Azúcar blanco', { type: 'bag', color: '#fafafa', label: 'AZU' }),
    p('🍬', 'Azúcar moreno', { type: 'bag', color: '#8d6e63', label: 'MOR' }),
    p('🍬', 'Azúcar glass', { type: 'bag', color: '#eceff1', label: 'GLA' }),
    p('🧂', 'Sal fina', { type: 'box', color: '#e3f2fd', label: 'SAL' }),
    p('🧂', 'Sal marina', { type: 'box', color: '#b3e5fc', label: 'MAR' }),
    p('🫒', 'Aceite de oliva', { type: 'bottle', color: '#827717', cap: '#33691e', liquid: '#c0ca33', label: 'AO' }),
    p('🫒', 'AOVE', { type: 'bottle', color: '#558b2f', cap: '#1b5e20', liquid: '#9e9d24', label: 'AOVE' }),
    p('🌻', 'Aceite de girasol', { type: 'bottle', color: '#fdd835', cap: '#f9a825', liquid: '#fff176', label: 'GIR' }),
    p('🥥', 'Aceite de coco', { type: 'jar', color: '#fffde7', lid: '#b0bec5', label: 'COC' }),
    p('🫙', 'Vinagre de vino', { type: 'bottle', color: '#6a1b9a', cap: '#4a148c', liquid: '#8e24aa', label: 'VIN' }),
    p('🫙', 'Vinagre balsámico', { type: 'bottle', color: '#4e342e', cap: '#3e2723', liquid: '#5d4037', label: 'BAL' }),
    p('🫙', 'Vinagre de manzana', { type: 'bottle', color: '#c0ca33', cap: '#827717', liquid: '#dce775', label: 'MAN' }),
    p('🌽', 'Maíz palomitas', { type: 'bag', color: '#ffeb3b', label: 'PAL' }),
    p('🌰', 'Nueces', { type: 'bag', color: '#6d4c41', label: 'NUE' }),
    p('🥜', 'Cacahuetes', { type: 'bag', color: '#d7ccc8', label: 'CAC' }),
    p('🌰', 'Almendras', { type: 'bag', color: '#bcaaa4', label: 'ALM' }),
    p('🌰', 'Avellanas', { type: 'bag', color: '#8d6e63', label: 'AVE' }),
    p('🌰', 'Anacardos', { type: 'bag', color: '#ffe0b2', label: 'ANA' }),
    p('🌰', 'Pistachos', { type: 'bag', color: '#aed581', label: 'PIS' }),
    p('🌻', 'Pipas', { type: 'bag', color: '#ffcc80', label: 'PIP' }),
    p('🎃', 'Semillas de calabaza', { type: 'bag', color: '#9ccc65', label: 'CAL' }),
    p('🌱', 'Semillas de chía', { type: 'bag', color: '#5d4037', label: 'CHI' }),
    p('🍚', 'Quinoa', { type: 'bag', color: '#efebe9', label: 'QUI' }),
    p('🌾', 'Cuscús', { type: 'box', color: '#ffe0b2', label: 'CUS' }),
    p('🍲', 'Caldo de pollo', { type: 'carton', color: '#ffb74d', label: 'POL', liquid: '#ffe0b2', stripe: '#fff' }),
    p('🍲', 'Caldo de verduras', { type: 'carton', color: '#81c784', label: 'VER', liquid: '#c8e6c9', stripe: '#fff' }),
    p('🍲', 'Caldo de carne', { type: 'carton', color: '#e57373', label: 'CAR', liquid: '#ffcdd2', stripe: '#fff' }),
    p('🍜', 'Sopa de sobre', { type: 'box', color: '#ff8a65', label: 'SOP' }),
    p('🧁', 'Levadura fresca', { type: 'bar', color: '#c5e1a5', wrap: '#fff', label: 'LEV' }),
    p('🧁', 'Levadura química', { type: 'can', color: '#ffcc80', top: '#fff', label: 'QUI' }),
    p('🧁', 'Bicarbonato', { type: 'box', color: '#e3f2fd', label: 'BIC' }),
    p('🍫', 'Chocolate fondant', { type: 'bar', color: '#3e2723', wrap: '#5d4037', label: 'FON' }),
    p('🍫', 'Pepitas de chocolate', { type: 'bag', color: '#4e342e', label: 'PEP' }),
    p('🥥', 'Coco rallado', { type: 'bag', color: '#fafafa', label: 'COC' }),
  ],

  conservas: [
    p('🥫', 'Atún en aceite', { type: 'can', color: '#0277bd', top: '#b3e5fc', label: 'ATU' }),
    p('🥫', 'Atún al natural', { type: 'can', color: '#29b6f6', top: '#e1f5fe', label: 'NAT' }),
    p('🥫', 'Atún claro', { type: 'can', color: '#01579b', top: '#81d4fa', label: 'CLA' }),
    p('🥫', 'Sardinas en aceite', { type: 'can', color: '#1565c0', top: '#90caf9', label: 'SAR' }),
    p('🥫', 'Caballa en aceite', { type: 'can', color: '#283593', top: '#9fa8da', label: 'CAB' }),
    p('🥫', 'Mejillones en escabeche', { type: 'can', color: '#00695c', top: '#80cbc4', label: 'MEJ' }),
    p('🥫', 'Tomate frito', { type: 'can', color: '#c62828', top: '#ef9a9a', label: 'FRI' }),
    p('🥫', 'Tomate frito casero', { type: 'jar', color: '#d32f2f', lid: '#b71c1c', label: 'CAS' }),
    p('🥫', 'Tomate triturado', { type: 'carton', color: '#e53935', label: 'TRI', liquid: '#ffcdd2', stripe: '#fff' }),
    p('🥫', 'Tomate concentrado', { type: 'can', color: '#b71c1c', top: '#e57373', label: 'CON' }),
    p('🥫', 'Maíz dulce', { type: 'can', color: '#fbc02d', top: '#fff59d', label: 'MAI' }),
    p('🥫', 'Guisantes', { type: 'can', color: '#7cb342', top: '#c5e1a5', label: 'GUI' }),
    p('🥫', 'Garbanzos', { type: 'can', color: '#d7ccc8', top: '#efebe9', label: 'GAR' }),
    p('🥫', 'Lentejas', { type: 'can', color: '#6d4c41', top: '#bcaaa4', label: 'LEN' }),
    p('🥫', 'Alubias', { type: 'can', color: '#fafafa', top: '#e0e0e0', label: 'ALU' }),
    p('🥫', 'Champiñones', { type: 'can', color: '#8d6e63', top: '#d7ccc8', label: 'CHA' }),
    p('🥫', 'Piña en almíbar', { type: 'can', color: '#fdd835', top: '#fff59d', label: 'PIÑ' }),
    p('🥫', 'Melocotón en almíbar', { type: 'can', color: '#ffb74d', top: '#ffe0b2', label: 'MEL' }),
    p('🥫', 'Cóctel de frutas', { type: 'can', color: '#ef5350', top: '#ffcdd2', label: 'COC' }),
    p('🥫', 'Espárragos', { type: 'can', color: '#aed581', top: '#dcedc8', label: 'ESP' }),
    p('🥫', 'Pimientos asados', { type: 'jar', color: '#c62828', lid: '#b71c1c', label: 'PIM' }),
    p('🥫', 'Aceitunas verdes', { type: 'jar', color: '#9e9d24', lid: '#827717', label: 'VER' }),
    p('🥫', 'Aceitunas negras', { type: 'jar', color: '#37474f', lid: '#263238', label: 'NEG' }),
    p('🥫', 'Pepinillos', { type: 'jar', color: '#7cb342', lid: '#558b2f', label: 'PEP' }),
    p('🫙', 'Compota de manzana', { type: 'jar', color: '#ffcc80', lid: '#ef6c00', label: 'COM' }),
  ],

  salsas: [
    p('🍅', 'Ketchup', { type: 'bottle', color: '#c62828', cap: '#b71c1c', liquid: '#e53935', label: 'KET' }),
    p('🟡', 'Mayonesa', { type: 'jar', color: '#fff59d', lid: '#fbc02d', label: 'MAY' }),
    p('🟡', 'Mayonesa light', { type: 'jar', color: '#fffde7', lid: '#fdd835', label: 'LIT' }),
    p('🟡', 'Mostaza', { type: 'jar', color: '#f9a825', lid: '#f57f17', label: 'MOS' }),
    p('🌶️', 'Salsa picante', { type: 'bottle', color: '#d32f2f', cap: '#212121', liquid: '#b71c1c', label: 'PIC' }),
    p('🟤', 'Salsa barbacoa', { type: 'bottle', color: '#4e342e', cap: '#3e2723', liquid: '#5d4037', label: 'BBQ' }),
    p('🧧', 'Salsa de soja', { type: 'bottle', color: '#212121', cap: '#ff6f00', liquid: '#3e2723', label: 'SOJ' }),
    p('🧧', 'Salsa teriyaki', { type: 'bottle', color: '#3e2723', cap: '#e65100', liquid: '#4e342e', label: 'TER' }),
    p('🍅', 'Pesto', { type: 'jar', color: '#558b2f', lid: '#33691e', label: 'PES' }),
    p('🍅', 'Salsa carbonara', { type: 'jar', color: '#fff8e1', lid: '#ffcc80', label: 'CAR' }),
    p('🍅', 'Salsa boloñesa', { type: 'jar', color: '#c62828', lid: '#8d1b1b', label: 'BOL' }),
    p('🥑', 'Guacamole', { type: 'tub', color: '#8bc34a', lid: '#558b2f', label: 'GUA' }),
    p('🫘', 'Houmous', { type: 'tub', color: '#ffe0b2', lid: '#ffb74d', label: 'HOU' }),
    p('🧂', 'Pimienta negra', { type: 'jar', color: '#212121', lid: '#616161', label: 'PIM' }),
    p('🌶️', 'Pimentón dulce', { type: 'can', color: '#c62828', top: '#ef9a9a', label: 'DUL' }),
    p('🌶️', 'Pimentón picante', { type: 'can', color: '#b71c1c', top: '#e57373', label: 'PIC' }),
    p('🌿', 'Orégano', { type: 'jar', color: '#7cb342', lid: '#558b2f', label: 'ORE' }),
    p('🌿', 'Comino', { type: 'jar', color: '#a1887f', lid: '#6d4c41', label: 'COM' }),
    p('🌿', 'Curry', { type: 'jar', color: '#fbc02d', lid: '#f9a825', label: 'CUR' }),
    p('🌿', 'Cúrcuma', { type: 'jar', color: '#fdd835', lid: '#fbc02d', label: 'CURC' }),
    p('🌿', 'Canela', { type: 'jar', color: '#6d4c41', lid: '#4e342e', label: 'CAN' }),
    p('🫙', 'Alioli', { type: 'jar', color: '#fffde7', lid: '#fdd835', label: 'ALI' }),
    p('🫙', 'Salsa César', { type: 'bottle', color: '#fff8e1', cap: '#8d6e63', liquid: '#ffe0b2', label: 'CES' }),
  ],

  congelados: [
    p('🍕', 'Pizza margarita', { type: 'box', color: '#e53935', label: 'MAR' }),
    p('🍕', 'Pizza 4 quesos', { type: 'box', color: '#fb8c00', label: '4Q' }),
    p('🍕', 'Pizza pepperoni', { type: 'box', color: '#c62828', label: 'PEP' }),
    p('🍟', 'Patatas fritas congeladas', { type: 'bag', color: '#ffb300', label: 'PAT' }),
    p('🥦', 'Verduras congeladas', { type: 'bag', color: '#66bb6a', label: 'VER' }),
    p('🌽', 'Maíz congelado', { type: 'bag', color: '#fdd835', label: 'MAI' }),
    p('🫛', 'Guisantes congelados', { type: 'bag', color: '#7cb342', label: 'GUI' }),
    p('🍓', 'Frutos rojos congelados', { type: 'bag', color: '#8e24aa', label: 'ROJ' }),
    p('🥭', 'Fruta congelada', { type: 'bag', color: '#ff7043', label: 'FRU' }),
    p('🍤', 'Gambas congeladas', { type: 'bag', color: '#ef5350', label: 'GAM' }),
    p('🐟', 'Pescado congelado', { type: 'bag', color: '#42a5f5', label: 'PES' }),
    p('🍗', 'Nuggets congelados', { type: 'bag', color: '#ffb74d', label: 'NUG' }),
    p('🥩', 'Hamburguesas congeladas', { type: 'box', color: '#e57373', label: 'HAM' }),
    p('🥟', 'Empanadillas', { type: 'box', color: '#ffcc80', label: 'EMP' }),
    p('🥟', 'Gyozas', { type: 'box', color: '#ffab91', label: 'GYO' }),
    p('🍜', 'Lasaña congelada', { type: 'box', color: '#ef6c00', label: 'LAS' }),
    p('🍱', 'Plato preparado', { type: 'box', color: '#5c6bc0', label: 'PLA' }),
    p('🍦', 'Helado vainilla', { type: 'tub', color: '#fff8e1', lid: '#ffe082', label: 'VAI' }),
    p('🍦', 'Helado chocolate', { type: 'tub', color: '#5d4037', lid: '#3e2723', label: 'CHO' }),
    p('🍦', 'Helado fresa', { type: 'tub', color: '#f48fb1', lid: '#e91e63', label: 'FRE' }),
    p('🍦', 'Polos', { type: 'box', color: '#29b6f6', label: 'POL' }),
    p('🍦', 'Helado tarrina', { type: 'tub', color: '#ce93d8', lid: '#8e24aa', label: 'TAR' }),
    p('🥖', 'Pan congelado', { type: 'bag', color: '#ffe0b2', label: 'PAN' }),
    p('🥐', 'Croissants congelados', { type: 'bag', color: '#ffcc80', label: 'CRO' }),
    p('🧊', 'Cubitos de hielo', { type: 'bag', color: '#e1f5fe', label: 'HIE' }),
  ],

  bebidas: [
    p('💧', 'Agua mineral', { type: 'bottle', color: '#4fc3f7', cap: '#0277bd', liquid: '#e1f5fe', label: 'H2O' }),
    p('💧', 'Agua con gas', { type: 'bottle', color: '#81d4fa', cap: '#0288d1', liquid: '#e3f2fd', label: 'GAS' }),
    p('💧', 'Pack agua 6x', { type: 'box', color: '#29b6f6', label: '6×' }),
    p('🧃', 'Zumo naranja', { type: 'carton', color: '#fb8c00', label: 'NAR', liquid: '#ffe0b2', stripe: '#fff' }),
    p('🧃', 'Zumo manzana', { type: 'carton', color: '#c62828', label: 'MAN', liquid: '#ffcdd2', stripe: '#fff' }),
    p('🧃', 'Zumo tomate', { type: 'carton', color: '#d32f2f', label: 'TOM', liquid: '#ef9a9a', stripe: '#fff' }),
    p('🧃', 'Zumo piña', { type: 'carton', color: '#fdd835', label: 'PIÑ', liquid: '#fff9c4', stripe: '#fff' }),
    p('🧃', 'Smoothie', { type: 'bottle', color: '#ec407a', cap: '#ad1457', liquid: '#f8bbd0', label: 'SM' }),
    p('🥤', 'Cola', { type: 'can', color: '#212121', top: '#b71c1c', label: 'COLA' }),
    p('🥤', 'Cola zero', { type: 'can', color: '#212121', top: '#c0ca33', label: 'ZERO' }),
    p('🥤', 'Naranja', { type: 'can', color: '#ef6c00', top: '#ffcc80', label: 'NAR' }),
    p('🥤', 'Limón', { type: 'can', color: '#fdd835', top: '#fff59d', label: 'LIM' }),
    p('🥤', 'Tónica', { type: 'can', color: '#eceff1', top: '#90a4ae', label: 'TON' }),
    p('🧋', 'Té helado', { type: 'bottle', color: '#8d6e63', cap: '#5d4037', liquid: '#d7ccc8', label: 'TE' }),
    p('🍺', 'Cerveza', { type: 'can', color: '#f9a825', top: '#fff59d', label: 'CER' }),
    p('🍺', 'Cerveza sin alcohol', { type: 'can', color: '#81c784', top: '#c8e6c9', label: '0.0' }),
    p('🍻', 'Pack cervezas', { type: 'box', color: '#ef6c00', label: 'PACK' }),
    p('🍷', 'Vino tinto', { type: 'bottle', color: '#4a148c', cap: '#212121', liquid: '#6a1b9a', label: 'TIN' }),
    p('🍷', 'Vino blanco', { type: 'bottle', color: '#fff59d', cap: '#827717', liquid: '#fffde7', label: 'BLA' }),
    p('🥂', 'Cava', { type: 'bottle', color: '#1a237e', cap: '#ffd54f', liquid: '#e8eaf6', label: 'CAV' }),
    p('🍾', 'Sidra', { type: 'bottle', color: '#c0ca33', cap: '#558b2f', liquid: '#f0f4c3', label: 'SID' }),
    p('🥛', 'Batido chocolate', { type: 'carton', color: '#5d4037', label: 'CHO', liquid: '#efebe9', stripe: '#ffcc80' }),
    p('🥛', 'Batido fresa', { type: 'carton', color: '#e91e63', label: 'FRE', liquid: '#fce4ec', stripe: '#fff' }),
    p('🧋', 'Bebida energética', { type: 'can', color: '#212121', top: '#00e676', label: 'ENE' }),
    p('🧋', 'Isotónica', { type: 'bottle', color: '#00bcd4', cap: '#006064', liquid: '#b2ebf2', label: 'ISO' }),
  ],

  snacks: [
    p('🥔', 'Patatas chips', { type: 'bag', color: '#fdd835', label: 'CHI' }),
    p('🥔', 'Patatas onduladas', { type: 'bag', color: '#ffb300', label: 'OND' }),
    p('🥔', 'Patatas jamón', { type: 'bag', color: '#ef5350', label: 'JAM' }),
    p('🌽', 'Nachos', { type: 'bag', color: '#ff9800', label: 'NAC' }),
    p('🌽', 'Palomitas', { type: 'bag', color: '#ffeb3b', label: 'PAL' }),
    p('🥨', 'Pretzels', { type: 'bag', color: '#d7ccc8', label: 'PRE' }),
    p('🍘', 'Crackers', { type: 'box', color: '#ffe0b2', label: 'CRA' }),
    p('🥜', 'Frutos secos mixtos', { type: 'bag', color: '#8d6e63', label: 'MIX' }),
    p('🍫', 'Chocolate negro', { type: 'bar', color: '#3e2723', wrap: '#5d4037', label: 'NEG' }),
    p('🍫', 'Chocolate con leche', { type: 'bar', color: '#6d4c41', wrap: '#a1887f', label: 'LEC' }),
    p('🍫', 'Chocolate blanco', { type: 'bar', color: '#fff8e1', wrap: '#ffe0b2', label: 'BLA' }),
    p('🍫', 'Chocolate con almendras', { type: 'bar', color: '#4e342e', wrap: '#bcaaa4', label: 'ALM' }),
    p('🍬', 'Caramelos', { type: 'bag', color: '#ec407a', label: 'CAR' }),
    p('🍬', 'Gominolas', { type: 'bag', color: '#ab47bc', label: 'GOM' }),
    p('🍭', 'Chupa chups', { type: 'bag', color: '#e53935', label: 'CHU' }),
    p('🍪', 'Galletas', { type: 'box', color: '#ffcc80', label: 'GAL' }),
    p('🍪', 'Galletas chocolate', { type: 'box', color: '#5d4037', label: 'CHO' }),
    p('🍪', 'Galletas digestivas', { type: 'box', color: '#d7ccc8', label: 'DIG' }),
    p('🍪', 'Galletas rellenas', { type: 'box', color: '#f48fb1', label: 'REL' }),
    p('🧁', 'Magdalenas pack', { type: 'box', color: '#ffab91', label: 'MAG' }),
    p('🍫', 'Barritas cereales', { type: 'box', color: '#8bc34a', label: 'CER' }),
    p('🍫', 'Barritas chocolate', { type: 'box', color: '#6d4c41', label: 'CHO' }),
    p('🧀', 'Snack queso', { type: 'bag', color: '#ffc107', label: 'QUE' }),
    p('🍬', 'Chicles', { type: 'box', color: '#26c6da', label: 'CHI' }),
    p('🍫', 'Bombones', { type: 'box', color: '#4a148c', label: 'BOM' }),
  ],

  platos: [
    e('🍱', 'Ensalada preparada'),
    e('🥪', 'Sándwich'),
    e('🌮', 'Tacos preparados'),
    e('🍕', 'Pizza refrigerada'),
    e('🍝', 'Pasta fresca'),
    e('🍲', 'Guiso preparado'),
    e('🍜', 'Sopa preparada'),
    e('🥗', 'Bowl preparado'),
    e('🍣', 'Sushi'),
    e('🥟', 'Empanada'),
    e('🧆', 'Falafel'),
    e('🥙', 'Kebab preparado'),
    e('🍳', 'Tortilla de patatas'),
    e('🥘', 'Paella preparada'),
    e('🍖', 'Pollo asado'),
    e('🍲', 'Cocido preparado'),
  ],

  bebe: [
    p('🍼', 'Leche de fórmula 1', { type: 'can', color: '#fff59d', top: '#fdd835', label: '1' }),
    p('🍼', 'Leche de fórmula 2', { type: 'can', color: '#c8e6c9', top: '#81c784', label: '2' }),
    p('🍼', 'Leche de fórmula 3', { type: 'can', color: '#bbdefb', top: '#64b5f6', label: '3' }),
    p('🥣', 'Papilla', { type: 'box', color: '#ffe0b2', label: 'PAP' }),
    p('🥣', 'Potitos verduras', { type: 'jar', color: '#aed581', lid: '#7cb342', label: 'VER' }),
    p('🥣', 'Potitos fruta', { type: 'jar', color: '#ffab91', lid: '#ff7043', label: 'FRU' }),
    p('🍪', 'Galletas bebé', { type: 'box', color: '#ffcc80', label: 'GAL' }),
    p('🧃', 'Zumo bebé', { type: 'carton', color: '#ffb74d', label: 'ZUM', liquid: '#ffe0b2', stripe: '#fff' }),
    p('🧷', 'Pañales T2', { type: 'box', color: '#81d4fa', label: 'T2' }),
    p('🧷', 'Pañales T3', { type: 'box', color: '#4fc3f7', label: 'T3' }),
    p('🧷', 'Pañales T4', { type: 'box', color: '#29b6f6', label: 'T4' }),
    p('🧷', 'Pañales T5', { type: 'box', color: '#039be5', label: 'T5' }),
    p('🧴', 'Toallitas bebé', { type: 'box', color: '#b2ebf2', label: 'TOA' }),
    p('🧴', 'Crema bebé', { type: 'tub', color: '#fff9c4', lid: '#fff176', label: 'CRE' }),
    p('🧴', 'Champú bebé', { type: 'bottle', color: '#fff59d', cap: '#fbc02d', liquid: '#fffde7', label: 'CHA' }),
  ],

  mascotas: [
    p('🐕', 'Pienso perro adulto', { type: 'bag', color: '#5d4037', label: 'PER' }),
    p('🐕', 'Pienso perro cachorro', { type: 'bag', color: '#8d6e63', label: 'CAC' }),
    p('🐈', 'Pienso gato', { type: 'bag', color: '#6a1b9a', label: 'GAT' }),
    p('🥫', 'Comida húmeda perro', { type: 'can', color: '#6d4c41', top: '#bcaaa4', label: 'HUM' }),
    p('🥫', 'Comida húmeda gato', { type: 'can', color: '#7b1fa2', top: '#ce93d8', label: 'HUM' }),
    p('🦴', 'Snacks perro', { type: 'bag', color: '#ff8a65', label: 'SNK' }),
    p('🐈', 'Snacks gato', { type: 'bag', color: '#ba68c8', label: 'SNK' }),
    p('🐈', 'Arena gatos', { type: 'bag', color: '#90a4ae', label: 'ARE' }),
    p('🐕', 'Bolsas excrementos', { type: 'box', color: '#66bb6a', label: 'BOL' }),
    p('🐟', 'Comida peces', { type: 'can', color: '#29b6f6', top: '#81d4fa', label: 'PEZ' }),
    p('🐦', 'Comida pájaros', { type: 'bag', color: '#ffca28', label: 'PAJ' }),
  ],

  limpieza: [
    p('🧴', 'Lavavajillas líquido', { type: 'bottle', color: '#00bcd4', cap: '#00838f', liquid: '#80deea', label: 'LAV' }),
    p('🧴', 'Lavavajillas pastillas', { type: 'box', color: '#0097a7', label: 'PAS' }),
    p('🧴', 'Detergente ropa', { type: 'bottle', color: '#1565c0', cap: '#0d47a1', liquid: '#42a5f5', label: 'DET' }),
    p('🧴', 'Detergente cápsulas', { type: 'bag', color: '#1e88e5', label: 'CAP' }),
    p('🧴', 'Suavizante', { type: 'bottle', color: '#ec407a', cap: '#ad1457', liquid: '#f48fb1', label: 'SUA' }),
    p('🧴', 'Lejía', { type: 'bottle', color: '#ffeb3b', cap: '#fbc02d', liquid: '#fff59d', label: 'LEJ' }),
    p('🧴', 'Multiusos', { type: 'bottle', color: '#26a69a', cap: '#00695c', liquid: '#80cbc4', label: 'MUL' }),
    p('🧴', 'Limpiacristales', { type: 'bottle', color: '#29b6f6', cap: '#0277bd', liquid: '#e1f5fe', label: 'CRI' }),
    p('🧴', 'Limpiador baño', { type: 'bottle', color: '#7e57c2', cap: '#4527a0', liquid: '#b39ddb', label: 'BAÑ' }),
    p('🧴', 'Limpiador cocina', { type: 'bottle', color: '#ef6c00', cap: '#e65100', liquid: '#ffb74d', label: 'COC' }),
    p('🧴', 'Desinfectante', { type: 'bottle', color: '#43a047', cap: '#1b5e20', liquid: '#81c784', label: 'DES' }),
    p('🧽', 'Estropajos', { type: 'bag', color: '#ff7043', label: 'EST' }),
    p('🧽', 'Bayetas', { type: 'bag', color: '#29b6f6', label: 'BAY' }),
    p('🧻', 'Papel de cocina', { type: 'box', color: '#fffde7', label: 'PAC' }),
    p('🗑️', 'Bolsas basura', { type: 'box', color: '#212121', label: 'BAS' }),
    p('🗑️', 'Bolsas orgánicos', { type: 'box', color: '#8bc34a', label: 'ORG' }),
    p('🧴', 'Ambientador', { type: 'bottle', color: '#ce93d8', cap: '#8e24aa', liquid: '#e1bee7', label: 'AMB' }),
    p('🧴', 'Quitagrasas', { type: 'bottle', color: '#ff5722', cap: '#bf360c', liquid: '#ff8a65', label: 'GRA' }),
    p('🧴', 'Antical', { type: 'bottle', color: '#26c6da', cap: '#00838f', liquid: '#80deea', label: 'CAL' }),
  ],

  higiene: [
    p('🧻', 'Papel higiénico', { type: 'box', color: '#fafafa', label: 'PH' }),
    p('🧻', 'Pañuelos', { type: 'box', color: '#e3f2fd', label: 'PAÑ' }),
    p('🧴', 'Jabón de manos', { type: 'bottle', color: '#4db6ac', cap: '#00695c', liquid: '#b2dfdb', label: 'JAB' }),
    p('🧴', 'Gel de ducha', { type: 'bottle', color: '#26a69a', cap: '#004d40', liquid: '#80cbc4', label: 'GEL' }),
    p('🧴', 'Champú', { type: 'bottle', color: '#5c6bc0', cap: '#283593', liquid: '#9fa8da', label: 'CHA' }),
    p('🧴', 'Acondicionador', { type: 'bottle', color: '#7e57c2', cap: '#4527a0', liquid: '#b39ddb', label: 'ACO' }),
    p('🧴', 'Pasta de dientes', { type: 'box', color: '#e53935', label: 'PAS' }),
    p('🪥', 'Cepillo dientes', { type: 'box', color: '#29b6f6', label: 'CEP' }),
    p('🧴', 'Enjuague bucal', { type: 'bottle', color: '#00bcd4', cap: '#006064', liquid: '#80deea', label: 'ENJ' }),
    p('🧴', 'Desodorante', { type: 'bottle', color: '#212121', cap: '#616161', liquid: '#eceff1', label: 'DES' }),
    p('🧴', 'Crema hidratante', { type: 'tub', color: '#f8bbd0', lid: '#ec407a', label: 'CRE' }),
    p('🧴', 'Protector solar', { type: 'bottle', color: '#ff9800', cap: '#e65100', liquid: '#ffe0b2', label: 'FPS' }),
    p('🪒', 'Cuchillas', { type: 'box', color: '#78909c', label: 'CUC' }),
    p('🧴', 'Espuma afeitar', { type: 'bottle', color: '#eceff1', cap: '#455a64', liquid: '#fafafa', label: 'AFE' }),
    p('🩹', 'Tiritas', { type: 'box', color: '#e53935', label: 'TIR' }),
    p('💊', 'Analgésicos', { type: 'box', color: '#1565c0', label: 'ANA' }),
    p('💊', 'Vitaminas', { type: 'box', color: '#ffa726', label: 'VIT' }),
    p('🧴', 'Gel hidroalcohólico', { type: 'bottle', color: '#4fc3f7', cap: '#0288d1', liquid: '#e1f5fe', label: 'GEL' }),
    p('🧻', 'Compensas', { type: 'box', color: '#f48fb1', label: 'COM' }),
    p('🧴', 'Crema de manos', { type: 'tub', color: '#fff9c4', lid: '#fdd835', label: 'MAN' }),
  ],

  hogar: [
    p('🔋', 'Pilas AA', { type: 'box', color: '#212121', label: 'AA' }),
    p('🔋', 'Pilas AAA', { type: 'box', color: '#424242', label: 'AAA' }),
    p('💡', 'Bombillas LED', { type: 'box', color: '#fff176', label: 'LED' }),
    p('🕯️', 'Velas', { type: 'box', color: '#fff8e1', label: 'VEL' }),
    p('📦', 'Papel de aluminio', { type: 'box', color: '#b0bec5', label: 'ALU' }),
    p('📦', 'Film transparente', { type: 'box', color: '#e1f5fe', label: 'FIL' }),
    p('📦', 'Papel de horno', { type: 'box', color: '#fff3e0', label: 'HOR' }),
    p('🥡', 'Táper', { type: 'box', color: '#80cbc4', label: 'TAP' }),
    p('🍽️', 'Vasos desechables', { type: 'box', color: '#e3f2fd', label: 'VAS' }),
    p('🍽️', 'Platos desechables', { type: 'box', color: '#fffde7', label: 'PLA' }),
    p('🍴', 'Cubiertos desechables', { type: 'box', color: '#eceff1', label: 'CUB' }),
    p('🛍️', 'Bolsas de compra', { type: 'bag', color: '#66bb6a', label: 'BOL' }),
    p('🩹', 'Cinta adhesiva', { type: 'box', color: '#ffcc80', label: 'CIN' }),
    p('🖊️', 'Bolígrafos', { type: 'box', color: '#1565c0', label: 'BOL' }),
    p('📓', 'Libreta', { type: 'box', color: '#ef5350', label: 'LIB' }),
  ],
}

function e(emoji, name) {
  return { emoji, name }
}

function p(emoji, name, icon) {
  return { emoji, name: name.trim(), icon }
}

export const PRODUCTS = Object.entries(items).flatMap(([category, list]) =>
  list.map((item, index) => {
    const name = item.name
    return {
      id: `${category}-${index}-${slug(name)}`,
      name,
      emoji: item.emoji,
      icon: item.icon || null,
      category,
      sub: detectSub(category, name),
    }
  }),
)

function detectSub(category, name) {
  const n = norm(name)
  const has = (key) => n.includes(norm(key))
  const rules = {
    frutas: [
      [['naranja', 'mandarina', 'limon', 'lima', 'pomelo'], 'citricos'],
      [['mango', 'pina', 'platano', 'coco', 'papaya', 'chirimoya', 'kiwi', 'aguacate'], 'tropicales'],
      [['fresa', 'arandano', 'frambuesa', 'mora', 'cereza', 'uva'], 'frutos-rojos'],
      [[], 'otras-frutas'],
    ],
    verduras: [
      [['lechuga', 'espinaca', 'acelga', 'rucula', 'canonigo', 'repollo', 'endivia', 'ensalada', 'brotes', 'coles'], 'hoja'],
      [['patata', 'boniato', 'nabo', 'zanahoria', 'remolacha'], 'tuberculos'],
      [['perejil', 'cilantro', 'albahaca', 'romero', 'tomillo', 'menta', 'jengibre'], 'hierbas'],
      [[], 'hortalizas'],
    ],
    lacteos: [
      [['yogur', 'skyr'], 'yogures'],
      [['queso', 'mozzarella', 'ricotta', 'parmesano', 'feta', 'brie', 'camembert', 'emmental', 'provolone', 'tetilla', 'idiazabal', 'burgos', 'grana'], 'quesos'],
      [['mantequilla', 'margarina'], 'mantequillas'],
      [['natilla', 'flan', 'cuajada', 'mousse', 'arroz con leche'], 'postres'],
      [['huevo', 'clara'], 'huevos'],
      [['leche de avena', 'leche de almendra', 'leche de soja', 'leche de coco', 'leche de arroz', 'leche de avellana'], 'vegetales'],
      [['leche'], 'leches'],
      [['nata para', 'nata montada', 'kefir'], 'natas'],
      [[], 'leches'],
    ],
    carne: [
      [['pollo', 'pavo', 'nugget'], 'pollo'],
      [['ternera', 'vacuno', 'entrecot', 'hamburguesa vacuno'], 'vacuno'],
      [['cerdo', 'lomo de cerdo', 'costilla', 'chuleta de cerdo', 'solomillo'], 'cerdo'],
      [[], 'otras-carnes'],
    ],
    pescado: [
      [['gamba', 'langostino', 'calamar', 'pulpo', 'bogavante', 'mejillon', 'almeja', 'ostra', 'berberecho', 'marisco'], 'marisco'],
      [['surimi', 'varita'], 'elaborados-pescado'],
      [[], 'pescado-fresco'],
    ],
    charcuteria: [
      [['jamon'], 'jamones'],
      [['loncha', 'york', 'pavo en', 'pollo en', 'mortadela', 'bacon', 'panceta'], 'loncheados'],
      [[], 'embutidos'],
    ],
    panaderia: [
      [['croissant', 'magdalena', 'bizcocho', 'donut', 'napolitana', 'palmera', 'galleta'], 'bolleria'],
      [['tortilla', 'wrap', 'pita', 'focaccia'], 'tortillas-pan'],
      [[], 'pan'],
    ],
    desayuno: [
      [['cereal', 'avena', 'muesli', 'granola', 'corn'], 'cereales'],
      [['mermelada', 'miel', 'crema', 'cacahuete', 'cacao en'], 'untables'],
      [['cafe', 'te', 'manzanilla', 'infusion'], 'cafe-te'],
      [['zumo', 'batido', 'sirope', 'harina para'], 'zumos-desayuno'],
      [[], 'cereales'],
    ],
    despensa: [
      [['arroz', 'espagueti', 'macarron', 'tallarin', 'pasta', 'fideo', 'ramen', 'lasana', 'cuscus', 'quinoa', 'bulgur'], 'arroz-pasta'],
      [['lenteja', 'garbanzo', 'alubia', 'soja texturizada', 'judia'], 'legumbres'],
      [['aceite', 'vinagre', 'aove'], 'aceites'],
      [['harina', 'azucar', 'sal', 'levadura', 'bicarbonato', 'chocolate fondant', 'pepita', 'coco rallado'], 'harinas'],
      [['nuez', 'cacahuete', 'almendra', 'avellana', 'anacardo', 'pistacho', 'pipa', 'semilla', 'maiz palomitas'], 'frutos-secos'],
      [['caldo', 'sopa'], 'caldos'],
      [[], 'arroz-pasta'],
    ],
    conservas: [
      [['atun', 'sardina', 'caballa', 'mejillon'], 'pescado-lata'],
      [['pina', 'melocoton', 'coctel', 'compota'], 'frutas-lata'],
      [[], 'vegetales-lata'],
    ],
    salsas: [
      [['pimienta', 'pimenton', 'oregano', 'comino', 'curry', 'curcuma', 'canela', 'especia'], 'especias'],
      [[], 'salsas-mesa'],
    ],
    congelados: [
      [['helado', 'polo', 'tarrina'], 'helados'],
      [['verdura', 'maiz congelado', 'guisante congelado', 'frutos rojos', 'fruta congelada'], 'congelado-verdura'],
      [[], 'congelado-salado'],
    ],
    bebidas: [
      [['agua'], 'agua'],
      [['cola', 'naranja', 'limon', 'tonica', 'energetica', 'isotonica', 'te helado', 'refresco'], 'refrescos'],
      [['zumo', 'smoothie', 'batido'], 'zumos-bebida'],
      [['cerveza', 'vino', 'cava', 'sidra', 'whisky', 'gin', 'ron', 'vodka'], 'alcohol'],
      [[], 'refrescos'],
    ],
    snacks: [
      [['chocolate', 'bombon'], 'chocolates'],
      [['caramelo', 'gominola', 'chupa', 'galleta', 'magdalena', 'chicle', 'barrita'], 'dulces'],
      [[], 'aperitivos'],
    ],
    platos: [[[], 'preparados']],
    bebe: [
      [['panal', 'toallita', 'crema bebe', 'champu bebe'], 'cuidado-bebe'],
      [[], 'alimentacion-bebe'],
    ],
    mascotas: [[[], 'mascota']],
    limpieza: [
      [['detergente', 'suavizante', 'ropa'], 'ropa-limpieza'],
      [[], 'hogar-limpieza'],
    ],
    higiene: [
      [['pasta', 'cepillo', 'enjuague', 'seda'], 'bucal'],
      [['tirita', 'analgesico', 'vitamina'], 'farmacia'],
      [[], 'corporal'],
    ],
    hogar: [[[], 'casa']],
  }

  const list = rules[category]
  if (!list) return 'otros'
  for (const [keys, sub] of list) {
    if (!keys.length) return sub
    if (keys.some((k) => has(k))) return sub
  }
  return list[list.length - 1][1]
}

function norm(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function slug(text) {
  return norm(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Productos añadidos desde tickets (u otras fuentes) */
let EXTRA_PRODUCTS = []

export function setExtraProducts(list) {
  EXTRA_PRODUCTS = Array.isArray(list) ? list.filter((p) => p?.id && p?.name) : []
}

export function getExtraProducts() {
  return EXTRA_PRODUCTS
}

export function allProducts() {
  return EXTRA_PRODUCTS.length ? [...PRODUCTS, ...EXTRA_PRODUCTS] : PRODUCTS
}

export function searchProducts(query) {
  const q = norm(query.trim())
  const pool = allProducts()
  if (!q) return pool
  return pool.filter((p) => norm(p.name).includes(q))
}

export function getProductById(id) {
  return allProducts().find((p) => p.id === id)
}

export function getProductsByCategory(categoryId) {
  return allProducts().filter((p) => p.category === categoryId)
}

export function getProductsBySub(categoryId, subId) {
  return allProducts().filter((p) => p.category === categoryId && p.sub === subId)
}

export function guessEmoji(name) {
  const n = norm(name)
  const rules = [
    [['leche', 'lactosa'], '🥛'],
    [['yogur', 'skyr'], '🥛'],
    [['queso'], '🧀'],
    [['huevo'], '🥚'],
    [['pan', 'baguette', 'barra'], '🍞'],
    [['agua'], '💧'],
    [['cerveza'], '🍺'],
    [['vino'], '🍷'],
    [['cafe', 'te '], '☕'],
    [['pollo', 'pavo'], '🍗'],
    [['carne', 'ternera', 'cerdo', 'chorizo', 'jamon'], '🥩'],
    [['pescado', 'atun', 'salmon', 'merluza'], '🐟'],
    [['fruta', 'manzana', 'platano', 'naranja', 'pera', 'fresa'], '🍎'],
    [['verdura', 'lechuga', 'tomate', 'patata', 'cebolla'], '🥦'],
    [['arroz', 'pasta', 'espagueti'], '🍝'],
    [['aceite'], '🫒'],
    [['azucar', 'sal', 'harina'], '🧂'],
    [['galleta', 'chocolate', 'snack'], '🍪'],
    [['detergente', 'lejia', 'limpi'], '🧴'],
    [['papel', 'servilleta'], '🧻'],
    [['pizza'], '🍕'],
    [['helado'], '🍦'],
  ]
  for (const [keys, emoji] of rules) {
    if (keys.some((k) => n.includes(k))) return emoji
  }
  return '🛒'
}

export function guessCategory(name) {
  const n = norm(name)
  const cats = [
    ['frutas', ['manzana', 'platano', 'naranja', 'pera', 'fresa', 'uva', 'kiwi', 'melon', 'sandia', 'limon']],
    ['verduras', ['lechuga', 'tomate', 'patata', 'cebolla', 'pimiento', 'zanahoria', 'brocoli', 'ajo']],
    ['lacteos', ['leche', 'yogur', 'queso', 'mantequilla', 'nata', 'huevo', 'kefir']],
    ['carne', ['pollo', 'ternera', 'cerdo', 'pavo', 'carne', 'hamburguesa']],
    ['pescado', ['pescado', 'atun', 'salmon', 'merluza', 'gamba', 'calamar']],
    ['charcuteria', ['jamon', 'chorizo', 'salchichon', 'york', 'bacon', 'loncha']],
    ['panaderia', ['pan', 'baguette', 'barra', 'croissant', 'boll']],
    ['desayuno', ['cafe', 'te', 'cereal', 'mermelada', 'miel', 'zumo']],
    ['bebidas', ['agua', 'cola', 'refresco', 'cerveza', 'vino', 'bebida']],
    ['limpieza', ['detergente', 'lejia', 'limpi', 'suavizante', 'estropajo']],
    ['hogar', ['papel higienico', 'servilleta', 'basura', 'aluminio', 'film']],
    ['congelados', ['congelado', 'helado', 'pizza congel']],
    ['conservas', ['conserva', 'lata', 'bote']],
    ['salsas', ['ketchup', 'mayonesa', 'mostaza', 'salsa']],
    ['despensa', ['arroz', 'pasta', 'aceite', 'azucar', 'sal', 'harina', 'lenteja']],
  ]
  for (const [cat, keys] of cats) {
    if (keys.some((k) => n.includes(k))) {
      return { category: cat, sub: detectSub(cat, name) }
    }
  }
  return { category: 'despensa', sub: detectSub('despensa', name) }
}

/** Crea o reutiliza un producto de catálogo extra a partir del nombre del ticket */
export function upsertExtraProduct(extras, name) {
  const list = Array.isArray(extras) ? [...extras] : []
  const trimmed = String(name || '').trim()
  if (!trimmed) return { list, product: null }

  const fromBase = PRODUCTS.find((p) => norm(p.name) === norm(trimmed))
  if (fromBase) return { list, product: fromBase }

  const fromExtra = list.find(
    (p) => p.id === `extra-${slug(trimmed)}` || norm(p.name) === norm(trimmed),
  )
  if (fromExtra) return { list, product: fromExtra }

  const { category, sub } = guessCategory(trimmed)
  const product = {
    id: `extra-${slug(trimmed)}`,
    name: prettyName(trimmed),
    emoji: guessEmoji(trimmed),
    icon: null,
    category,
    sub,
    custom: true,
  }
  list.push(product)
  return { list, product }
}

function prettyName(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function groupProducts(list) {
  const map = new Map()
  for (const p of list) {
    const cat = getCategory(p.category)
    const sub = cat?.subs?.find((s) => s.id === p.sub)
    const key = `${p.category}:${p.sub}`
    if (!map.has(key)) {
      map.set(key, {
        categoryId: p.category,
        subId: p.sub,
        categoryName: cat?.name || p.category,
        subName: sub?.name || '',
        products: [],
      })
    }
    map.get(key).products.push(p)
  }
  return [...map.values()]
}

