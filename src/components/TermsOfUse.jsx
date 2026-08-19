import React from 'react';
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';
import { useLang } from '../useLang';
import { usePageMeta } from '../hooks/usePageMeta';

var content = {
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 10 August 2026',
    intro: 'These terms apply to your use of this website (baumgertner.fi), run by Anthony Baumgertner as a personal portfolio. By using this site, you agree to the terms below. For how your personal data is handled, see the Privacy Policy.',
    sections: [
      {
        heading: 'Using this site',
        body: [
          'If you submit a testimonial, you confirm it\'s your genuine opinion and grant Anthony Baumgertner the right to display your submitted name, role, company, message, rating and optional photo on this site until you request removal. Submissions are reviewed before publishing. Please don\'t submit illegal, abusive, spam, or automated/bulk content through the contact or testimonial forms.',
          'The site\'s design and code belong to Anthony Baumgertner; testimonial authors retain ownership of their own words.'
        ]
      },
      {
        heading: 'Liability',
        body: [
          'This site is provided "as is", without guarantees of uninterrupted availability or error-free content. To the extent permitted by law, Anthony Baumgertner is not liable for damages arising from your use of this site — this does not affect your mandatory rights as a consumer under Finnish law.'
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
    updated: 'Päivitetty viimeksi: 10.8.2026',
    intro: 'Nämä ehdot koskevat tämän verkkosivuston (baumgertner.fi) käyttöä, jota ylläpitää Anthony Baumgertner henkilökohtaisena portfoliona. Käyttämällä sivustoa hyväksyt alla olevat ehdot. Henkilötietojesi käsittelystä kerrotaan tietosuojaselosteessa.',
    sections: [
      {
        heading: 'Sivuston käyttö',
        body: [
          'Jos lähetät suosittelun, vahvistat että se on aito mielipiteesi ja myönnät Anthony Baumgertnerille oikeuden näyttää antamaasi nimeä, roolia, yritystä, viestiä, arvosanaa ja valinnaista kuvaa tällä sivustolla, kunnes pyydät sen poistamista. Suosittelut tarkistetaan ennen julkaisua. Älä lähetä yhteydenotto- tai suositteluformin kautta laitonta, loukkaavaa, roskapostia tai automatisoitua/massasisältöä.',
          'Sivuston ulkoasu ja koodi kuuluvat Anthony Baumgertnerille; suosittelujen kirjoittajat säilyttävät omistusoikeuden omiin sanoihinsa.'
        ]
      },
      {
        heading: 'Vastuunrajoitus',
        body: [
          'Tämä sivusto tarjotaan "sellaisenaan" ilman takuita keskeytyksettömästä saatavuudesta tai virheettömästä sisällöstä. Lain sallimissa rajoissa Anthony Baumgertner ei ole vastuussa vahingoista jotka aiheutuvat sivuston käytöstä — tämä ei vaikuta kuluttajansuojalain mukaisiin pakottaviin oikeuksiisi.'
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

  usePageMeta(
    'Terms of Use | Anthony Baumgertner',
    'Terms of use for baumgertner.fi - testimonial submission rules, acceptable use, and liability.'
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

export default TermsOfUse;
