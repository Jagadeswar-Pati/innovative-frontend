/**
 * Dynamic Product JSON-LD for product detail pages (schema.org Product + Offer).
 */
import { getBaseUrl } from '@/lib/seo';

const SCRIPT_ID = 'ih-product-jsonld';

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  const u = pathOrUrl.trim();
  if (!u) return `${baseUrl}/assets/logo.png`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${baseUrl}${u.startsWith('/') ? u : `/${u}`}`;
}

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  priceCurrency?: string;
  stock: number;
  path: string;
}

/**
 * Injects or updates a single JSON-LD script for the current product.
 */
export function setProductJsonLd(input: ProductJsonLdInput): void {
  const baseUrl = getBaseUrl();
  const desc = stripHtml(input.description).slice(0, 5000);
  const rawImages = Array.isArray(input.image) ? input.image : [input.image];
  const images = rawImages.filter(Boolean).map((u) => toAbsoluteUrl(u, baseUrl));
  const primaryImage = images[0] || toAbsoluteUrl('/assets/logo.png', baseUrl);
  const availability =
    input.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const offerUrl = `${baseUrl}${path}`;

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: input.name,
    image: images.length <= 1 ? primaryImage : images,
    description: desc || input.name,
    brand: {
      '@type': 'Brand',
      name: 'Innovative Hub',
    },
    offers: {
      '@type': 'Offer',
      url: offerUrl,
      priceCurrency: input.priceCurrency ?? 'INR',
      price: String(input.price),
      availability,
    },
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

export function clearProductJsonLd(): void {
  document.getElementById(SCRIPT_ID)?.remove();
}
