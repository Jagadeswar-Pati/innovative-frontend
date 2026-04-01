/**
 * BreadcrumbList JSON-LD for product and listing pages (schema.org).
 */
import { getBaseUrl } from '@/lib/seo';

const SCRIPT_ID = 'ih-breadcrumb-jsonld';

function toLoc(path: string, baseUrl: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

export interface BreadcrumbItem {
  name: string;
  /** Site path including leading slash, e.g. /eshop/products */
  path: string;
}

export function setBreadcrumbJsonLd(items: BreadcrumbItem[]): void {
  if (!items.length) {
    clearBreadcrumbJsonLd();
    return;
  }
  const baseUrl = getBaseUrl();
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toLoc(item.path, baseUrl),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  let el = document.getElementById(SCRIPT_ID);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = SCRIPT_ID;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

export function clearBreadcrumbJsonLd(): void {
  document.getElementById(SCRIPT_ID)?.remove();
}
