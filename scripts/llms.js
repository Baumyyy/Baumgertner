/**
 * Builds /llms.txt - a short, plain-language map of the site for language
 * models, in the format proposed at llmstxt.org: an H1, a blockquote
 * summary, free prose, then H2 sections of links.
 *
 * Worth being straight about what this is: the convention is a proposal,
 * and no major AI company has publicly committed to reading it. It is
 * cheap, it is checked by the agentic-browsing audits, and it costs
 * nothing if it turns out nobody reads it. That is the whole case for it -
 * not that it is known to work.
 *
 * The services are read from src/lang/en.js for the same reason
 * scripts/schema.js reads them: two hand-maintained copies of the same six
 * sentences drift, and the one nobody looks at drifts first.
 */
import en from '../src/lang/en.js';
import fi from '../src/lang/fi.js';

const KOTISIVU = 'https://baumgertner.fi';

function palvelurivit(teksti) {
  const rivit = [];
  for (let i = 1; i <= 6; i++) {
    const nimi = teksti['services_' + i + '_title'];
    const kuvaus = teksti['services_' + i + '_body'];
    if (nimi) rivit.push('- **' + nimi + '** — ' + kuvaus);
  }
  return rivit.join('\n');
}

export function rakennaLlmsTxt() {
  return `# Baumgertner

> The portfolio and studio site of Anthony Baumgertner, a software engineer
> and project manager based in Turku, Finland, who designs and builds
> websites end to end — brand, interface, code and hosting.

The site exists in two languages, English at /en and Finnish at /fi, with
identical content. It is a personal portfolio, not a registered company;
work is agreed case by case and no pricing is published.

## What is offered

${palvelurivit(en)}

Every one of these is done by one person rather than handed between a
designer, a developer and an agency account manager.

## Sivut ja palvelut suomeksi

${palvelurivit(fi)}

## Pages

- [Home, English](${KOTISIVU}/en): the full site — the case against template
  builders, the six services above, selected work, and a contact form.
- [Etusivu, suomeksi](${KOTISIVU}/fi): the same page in Finnish.

## Legal

- [Privacy Policy](${KOTISIVU}/en/privacy): what the site collects and why.
  It collects a contact form submission, cookieless first-party page counts
  and Cloudflare Web Analytics. It sets no cookies for ordinary visitors and
  has no cookie banner.
- [Tietosuojaseloste](${KOTISIVU}/fi/privacy): the Finnish version.
- [Terms of Use](${KOTISIVU}/en/terms): acceptable use, ownership, liability.
- [Käyttöehdot](${KOTISIVU}/fi/terms): the Finnish version.

## Contact

The contact form on either home page is the way in. It asks which services
are relevant, what stage the project is at, how large it is, and then takes
a message. Messages are deleted automatically after six months.

## Optional

- [Sitemap](${KOTISIVU}/sitemap.xml): every indexable address.
- [robots.txt](${KOTISIVU}/robots.txt): crawl rules. All crawlers are
  welcome apart from the admin panel, which is behind a login.
`;
}
