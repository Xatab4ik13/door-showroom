import door01 from '@/assets/doors/door-01-minimal-white.png';
import door02 from '@/assets/doors/door-02-classic-beige.png';
import door03 from '@/assets/doors/door-03-arched-gray.png';
import door04 from '@/assets/doors/door-04-fluted-terracotta.png';
import door05 from '@/assets/doors/door-05-glass-sand.png';
import door06 from '@/assets/doors/door-06-decorative-green.png';
import door07 from '@/assets/doors/door-07-smooth-graphite.png';
import door08 from '@/assets/doors/door-08-glasstrip-gray.png';
import door09 from '@/assets/doors/door-09-grooved-cream.png';
import door10 from '@/assets/doors/door-10-ornate-terracotta.png';
import door11 from '@/assets/doors/door-11-flush-white.png';
import door12 from '@/assets/doors/door-12-fluted-green.png';

export interface Door {
  id: string;
  name: string;
  collection: string;
  description: string;
  image: string;
  material: string;
  sizes: string;
  finish: string;
  colors: string[];
}

export const doors: Door[] = [
  {
    id: '1', name: 'Milano', collection: 'Minimal', description: 'Гладкая минималистичная дверь с чистыми линиями и утончённой геометрией филёнок.',
    image: door01, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#F5F0E8', '#E8E0D4', '#D4CBC0'],
  },
  {
    id: '2', name: 'Classico', collection: 'Heritage', description: 'Классическая филёнчатая дверь с изящными молдингами в тёплых бежевых тонах.',
    image: door02, material: 'Массив ясеня', sizes: '700–900 × 2000 мм', finish: 'Шпон натуральный',
    colors: ['#E8D5B8', '#D4C4A8', '#C0B090'],
  },
  {
    id: '3', name: 'Arco', collection: 'Palazzo', description: 'Элегантная дверь с арочной фрезеровкой, вдохновлённая классической архитектурой.',
    image: door03, material: 'МДФ, шпон', sizes: '800–900 × 2100 мм', finish: 'Эмаль светло-серая',
    colors: ['#D8D4CE', '#C8C4BE', '#B8B4AE'],
  },
  {
    id: '4', name: 'Rigato', collection: 'Moderno', description: 'Современная дверь с вертикальными канелюрами в нежном терракотово-розовом оттенке.',
    image: door04, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль сатин',
    colors: ['#D4A08A', '#C89880', '#BC9078'],
  },
  {
    id: '5', name: 'Vista', collection: 'Light', description: 'Дверь с матовой стеклянной вставкой, наполняющей пространство мягким светом.',
    image: door05, material: 'МДФ, стекло', sizes: '700–900 × 2000 мм', finish: 'Шпон песочный',
    colors: ['#E8D8B8', '#DCD0B0', '#D0C8A8'],
  },
  {
    id: '6', name: 'Botanica', collection: 'Art', description: 'Декоративная дверь с изысканным орнаментальным рисунком в глубоком зелёном цвете.',
    image: door06, material: 'Массив, резьба', sizes: '800–900 × 2100 мм', finish: 'Эмаль глянец',
    colors: ['#2D4A3E', '#1E3A2E', '#3A5A4E'],
  },
  {
    id: '7', name: 'Carbon', collection: 'Urban', description: 'Минималистичная дверь в тёмном графитовом цвете с бархатистой гладкой поверхностью.',
    image: door07, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#4A4A48', '#3A3A38', '#5A5A58'],
  },
  {
    id: '8', name: 'Lumiere', collection: 'Light', description: 'Изящная дверь с узкой вертикальной стеклянной полосой в светло-серых тонах.',
    image: door08, material: 'МДФ, стекло', sizes: '700–900 × 2000 мм', finish: 'Эмаль перламутр',
    colors: ['#E0DCD6', '#D0CCC6', '#C8C4BE'],
  },
  {
    id: '9', name: 'Linea', collection: 'Minimal', description: 'Современная дверь с горизонтальными линиями-канавками в тёплом кремовом оттенке.',
    image: door09, material: 'МДФ, шпон', sizes: '600–900 × 2000 мм', finish: 'Шпон натуральный',
    colors: ['#F0E8D8', '#E8E0D0', '#E0D8C8'],
  },
  {
    id: '10', name: 'Imperiale', collection: 'Palazzo', description: 'Роскошная орнаментальная дверь с резным порталом в тёплом терракотовом цвете.',
    image: door10, material: 'Массив дуба', sizes: '900 × 2100 мм', finish: 'Патина золото',
    colors: ['#C87850', '#B86840', '#D88860'],
  },
  {
    id: '11', name: 'Puro', collection: 'Minimal', description: 'Абсолютно чистая белая дверь с лаконичными филёнками для светлых интерьеров.',
    image: door11, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#FEFCF8', '#F5F0E8', '#ECE8E0'],
  },
  {
    id: '12', name: 'Foresta', collection: 'Art', description: 'Дверь с вертикальным рифлением в глубоком лесном зелёном цвете.',
    image: door12, material: 'МДФ, эмаль', sizes: '700–900 × 2000 мм', finish: 'Эмаль сатин',
    colors: ['#3A5A3E', '#2A4A2E', '#4A6A4E'],
  },
];
