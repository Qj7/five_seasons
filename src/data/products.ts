export type Category =
  | 'classic'
  | 'exclusive'
  | 'bayaband'
  | 'bape'
  | 'naruto'
  | 'characters'
  | 'jibbitz'
  | 'popular'
  | 'salehe'
  | 'cars'
  | 'minecraft'
  | 'spongebob'
  | 'simpsons'
  | 'southpark'

export interface Product {
  id: string
  name: string
  price: number
  category: Category
  color: string
  accent: string
  /** English color / variant label for the picker */
  colorName: string
  /** Groups colorways of the same model on PDP */
  modelGroup: string
  image: string
  tag?: string
  delivery: string
  returnable?: boolean
  popularRank?: number
  fromPrice?: boolean
  soldOut?: boolean
}

export const formatPrice = (n: number) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₫'

export const splitPrice = (n: number) =>
  formatPrice(Math.round(n / 2)) + ' × 2 в сплит'

/** Public asset path that respects Vite `base` (needed for GitHub Pages). */
const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const img = (file: string) => asset(`products/new/${file}`)
const imgLegacy = (file: string) => asset(`products/${file}`)

function p(
  partial: Omit<Product, 'delivery' | 'returnable' | 'accent'> & {
    delivery?: string
    returnable?: boolean
    accent?: string
  },
): Product {
  return {
    delivery: partial.delivery ?? '3 дня',
    returnable: partial.returnable ?? true,
    accent: partial.accent ?? '#e8e8e8',
    ...partial,
  }
}

export const products: Product[] = [
  // —— Classic ——
  p({
    id: 'classic-white',
    name: 'Classic Clog · White',
    price: 1799000,
    category: 'classic',
    color: '#f5f5f5',
    colorName: 'White',
    modelGroup: 'classic',
    image: img('classic-white.png'),
    delivery: '1-2 дня',
    popularRank: 10,
  }),
  p({
    id: 'classic-black',
    name: 'Classic Clog · Black',
    price: 1799000,
    category: 'classic',
    color: '#1a1a1a',
    colorName: 'Black',
    modelGroup: 'classic',
    image: img('classic-black.png'),
    delivery: '1-2 дня',
    popularRank: 11,
  }),
  p({
    id: 'classic-navy',
    name: 'Classic Clog · Navy',
    price: 1799000,
    category: 'classic',
    color: '#1e3a5f',
    colorName: 'Navy',
    modelGroup: 'classic',
    image: img('classic-navy.png'),
    delivery: '1-2 дня',
  }),
  p({
    id: 'classic-grey',
    name: 'Classic Clog · Grey',
    price: 1799000,
    category: 'classic',
    color: '#9e9e9e',
    colorName: 'Grey',
    modelGroup: 'classic',
    image: img('classic-grey.png'),
    delivery: '1-2 дня',
  }),

  // —— Exclusive colors (Screen 2) ——
  // Distinctive colors first so the section doesn't look like Classic
  p({
    id: 'excl-mint',
    name: 'Exclusive Clog · Mint',
    price: 1949000,
    category: 'exclusive',
    color: '#b8e0d2',
    colorName: 'Mint',
    modelGroup: 'exclusive',
    image: img('exclusive-mint.png'),
    tag: 'Exclusive',
    popularRank: 15,
  }),
  p({
    id: 'excl-pink',
    name: 'Exclusive Clog · Pink',
    price: 1949000,
    category: 'exclusive',
    color: '#f5c6d0',
    colorName: 'Pink',
    modelGroup: 'exclusive',
    image: img('exclusive-pink.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-beige',
    name: 'Exclusive Clog · Beige',
    price: 1949000,
    category: 'exclusive',
    color: '#d4c4a8',
    colorName: 'Beige',
    modelGroup: 'exclusive',
    image: img('exclusive-beige.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-blue',
    name: 'Exclusive Clog · Blue',
    price: 1949000,
    category: 'exclusive',
    color: '#7eb8da',
    colorName: 'Blue',
    modelGroup: 'exclusive',
    image: img('exclusive-blue.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-green',
    name: 'Exclusive Clog · Green',
    price: 1949000,
    category: 'exclusive',
    color: '#5a7a4a',
    colorName: 'Green',
    modelGroup: 'exclusive',
    image: img('exclusive-green.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-chocolate',
    name: 'Exclusive Clog · Chocolate',
    price: 1949000,
    category: 'exclusive',
    color: '#5c3a2a',
    colorName: 'Chocolate',
    modelGroup: 'exclusive',
    image: img('exclusive-chocolate.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-plum',
    name: 'Exclusive Clog · Plum',
    price: 1949000,
    category: 'exclusive',
    color: '#6b2d3c',
    colorName: 'Plum',
    modelGroup: 'exclusive',
    image: img('exclusive-plum.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-grey',
    name: 'Exclusive Clog · Grey',
    price: 1949000,
    category: 'exclusive',
    color: '#c8c8c8',
    colorName: 'Grey',
    modelGroup: 'exclusive',
    image: img('exclusive-grey.png'),
    tag: 'Exclusive',
    popularRank: 14,
  }),
  p({
    id: 'excl-white',
    name: 'Exclusive Clog · White',
    price: 1949000,
    category: 'exclusive',
    color: '#fafafa',
    colorName: 'White',
    modelGroup: 'exclusive',
    image: img('exclusive-white.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-black',
    name: 'Exclusive Clog · Black',
    price: 1949000,
    category: 'exclusive',
    color: '#111',
    colorName: 'Black',
    modelGroup: 'exclusive',
    image: img('exclusive-black.png'),
    tag: 'Exclusive',
  }),
  p({
    id: 'excl-navy',
    name: 'Exclusive Clog · Navy',
    price: 1949000,
    category: 'exclusive',
    color: '#1a3a5c',
    colorName: 'Navy',
    modelGroup: 'exclusive',
    image: img('exclusive-navy.png'),
    tag: 'Exclusive',
  }),

  // —— Bayaband ——
  p({
    id: 'baya-black',
    name: 'Crocs Bayaband Clog Black',
    price: 2249000,
    category: 'bayaband',
    color: '#1a1a1a',
    colorName: 'Black',
    modelGroup: 'bayaband',
    image: img('bayaband-black.png'),
    popularRank: 16,
  }),
  p({
    id: 'baya-white',
    name: 'Crocs Bayaband Clog White',
    price: 2249000,
    category: 'bayaband',
    color: '#f5f5f5',
    colorName: 'White',
    modelGroup: 'bayaband',
    image: img('bayaband-white.png'),
  }),

  // —— BAPE (Screen 5) ——
  p({
    id: 'bape-blue',
    name: 'BAPE × Crocs Classic Clog Blue Camo',
    price: 5699000,
    category: 'bape',
    color: '#1a3a5f',
    colorName: 'Blue',
    modelGroup: 'bape',
    image: img('bape-blue.png'),
    tag: 'Collab',
    delivery: '7 дней',
    popularRank: 3,
  }),
  p({
    id: 'bape-purple',
    name: 'BAPE × Crocs Classic Clog Purple Camo',
    price: 5699000,
    category: 'bape',
    color: '#6b4a8a',
    colorName: 'Purple',
    modelGroup: 'bape',
    image: img('bape-purple.png'),
    tag: 'Collab',
    delivery: '7 дней',
    soldOut: true,
  }),
  p({
    id: 'bape-pink',
    name: 'BAPE × Crocs Classic Clog Pink Camo',
    price: 5699000,
    category: 'bape',
    color: '#e8a0bf',
    colorName: 'Pink',
    modelGroup: 'bape',
    image: img('bape-pink.png'),
    tag: 'Collab',
    delivery: '7 дней',
    popularRank: 5,
  }),
  p({
    id: 'bape-army',
    name: 'BAPE × Crocs Classic Clog Army Green Camo',
    price: 5699000,
    category: 'bape',
    color: '#2d5a3d',
    colorName: 'Army Green',
    modelGroup: 'bape',
    image: img('bape-army-green.png'),
    tag: 'Collab',
    delivery: '7 дней',
    popularRank: 1,
  }),
  p({
    id: 'bape-black',
    name: 'BAPE × Crocs Classic Clog Black Camo',
    price: 5699000,
    category: 'bape',
    color: '#222',
    colorName: 'Black',
    modelGroup: 'bape',
    image: img('bape-black.png'),
    tag: 'Collab',
    delivery: '7 дней',
  }),
  p({
    id: 'bape-dark-grey',
    name: 'BAPE × Crocs Classic Clog Dark Grey Camo',
    price: 5699000,
    category: 'bape',
    color: '#555',
    colorName: 'Dark Grey',
    modelGroup: 'bape',
    image: img('bape-dark-grey.png'),
    tag: 'Collab',
    delivery: '7 дней',
    soldOut: true,
  }),
  p({
    id: 'bape-grey',
    name: 'BAPE × Crocs Classic Clog Grey Camo',
    price: 5699000,
    category: 'bape',
    color: '#c0c0c0',
    colorName: 'Grey',
    modelGroup: 'bape',
    image: img('bape-grey.png'),
    tag: 'Collab',
    delivery: '7 дней',
  }),
  p({
    id: 'bape-light-brown',
    name: 'BAPE × Crocs Classic Clog Light Brown Camo',
    price: 5699000,
    category: 'bape',
    color: '#c4a574',
    colorName: 'Light Brown',
    modelGroup: 'bape',
    image: img('bape-light-brown.png'),
    tag: 'Collab',
    delivery: '7 дней',
    soldOut: true,
  }),

  // —— Naruto (existing tab, unified side-profile style) ——
  p({
    id: 'naruto-1',
    name: 'Naruto × Crocs Classic Clog Naruto Uzumaki',
    price: 3899000,
    category: 'naruto',
    color: '#f26522',
    colorName: 'Naruto',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-uzumaki.png'),
    tag: 'Collab',
    delivery: '5 дней',
    popularRank: 2,
  }),
  p({
    id: 'naruto-2',
    name: 'Naruto × Crocs Classic Clog Kakashi Hatake',
    price: 3899000,
    category: 'naruto',
    color: '#5c6b7a',
    colorName: 'Kakashi',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-kakashi.png'),
    tag: 'Collab',
    delivery: '5 дней',
    popularRank: 4,
  }),
  p({
    id: 'naruto-3',
    name: 'Naruto × Crocs Classic Clog Sasuke Uchiha',
    price: 3899000,
    category: 'naruto',
    color: '#1e3a5f',
    colorName: 'Sasuke',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-sasuke.png'),
    tag: 'Collab',
    delivery: '5 дней',
    popularRank: 6,
  }),
  p({
    id: 'naruto-4',
    name: 'Naruto × Crocs Classic Clog Itachi Uchiha',
    price: 4049000,
    category: 'naruto',
    color: '#2a0a0a',
    colorName: 'Itachi',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-itachi.png'),
    tag: 'Collab',
    delivery: '7 дней',
    popularRank: 8,
  }),
  p({
    id: 'naruto-5',
    name: 'Naruto × Crocs Classic Clog Minato Namikaze',
    price: 3899000,
    category: 'naruto',
    color: '#f4e04d',
    colorName: 'Minato',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-minato.png'),
    tag: 'Collab',
    delivery: '7 дней',
  }),
  p({
    id: 'naruto-6',
    name: 'Naruto × Crocs Classic Clog Jiraiya',
    price: 3899000,
    category: 'naruto',
    color: '#c8d5c0',
    colorName: 'Jiraiya',
    modelGroup: 'naruto',
    image: imgLegacy('naruto-jiraiya.png'),
    tag: 'Collab',
    delivery: '7 дней',
  }),

  // —— Character set (Screen 3) ——
  p({
    id: 'char-peanut',
    name: 'Crocs Classic Clog Peanut',
    price: 3599000,
    category: 'characters',
    color: '#f5f5f5',
    colorName: 'Peanut',
    modelGroup: 'characters',
    image: img('char-peanut.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-monster',
    name: 'Crocs Classic Clog Monster',
    price: 3599000,
    category: 'characters',
    color: '#9acd32',
    colorName: 'Monster',
    modelGroup: 'characters',
    image: img('char-monster.png'),
    tag: 'Collab',
    popularRank: 12,
  }),
  p({
    id: 'char-batman',
    name: 'Crocs Classic Clog Winged Batman',
    price: 3599000,
    category: 'characters',
    color: '#1a1a2e',
    colorName: 'Winged Batman',
    modelGroup: 'characters',
    image: img('char-batman.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-starwars',
    name: 'Crocs Classic Clog Star Wars',
    price: 3599000,
    category: 'characters',
    color: '#f5f5f5',
    colorName: 'Star Wars',
    modelGroup: 'characters',
    image: img('char-starwars.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-simpson',
    name: 'Crocs Classic Clog Simpson',
    price: 3599000,
    category: 'characters',
    color: '#ffd100',
    colorName: 'Simpson',
    modelGroup: 'characters',
    image: img('char-simpson.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-mater',
    name: 'Crocs Classic Clog Brown Car',
    price: 3599000,
    category: 'characters',
    color: '#8b7355',
    colorName: 'Brown Car',
    modelGroup: 'characters',
    image: img('char-mater.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-zenitsu',
    name: 'Crocs Classic Clog Zenitsu',
    price: 3599000,
    category: 'characters',
    color: '#f4e04d',
    colorName: 'Zenitsu',
    modelGroup: 'characters',
    image: img('char-zenitsu.png'),
    tag: 'Collab',
    soldOut: true,
  }),
  p({
    id: 'char-inosuke',
    name: 'Crocs Classic Clog Inosuke',
    price: 3599000,
    category: 'characters',
    color: '#7eb8da',
    colorName: 'Inosuke',
    modelGroup: 'characters',
    image: img('char-inosuke.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-nezuko',
    name: 'Crocs Classic Clog Nezuko',
    price: 3599000,
    category: 'characters',
    color: '#e8a0bf',
    colorName: 'Nezuko',
    modelGroup: 'characters',
    image: img('char-nezuko.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-spongebob',
    name: 'Crocs Classic Clog Yellow Sponge',
    price: 3599000,
    category: 'characters',
    color: '#ffd100',
    colorName: 'Yellow Sponge',
    modelGroup: 'characters',
    image: img('char-spongebob.png'),
    tag: 'Collab',
  }),
  p({
    id: 'char-patrick',
    name: 'Crocs Classic Clog Pink Sponge',
    price: 3599000,
    category: 'characters',
    color: '#ffb6c1',
    colorName: 'Pink Sponge',
    modelGroup: 'characters',
    image: img('char-patrick.png'),
    tag: 'Collab',
    soldOut: true,
  }),
  p({
    id: 'char-shinobu',
    name: 'Crocs Classic Clog Shinobu',
    price: 3599000,
    category: 'characters',
    color: '#c8b8e8',
    colorName: 'Shinobu',
    modelGroup: 'characters',
    image: img('char-shinobu.png'),
    tag: 'Collab',
  }),

  // —— McQueen (same as before) ——
  p({
    id: 'cars-1',
    name: 'Cars × Crocs Classic Clog Lightning McQueen',
    price: 3599000,
    category: 'cars',
    color: '#e10600',
    colorName: 'McQueen',
    modelGroup: 'cars',
    image: img('cars-mcqueen.png'),
    tag: 'Collab',
    delivery: '3 дня',
    popularRank: 9,
  }),

  // —— Salehe Pollex (Screen 4) ——
  p({
    id: 'salehe-white',
    name: 'Salehe Bembury × Crocs Pollex Clog White',
    price: 4799000,
    category: 'salehe',
    color: '#f5f5f5',
    colorName: 'White',
    modelGroup: 'pollex',
    image: img('pollex-white.png'),
    tag: 'Collab',
    delivery: '5 дней',
  }),
  p({
    id: 'salehe-green',
    name: 'Salehe Bembury × Crocs Pollex Clog Green',
    price: 4799000,
    category: 'salehe',
    color: '#b8d43a',
    colorName: 'Green',
    modelGroup: 'pollex',
    image: img('pollex-green.png'),
    tag: 'Collab',
    delivery: '5 дней',
    popularRank: 7,
  }),
  p({
    id: 'salehe-navy',
    name: 'Salehe Bembury × Crocs Pollex Clog Dark Blue',
    price: 4799000,
    category: 'salehe',
    color: '#1a2a4a',
    colorName: 'Dark Blue',
    modelGroup: 'pollex',
    image: img('pollex-navy.png'),
    tag: 'Collab',
    delivery: '5 дней',
  }),
  p({
    id: 'salehe-black-grey',
    name: 'Salehe Bembury × Crocs Pollex Clog Black Grey',
    price: 4799000,
    category: 'salehe',
    color: '#3a3a3a',
    colorName: 'Black Grey',
    modelGroup: 'pollex',
    image: img('pollex-black-grey.png'),
    tag: 'Collab',
    delivery: '5 дней',
  }),
  p({
    id: 'salehe-purple',
    name: 'Salehe Bembury × Crocs Pollex Clog Purple',
    price: 4799000,
    category: 'salehe',
    color: '#b8a0d0',
    colorName: 'Purple',
    modelGroup: 'pollex',
    image: img('pollex-purple.png'),
    tag: 'Collab',
    delivery: '5 дней',
  }),
  p({
    id: 'salehe-khaki',
    name: 'Salehe Bembury × Crocs Pollex Clog Khaki',
    price: 4799000,
    category: 'salehe',
    color: '#c4b896',
    colorName: 'Khaki',
    modelGroup: 'pollex',
    image: img('pollex-khaki.png'),
    tag: 'Collab',
    delivery: '5 дней',
  }),

  // —— Minecraft ——
  p({
    id: 'minecraft-green',
    name: 'Minecraft × Crocs Classic Clog Green',
    price: 3749000,
    category: 'minecraft',
    color: '#5a8f3c',
    colorName: 'Green',
    modelGroup: 'minecraft',
    image: img('minecraft-green.png'),
    tag: 'Collab',
    popularRank: 13,
  }),
  p({
    id: 'minecraft-black',
    name: 'Minecraft × Crocs Classic Clog Black',
    price: 3749000,
    category: 'minecraft',
    color: '#1a1a1a',
    colorName: 'Black',
    modelGroup: 'minecraft',
    image: img('minecraft-black.png'),
    tag: 'Collab',
  }),

  // —— SpongeBob (standalone) ——
  p({
    id: 'spongebob-1',
    name: 'SpongeBob × Crocs Classic Clog Yellow',
    price: 3599000,
    category: 'spongebob',
    color: '#ffd100',
    colorName: 'Yellow',
    modelGroup: 'spongebob',
    image: img('spongebob-yellow.png'),
    tag: 'Collab',
  }),

  // —— Simpsons ——
  p({
    id: 'simpsons-1',
    name: "The Simpsons × Crocs Classic Clog Black Yellow",
    price: 3899000,
    category: 'simpsons',
    color: '#ffd100',
    colorName: 'Black Yellow',
    modelGroup: 'simpsons',
    image: img('simpsons-black-yellow.png'),
    tag: 'Collab',
  }),

  // —— South Park ——
  p({
    id: 'southpark-1',
    name: 'South Park × Crocs Classic Clog Teal Grey',
    price: 3599000,
    category: 'southpark',
    color: '#2a9d8f',
    colorName: 'Teal Grey',
    modelGroup: 'southpark',
    image: img('southpark-teal.png'),
    tag: 'Collab',
  }),

  // —— Jibbitz (keep accessories) ——
  p({
    id: 'jib-1',
    name: 'Jibbitz Fun Pack',
    price: 599000,
    category: 'jibbitz',
    color: '#ff6b6b',
    colorName: 'Fun Pack',
    modelGroup: 'jibbitz',
    image: imgLegacy('jibbitz-pack.png'),
    tag: 'Набор',
    delivery: '1-2 дня',
  }),
  p({
    id: 'jib-2',
    name: 'Jibbitz Butterfly Set',
    price: 569000,
    category: 'jibbitz',
    color: '#ff85a2',
    colorName: 'Butterfly',
    modelGroup: 'jibbitz',
    image: imgLegacy('jibbitz-butterfly.jpg'),
    tag: 'Набор',
    delivery: '1-2 дня',
  }),
  p({
    id: 'jib-3',
    name: 'Jibbitz Fruit Mix',
    price: 539000,
    category: 'jibbitz',
    color: '#ff6b6b',
    colorName: 'Fruit',
    modelGroup: 'jibbitz',
    image: imgLegacy('jibbitz-fruit.jpg'),
    tag: 'Набор',
    delivery: '1-2 дня',
  }),
]

export const variantsOf = (product: Product) =>
  products.filter((x) => x.modelGroup === product.modelGroup)

function imageStem(image: string) {
  const file = image.split('/').pop()?.split('?')[0] ?? ''
  return file.replace(/\.[^.]+$/, '')
}

/** Side profile plus extra studio angles for the PDP carousel. */
export function galleryOf(product: Product): string[] {
  if (product.category === 'jibbitz') return [product.image]
  const stem = imageStem(product.image)
  return [
    product.image,
    img(`gallery/${stem}-front.png`),
    img(`gallery/${stem}-top.png`),
    img(`gallery/${stem}-heel.png`),
  ]
}

export const top20 = products
  .filter((p) => p.popularRank)
  .sort((a, b) => (a.popularRank ?? 99) - (b.popularRank ?? 99))

export const bestsellers = [
  products.find((p) => p.id === 'bape-army')!,
  products.find((p) => p.id === 'naruto-1')!,
  products.find((p) => p.id === 'bape-blue')!,
  products.find((p) => p.id === 'naruto-2')!,
  products.find((p) => p.id === 'bape-pink')!,
  products.find((p) => p.id === 'naruto-3')!,
  products.find((p) => p.id === 'salehe-green')!,
  products.find((p) => p.id === 'cars-1')!,
]

export const narutoSeries = products.filter((p) => p.category === 'naruto')

export const collabCollections = [
  { id: 'salehe', name: 'Salehe', label: 'Salehe Bembury' },
  { id: 'cars', name: 'Cars', label: 'Cars / McQueen' },
  { id: 'characters', name: 'Characters', label: 'Character Set' },
  { id: 'minecraft', name: 'Minecraft', label: 'Minecraft' },
  { id: 'spongebob', name: 'SpongeBob', label: 'SpongeBob' },
  { id: 'simpsons', name: 'Simpsons', label: 'The Simpsons' },
  { id: 'southpark', name: 'South Park', label: 'South Park' },
  { id: 'bape', name: 'BAPE', label: 'BAPE × Crocs' },
  { id: 'naruto', name: 'Naruto', label: 'Naruto × Crocs' },
] as const

export const collections = [
  { id: 'classic', name: 'Classic', label: 'Classic Clog' },
  { id: 'exclusive', name: 'Exclusive', label: 'Exclusive Colors' },
  { id: 'bayaband', name: 'Bayaband', label: 'Bayaband' },
  { id: 'bape', name: 'BAPE', label: 'BAPE × Crocs' },
  { id: 'naruto', name: 'Naruto', label: 'Naruto × Crocs' },
  { id: 'salehe', name: 'Salehe', label: 'Salehe Bembury' },
  { id: 'jibbitz', name: 'Jibbitz', label: 'Jibbitz' },
] as const
