import { describe, expect, it } from 'vitest';
import { isRepeatedArticle } from '@/lib/productSpecDuplicates';

describe('Article and technical data duplication', () => {
  it('hides the erroneous article when it repeats the technical block', () => {
    const technical = '• Габаритные размеры: 2050x860 мм, 2050x960 мм • Открывание: левое /правое';
    const specs = { 'Артикул': technical, 'Технические данные': technical };
    expect(isRepeatedArticle('Артикул', technical, specs)).toBe(true);
    expect(isRepeatedArticle('Технические данные', technical, specs)).toBe(false);
  });

  it('recognizes the same duplicate despite case, spacing and nonbreaking spaces', () => {
    expect(isRepeatedArticle(' АРТИКУЛ ', '  Размер:\u00a02050x860\nмм ', { 'технические данные': 'размер: 2050x860 мм' })).toBe(true);
  });

  it('keeps real articles and all distinct technical data', () => {
    expect(isRepeatedArticle('Артикул', 'F0000070756', { 'Артикул': 'F0000070756', 'Технические данные': 'Толщина 40 мм' })).toBe(false);
    expect(isRepeatedArticle('Артикул', 'F0000070756', { 'Артикул': 'F0000070756' })).toBe(false);
    expect(isRepeatedArticle('Модель', 'Фрейм 10', { 'Технические данные': 'Фрейм 10' })).toBe(false);
    expect(isRepeatedArticle('Материал', 'МДФ', { 'Покрытие': 'МДФ' })).toBe(false);
  });
});