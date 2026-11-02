/** Shared PostgreSQL key for catalog grouping and retrieving all size variants. */
export function productModelKeySql(column = 'p.name'): string {
  const withoutSize = `regexp_replace(lower(${column}), '(?<![0-9])[0-9]{3,4}[[:space:]]*[*хx×][[:space:]]*[0-9]{3,4}(?![0-9])', ' ', 'g')`;
  const withoutQuotes = `regexp_replace(${withoutSize}, '["«»“”]', '', 'g')`;
  return `btrim(regexp_replace(${withoutQuotes}, '[[:space:],]+', ' ', 'g'))`;
}