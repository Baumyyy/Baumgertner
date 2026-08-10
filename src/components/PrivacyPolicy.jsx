import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';

var content = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 4 August 2026',
    intro: 'This page explains what personal data this website (baumgertner.fi) collects, why, and what rights you have. This site is run by Anthony Baumgertner as a personal portfolio.',
    sections: [
      {
        heading: 'What data is collected',
        body: [
          'Contact form: name, email address and message, when you submit the contact form.',
          'Testimonials: name, role, company, message, rating and an optional profile photo, when you submit a testimonial. Submitted testimonials are reviewed before being published publicly on the site.',
          'Basic page-view analytics: the page you visited, the referring page, and your browser’s user-agent string. This is first-party, does not use cookies or a tracking identifier, and is not linked to your name or email.'
        ]
      },
      {
        heading: 'Why this data is processed',
        body: [
          'To respond to messages sent through the contact form.',
          'To review and, if approved, publish testimonials.',
          'To understand overall site traffic (which pages are visited) in aggregate.'
        ]
      },
      {
        heading: 'Third parties',
        body: [
          'Resend — used to deliver email notifications when a contact message or testimonial is submitted.',
          'A PostgreSQL database host — used to store the data listed above.',
          'GitHub — used only for the site owner’s own admin login (OAuth), not for visitor tracking.'
        ]
      },
      {
        heading: 'Cookies',
        body: [
          'This site does not set any cookies for regular visitors. A session cookie is only created if someone attempts to log in to the admin area.'
        ]
      },
      {
        heading: 'Data retention',
        body: [
          'Messages and testimonials are kept until deleted by the site owner. You can request deletion at any time (see contact details below).',
          'Pageview analytics rows are automatically deleted after 12 months.'
        ]
      },
      {
        heading: 'Your rights',
        body: [
          'Under GDPR you have the right to access, correct or request deletion of your personal data. To exercise any of these rights, contact the email address below.'
        ]
      },
      {
        heading: 'Contact',
        body: [
          'baumgertnerr@outlook.com'
        ]
      }
    ],
    back: 'Back to Home'
  },
  fi: {
    title: 'Tietosuojaseloste',
    updated: 'Päivitetty viimeksi: 4.8.2026',
    intro: 'Tämä sivu kertoo, mitä henkilötietoja tämä verkkosivusto (baumgertner.fi) kerää, miksi, ja mitä oikeuksia sinulla on. Sivustoa ylläpitää Anthony Baumgertner henkilökohtaisena portfoliona.',
    sections: [
      {
        heading: 'Mitä tietoja kerätään',
        body: [
          'Yhteydenottolomake: nimi, sähköpostiosoite ja viesti, kun lähetät yhteydenottolomakkeen.',
          'Suosittelut: nimi, rooli, yritys, viesti, arvosana ja valinnainen profiilikuva, kun lähetät suosittelun. Lähetetyt suosittelut tarkistetaan ennen kuin ne mahdollisesti julkaistaan sivustolla.',
          'Perustason sivukäyntitilastot: käytetty sivu, mistä tulit sivulle (referrer) ja selaimesi user-agent-tunniste. Tämä on ensimmäisen osapuolen tilastointia, ei käytä evästeitä tai seurantatunnistetta, eikä sitä yhdistetä nimeesi tai sähköpostiisi.'
        ]
      },
      {
        heading: 'Miksi tietoja käsitellään',
        body: [
          'Vastataksemme yhteydenottolomakkeen kautta lähetettyihin viesteihin.',
          'Tarkistaaksemme ja hyväksytyt suosittelut julkaistaksemme.',
          'Ymmärtääksemme sivuston kokonaiskävijämäärää (mitä sivuja käytetään) koostetusti.'
        ]
      },
      {
        heading: 'Kolmannet osapuolet',
        body: [
          'Resend — käytetään sähköposti-ilmoitusten lähettämiseen kun yhteydenotto tai suosittelu lähetetään.',
          'PostgreSQL-tietokannan hosting-palveluntarjoaja — käytetään yllä lueteltujen tietojen tallentamiseen.',
          'GitHub — käytetään vain sivuston ylläpitäjän omaan admin-kirjautumiseen (OAuth), ei kävijöiden seurantaan.'
        ]
      },
      {
        heading: 'Evästeet',
        body: [
          'Tämä sivusto ei aseta evästeitä tavallisille kävijöille. Sessioeväste luodaan vain, jos joku yrittää kirjautua admin-paneeliin.'
        ]
      },
      {
        heading: 'Tietojen säilytys',
        body: [
          'Viestit ja suosittelut säilytetään kunnes ylläpitäjä poistaa ne. Voit pyytää tietojesi poistoa milloin tahansa (yhteystiedot alla).',
          'Sivukäyntitilastojen rivit poistetaan automaattisesti 12 kuukauden jälkeen.'
        ]
      },
      {
        heading: 'Oikeutesi',
        body: [
          'GDPR:n mukaan sinulla on oikeus tarkastaa, oikaista tai pyytää poistamaan henkilötietosi. Käyttääksesi näitä oikeuksia, ota yhteyttä alla olevaan sähköpostiosoitteeseen.'
        ]
      },
      {
        heading: 'Yhteystiedot',
        body: [
          'baumgertnerr@outlook.com'
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
