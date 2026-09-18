/**
 * Builds the JSON-LD graph that scripts/prerender.js writes into each
 * page's head.
 *
 * The service names and descriptions come from src/lang/{en,fi}.js - the
 * same file the visible text is rendered from - so the structured data
 * cannot drift away from what the page actually says. That is the whole
 * reason this reads the language files rather than restating them.
 *
 * On the type used for the provider: this is deliberately a Person who
 * `makesOffer`, not a ProfessionalService. ProfessionalService is a
 * LocalBusiness subtype and declaring one asserts a registered business,
 * which the privacy policy and terms both say does not exist yet ("a
 * private individual running this site as a personal portfolio"). Google
 * gets the same service and area signals either way; the map pack needs a
 * Business Profile, which needs the business, and no amount of schema
 * substitutes for it. When the toiminimi is registered this becomes a
 * ProfessionalService with its Y-tunnus in `identifier`, and the legal
 * pages change in the same sitting.
 */
import en from '../src/lang/en.js';
import fi from '../src/lang/fi.js';

const KOTISIVU = 'https://baumgertner.fi';
const KIELET = { en, fi };

const PERSON_ID = KOTISIVU + '/#person';
const SITE_ID = KOTISIVU + '/#website';

/** Turku first, then the region, then the country - narrowest to widest. */
const ALUEET = [
  { '@type': 'City', name: 'Turku' },
  { '@type': 'AdministrativeArea', name: 'Varsinais-Suomi' },
  { '@type': 'Country', name: 'Finland' }
];

const SOSIAALINEN = [
  'https://github.com/baumyyy',
  'https://www.linkedin.com/in/anthony-baumgertner-65548742a/',
  'https://www.instagram.com/baumgertnerr/'
];

/** The six services as they are written on the page, in the page's language. */
function palvelut(teksti) {
  const ulos = [];
  for (let i = 1; i <= 6; i++) {
    const nimi = teksti['services_' + i + '_title'];
    const kuvaus = teksti['services_' + i + '_body'];
    if (!nimi) continue;
    ulos.push({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: nimi,
        description: kuvaus,
        provider: { '@id': PERSON_ID },
        areaServed: ALUEET
      }
    });
  }
  return ulos;
}

function henkilo(teksti, kieli) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Anthony Baumgertner',
    jobTitle: kieli === 'fi' ? 'Ohjelmistokehittäjä ja projektipäällikkö' : 'Software Engineer & Project Manager',
    url: KOTISIVU,
    image: KOTISIVU + '/avatar.jpg',
    sameAs: SOSIAALINEN,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Turku',
      addressRegion: 'Varsinais-Suomi',
      addressCountry: 'FI'
    },
    knowsLanguage: [
      { '@type': 'Language', name: 'Finnish', alternateName: 'fi' },
      { '@type': 'Language', name: 'English', alternateName: 'en' }
    ],
    // Drawn from the services rather than a hand-written keyword list, so
    // it says what the page says.
    knowsAbout: [1, 2, 3, 4, 5, 6]
      .map(function (i) { return teksti['services_' + i + '_title']; })
      .filter(Boolean),
    areaServed: ALUEET,
    makesOffer: palvelut(teksti)
  };
}

/**
 * @param reitti  the route entry from prerender.js
 * @param meta    { title, kuvaus } as the rendered page reports them
 */
export function rakennaSkeema(reitti, meta) {
  const teksti = KIELET[reitti.kieli] || en;
  const osoite = KOTISIVU + (reitti.kanoninen || reitti.polku);
  const koti = reitti.polku === '/en' || reitti.polku === '/fi';

  const sivu = {
    '@type': 'WebPage',
    '@id': osoite + '#webpage',
    url: osoite,
    name: meta.title,
    description: meta.kuvaus,
    inLanguage: reitti.kieli,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': PERSON_ID }
  };

  const graafi = [
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: KOTISIVU,
      name: 'Baumgertner',
      inLanguage: reitti.kieli,
      publisher: { '@id': PERSON_ID }
    },
    sivu
  ];

  // The offer catalogue belongs on the pages that actually offer
  // something. Repeating six services inside a privacy policy would be
  // describing the page as something it is not.
  graafi.push(koti ? henkilo(teksti, reitti.kieli) : {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Anthony Baumgertner',
    url: KOTISIVU,
    sameAs: SOSIAALINEN
  });

  return { '@context': 'https://schema.org', '@graph': graafi };
}

/**
 * Serialised for embedding in HTML. `<` is escaped because a `</script>`
 * appearing inside a JSON string would otherwise close the tag early -
 * the one way a JSON-LD block can break the page around it.
 */
export function skeemaTagiksi(skeema) {
  const json = JSON.stringify(skeema, null, 2).split('<').join('\\u003c');
  return '<script type="application/ld+json">' + json + '</script>';
}
