export interface CatalogFiltersSnapshot {
  tag: 'all' | 'popular' | 'new' | 'sale';
  priceRange: [number, number];
  materials: string[];
  finishes: string[];
  manufacturers: string[];
  search: string;
  sort: 'updated_at' | 'price' | 'name';
  order: 'asc' | 'desc';
}

export interface CatalogSnapshot {
  url: string;
  y: number;
  filters: CatalogFiltersSnapshot;
}

export interface CatalogReturn {
  key: string;
  url: string;
}

export function getCatalogReturn(state: unknown): CatalogReturn | null {
  if (!state || typeof state !== 'object' || !('catalogReturn' in state)) return null;
  const value = state.catalogReturn;
  if (!value || typeof value !== 'object' || !('key' in value) || !('url' in value)) return null;
  if (typeof value.key !== 'string' || typeof value.url !== 'string') return null;
  if (value.url !== '/catalog' && !value.url.startsWith('/catalog?')) return null;
  return { key: value.key, url: value.url };
}

export function saveCatalogSnapshot(key: string, snapshot: CatalogSnapshot) {
  try {
    sessionStorage.setItem(`catalog-return:${key}`, JSON.stringify(snapshot));
  } catch { /* Navigation still works when storage is unavailable. */ }
}

export function readCatalogSnapshot(key: string, url: string): CatalogSnapshot | null {
  try {
    const raw = sessionStorage.getItem(`catalog-return:${key}`);
    if (!raw) return null;
    const saved = JSON.parse(raw) as CatalogSnapshot;
    if (saved.url !== url || !Number.isFinite(saved.y) || saved.y < 0 || !saved.filters) return null;
    return saved;
  } catch {
    return null;
  }
}