import door01 from '@/assets/doors/door-01.jpg';
import door02 from '@/assets/doors/door-02.jpg';
import door03 from '@/assets/doors/door-03.jpg';
import door04 from '@/assets/doors/door-04.jpg';
import door05 from '@/assets/doors/door-05.jpg';
import door06 from '@/assets/doors/door-06.jpg';
import door07 from '@/assets/doors/door-07.jpg';
import door08 from '@/assets/doors/door-08.jpg';
import door09 from '@/assets/doors/door-09.jpg';
import door10 from '@/assets/doors/door-10.jpg';
import door11 from '@/assets/doors/door-11.jpg';
import door12 from '@/assets/doors/door-12.jpg';

export type Category =
  | 'mezhkomnatnye'
  | 'vhodnye'
  | 'furnitura'
  | 'peregorodki'
  | 'sistemy-otkryvaniya'
  | 'specialnye';

export type SubCategory = string;

export type Tag = 'popular' | 'new' | 'sale';

export interface SubCategoryDef {
  key: string;
  label: string;
  children?: { key: string; label: string }[];
}

export interface CategoryDef {
  key: Category | 'all';
  label: string;
  subcategories?: SubCategoryDef[];
}

export const categories: CategoryDef[] = [
  { key: 'all', label: 'Все двери' },
  {
    key: 'mezhkomnatnye',
    label: 'Межкомнатные двери',
    subcategories: [
      { key: 'massiv', label: 'Массив' },
      { key: 'emal', label: 'Эмаль' },
      { key: 'plenka', label: 'Плёнка' },
      { key: 'ekoshpon', label: 'Экошпон' },
      { key: 'pod-pokrasku', label: 'Под покраску' },
      { key: 's-framugoy', label: 'С фрамугой' },
    ],
  },
  {
    key: 'vhodnye',
    label: 'Входные двери',
    subcategories: [
      { key: 'dlya-kvartiry', label: 'Для квартиры' },
      { key: 'dlya-doma', label: 'Для уличного дома' },
      { key: 'biometricheskiy-zamok', label: 'С биометрическим замком' },
    ],
  },
  {
    key: 'sistemy-otkryvaniya',
    label: 'Системы открывания',
    subcategories: [
      { key: 'penaly', label: 'Пеналы' },
      { key: 'knizhniki', label: 'Книжники' },
      { key: 'roto-dveri', label: 'Рото двери' },
    ],
  },
  {
    key: 'specialnye',
    label: 'Специальные двери',
    subcategories: [
      { key: 'kupe', label: 'Купе' },
      { key: 'penaly-spec', label: 'Пеналы' },
      { key: 'steklyannye', label: 'Стеклянные двери' },
      { key: 'skrytogo-montazha', label: 'Скрытого монтажа' },
    ],
  },
  { key: 'peregorodki', label: 'Перегородки' },
  {
    key: 'furnitura',
    label: 'Фурнитура',
    subcategories: [
      {
        key: 'ruchki',
        label: 'Ручки',
        children: [
          { key: 'ruchki-kvadratnaya', label: 'На квадратной розетке' },
          { key: 'ruchki-kruglaya', label: 'На круглой розетке' },
          { key: 'ruchki-kruglye', label: 'Круглые' },
          { key: 'ruchki-kupe', label: 'Для купе' },
        ],
      },
      { key: 'zamki', label: 'Замки' },
      { key: 'zavertki', label: 'Завёртки / цилиндры' },
      { key: 'mekhanizmy', label: 'Механизмы' },
      { key: 'rigeli', label: 'Ригеля' },
      { key: 'ogranichiteli', label: 'Ограничители' },
      { key: 'dovodchiki', label: 'Доводчики' },
      {
        key: 'petli',
        label: 'Петли',
        children: [
          { key: 'petli-universalnye', label: 'Универсальные' },
          { key: 'petli-skrytye', label: 'Скрытые' },
          { key: 'petli-babochki', label: 'Бабочки' },
          { key: 'petli-kartochnaya', label: 'Карточная' },
        ],
      },
      { key: 'dlya-stekla', label: 'Для стеклянных дверей — комплекты' },
    ],
  },
];

export const tagFilters: { key: Tag | 'all'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'popular', label: 'Популярное' },
  { key: 'new', label: 'Новинки' },
  { key: 'sale', label: 'Скидки' },
];

export const manufacturers = [
  'Волховец',
  'Profil Doors',
  'Bravo',
  'Porta Prima',
  'Luxor',
  'Sofia',
];

export const materials = [
  'МДФ',
  'Экошпон',
  'Эмаль',
  'Шпон',
  'Массив',
  'Стекло',
  'ПВХ',
];

export const finishes = [
  'Белый',
  'Серый',
  'Венге',
  'Дуб',
  'Чёрный',
  'Песочный',
  'Натуральный',
];

export interface CatalogProduct {
  id: string;
  name: string;
  category: Category;
  subcategory?: string;
  tags: Tag[];
  price: number;
  oldPrice?: number;
  image: string;
  material: string;
  finish: string;
  manufacturer: string;
  colors: string[];
}

export const catalogProducts: CatalogProduct[] = [
  {
    id: '1', name: 'Vetro', category: 'mezhkomnatnye', subcategory: 'ekoshpon', tags: ['popular'],
    price: 12900, oldPrice: 15500, image: door01,
    material: 'МДФ', finish: 'Белый', manufacturer: 'Profil Doors',
    colors: ['#D0CCC6', '#C0BCB6', '#E0DCD6'],
  },
  {
    id: '2', name: 'Diamante', category: 'mezhkomnatnye', subcategory: 'emal', tags: ['new'],
    price: 18700, image: door02,
    material: 'МДФ', finish: 'Серый', manufacturer: 'Волховец',
    colors: ['#8A8A96', '#7A7A86', '#9A9AA6'],
  },
  {
    id: '3', name: 'Bianco', category: 'mezhkomnatnye', subcategory: 'plenka', tags: ['popular'],
    price: 9800, image: door03,
    material: 'МДФ', finish: 'Белый', manufacturer: 'Bravo',
    colors: ['#FEFCF8', '#F5F0E8', '#ECE8E0'],
  },
  {
    id: '4', name: 'Nero', category: 'vhodnye', subcategory: 'dlya-kvartiry', tags: ['new', 'popular'],
    price: 34500, oldPrice: 41000, image: door04,
    material: 'Экошпон', finish: 'Чёрный', manufacturer: 'Porta Prima',
    colors: ['#2A2A28', '#1A1A18', '#3A3A38'],
  },
  {
    id: '5', name: 'Classico', category: 'mezhkomnatnye', subcategory: 'massiv', tags: [],
    price: 22400, image: door05,
    material: 'МДФ', finish: 'Серый', manufacturer: 'Luxor',
    colors: ['#A0A098', '#909088', '#B0B0A8'],
  },
  {
    id: '6', name: 'Grafika', category: 'peregorodki', tags: ['sale'],
    price: 28900, oldPrice: 35000, image: door06,
    material: 'Стекло', finish: 'Серый', manufacturer: 'Sofia',
    colors: ['#C8C4BE', '#B8B4AE', '#D8D4CE'],
  },
  {
    id: '7', name: 'Sabbia', category: 'mezhkomnatnye', subcategory: 'ekoshpon', tags: [],
    price: 11200, image: door07,
    material: 'МДФ', finish: 'Песочный', manufacturer: 'Profil Doors',
    colors: ['#B8B0A0', '#A8A090', '#C8C0B0'],
  },
  {
    id: '8', name: 'Rovere', category: 'mezhkomnatnye', subcategory: 'massiv', tags: ['popular'],
    price: 31600, image: door08,
    material: 'Шпон', finish: 'Дуб', manufacturer: 'Волховец',
    colors: ['#A09070', '#908060', '#B0A080'],
  },
  {
    id: '9', name: 'Invisible', category: 'specialnye', subcategory: 'skrytogo-montazha', tags: ['new'],
    price: 45000, image: door09,
    material: 'МДФ', finish: 'Серый', manufacturer: 'Sofia',
    colors: ['#D8D4CE', '#C8C4BE', '#E8E4DE'],
  },
  {
    id: '10', name: 'Linea', category: 'mezhkomnatnye', subcategory: 'pod-pokrasku', tags: ['sale'],
    price: 8500, oldPrice: 11000, image: door10,
    material: 'МДФ', finish: 'Белый', manufacturer: 'Bravo',
    colors: ['#FEFCF8', '#F5F0E8', '#ECE8E0'],
  },
  {
    id: '11', name: 'Imperiale', category: 'mezhkomnatnye', subcategory: 'massiv', tags: [],
    price: 54000, image: door11,
    material: 'Массив', finish: 'Белый', manufacturer: 'Luxor',
    colors: ['#F8F6F2', '#E8E6E2', '#D8D6D2'],
  },
  {
    id: '12', name: 'Strato', category: 'sistemy-otkryvaniya', subcategory: 'penaly', tags: ['new', 'sale'],
    price: 16900, oldPrice: 21000, image: door12,
    material: 'МДФ', finish: 'Белый', manufacturer: 'Porta Prima',
    colors: ['#FEFCF8', '#F0EEE8', '#E0DED8'],
  },
];
