/**
 * SEO utilities: base URL and document head updates for title, meta, OG, Twitter, canonical.
 * Brand: Innovative Hub | Domain: https://inovative-hub.com
 */

import { BRAND_LOGO } from '@/constants/media';

export const SITE_NAME = 'Innovative Hub';
/** Default first segment before " | Innovative Hub" for homepage-style titles */
const DEFAULT_PAGE_HEADLINE = 'Robotics, IoT & Embedded Systems Platform in Odisha';
/** Brand-first meta for homepage and default. */
export const DEFAULT_DESCRIPTION =
  "Innovative Hub is Odisha's leading platform for robotics, IoT & embedded systems. Components, kits & tutorials for engineering students and makers.";
const DEFAULT_OG_IMAGE = BRAND_LOGO;

const SUFFIX = ` | ${SITE_NAME}`;

/** Base URL for canonical and OG (absolute). No trailing slash. */
export function getBaseUrl(): string {
  if (typeof import.meta.env.VITE_APP_URL === 'string' && import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'https://inovative-hub.com';
}

/**
 * Resolve any site path or absolute URL to a full https URL for OG/Twitter images.
 */
export function toAbsoluteUrl(pathOrUrl: string, baseUrl?: string): string {
  const base = baseUrl ?? getBaseUrl();
  const u = pathOrUrl.trim();
  if (!u) return `${base}${BRAND_LOGO.startsWith('/') ? BRAND_LOGO : `/${BRAND_LOGO}`}`;
  if (/^https?:\/\//i.test(u)) return u;
  return `${base}${u.startsWith('/') ? u : `/${u}`}`;
}

/** Browser tab title: always "… | Innovative Hub" */
export function buildDocumentTitle(pageTitle?: string): string {
  const raw = (pageTitle ?? '').trim();
  if (!raw) return `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  if (raw.endsWith(SUFFIX)) return raw;
  if (raw === SITE_NAME) return `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  if (raw.startsWith(`${SITE_NAME} |`)) {
    const rest = raw.slice(SITE_NAME.length + 1).replace(/^\s*\|\s*/, '').trim();
    return rest ? `${rest}${SUFFIX}` : `${DEFAULT_PAGE_HEADLINE}${SUFFIX}`;
  }
  return `${raw}${SUFFIX}`;
}

function normalizeOgType(ogType: string): string {
  const t = (ogType || 'website').toLowerCase();
  if (t === 'product') return 'product';
  return 'website';
}

export interface SEOOptions {
  title?: string;
  description?: string;
  image?: string;
  /** Path (e.g. /about). Canonical and og:url will be baseUrl + path (+ query if present) */
  path?: string;
  /** Use "product" for product detail pages (Open Graph). */
  ogType?: string;
  /** If true, set robots noindex,nofollow */
  noIndex?: boolean;
}

function ensureMeta(nameOrProperty: string, isProperty: boolean): HTMLMetaElement {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${nameOrProperty}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(nameOrProperty: string, content: string, isProperty: boolean): void {
  const el = ensureMeta(nameOrProperty, isProperty);
  el.setAttribute('content', content);
}

const INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/**
 * Update document head: title, description, og:*, twitter:*, canonical.
 * Call from a useEffect in each page component (via <SEO />).
 */
export function updateDocumentHead(options: SEOOptions): void {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_OG_IMAGE,
    path = '',
    ogType = 'website',
    noIndex = false,
  } = options;

  const baseUrl = getBaseUrl();
  const pathPart = path
    ? path.startsWith('/')
      ? path
      : `/${path}`
    : '';
  const canonicalUrl = pathPart ? `${baseUrl}${pathPart}` : baseUrl;
  const imageUrl = toAbsoluteUrl(image, baseUrl);
  const fullTitle = buildDocumentTitle(title);

  document.title = fullTitle;

  const ogTypeNorm = normalizeOgType(ogType);

  setMeta('description', description, false);
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', description, true);
  setMeta('og:image', imageUrl, true);
  setMeta('og:url', canonicalUrl, true);
  setMeta('og:type', ogTypeNorm, true);
  setMeta('og:site_name', SITE_NAME, true);

  setMeta('twitter:card', 'summary_large_image', false);
  setMeta('twitter:title', fullTitle, false);
  setMeta('twitter:description', description, false);
  setMeta('twitter:image', imageUrl, false);
  setMeta('twitter:image:alt', fullTitle, false);

  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.rel = 'canonical';
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonicalUrl;

  if (noIndex) {
    setMeta('robots', 'noindex, nofollow', false);
  } else {
    setMeta('robots', INDEX_ROBOTS, false);
  }
}
