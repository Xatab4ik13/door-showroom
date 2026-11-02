/** Shared PostgreSQL key for catalog grouping and retrieving all size variants. */
export function productModelKeySql(column = 'p.name'): string {
  // replace() is byte-safe: it normalizes Cyrillic 'х'/'×' to '*' even in SQL_ASCII
  // databases, where the regex character class cannot match multi-byte characters.
  const normalized = `replace(replace(lower(${column}), 'х', '*'), '×', '*')`;
  const withoutSize = `regexp_replace(${normalized}, '(?<![0-9])[0-9]{3,4}[[:space:]]*[*x][[:space:]]*[0-9]{3,4}(?![0-9])', ' ', 'g')`;
  const withoutQuotes = `regexp_replace(${withoutSize}, '["«»“”]', '', 'g')`;
  return `btrim(regexp_replace(${withoutQuotes}, '[[:space:],]+', ' ', 'g'))`;
}
