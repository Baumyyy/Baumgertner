/**
 * Tells the IndexNow endpoint that the site has changed, instead of
 * waiting for a crawler to come round and notice.
 *
 * One ping reaches Bing, Yandex, Seznam and Naver - they share the
 * protocol and forward submissions between each other. Google does not
 * participate, so this changes nothing on that side; Search Console's
 * "Request indexing" stays the only lever there.
 *
 * On the key being in a public repo: that is the design, not a leak. The
 * whole verification mechanism is that anyone can fetch
 * /<key>.txt from the domain and find the same key inside it - that is
 * how the endpoint proves the submission came from someone who controls
 * the site. A key nobody can read would verify nothing. It grants no
 * access and says nothing about anything else; the worst a stranger can
 * do with it is tell Bing to re-crawl pages that are already public.
 *
 * The URL list is read from public/sitemap.xml rather than restated here,
 * for the reason scripts/schema.js reads the language files: a second
 * hand-maintained copy of the same six addresses drifts, and the copy
 * nobody looks at drifts first.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TAMA = dirname(fileURLToPath(import.meta.url));
const JUURI = join(TAMA, '..');

const ISANTA = 'baumgertner.fi';
const AVAIN = 'c872cc27850f411ea785445cd420cca0';
const PAATEPISTE = 'https://api.indexnow.org/indexnow';

/** Every <loc> in the sitemap, in the order it appears there. */
export function osoitteetSivustokartasta(xml) {
  const osumat = xml.match(/<loc>\s*([^<\s]+)\s*<\/loc>/g) || [];
  return osumat.map(function (rivi) {
    return rivi.replace(/<\/?loc>/g, '').trim();
  });
}

export function lueOsoitteet() {
  return osoitteetSivustokartasta(
    readFileSync(join(JUURI, 'public', 'sitemap.xml'), 'utf8')
  );
}

/**
 * The key file has to be reachable and has to contain exactly the key,
 * or the endpoint rejects every submission with a 403. Checking it here
 * turns that into one clear message now rather than a silent failure
 * every deploy from here on.
 */
async function tarkistaAvaintiedosto(sijainti) {
  const vastaus = await fetch(sijainti);
  if (!vastaus.ok) {
    throw new Error('avaintiedostoa ei saatu: ' + vastaus.status + ' ' + sijainti);
  }
  const sisalto = (await vastaus.text()).trim();
  if (sisalto !== AVAIN) {
    throw new Error('avaintiedoston sisalto ei vastaa avainta: ' + sijainti);
  }
}

async function main() {
  const osoitteet = lueOsoitteet();
  const sijainti = 'https://' + ISANTA + '/' + AVAIN + '.txt';

  if (osoitteet.length === 0) {
    throw new Error('sivustokartassa ei ollut yhtaan osoitetta');
  }

  await tarkistaAvaintiedosto(sijainti);

  const vastaus = await fetch(PAATEPISTE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: ISANTA,
      key: AVAIN,
      keyLocation: sijainti,
      urlList: osoitteet
    })
  });

  // 200 means accepted, 202 means accepted but the key is still being
  // checked. Both are success; anything else is not.
  if (vastaus.status !== 200 && vastaus.status !== 202) {
    const runko = await vastaus.text();
    throw new Error('IndexNow hylkasi: ' + vastaus.status + ' ' + runko.slice(0, 200));
  }

  console.log('IndexNow: ' + osoitteet.length + ' osoitetta lahetetty (' + vastaus.status + ')');
  osoitteet.forEach(function (o) { console.log('  ' + o); });
}

// Only when run directly, so the tests can import the parsing without
// firing a real submission.
if (process.argv[1] && process.argv[1].endsWith('indexnow.js')) {
  main().catch(function (virhe) {
    console.error('IndexNow epaonnistui: ' + virhe.message);
    // exitCode rather than exit(): the failing path still has an open
    // fetch handle, and tearing the loop down under it makes libuv print
    // an assertion over the message that actually says what went wrong.
    process.exitCode = 1;
  });
}
