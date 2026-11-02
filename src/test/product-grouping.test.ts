import { afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { productModelKeySql } from '../../backend/src/lib/productGrouping';
import { stripSize, extractSize } from '../lib/description';

const db = new PGlite();
afterAll(() => db.close());
const toscana = 'Тоскана-5 Чиаро Гриджио ДО';
const key = async (name: string) => {
  const result = await db.query<{ key: string }>(`SELECT ${productModelKeySql('name')} AS key FROM (SELECT $1::text AS name) p`, [name]);
  return result.rows[0]?.key;
};

describe('size grouping', () => {
  it('merges Toscana sizes in the middle, including decorative quotes', async () => {
    expect(await key(`${toscana} 2000Х800 Стекло Сатинат, Контурный Полимер Рисунок Решетка`))
      .toBe(await key(`${toscana} 2000Х700 Стекло Сатинат, Контурный Полимер Рисунок "Решетка"`));
  });
  it('merges trailing Frame dimensions and separator variants', async () => {
    const base = 'Фрейм 10 шпон Ясень белоснежный, глухое';
    expect(await key(`${base} 800*2000`)).toBe(await key(`${base}, 700х2000`));
    expect(await key(`${base} 600×2000`)).toBe(await key(`${base} 900X2000`));
  });
  it('keeps different colors separate', async () => {
    expect(await key('Фрейм 07 шпон Крем глухое 600*2000')).not.toBe(await key('Фрейм 07 шпон Бьянко глухое 700*2000'));
  });
  it('keeps glass and solid leaves separate', async () => {
    expect(await key(`${toscana} 2000Х800 Стекло Сатинат`)).not.toBe(await key('Тоскана-5 Чиаро Гриджио ДГ 2000Х700'));
  });
  it('keeps different decorative finishes separate', async () => {
    expect(await key('Фрейм 05 багет патина золото 700*2000')).not.toBe(await key('Фрейм 05 багет патина серебро 800*2000'));
  });
  it('preserves model numbers and removes only bounded dimensions', async () => {
    expect(await key('Фрейм 10 700*2000')).not.toBe(await key('Фрейм 09 800*2000'));
    expect(await key('Модель 12345X12345')).toBe('модель 12345x12345');
  });
  it('extracts and strips middle and attached dimensions for size selection', () => {
    expect(extractSize(`${toscana} 2000Х800 Стекло Сатинат`)).toBe('2000×800');
    expect(stripSize(`${toscana} 2000Х800 Стекло Сатинат`)).toBe(`${toscana} Стекло Сатинат`);
    expect(stripSize('Модель ДГ2000X900')).toBe('Модель ДГ');
  });
  it('selects the cheapest size without merging suppliers or categories', async () => {
    await db.exec(`CREATE TABLE products (id int, supplier_id int, category_id int, name text, price numeric);
      INSERT INTO products VALUES
      (1, 1, 2, 'Тоскана ДО 2000Х800 стекло', 12000),
      (2, 1, 2, 'Тоскана ДО 2000Х700 стекло', 11000),
      (3, 2, 2, 'Тоскана ДО 2000Х900 стекло', 10000),
      (4, 1, 3, 'Тоскана ДО 2000Х600 стекло', 9000);`);
    const result = await db.query<{ id: number }>(`WITH f AS (
      SELECT p.*, ROW_NUMBER() OVER (
        PARTITION BY COALESCE(p.supplier_id, 0), p.category_id, ${productModelKeySql()}
        ORDER BY price ASC, id) rn FROM products p)
      SELECT id FROM f WHERE rn = 1 ORDER BY id`);
    expect(result.rows.map(row => row.id)).toEqual([2, 3, 4]);
  });
});