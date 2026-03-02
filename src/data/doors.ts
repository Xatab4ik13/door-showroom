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
    id: '1', name: 'Vetro', collection: 'Light', description: 'Светло-серая дверь с узкой стеклянной вставкой, пропускающей мягкий свет.',
    image: door01, material: 'МДФ, стекло', sizes: '700–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#D0CCC6', '#C0BCB6', '#E0DCD6'],
  },
  {
    id: '2', name: 'Diamante', collection: 'Heritage', description: 'Классическая двухфилёнчатая дверь в благородном сером оттенке с геометрическими фасками.',
    image: door02, material: 'МДФ, эмаль', sizes: '700–900 × 2000 мм', finish: 'Эмаль сатин',
    colors: ['#8A8A96', '#7A7A86', '#9A9AA6'],
  },
  {
    id: '3', name: 'Bianco', collection: 'Minimal', description: 'Белоснежная дверь с диагональными филёнками и чистой геометрией.',
    image: door03, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#FEFCF8', '#F5F0E8', '#ECE8E0'],
  },
  {
    id: '4', name: 'Nero', collection: 'Urban', description: 'Тёмная дверь с горизонтальными ламелями в текстуре чёрного дерева.',
    image: door04, material: 'Экошпон', sizes: '600–900 × 2000 мм', finish: 'Экошпон матовый',
    colors: ['#2A2A28', '#1A1A18', '#3A3A38'],
  },
  {
    id: '5', name: 'Classico', collection: 'Palazzo', description: 'Элегантная серая дверь с классическими молдингами и глубокими филёнками.',
    image: door05, material: 'МДФ, эмаль', sizes: '700–900 × 2100 мм', finish: 'Эмаль сатин',
    colors: ['#A0A098', '#909088', '#B0B0A8'],
  },
  {
    id: '6', name: 'Grafika', collection: 'Art', description: 'Современная серая дверь с геометрическим узором и чёрной стеклянной вставкой.',
    image: door06, material: 'МДФ, стекло', sizes: '700–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#C8C4BE', '#B8B4AE', '#D8D4CE'],
  },
  {
    id: '7', name: 'Sabbia', collection: 'Minimal', description: 'Минималистичная дверь в песочном оттенке с тонкими чёрными контурами.',
    image: door07, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#B8B0A0', '#A8A090', '#C8C0B0'],
  },
  {
    id: '8', name: 'Rovere', collection: 'Nature', description: 'Дверь с натуральным шпоном дуба и вертикальными тёмными линиями.',
    image: door08, material: 'Шпон дуба', sizes: '700–900 × 2000 мм', finish: 'Шпон натуральный',
    colors: ['#A09070', '#908060', '#B0A080'],
  },
  {
    id: '9', name: 'Invisible', collection: 'Urban', description: 'Скрытая дверь в светло-сером исполнении с тонкой чёрной кромкой.',
    image: door09, material: 'МДФ, алюминий', sizes: '600–900 × 2400 мм', finish: 'Эмаль матовая',
    colors: ['#D8D4CE', '#C8C4BE', '#E8E4DE'],
  },
  {
    id: '10', name: 'Linea', collection: 'Minimal', description: 'Чистая белая дверь с одной горизонтальной линией посередине.',
    image: door10, material: 'МДФ, эмаль', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#FEFCF8', '#F5F0E8', '#ECE8E0'],
  },
  {
    id: '11', name: 'Imperiale', collection: 'Heritage', description: 'Белая классическая дверь с двойными филёнками и бронзовой фурнитурой.',
    image: door11, material: 'Массив, МДФ', sizes: '700–900 × 2100 мм', finish: 'Эмаль глянец',
    colors: ['#F8F6F2', '#E8E6E2', '#D8D6D2'],
  },
  {
    id: '12', name: 'Strato', collection: 'Light', description: 'Белая дверь с горизонтальными чёрными ламелями и современной фурнитурой.',
    image: door12, material: 'МДФ, стекло', sizes: '600–900 × 2000 мм', finish: 'Эмаль матовая',
    colors: ['#FEFCF8', '#F0EEE8', '#E0DED8'],
  },
];
