/**
 * Dynamic Product JSON-LD for product detail pages (schema.org Product + Offer).
 */
import { getBaseUrl } from '@/lib/seo';
import { BRAND_LOGO } from '@/constants/media';

const SCRIPT_ID = 'ih-product-jsonld';

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  const u = pathOrUrl.trim();
  if (!u) return `${baseUrl}${BRAND_LOGO.startsWith('/') ? BRAND_LOGO : `/${BRAND_LOGO}`}`;
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

export interface ProductJsonLdReview {
  authorName?: string;
  reviewBody: string;
  ratingValue: number;
  bestRating?: number;
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  priceCurrency?: string;
  stock: number;
  path: string;
  /** Product SKU (required for Merchant / product rich results when available) */
  sku?: string;
  category?: string;
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: ProductJsonLdReview[];
}

function priceValidUntilIso(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Injects or updates a single JSON-LD script for the current product.
 */
export function setProductJsonLd(input: ProductJsonLdInput): void {
  const baseUrl = getBaseUrl();
  const desc = stripHtml(input.description).slice(0, 5000);
  const rawImages = Array.isArray(input.image) ? input.image : [input.image];
  const images = rawImages.filter(Boolean).map((u) => toAbsoluteUrl(u, baseUrl));
  const primaryImage = images[0] || toAbsoluteUrl(BRAND_LOGO, baseUrl);
  const availability =
    input.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const offerUrl = `${baseUrl}${path}`;
  const sku = (input.sku || '').trim();

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: offerUrl,
    priceCurrency: input.priceCurrency ?? 'INR',
    price: String(input.price),
    availability,
    priceValidUntil: priceValidUntilIso(),
    itemCondition: 'https://schema.org/NewCondition',
  };

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: input.name,
    image: images.length <= 1 ? primaryImage : images,
    description: desc || input.name,
    brand: {
      '@type': 'Brand',
      name: 'Innovative Hub',
    },
    offers: offer,
  };

  if (sku) {
    schema.sku = sku;
    schema.mpn = sku;
  }

  if (input.category?.trim()) {
    schema.category = input.category.trim();
  }

  const agg = input.aggregateRating;
  const usePlaceholderRating =
    import.meta.env.VITE_SEO_USE_PLACEHOLDER_RATINGS === 'true' &&
    !agg &&
    (!input.reviews || input.reviews.length === 0);

  if (agg && agg.reviewCount > 0 && agg.ratingValue > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(Math.min(5, Math.max(1, agg.ratingValue))),
      reviewCount: String(Math.floor(agg.reviewCount)),
    };
  } else if (usePlaceholderRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.5',
      reviewCount: '12',
    };
  }

  if (input.reviews && input.reviews.length > 0) {
    schema.review = input.reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.authorName || 'Verified buyer',
      },
      reviewBody: r.reviewBody.slice(0, 5000),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Math.min(5, Math.max(1, r.ratingValue)),
        bestRating: r.bestRating ?? 5,
      },
    }));
  }

  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (!el) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = SCRIPT_ID;
    document.head.appendChild(script);
    el = script;
  }
  el.textContent = JSON.stringify(schema);
}

export function clearProductJsonLd(): void {
  document.getElementById(SCRIPT_ID)?.remove();
}
