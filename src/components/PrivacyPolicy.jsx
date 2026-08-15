import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../useLang';
import { usePageMeta } from '../hooks/usePageMeta';

var content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 15 August 2026',
    intro: 'This page explains what personal data this website (baumgertner.fi) collects, why, and what rights you have. The data controller for the personal data described here is Anthony Baumgertner, who runs this site as a personal portfolio.',
    sections: [
      {
        heading: 'What data is collected',
        body: [
          'Contact form: name, email address and message, when you submit the contact form.',
          'Testimonials: name, role, company, message, rating and an optional profile photo, when you submit a testimonial. Submitted testimonials are reviewed before being published publicly on the site.',
          'Basic page-view analytics: the page you visited, the referring page, and your browser’s user-agent string. This is first-party, does not use cookies or a tracking identifier, and is not linked to your name or email.',
          'Security logs: if you trigger one of our rate limits (for example by sending an unusually high number of requests), we log your IP address and the requested route.'
        ]
      },
      {
        heading: 'Why this data is processed, and on what legal basis',
        body: [
          'To respond to messages sent through the contact form. Legal basis: legitimate interest (responding to inquiries addressed to us).',
          'To review and, if approved, publish testimonials. Legal basis: your consent, given at the moment you submit the testimonial.',
          'To understand overall site traffic (which pages are visited) in aggregate. Legal basis: legitimate interest (maintaining and improving the site).',
          'To detect and respond to abusive or malicious traffic (bots, scraping, brute-force attempts). Legal basis: legitimate interest (keeping the site secure and available).'
        ]
      },
      {
        heading: 'Third parties',
        body: [
          'Resend — used to deliver email notifications when a contact message or testimonial is submitted.',
          'A PostgreSQL database host — used to store the data listed above.',
          'GitHub — used only for the site owner’s own admin login (OAuth), not for visitor tracking.',
          'Cloudflare Turnstile — a bot-protection challenge on the contact and testimonial forms. To verify you are not a bot, your IP address and browser signals are shared with Cloudflare when you load a page with one of these forms and when you submit it. It does not track you across other sites.'
        ]
      },
      {
        heading: 'International data transfers',
        body: [
          'Resend, the database host, and Cloudflare (Turnstile) may process data outside the EU/EEA (for example in the United States). Where this happens, the transfer is safeguarded under the EU-US Data Privacy Framework and/or the European Commission\'s Standard Contractual Clauses.'
        ]
      },
      {
        heading: 'Cookies',
        body: [
          'This site does not set any cookies for regular visitors. A session cookie is only created if someone attempts to log in to the admin area.',
          'Cloudflare Turnstile, the bot-protection challenge on the contact and testimonial forms, may set its own technical identifier on pages that include one of these forms. This is not a tracking cookie.'
        ]
      },
      {
        heading: 'Data retention',
        body: [
          'Messages and testimonials are kept until deleted by the site owner. You can request deletion at any time (see contact details below).',
          'Pageview analytics rows are automatically deleted after 12 months.',
          'Security logs are automatically deleted after 30 days.'
        ]
      },
      {
        heading: 'How we protect your data',
        body: [
          'We use security measures including GitHub OAuth for admin login (no passwords stored on this site), rate limiting with automated abuse alerts, and a database access role restricted to only what the site needs to function. All traffic to this site is encrypted with HTTPS (TLS).',
          'No security measure is perfect, but we take reasonable steps to keep your data safe.'
        ]
      },
      {
        heading: 'Your rights',
        body: [
          'Right of access — you can ask what personal data we hold about you.',
          'Right to rectification — you can ask us to correct inaccurate or incomplete data.',
          'Right to erasure — you can ask us to delete your data, for example if you withdraw consent for a testimonial or the data is no longer needed.',
          'Right to restrict processing — you can ask us to limit how your data is used while a dispute about it is resolved.',
          'Right to object — you can object to processing based on legitimate interest.',
          'Right to withdraw consent — where processing is based on consent (testimonials), you can withdraw it at any time; this does not affect processing carried out before the withdrawal.',
          'Right to data portability — you can ask to receive the data you provided to us in a machine-readable format.',
          'To exercise any of these rights, contact the email address below.',
          'You also have the right to lodge a complaint with the Office of the Data Protection Ombudsman (tietosuoja.fi) if you believe your data has been processed unlawfully.'
        ]
      },
      {
        heading: 'Contact',
        body: [
          'contact@baumgertner.fi'
        ]
      }
    ],
    back: 'Back to Home'
  },
  fi: {
    title: 'Tietosuojaseloste',
    updated: 'Päivitetty viimeksi: 15.8.2026',
    intro: 'Tämä sivu kertoo, mitä henkilötietoja tämä verkkosivusto (baumgertner.fi) kerää, miksi, ja mitä oikeuksia sinulla on. Näiden henkilötietojen rekisterinpitäjä on Anthony Baumgertner, joka ylläpitää sivustoa henkilökohtaisena portfoliona.',
    sections: [
      {
        heading: 'Mitä tietoja kerätään',
        body: [
          'Yhteydenottolomake: nimi, sähköpostiosoite ja viesti, kun lähetät yhteydenottolomakkeen.',
          'Suosittelut: nimi, rooli, yritys, viesti, arvosana ja valinnainen profiilikuva, kun lähetät suosittelun. Lähetetyt suosittelut tarkistetaan ennen kuin ne mahdollisesti julkaistaan sivustolla.',
          'Perustason sivukäyntitilastot: käytetty sivu, mistä tulit sivulle (referrer) ja selaimesi user-agent-tunniste. Tämä on ensimmäisen osapuolen tilastointia, ei käytä evästeitä tai seurantatunnistetta, eikä sitä yhdistetä nimeesi tai sähköpostiisi.',
          'Turvalokit: jos laukaiset jonkin pyyntörajoituksistamme (esim. lähettämällä poikkeuksellisen suuren määrän pyyntöjä), tallennamme IP-osoitteesi ja pyydetyn reitin.'
        ]
      },
      {
        heading: 'Miksi tietoja käsitellään, ja millä oikeusperusteella',
        body: [
          'Vastataksemme yhteydenottolomakkeen kautta lähetettyihin viesteihin. Oikeusperuste: oikeutettu etu (meille osoitettuihin yhteydenottoihin vastaaminen).',
          'Tarkistaaksemme ja hyväksytyt suosittelut julkaistaksemme. Oikeusperuste: suostumuksesi, jonka annat lähettäessäsi suosittelun.',
          'Ymmärtääksemme sivuston kokonaiskävijämäärää (mitä sivuja käytetään) koostetusti. Oikeusperuste: oikeutettu etu (sivuston ylläpito ja kehittäminen).',
          'Havaitaksemme ja torjuaksemme väärinkäytöksiä ja haitallista liikennettä (botit, skreippaus, brute-force-yritykset). Oikeusperuste: oikeutettu etu (sivuston turvallisuuden ja saatavuuden ylläpito).'
        ]
      },
      {
        heading: 'Kolmannet osapuolet',
        body: [
          'Resend — käytetään sähköposti-ilmoitusten lähettämiseen kun yhteydenotto tai suosittelu lähetetään.',
          'PostgreSQL-tietokannan hosting-palveluntarjoaja — käytetään yllä lueteltujen tietojen tallentamiseen.',
          'GitHub — käytetään vain sivuston ylläpitäjän omaan admin-kirjautumiseen (OAuth), ei kävijöiden seurantaan.',
          'Cloudflare Turnstile — bottisuojaus yhteydenotto- ja suositteluformeissa. Sen varmistamiseksi, ettet ole botti, IP-osoitteesi ja selaintietoja välitetään Cloudflarelle kun lataat lomakkeen sisältävän sivun ja kun lähetät lomakkeen. Se ei seuraa sinua muilla sivustoilla.'
        ]
      },
      {
        heading: 'Kansainväliset tiedonsiirrot',
        body: [
          'Resend, tietokannan hosting-palveluntarjoaja ja Cloudflare (Turnstile) saattavat käsitellä tietoja EU/ETA-alueen ulkopuolella (esimerkiksi Yhdysvalloissa). Tällöin siirto on suojattu EU:n ja Yhdysvaltojen tietosuojakehyksellä (Data Privacy Framework) ja/tai Euroopan komission vakiosopimuslausekkeilla (Standard Contractual Clauses).'
        ]
      },
      {
        heading: 'Evästeet',
        body: [
          'Tämä sivusto ei aseta evästeitä tavallisille kävijöille. Sessioeväste luodaan vain, jos joku yrittää kirjautua admin-paneeliin.',
          'Cloudflare Turnstile, yhteydenotto- ja suositteluformien bottisuojaus, voi asettaa oman teknisen tunnisteensa lomakkeita sisältävillä sivuilla. Tämä ei ole seurantaeväste.'
        ]
      },
      {
        heading: 'Tietojen säilytys',
        body: [
          'Viestit ja suosittelut säilytetään kunnes ylläpitäjä poistaa ne. Voit pyytää tietojesi poistoa milloin tahansa (yhteystiedot alla).',
          'Sivukäyntitilastojen rivit poistetaan automaattisesti 12 kuukauden jälkeen.',
          'Turvalokit poistetaan automaattisesti 30 päivän jälkeen.'
        ]
      },
      {
        heading: 'Miten suojaamme tietojasi',
        body: [
          'Käytämme turvatoimia kuten GitHub OAuth -kirjautumista admin-paneeliin (sivustolla ei säilytetä salasanoja), pyyntörajoituksia automaattisin väärinkäyttöhälytyksin, ja tietokantakäyttöoikeutta joka on rajattu vain siihen mitä sivusto tarvitsee toimiakseen. Kaikki liikenne tälle sivustolle on salattu HTTPS:llä (TLS).',
          'Mikään turvatoimi ei ole täydellinen, mutta pyrimme kohtuullisin keinoin pitämään tietosi turvassa.'
        ]
      },
      {
        heading: 'Oikeutesi',
        body: [
          'Oikeus saada pääsy tietoihin — voit kysyä mitä henkilötietoja meillä on sinusta.',
          'Oikeus tietojen oikaisuun — voit pyytää korjaamaan virheelliset tai puutteelliset tiedot.',
          'Oikeus tietojen poistoon — voit pyytää tietojesi poistoa, esimerkiksi jos peruutat suostumuksesi suosittelun osalta tai tietoja ei enää tarvita.',
          'Oikeus käsittelyn rajoittamiseen — voit pyytää rajoittamaan tietojesi käyttöä kiistan selvittämisen ajaksi.',
          'Oikeus vastustaa käsittelyä — voit vastustaa oikeutettuun etuun perustuvaa käsittelyä.',
          'Oikeus peruuttaa suostumus — kun käsittely perustuu suostumukseen (suosittelut), voit peruuttaa sen milloin tahansa; tämä ei vaikuta ennen peruutusta tehtyyn käsittelyyn.',
          'Oikeus siirtää tiedot järjestelmästä toiseen — voit pyytää saada meille antamasi tiedot koneluettavassa muodossa.',
          'Käyttääksesi näitä oikeuksia, ota yhteyttä alla olevaan sähköpostiosoitteeseen.',
          'Sinulla on myös oikeus tehdä valitus Tietosuojavaltuutetun toimistolle (tietosuoja.fi), jos katsot että tietojasi on käsitelty lainvastaisesti.'
        ]
      },
      {
        heading: 'Yhteystiedot',
        body: [
          'contact@baumgertner.fi'
        ]
      }
    ],
    back: 'Takaisin etusivulle'
  }
};

var PrivacyPolicy = function() {
  var { lang } = useLang();
  var c = content[lang] || content.en;

  usePageMeta(
    'Privacy Policy | Anthony Baumgertner',
    'Privacy policy for baumgertner.fi - what personal data is collected, why, and your GDPR rights.'
  );

  return (
    <div className="privacy-page">
      <div className="privacy-content">
        <Link to="/" className="privacy-back">&larr; {c.back}</Link>
        <h1 className="privacy-title">{c.title}</h1>
        <p className="privacy-updated">{c.updated}</p>
        <p className="privacy-intro">{c.intro}</p>

        {c.sections.map(function(section, i) {
          return (
            <section className="privacy-section" key={i}>
              <h2 className="privacy-heading">{section.heading}</h2>
              {section.body.map(function(p, j) {
                return <p className="privacy-paragraph" key={j}>{p}</p>;
              })}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
