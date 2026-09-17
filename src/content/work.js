// The work, as content rather than data. Everything a case study needs
// lives here: no API call, no database row, nothing to fail at runtime.
// Adding a project means adding an entry and dropping its images into
// public/work/ - both of which land in the same commit, so the list and
// the case study can never drift apart.
//
// Fields
//   slug      stable id, also used for the deep link
//   name      short label for the collapsed row
//   logo      'wordmark' for our own mark, a path in public/work/ for a
//             client's, or null to fall back to the name as text
//   status    'live' | 'progress' | 'open'  - drives the indicator
//   year      the year the work was done, shown as a fact
//   title     the full sentence shown when the row is open
//   tags      disciplines, shown as chips
//   industry  one short line
//   site      { label, href } or null while there is nothing to link to
//   shots     images for the carousel, in order
//   body      paragraphs, written for a client rather than a developer
//   feedback  { quote, name, role } or null until the client gives one
//
// Anything a reader sees may be written either as a plain value or as
// { en, fi }, and pick() below resolves it. Both forms on purpose: a
// company name is the same in every language and writing it twice would
// only be a chance for the two copies to drift, while a sentence is not.

// Resolves a field for the current language. A plain string or array is
// already the answer; an object is a set of translations, and English is
// the fallback so a half-translated entry degrades to readable rather
// than to blank.
export function pick(field, lang) {
  if (field === null || field === undefined) return field;
  if (typeof field === 'string' || Array.isArray(field)) return field;
  return field[lang] || field.en;
}

export const work = [
  {
    slug: 'baumgertner',
    name: 'Baumgertner',
    logo: 'wordmark',
    status: 'live',
    year: 2026,
    title: {
      en: 'Baumgertner — brand, portfolio and a self-hosted platform',
      fi: 'Baumgertner — brändi, portfolio ja itse ylläpidetty alusta',
    },
    tags: {
      en: ['Branding', 'Web design', 'Development', 'Hosting'],
      fi: ['Brändi', 'Verkkosuunnittelu', 'Kehitys', 'Ylläpito'],
    },
    industry: { en: 'Portfolio', fi: 'Portfolio' },
    site: { label: 'baumgertner.fi', href: 'https://baumgertner.fi' },
    // Empty on purpose, which is what the carousel reads as "show the
    // mark instead" - the same placeholder the two unfinished projects
    // below are showing.
    //
    // The mock-up is still in the repo at
    // /work/Baumgertner/BaumgertnerSnapshot.jpg. Putting it back is one
    // line: add it to this array.
    shots: [],
    body: {
      en: [
        'Built from nothing rather than assembled from a theme: the identity, the interface, the API behind it and the server it runs on.',
        'It runs on its own machine with automatic certificates, nightly backups and monitoring, and every claim made anywhere else on this site can be checked against it.',
      ],
      fi: [
        'Rakennettu tyhjästä eikä koottu valmiista teemasta: ilme, käyttöliittymä, sen takana oleva rajapinta ja palvelin, jolla se pyörii.',
        'Se pyörii omalla koneellaan, jossa on automaattiset varmenteet, yölliset varmuuskopiot ja valvonta. Jokainen väite, joka tällä sivustolla esitetään, on tarkistettavissa sitä vasten.',
      ],
    },
    feedback: null,
  },
  {
    slug: 'pintaparoni',
    name: 'Pintaparoni',
    logo: '/work/pintaparoni.png',
    status: 'progress',
    year: 2026,
    title: {
      en: 'Pintaparoni — replacing a template with a site built for the company',
      fi: 'Pintaparoni — mallipohjan tilalle sivusto, joka on tehty tälle yritykselle',
    },
    tags: {
      en: ['Web design', 'Development'],
      fi: ['Verkkosuunnittelu', 'Kehitys'],
    },
    industry: { en: 'Facade and painting', fi: 'Julkisivu- ja maalaustyöt' },
    site: null,
    shots: [],
    body: {
      en: [
        'Pintaparoni already had a site. It was a template, it had aged, and it said almost nothing about the work the company actually does or the standard it does it to.',
        'The new one is being built for this company rather than adapted from a layout that was drawn for nobody in particular.',
        'In progress. The case study lands here once it is live.',
      ],
      fi: [
        'Pintaparonilla oli jo sivusto. Se oli mallipohja, se oli vanhentunut, eikä se kertonut juuri mitään siitä työstä, jota yritys oikeasti tekee tai millä tasolla se sen tekee.',
        'Uusi tehdään tälle yritykselle sen sijaan, että sovitettaisiin asettelu, jota ei ole piirretty kenellekään erityisesti.',
        'Työn alla. Referenssi ilmestyy tähän, kun sivusto on julkaistu.',
      ],
    },
    feedback: null,
  },
  {
    slug: 'marine-electrical',
    name: { en: 'Marine electrical', fi: 'Venesähkötyöt' },
    logo: null,
    status: 'progress',
    year: 2026,
    title: {
      en: 'A site for a local electrical company working in the marine industry',
      fi: 'Sivusto paikalliselle sähköalan yritykselle, joka työskentelee venealalla',
    },
    tags: {
      en: ['Web design', 'Development'],
      fi: ['Verkkosuunnittelu', 'Kehitys'],
    },
    industry: { en: 'Marine electrical', fi: 'Venesähkötyöt' },
    site: null,
    shots: [],
    body: {
      en: [
        'A custom site for a local electrical contractor working on boats and marine installations, replacing a presence that told visitors almost nothing about the work.',
        'In progress. The case study lands here once it is live.',
      ],
      fi: [
        'Räätälöity sivusto paikalliselle sähköurakoitsijalle, joka työskentelee veneiden ja meriasennusten parissa. Se korvaa näkyvyyden, joka ei kertonut kävijälle juuri mitään itse työstä.',
        'Työn alla. Referenssi ilmestyy tähän, kun sivusto on julkaistu.',
      ],
    },
    feedback: null,
  },
];

export default work;
