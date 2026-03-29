/**
 * Generates public/sitemap.xml with static routes, category listing URLs, and product URLs.
 * Uses VITE_APP_URL and VITE_API_URL from .env when present.
 * Run before build: node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const sitemapPath = path.join(root, 'public', 'sitemap.xml');
const robotsPath = path.join(root, 'public', 'robots.txt');

const FALLBACK_SITE = 'https://inovative-hub.com';
const FALLBACK_API = 'http://127.0.0.1:5000';

function loadEnvFile() {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

/** Mirrors frontend/src/utils/products.ts STATIC_CATEGORIES slugs */
const CATEGORY_SLUGS = [
  'electronics-components',
  'microcontroller-boards',
  'electronic-modules',
  'displays',
  '3d-printing-service',
  'battery-charger',
  'iot-wireless-boards',
  'sensors',
  'power-supply',
  'mic-speaker',
  'motors-motor-drivers',
  'relays',
  'drone-parts',
  'equipment',
  'engineering-zone',
  'innovation-zone',
  'miscellaneous',
];

const STATIC_ENTRIES = [
  ['/', 'weekly', '1.0'],
  ['/eshop', 'weekly', '0.9'],
  ['/eshop/products', 'daily', '0.9'],
  ['/about', 'monthly', '0.85'],
  ['/contact', 'monthly', '0.8'],
  ['/faq', 'monthly', '0.8'],
  ['/order-tracking', 'monthly', '0.6'],
  ['/robotics-courses', 'monthly', '0.5'],
  ['/project-kits', 'monthly', '0.5'],
  ['/resources', 'monthly', '0.5'],
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urlEl(loc, changefreq, priority) {
  return `  <url><loc>${escapeXml(loc)}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

async function fetchAllProductIds(apiBase) {
  const ids = [];
  const limit = 100;
  let skip = 0;
  for (;;) {
    const u = new URL('/api/products', apiBase);
    u.searchParams.set('skip', String(skip));
    u.searchParams.set('limit', String(limit));
    const res = await fetch(u.href, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`GET ${u.href} → ${res.status}`);
    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : [];
    for (const row of data) {
      const id = row._id != null ? String(row._id) : row.id != null ? String(row.id) : '';
      if (id) ids.push(id);
    }
    if (data.length < limit) break;
    skip += limit;
  }
  return ids;
}

async function main() {
  const env = loadEnvFile();
  const site = (env.VITE_APP_URL || FALLBACK_SITE).replace(/\/$/, '');
  const api = (env.VITE_API_URL || env.SITEMAP_API_URL || FALLBACK_API).replace(/\/$/, '');

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

  for (const [p, freq, pri] of STATIC_ENTRIES) {
    lines.push(urlEl(`${site}${p}`, freq, pri));
  }

  for (const slug of CATEGORY_SLUGS) {
    const loc = `${site}/eshop/products?category=${encodeURIComponent(slug)}`;
    lines.push(urlEl(loc, 'daily', '0.8'));
  }

  try {
    const productIds = await fetchAllProductIds(api);
    for (const id of productIds) {
      lines.push(urlEl(`${site}/product/${encodeURIComponent(id)}`, 'weekly', '0.75'));
    }
    console.log('Sitemap: added', productIds.length, 'product URLs from', api);
  } catch (e) {
    console.warn('Sitemap: product fetch skipped —', e.message || e);
  }

  lines.push('</urlset>');
  fs.writeFileSync(sitemapPath, lines.join('\n'), 'utf8');
  console.log('Wrote', sitemapPath, '— site base:', site);

  const robots = `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;
  fs.writeFileSync(robotsPath, robots, 'utf8');
  console.log('Wrote', robotsPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
