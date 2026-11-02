const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();

/** Hide only an erroneous article containing the same text as technical data. */
export function isRepeatedArticle(key: string, value: string, specs: Record<string, string | null>): boolean {
  if (normalize(key) !== 'артикул') return false;
  const article = normalize(value);
  if (!article) return false;
  return Object.entries(specs).some(([otherKey, otherValue]) =>
    normalize(otherKey) === 'технические данные' && typeof otherValue === 'string' && normalize(otherValue) === article,
  );
}