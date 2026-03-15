import { useEffect } from 'react';

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>;
}

/** Sets document.title, meta description, canonical, and optional JSON-LD for any page */
const PageSEO = ({ title, description, canonical, jsonLd }: PageSEOProps) => {
  useEffect(() => {
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OG tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical || window.location.href,
    };
    Object.entries(ogTags).forEach(([prop, content]) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    });

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // JSON-LD
    if (jsonLd) {
      let scriptEl = document.getElementById('page-jsonld');
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'page-jsonld';
        scriptEl.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      document.title = 'Купить двери в Москве — входные и межкомнатные двери | RUSDOORS';
      const jsonLdEl = document.getElementById('page-jsonld');
      if (jsonLdEl) jsonLdEl.remove();
    };
  }, [title, description, canonical, jsonLd]);

  return null;
};

export default PageSEO;
