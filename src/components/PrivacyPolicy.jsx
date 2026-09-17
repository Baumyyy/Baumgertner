import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../useLang';
import { usePageMeta } from '../hooks/usePageMeta';

// Everything here has to be checkable against the code that runs.
//
// The previous version described a testimonial form that no longer
// exists, a retention period of 45 days that is now six months, and an
// email notification that "separately retained" the visitor's message in
// an inbox - which stopped being true when per-submission emails were
// replaced by a digest that deliberately carries no names, addresses or
// message bodies. A policy that describes the wrong system is worse than
// none: it is a promise about somewhere the data does not go.
//
// If any of the following changes, this file changes with it:
//   backend/server.js  cleanupOldMessages     retention, 6 months
//   backend/server.js  cleanupOldPageviews    retention, 12 months
//   backend/server.js  cleanupOldSecurityEvents  retention, 30 days
//   backend/server.js  sendDigestNotification what leaves the server
//   src/components/ContactPanel.jsx  what the form asks for
var content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 17 September 2026',
    intro: 'This page explains what personal data this website (baumgertner.fi) collects, why, and what rights you have. The data controller is Anthony Baumgertner, a private individual running this site as a personal portfolio.',
    sections: [
      {
        heading: 'What data is collected',
        body: [
          'Contact form: your name, email address and message. The form asks four questions before the message, and your answers to them — which services you are interested in, what stage your project is at, how large it is, and the address of your current website if you gave one — are stored as part of that message.',
          'Basic page-view analytics: the page you visited and your browser’s user-agent string. This is first-party, uses no cookies and no tracking identifier, records no IP address, and is not linked to your name or email.',
          'Security logs: if you trigger one of the rate limits — for example by sending an unusually high number of requests — your IP address and the requested route are logged.',
          'Nothing else is collected. There is no advertising, no profiling and no third-party analytics on this site.'
        ]
      },
      {
        heading: 'Why this data is processed, and on what legal basis',
        body: [
          'To read and answer messages sent through the contact form. Legal basis: legitimate interest — responding to an enquiry you chose to send.',
          'To see which pages are visited, in aggregate. Legal basis: legitimate interest — maintaining and improving the site.',
          'To detect and stop abusive traffic such as bots, scraping and brute-force attempts. Legal basis: legitimate interest — keeping the site secure and available.'
        ]
      },
      {
        heading: 'Where the data is kept',
        body: [
          'The site and its database run on a server located in the EU. Your message, the analytics rows and the security logs are stored there and nowhere else.'
        ]
      },
      {
        heading: 'Third parties',
        body: [
          'Cloudflare Turnstile — the bot check on the contact form. When you load the form and when you send it, your IP address and browser signals are shared with Cloudflare to confirm you are not a bot. It does not track you across other websites.',
          'Resend — used to send one notification when new messages have arrived. That notification is deliberately generic: it says how many messages there are and nothing else. Your name, your email address and the contents of your message are never included in it and never leave the server this way.',
          'GitHub — used only for the site owner’s own admin login (OAuth). It has no part in anything a visitor does.'
        ]
      },
      {
        heading: 'International data transfers',
        body: [
          'The server is in the EU, so your message does not leave the EU by being stored.',
          'Cloudflare (for the bot check) and Resend (for the notification described above) may process data outside the EU/EEA, including in the United States. Where that happens, the transfer is safeguarded under the EU-US Data Privacy Framework and/or the European Commission’s Standard Contractual Clauses.'
        ]
      },
      {
        heading: 'Cookies',
        body: [
          'This site sets no cookies for ordinary visitors. There is no cookie banner because there is nothing to consent to.',
          'A session cookie is created only if someone attempts to log in to the admin area, which is the site owner alone.',
          'Cloudflare Turnstile may set its own technical identifier on the page carrying the contact form. It is used to tell a person from a bot and is not a tracking cookie.'
        ]
      },
      {
        heading: 'How long it is kept',
        body: [
          'Contact messages are deleted automatically six months after they are sent. This is not a policy someone has to remember — it is a scheduled job that runs once a day.',
          'Page-view rows are deleted automatically after 12 months.',
          'Security logs are deleted automatically after 30 days.',
          'You can ask for your data to be deleted sooner at any time, using the address at the bottom of this page.'
        ]
      },
      {
        heading: 'How your data is protected',
        body: [
          'All traffic to this site is encrypted with HTTPS. Admin access uses GitHub OAuth, so no password for this site exists anywhere to be stolen. The database role the site runs as is restricted to only what the site needs. Rate limits are in place on every public route, with automated alerts when they are hit repeatedly.',
          'No measure is perfect, but the amount of data held here is deliberately small — the less that is kept, the less there is to lose.'
        ]
      },
      {
        heading: 'Your rights',
        body: [
          'Right of access — you can ask what personal data is held about you.',
          'Right to rectification — you can ask for inaccurate or incomplete data to be corrected.',
          'Right to erasure — you can ask for your data to be deleted.',
          'Right to restrict processing — you can ask for processing to be limited while a dispute about it is resolved.',
          'Right to object — you can object to processing based on legitimate interest.',
          'Right to data portability — you can ask to receive the data you provided in a machine-readable format.',
          'To exercise any of these, write to the address below.',
          'You also have the right to lodge a complaint with the Office of the Data Protection Ombudsman (tietosuoja.fi) if you believe your data has been handled unlawfully.'
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
    updated: 'Päivitetty viimeksi: 17.9.2026',
    intro: 'Tämä sivu kertoo, mitä henkilötietoja tämä verkkosivusto (baumgertner.fi) kerää, miksi, ja mitä oikeuksia sinulla on. Rekisterinpitäjä on Anthony Baumgertner, yksityishenkilö, joka ylläpitää sivustoa henkilökohtaisena portfoliona.',
    sections: [
      {
        heading: 'Mitä tietoja kerätään',
        body: [
          'Yhteydenottolomake: nimesi, sähköpostiosoitteesi ja viestisi. Lomake kysyy ennen viestiä neljä kysymystä, ja vastauksesi niihin — mistä palveluista olet kiinnostunut, missä vaiheessa projektisi on, kuinka laaja se on ja nykyisen sivustosi osoite, jos annoit sellaisen — tallennetaan osana tuota viestiä.',
          'Perustason sivukäyntitilastot: käyttämäsi sivu ja selaimesi user-agent-tunniste. Tämä on ensimmäisen osapuolen tilastointia, ei käytä evästeitä eikä seurantatunnistetta, ei tallenna IP-osoitetta eikä sitä yhdistetä nimeesi tai sähköpostiisi.',
          'Turvalokit: jos laukaiset jonkin pyyntörajoituksista — esimerkiksi lähettämällä poikkeuksellisen suuren määrän pyyntöjä — IP-osoitteesi ja pyydetty reitti tallennetaan.',
          'Muuta ei kerätä. Sivustolla ei ole mainontaa, profilointia eikä kolmannen osapuolen analytiikkaa.'
        ]
      },
      {
        heading: 'Miksi tietoja käsitellään, ja millä oikeusperusteella',
        body: [
          'Yhteydenottolomakkeen kautta lähetettyjen viestien lukemiseksi ja niihin vastaamiseksi. Oikeusperuste: oikeutettu etu — vastaaminen yhteydenottoon, jonka olet itse päättänyt lähettää.',
          'Sen näkemiseksi, millä sivuilla käydään, koostetasolla. Oikeusperuste: oikeutettu etu — sivuston ylläpito ja kehittäminen.',
          'Häiriöliikenteen, kuten bottien, sisällön kaapimisen ja murtautumisyritysten, havaitsemiseksi ja estämiseksi. Oikeusperuste: oikeutettu etu — sivuston tietoturva ja saatavuus.'
        ]
      },
      {
        heading: 'Missä tiedot säilytetään',
        body: [
          'Sivusto ja sen tietokanta toimivat EU:ssa sijaitsevalla palvelimella. Viestisi, tilastorivit ja turvalokit säilytetään siellä eikä missään muualla.'
        ]
      },
      {
        heading: 'Kolmannet osapuolet',
        body: [
          'Cloudflare Turnstile — yhteydenottolomakkeen bottitarkistus. Kun lataat lomakkeen ja kun lähetät sen, IP-osoitteesi ja selaimen tiedot välitetään Cloudflarelle sen varmistamiseksi, ettet ole botti. Se ei seuraa sinua muilla verkkosivustoilla.',
          'Resend — käytetään yhden ilmoituksen lähettämiseen, kun uusia viestejä on saapunut. Ilmoitus on tarkoituksella yleisluontoinen: se kertoo viestien määrän eikä mitään muuta. Nimesi, sähköpostiosoitteesi ja viestisi sisältö eivät koskaan sisälly siihen eivätkä poistu palvelimelta tätä kautta.',
          'GitHub — käytetään ainoastaan sivuston ylläpitäjän omaan hallintakirjautumiseen (OAuth). Sillä ei ole osuutta mihinkään, mitä kävijä tekee.'
        ]
      },
      {
        heading: 'Kansainväliset tiedonsiirrot',
        body: [
          'Palvelin sijaitsee EU:ssa, joten viestisi ei poistu EU:sta sen säilyttämisen vuoksi.',
          'Cloudflare (bottitarkistus) ja Resend (edellä kuvattu ilmoitus) voivat käsitellä tietoja EU:n ja ETA:n ulkopuolella, myös Yhdysvalloissa. Näissä tapauksissa siirto perustuu EU:n ja Yhdysvaltojen väliseen tietosuojakehykseen (Data Privacy Framework) ja/tai Euroopan komission vakiosopimuslausekkeisiin.'
        ]
      },
      {
        heading: 'Evästeet',
        body: [
          'Sivusto ei aseta evästeitä tavallisille kävijöille. Evästebanneria ei ole, koska mihinkään ei tarvitse suostua.',
          'Istuntoeväste luodaan ainoastaan, jos joku yrittää kirjautua hallintapaneeliin, eli sivuston ylläpitäjä.',
          'Cloudflare Turnstile voi asettaa oman teknisen tunnisteensa sivulle, jolla yhteydenottolomake on. Sitä käytetään ihmisen erottamiseen botista, eikä se ole seurantaeväste.'
        ]
      },
      {
        heading: 'Kuinka kauan tietoja säilytetään',
        body: [
          'Yhteydenottoviestit poistetaan automaattisesti kuuden kuukauden kuluttua lähettämisestä. Tämä ei ole käytäntö, joka jonkun pitää muistaa — se on ajastettu tehtävä, joka ajetaan kerran vuorokaudessa.',
          'Sivukäyntirivit poistetaan automaattisesti 12 kuukauden kuluttua.',
          'Turvalokit poistetaan automaattisesti 30 päivän kuluttua.',
          'Voit milloin tahansa pyytää tietojesi poistamista aikaisemmin tämän sivun lopussa olevaan osoitteeseen.'
        ]
      },
      {
        heading: 'Miten tietosi suojataan',
        body: [
          'Kaikki liikenne sivustolle on salattu HTTPS-yhteydellä. Hallintakirjautuminen käyttää GitHub OAuthia, joten tälle sivustolle ei ole olemassa salasanaa, joka voitaisiin varastaa. Tietokantarooli, jolla sivusto toimii, on rajattu vain siihen, mitä sivusto tarvitsee. Jokaisella julkisella reitillä on pyyntörajoitus ja automaattinen hälytys, jos niihin törmätään toistuvasti.',
          'Mikään suojaus ei ole täydellinen, mutta tänne kertyvän tiedon määrä on tarkoituksella pieni — mitä vähemmän säilytetään, sitä vähemmän on menetettävää.'
        ]
      },
      {
        heading: 'Oikeutesi',
        body: [
          'Tarkastusoikeus — voit kysyä, mitä henkilötietoja sinusta on tallennettu.',
          'Oikeus tietojen oikaisemiseen — voit pyytää virheellisten tai puutteellisten tietojen korjaamista.',
          'Oikeus tietojen poistamiseen — voit pyytää tietojesi poistamista.',
          'Oikeus käsittelyn rajoittamiseen — voit pyytää käsittelyn rajoittamista siksi ajaksi, kun sitä koskevaa erimielisyyttä selvitetään.',
          'Vastustamisoikeus — voit vastustaa oikeutettuun etuun perustuvaa käsittelyä.',
          'Oikeus siirtää tiedot järjestelmästä toiseen — voit pyytää antamasi tiedot koneluettavassa muodossa.',
          'Näiden käyttämiseksi kirjoita alla olevaan osoitteeseen.',
          'Sinulla on myös oikeus tehdä valitus tietosuojavaltuutetun toimistolle (tietosuoja.fi), jos katsot, että tietojasi on käsitelty lainvastaisesti.'
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
  var langCtx = useLang();
  var lang = langCtx.lang;
  var c = content[lang] || content.en;

  usePageMeta(
    'Privacy Policy | Anthony Baumgertner',
    'What personal data baumgertner.fi collects, why, how long it is kept and what rights you have.'
  );

  return (
    <div className="privacy-page">
      <div className="privacy-content">
        <Link to={'/' + lang} className="privacy-back">&larr; {c.back}</Link>
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
