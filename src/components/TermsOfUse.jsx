import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../useLang';
import { usePageMeta } from '../hooks/usePageMeta';

// A note for when the business side changes, because two things below
// are written for how it stands today:
//
//   1. "The scope, schedule and price of any work are always agreed
//      separately and in writing". Once prices are published on the
//      site, that sentence has to be revisited - a published price is
//      closer to an offer than a portfolio is, and the terms should
//      then say which parts are binding and which are indicative.
//
//   2. The typefaces are bundled by @fontsource and served from this
//      site's own origin, never from Google's servers - which is what
//      keeps a visitor's IP address out of a third party's logs, and
//      what CSP font-src 'self' in nginx.conf enforces. Inter, Orbitron
//      and JetBrains Mono are all SIL Open Font License.
//
//   3. The privacy policy names Anthony Baumgertner, a private
//      individual, as the data controller. When a business name is
//      registered the controller becomes that business, and its
//      registration number belongs in the policy.
var content = {
  en: {
    title: 'Terms of Use',
    metaTitle: 'Terms of Use | Anthony Baumgertner',
    metaDescription: 'Terms of use for baumgertner.fi - acceptable use, ownership and liability.',
    updated: 'Last updated: 19 September 2026',
    intro: 'These terms apply to your use of this website (baumgertner.fi), run by Anthony Baumgertner as a personal portfolio. By using this site, you agree to the terms below. For how your personal data is handled, see the Privacy Policy.',
    sections: [
      {
        heading: 'Using this site',
        body: [
          'You are welcome to read this site, and to use the contact form to get in touch about work. Please do not send illegal, abusive, automated or bulk content through it.',
          'The design, text and code of this site belong to Anthony Baumgertner — with the exception of the open-source typefaces and libraries it uses, which are covered by their own licences. Anything you write in the contact form stays yours; it is read in order to answer you and is not published anywhere.'
        ]
      },
      {
        heading: 'Content and liability',
        body: [
          'This site is a personal portfolio. Its content — the projects shown, the service descriptions and any timelines — are examples of work already done, not an offer and not a promise of what any particular project will include. The scope, schedule and price of any work are always agreed separately and in writing.',
          'The site is provided as is, and uninterrupted availability is not guaranteed. This does not limit your mandatory rights under consumer protection law.'
        ]
      },
      {
        heading: 'Governing law & contact',
        body: [
          'These terms are governed by Finnish law and may be updated from time to time. Questions: contact@baumgertner.fi'
        ]
      }
    ],
    back: 'Back to Home'
  },
  fi: {
    title: 'Käyttöehdot',
    metaTitle: 'Käyttöehdot | Anthony Baumgertner',
    metaDescription: 'Sivuston baumgertner.fi käyttöehdot – sallittu käyttö, omistusoikeus ja vastuu.',
    updated: 'Päivitetty viimeksi: 19.9.2026',
    intro: 'Nämä ehdot koskevat tämän verkkosivuston (baumgertner.fi) käyttöä, jota ylläpitää Anthony Baumgertner henkilökohtaisena portfoliona. Käyttämällä sivustoa hyväksyt alla olevat ehdot. Henkilötietojesi käsittelystä kerrotaan tietosuojaselosteessa.',
    sections: [
      {
        heading: 'Sivuston käyttö',
        body: [
          'Sivustoa saa lukea vapaasti, ja yhteydenottolomakkeella saa ottaa yhteyttä työn merkeissä. Älä lähetä sen kautta laitonta, loukkaavaa, automatisoitua tai massana tuotettua sisältöä.',
          'Sivuston ulkoasu, tekstit ja koodi kuuluvat Anthony Baumgertnerille — lukuun ottamatta käytettyjä avoimen lähdekoodin fontteja ja kirjastoja, joilla on omat lisenssinsä. Se, mitä kirjoitat yhteydenottolomakkeeseen, pysyy sinun: se luetaan, jotta sinulle voidaan vastata, eikä sitä julkaista missään.'
        ]
      },
      {
        heading: 'Sisältö ja vastuu',
        body: [
          'Tämä sivusto on henkilökohtainen portfolio. Sen sisältö — esitellyt projektit, palvelukuvaukset ja aikataulut — on esimerkkejä jo tehdystä työstä, ei tarjous eikä lupaus siitä, mitä jokin tietty projekti sisältää. Työn laajuudesta, aikataulusta ja hinnasta sovitaan aina erikseen kirjallisesti.',
          'Sivusto tarjotaan sellaisena kuin se on, eikä sen keskeytymätöntä saatavuutta taata. Tämä ei rajoita pakottavan kuluttajansuojalainsäädännön mukaisia oikeuksiasi.'
        ]
      },
      {
        heading: 'Sovellettava laki & yhteystiedot',
        body: [
          'Näihin ehtoihin sovelletaan Suomen lakia, ja niitä voidaan päivittää ajoittain. Kysymykset: contact@baumgertner.fi'
        ]
      }
    ],
    back: 'Takaisin etusivulle'
  }
};

var TermsOfUse = function() {
  var { lang } = useLang();
  var c = content[lang] || content.en;

  usePageMeta(c.metaTitle, c.metaDescription);

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

export default TermsOfUse;
