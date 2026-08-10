import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';

var content = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 10 August 2026',
    intro: 'These terms apply to your use of this website (baumgertner.fi), run by Anthony Baumgertner as a personal portfolio. By using this site, you agree to the terms below. For how your personal data is handled, see the Privacy Policy.',
    sections: [
      {
        heading: 'Testimonial submissions',
        body: [
          'When you submit a testimonial through this site, you confirm it reflects your own genuine opinion and that you have the right to share it.',
          'Submitted testimonials are reviewed by the site owner before publication and may be edited for length, spelling, or formatting.',
          'By submitting a testimonial, you grant Anthony Baumgertner a non-exclusive, royalty-free right to display your submitted name, role, company, message, rating, and optional photo on this website and in related portfolio materials, until you request removal.'
        ]
      },
      {
        heading: 'Acceptable use',
        body: [
          'You agree not to submit content through the contact form or testimonial form that is illegal, abusive, spam, or infringes on someone else\'s rights.',
          'Automated or bulk submissions to these forms are not permitted.'
        ]
      },
      {
        heading: 'Intellectual property',
        body: [
          'The design, code, and original content of this site belong to Anthony Baumgertner unless otherwise noted. Testimonial authors retain ownership of their own words, subject to the license granted above.'
        ]
      },
      {
        heading: 'Disclaimer and liability',
        body: [
          'This site is provided "as is", without guarantees of uninterrupted availability or error-free content.',
          'To the extent permitted by law, Anthony Baumgertner is not liable for damages arising from your use of this site. This does not affect your mandatory rights as a consumer under Finnish law.'
        ]
      },
      {
        heading: 'Changes to these terms',
        body: [
          'These terms may be updated from time to time. The "last updated" date above reflects the most recent change.'
        ]
      },
      {
        heading: 'Governing law',
        body: [
          'These terms are governed by the laws of Finland.'
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
    title: 'Käyttöehdot',
    updated: 'Päivitetty viimeksi: 10.8.2026',
    intro: 'Nämä ehdot koskevat tämän verkkosivuston (baumgertner.fi) käyttöä, jota ylläpitää Anthony Baumgertner henkilökohtaisena portfoliona. Käyttämällä sivustoa hyväksyt alla olevat ehdot. Henkilötietojesi käsittelystä kerrotaan tietosuojaselosteessa.',
    sections: [
      {
        heading: 'Suosittelujen lähettäminen',
        body: [
          'Kun lähetät suosittelun tämän sivuston kautta, vahvistat että se on oma aito mielipiteesi ja että sinulla on oikeus jakaa se.',
          'Lähetetyt suosittelut tarkistetaan ylläpitäjän toimesta ennen julkaisua, ja niitä voidaan muokata pituuden, oikeinkirjoituksen tai muotoilun osalta.',
          'Lähettämällä suosittelun myönnät Anthony Baumgertnerille ei-yksinoikeudellisen, rojaltivapaan oikeuden näyttää antamaasi nimeä, roolia, yritystä, viestiä, arvosanaa ja valinnaista kuvaa tällä sivustolla ja siihen liittyvissä portfolio-materiaaleissa, kunnes pyydät sen poistamista.'
        ]
      },
      {
        heading: 'Hyväksyttävä käyttö',
        body: [
          'Sitoudut olemaan lähettämättä yhteydenottolomakkeen tai suositteluformin kautta sisältöä joka on laitonta, loukkaavaa, roskapostia, tai loukkaa jonkun muun oikeuksia.',
          'Automatisoidut tai massalähetykset näihin lomakkeisiin eivät ole sallittuja.'
        ]
      },
      {
        heading: 'Immateriaalioikeudet',
        body: [
          'Tämän sivuston ulkoasu, koodi ja alkuperäinen sisältö kuuluvat Anthony Baumgertnerille, ellei toisin mainita. Suosittelujen kirjoittajat säilyttävät omistusoikeuden omiin sanoihinsa, yllä myönnetyn lisenssin puitteissa.'
        ]
      },
      {
        heading: 'Vastuuvapaus ja vastuunrajoitus',
        body: [
          'Tämä sivusto tarjotaan "sellaisenaan" ilman takuita keskeytyksettömästä saatavuudesta tai virheettömästä sisällöstä.',
          'Lain sallimissa rajoissa Anthony Baumgertner ei ole vastuussa vahingoista jotka aiheutuvat sivuston käytöstä. Tämä ei vaikuta kuluttajansuojalain mukaisiin pakottaviin oikeuksiisi.'
        ]
      },
      {
        heading: 'Muutokset näihin ehtoihin',
        body: [
          'Näitä ehtoja voidaan päivittää ajoittain. Yllä oleva "päivitetty viimeksi" -päivämäärä kertoo viimeisimmän muutoksen.'
        ]
      },
      {
        heading: 'Sovellettava laki',
        body: [
          'Näihin ehtoihin sovelletaan Suomen lakia.'
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

var TermsOfUse = function() {
  var { lang } = useLang();
  var c = content[lang] || content.en;

  usePageMeta(
    'Terms of Use | Anthony Baumgertner',
    'Terms of use for baumgertner.fi - testimonial submission rules, acceptable use, and liability.'
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

export default TermsOfUse;
