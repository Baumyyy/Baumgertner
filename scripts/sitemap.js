/**
 * Builds /sitemap.xml at build time instead of keeping it as a file
 * somebody has to remember to edit.
 *
 * public/sitemap.xml was hand-written, and its <lastmod> said 2026-09-18
 * while the site had been deployed twice since. That is the one field in a
 * sitemap that has a job - it is how a crawler decides whether a page is
 * worth fetching again - and a date frozen in the past tells Google the
 * opposite of what is true. Nothing warns you: the file stays valid, the
 * sitemap keeps reporting Success, and recrawls just quietly slow down.
 *
 * So the date comes from git. Each route is mapped to the source files it
 * is actually built from, and its lastmod is the newest commit touching
 * any of them - not the build date, which would claim every page changed
 * every time anything was deployed and make the field meaningless in the
 * other direction.
 *
 * The URL list stays in step with scripts/prerender.js by construction:
 * both are driven by the same route table below, and src/tests/routes.js
 * fails if a public route exists without one.
 */
import { execFileSync } from 'node:child_process';
import { statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const JUURI = join(dirname(fileURLToPath(import.meta.url)), '..');

const KOTISIVU = 'https://baumgertner.fi';

/**
 * Every indexable address, the sources it is built from, and how it ranks
 * against the others. "/" is deliberately absent: it redirects to the
 * x-default language (nginx.conf, location = /), and a sitemap listing a
 * redirect asks a crawler to fetch a page only to be sent somewhere else.
 */
const REITIT = [
  {
    polku: '/en', kieli: 'en', vastine: '/fi', paino: '1.0', tahti: 'monthly',
    lahteet: ['src/lang/en.js', 'src/components', 'src/content'],
  },
  {
    polku: '/fi', kieli: 'fi', vastine: '/en', paino: '1.0', tahti: 'monthly',
    lahteet: ['src/lang/fi.js', 'src/components', 'src/content'],
  },
  {
    polku: '/en/privacy', kieli: 'en', vastine: '/fi/privacy', paino: '0.3', tahti: 'yearly',
    lahteet: ['src/components/PrivacyPolicy.jsx', 'src/lang/en.js'],
  },
  {
    polku: '/fi/privacy', kieli: 'fi', vastine: '/en/privacy', paino: '0.3', tahti: 'yearly',
    lahteet: ['src/components/PrivacyPolicy.jsx', 'src/lang/fi.js'],
  },
  {
    polku: '/en/terms', kieli: 'en', vastine: '/fi/terms', paino: '0.3', tahti: 'yearly',
    lahteet: ['src/components/TermsOfUse.jsx', 'src/lang/en.js'],
  },
  {
    polku: '/fi/terms', kieli: 'fi', vastine: '/en/terms', paino: '0.3', tahti: 'yearly',
    lahteet: ['src/components/TermsOfUse.jsx', 'src/lang/fi.js'],
  },
];

/** The English address for a route, which is what x-default points at. */
function englanniksi(r) {
  return r.kieli === 'en' ? r.polku : r.vastine;
}

/**
 * Newest commit date touching any of these paths, as YYYY-MM-DD.
 *
 * git is the better answer, but it is not available where this actually
 * runs: .git is in .dockerignore, so inside the frontend image there is no
 * repository to ask. Falling back to file timestamps is not a workaround
 * for that, it is the right second source - `git pull` on the server
 * rewrites the mtime of every file it changed and leaves the rest alone,
 * and Docker's COPY preserves what it is given. A page whose sources did
 * not move keeps its old date, which is the whole point of the field.
 *
 * Returns null if neither can answer. <lastmod> is optional, and leaving
 * it out says "I don't know" - a fabricated date says something false.
 */
export function viimeksiMuutettu(lahteet, aja = suoritaGit, nyt = Date.now()) {
  const paivat = [];
  for (const polku of lahteet) {
    const ulos = aja(['log', '-1', '--format=%cs', '--', polku]);
    if (ulos && ulos.trim()) paivat.push(ulos.trim());
  }
  if (paivat.length) return paivat.sort().at(-1);

  const leimat = lahteet.map((polku) => uusinAikaleima(join(JUURI, polku))).filter(Boolean);
  if (!leimat.length) return null;

  // Never past today: a clock skew or a stray future mtime would otherwise
  // publish a date that has not happened yet.
  const uusin = Math.min(Math.max(...leimat), nyt);
  return new Date(uusin).toISOString().slice(0, 10);
}

/** Newest mtime at or under a path, walking directories. */
function uusinAikaleima(polku) {
  let tiedot;
  try { tiedot = statSync(polku); } catch { return 0; }
  if (!tiedot.isDirectory()) return tiedot.mtimeMs;
  // A directory's own mtime only moves when entries are added or removed,
  // so editing a file inside one would not show up without this walk.
  let uusin = 0;
  let nimet;
  try { nimet = readdirSync(polku); } catch { return tiedot.mtimeMs; }
  for (const nimi of nimet) {
    const alla = uusinAikaleima(join(polku, nimi));
    if (alla > uusin) uusin = alla;
  }
  return uusin || tiedot.mtimeMs;
}

function suoritaGit(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

function vaihtoehdot(r) {
  const en = englanniksi(r);
  const fi = r.kieli === 'fi' ? r.polku : r.vastine;
  return [
    `    <xhtml:link rel="alternate" hreflang="en" href="${KOTISIVU}${en}" />`,
    `    <xhtml:link rel="alternate" hreflang="fi" href="${KOTISIVU}${fi}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${KOTISIVU}${en}" />`,
  ].join('\n');
}

export function rakennaSitemap(aja = suoritaGit) {
  const lohkot = REITIT.map((r) => {
    const paiva = viimeksiMuutettu(r.lahteet, aja);
    return [
      '  <url>',
      `    <loc>${KOTISIVU}${r.polku}</loc>`,
      ...(paiva ? [`    <lastmod>${paiva}</lastmod>`] : []),
      `    <changefreq>${r.tahti}</changefreq>`,
      `    <priority>${r.paino}</priority>`,
      vaihtoehdot(r),
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...lohkot,
    '</urlset>',
    '',
  ].join('\n');
}

export { REITIT as SITEMAP_REITIT, KOTISIVU };
