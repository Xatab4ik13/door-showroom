export interface KitItem {
  label: string;
  name: string;
  qty: number;
  price: number;
}

export interface ParsedDescription {
  /** Sanitized HTML of the marketing part (kit block removed) */
  html: string;
  /** Parsed "Комплектация" items (excluding the door leaf itself) */
  kit: KitItem[];
  /** Total price of the full kit, if the supplier stated it */
  kitTotal: number | null;
}

const ALLOWED = /<\/?(b|strong|i|em|br|p|ul|ol|li)\s*\/?>/gi;

function sanitize(html: string): string {
  return html
    // drop everything that is not in the allow-list
    .replace(/<[^>]+>/g, (tag) => (tag.match(ALLOWED) ? tag : ''))
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br/><br/>')
    .trim();
}

const numeric = (s: string) => Number(s.replace(/[^\d.]/g, '')) || 0;

export function parseDescription(raw?: string | null): ParsedDescription {
  if (!raw) return { html: '', kit: [], kitTotal: null };

  // Split off the "Комплектация" block — it is rendered by the configurator instead.
  const kitStart = raw.search(/<b>\s*Комплектаци[яи]/i);
  const main = kitStart >= 0 ? raw.slice(0, kitStart) : raw;
  const kitBlock = kitStart >= 0 ? raw.slice(kitStart) : '';

  const kit: KitItem[] = [];
  if (kitBlock) {
    const lines = kitBlock
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('•'));

    for (const line of lines) {
      const body = line.replace(/^•\s*/, '');
      const [labelPart, ...rest] = body.split(':');
      const value = rest.join(':').trim();
      const label = labelPart.trim();
      if (/полотно/i.test(label)) continue; // the leaf is the base product

      // "Коробка (телескоп ...) (3 шт. × 1716 руб.)"
      const m = value.match(/\((\d+)\s*шт\.?\s*[×x*]\s*([\d\s.,]+)\s*руб/i);
      const qty = m ? Number(m[1]) : 1;
      const price = m ? numeric(m[2]) : 0;
      const name = value.replace(/\s*\(\d+\s*шт\.?[^)]*\)\s*$/i, '').trim() || label;
      if (price > 0) kit.push({ label, name, qty, price });
    }
  }

  const totalMatch = kitBlock.match(/ИТОГО[^:]*:\s*([\d\s.,]+)\s*руб/i);

  return {
    html: sanitize(main),
    kit,
    kitTotal: totalMatch ? numeric(totalMatch[1]) : null,
  };
}

/** "Фрейм 10 шпон Ясень белоснежный, глухое 800*2000" -> base without the size */
export function stripSize(name: string): string {
  return name
    .replace(/\s*\d{3,4}\s*[*х×x]\s*\d{3,4}\s*$/i, '')
    .replace(/[,\s]+$/, '')
    .trim();
}

/** "800*2000" from the product name, or null */
export function extractSize(name: string): string | null {
  const m = name.match(/(\d{3,4})\s*[*х×x]\s*(\d{3,4})\s*$/i);
  return m ? `${m[1]}×${m[2]}` : null;
}
