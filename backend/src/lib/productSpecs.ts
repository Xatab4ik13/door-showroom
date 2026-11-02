/** Replace the editor's characteristics without losing hidden supplier metadata. */
export function productSpecsUpdateSql(parameter: string, replaceVisible: boolean): string {
  if (!replaceVisible) return `COALESCE(specs, '{}'::jsonb) || ${parameter}::jsonb`;
  return `COALESCE((
    SELECT jsonb_object_agg(entry.key, entry.value)
    FROM jsonb_each(COALESCE(specs, '{}'::jsonb)) AS entry
    WHERE left(entry.key, 1) = '_'
      OR entry.key IN ('source_url', 'supplier_url', 'xml_url', 'import_url', 'sync_id')
  ), '{}'::jsonb) || ${parameter}::jsonb`;
}