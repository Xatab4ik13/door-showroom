/**
 * Normalize a manufacturer / brand name so identical brands written with
 * different casing, extra spaces or ё/е variations collapse to a single value.
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

/**
 * Collapse consecutive duplicated words (case + cyr/lat translit insensitive).
 * Handles "Дверь Дверь", "FUARO Фуаро", "Vantage VANTAGE" etc.
 */
function collapseDuplicateWords(input: string): string {
  const CHAR_MAP: Record<string, string> = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'zh',з:'z',и:'i',й:'i',
    к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',
    ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sh',ъ:'',ы:'y',ь:'',э:'e',
    ю:'yu',я:'ya',
  };
  const WORD_MAP: Record<string, string> = {
    'фуаро':'fuaro','вантаж':'vantage','вантадж':'vantage','протектор':'protector',
    'термадор':'termador','бьянко':'bianco','бианко':'bianco',
  };
  const fold = (w: string): string => {
    const lower = w.toLocaleLowerCase('ru-RU').replace(/ё/g,'е');
    if (WORD_MAP[lower]) return WORD_MAP[lower];
    return lower.split('').map(ch => CHAR_MAP[ch] ?? ch).join('');
  };
  const parts = input.split(/(\s+)/);
  const out: string[] = [];
  let prevKey: string | null = null;
  for (const p of parts) {
    if (/^\s+$/.test(p)) { out.push(p); continue; }
    const key = fold(p);
    if (key && key === prevKey) {
      if (out.length && /^\s+$/.test(out[out.length - 1])) out.pop();
      continue;
    }
    out.push(p);
    if (key) prevKey = key;
  }
  return out.join('').replace(/\s+/g, ' ').trim();
}

const DESCRIPTION_PREFIX_BLACKLIST: RegExp[] = [
  /^двери\s+штучноосвоен\S*\s*/i,
  /^двер[ьи]\s+штучно\S*\s*/i,
];

/** Clean a product display name. */
export function normalizeProductName(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  let s = String(input).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  s = collapseDuplicateWords(s);
  // Strip trailing ", арт F0000123755" suffix from the title
  s = s.replace(/,?\s*арт\.?\s*[A-Za-zА-Яа-я0-9-]{4,}\s*$/i, '').trim();
  return s;
}

/** Clean a product description. */
export function normalizeProductDescription(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  let s = String(input).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  for (const re of DESCRIPTION_PREFIX_BLACKLIST) s = s.replace(re, '').trim();
  s = collapseDuplicateWords(s);
  return s || null;
}
