/**
 * Normalize a manufacturer / brand name so identical brands written with
 * different casing, extra spaces or ё/е variations collapse to a single value.
 *
 * Rules:
 *  - trim, collapse internal whitespace
 *  - replace ё → е (preserves case)
 *  - title-case each whitespace-separated word
 *
 * Example:
 *   "  двери  регионов "  → "Двери Регионов"
 *   "ДВЕРИ РЕГИОНОВ"      → "Двери Регионов"
 *   "Тёрмадор"            → "Термадор"
 */
export function normalizeManufacturer(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).replace(/\u00a0/g, ' ').replace(/[ёЁ]/g, m => (m === 'Ё' ? 'Е' : 'е'));
  const collapsed = raw.replace(/\s+/g, ' ').trim();
  if (!collapsed) return null;
  return collapsed
    .split(' ')
    .map(w => (w.length ? w[0].toLocaleUpperCase('ru-RU') + w.slice(1).toLocaleLowerCase('ru-RU') : w))
    .join(' ');
}
