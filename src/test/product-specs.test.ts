import { afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { productSpecsUpdateSql } from '../../backend/src/lib/productSpecs';

const db = new PGlite();
afterAll(() => db.close());

async function updateSpecs(existing: Record<string, unknown> | null, submitted: Record<string, unknown>, replace = true) {
  await db.exec('CREATE TABLE IF NOT EXISTS spec_products (id int PRIMARY KEY, specs jsonb)');
  await db.query('INSERT INTO spec_products VALUES (1, $1::jsonb) ON CONFLICT (id) DO UPDATE SET specs = EXCLUDED.specs', [existing === null ? null : JSON.stringify(existing)]);
  await db.query(`UPDATE spec_products SET specs = ${productSpecsUpdateSql('$1', replace)} WHERE id = 1`, [JSON.stringify(submitted)]);
  // Separate read represents opening the editor again after saving.
  const result = await db.query<{ specs: Record<string, unknown> }>('SELECT specs FROM spec_products WHERE id = 1');
  return result.rows[0]?.specs;
}

describe('Product characteristic deletion', () => {
  it('does not restore deleted or renamed characteristics on readback', async () => {
    expect(await updateSpecs({ 'Вес': '40 кг', 'Толщина': '40 мм', 'Модель': 'А' }, { 'Толщина полотна': '40 мм', 'Модель': 'А' }))
      .toEqual({ 'Толщина полотна': '40 мм', 'Модель': 'А' });
  });

  it('allows deleting the entire visible list without losing supplier data', async () => {
    const hidden = { _accessories: '[{"price":1000}]', _sizes: '["860x2050"]', _custom: 'keep', source_url: 'supplier-product', sync_id: '42' };
    expect(await updateSpecs({ ...hidden, 'Вес': '40 кг' }, {})).toEqual(hidden);
  });

  it('persists cleared sizes, opening sides and technical sizes', async () => {
    const cleared = { _sizes: '[]', _opening_sides: '[]', _tech_sizes: '[]' };
    expect(await updateSpecs({ _sizes: '["860x2050"]', _opening_sides: '["Левое"]', _tech_sizes: '["80x32"]' }, cleared)).toEqual(cleared);
  });

  it('preserves merge behavior for PATCH callers not using the editor replacement flag', async () => {
    expect(await updateSpecs({ 'Вес': '40 кг', 'Модель': 'А' }, { 'Модель': 'Б' }, false)).toEqual({ 'Вес': '40 кг', 'Модель': 'Б' });
  });

  it('handles products without existing specs', async () => {
    expect(await updateSpecs(null, { 'Модель': 'А' })).toEqual({ 'Модель': 'А' });
  });
});