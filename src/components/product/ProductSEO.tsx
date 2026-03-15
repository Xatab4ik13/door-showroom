import { useEffect } from 'react';
import type { ApiProduct } from '@/lib/api';
import type { CatalogProduct } from '@/data/catalog';

interface ProductSEOProps {
  product: CatalogProduct;
  apiProduct: ApiProduct | null;
}

/** Sets document.title, meta description, and JSON-LD Schema.org Product markup */
const ProductSEO = ({ product, apiProduct }: ProductSEOProps) => {
  useEffect(() => {
    const name = product.name;
    const brand = product.manufacturer || apiProduct?.specs?.['Бренд'] || '';
    const desc = apiProduct?.description
      ? apiProduct.description.slice(0, 155)
      : `${name}${brand ? ` от ${brand}` : ''} — купить в интернет-магазине RUSDOORS с доставкой по России`;

    // Title
    document.title = `${name}${brand ? ` ${brand}` : ''} — купить | RUSDOORS`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // OG tags
    const ogTags: Record<string, string> = {
      'og:title': `${name} — RUSDOORS`,
      'og:description': desc,
      'og:type': 'product',
      'og:url': window.location.href,
    };
    const image = Array.isArray(apiProduct?.images) && apiProduct!.images.length > 0
      ? apiProduct!.images[0]
      : product.image;
    if (image) ogTags['og:image'] = image;

    Object.entries(ogTags).forEach(([prop, content]) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });

    // JSON-LD Schema.org Product
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description: apiProduct?.description || desc,
      image: image || undefined,
      sku: apiProduct?.source_sku || undefined,
      brand: brand ? { '@type': 'Brand', name: brand } : undefined,
      material: apiProduct?.material || product.material || undefined,
      color: apiProduct?.color || product.finish || undefined,
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'RUB',
        price: product.price,
        availability: apiProduct?.in_stock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'RUSDOORS',
        },
      },
    };

    let scriptEl = document.getElementById('product-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'product-jsonld';
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    // Cleanup
    return () => {
      document.title = 'RUSDOORS — Интернет-магазин премиальных дверей';
      const jsonLdEl = document.getElementById('product-jsonld');
      if (jsonLdEl) jsonLdEl.remove();
    };
  }, [product, apiProduct]);

  return null;
};

export default ProductSEO;
