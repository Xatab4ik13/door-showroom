import { beforeEach, describe, expect, it } from 'vitest';
import { getCatalogReturn, readCatalogSnapshot, saveCatalogSnapshot, type CatalogSnapshot } from '@/lib/catalogNavigation';

const snapshot: CatalogSnapshot = {
  url: '/catalog?category=mezhkomnatnye&page=2', y: 2345,
  filters: { tag: 'all', priceRange: [5000, 25000], materials: ['Массив'], finishes: ['Белый'],
    manufacturers: ['Ока'], search: 'Тоскана', sort: 'price', order: 'asc' },
};

describe('Return to the previous catalog position', () => {
  beforeEach(() => sessionStorage.clear());

  it('preserves page, scroll, selected filters, search and sorting', () => {
    saveCatalogSnapshot('original-entry', snapshot);
    expect(readCatalogSnapshot('original-entry', snapshot.url)).toEqual(snapshot);
  });

  it('keeps different catalog visits independent', () => {
    saveCatalogSnapshot('first', snapshot);
    saveCatalogSnapshot('second', { ...snapshot, y: 100 });
    expect(readCatalogSnapshot('first', snapshot.url)?.y).toBe(2345);
    expect(readCatalogSnapshot('second', snapshot.url)?.y).toBe(100);
    expect(readCatalogSnapshot('first', '/catalog?category=vhodnye')).toBeNull();
  });

  it('returns only to an explicitly identified catalog, never an unrelated page', () => {
    expect(getCatalogReturn({ catalogReturn: { key: 'first', url: snapshot.url } })).toEqual({ key: 'first', url: snapshot.url });
    expect(getCatalogReturn(null)).toBeNull();
    expect(getCatalogReturn({ catalogReturn: { key: 'first', url: 'https://example.com' } })).toBeNull();
    expect(getCatalogReturn({ catalogReturn: { key: 'first', url: '/catalogue' } })).toBeNull();
  });
});