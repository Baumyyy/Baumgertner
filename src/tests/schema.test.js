import { describe, it, expect } from 'vitest';
import { rakennaSkeema, skeemaTagiksi } from '../../scripts/schema.js';
import en from '../lang/en.js';
import fi from '../lang/fi.js';

/**
 * The structured data is generated from src/lang, which is what keeps it
 * honest - but it also means a rename in the language file empties the
 * schema without anything failing. These tests are that alarm.
 */

var KOTI_EN = { polku: '/en', kieli: 'en', vastine: '/fi' };
var KOTI_FI = { polku: '/fi', kieli: 'fi', vastine: '/en' };
var LAKI = { polku: '/en/privacy', kieli: 'en', vastine: '/fi/privacy' };
var META = { title: 'Otsikko', kuvaus: 'Kuvaus' };

function poimi(skeema, tyyppi) {
  return skeema['@graph'].find(function (n) { return n['@type'] === tyyppi; });
}

describe('rakennaSkeema', function () {
  it('tarjoaa kuusi palvelua etusivulla', function () {
    var henkilo = poimi(rakennaSkeema(KOTI_EN, META), 'Person');
    expect(henkilo.makesOffer).toHaveLength(6);
  });

  it('lukee palvelujen nimet kielitiedostosta eika toista niita', function () {
    var henkilo = poimi(rakennaSkeema(KOTI_EN, META), 'Person');
    var nimet = henkilo.makesOffer.map(function (t) { return t.itemOffered.name; });
    expect(nimet).toEqual([
      en.services_1_title, en.services_2_title, en.services_3_title,
      en.services_4_title, en.services_5_title, en.services_6_title
    ]);
  });

  it('kaantyy suomeksi', function () {
    var henkilo = poimi(rakennaSkeema(KOTI_FI, META), 'Person');
    var nimet = henkilo.makesOffer.map(function (t) { return t.itemOffered.name; });
    expect(nimet[0]).toBe(fi.services_1_title);
    expect(nimet[0]).not.toBe(en.services_1_title);
  });

  it('nimeaa Turun palvelualueeksi', function () {
    var henkilo = poimi(rakennaSkeema(KOTI_EN, META), 'Person');
    var alueet = henkilo.makesOffer[0].itemOffered.areaServed.map(function (a) { return a.name; });
    expect(alueet).toContain('Turku');
    expect(alueet).toContain('Finland');
  });

  // A privacy policy is not an offer of six services, and saying so in
  // structured data describes the page as something it is not.
  it('ei tarjoa palveluita lakisivulla', function () {
    var henkilo = poimi(rakennaSkeema(LAKI, META), 'Person');
    expect(henkilo.makesOffer).toBeUndefined();
  });

  it('merkitsee sivun kielen', function () {
    expect(poimi(rakennaSkeema(KOTI_FI, META), 'WebPage').inLanguage).toBe('fi');
    expect(poimi(rakennaSkeema(KOTI_EN, META), 'WebPage').inLanguage).toBe('en');
  });

  it('ei julista yritysta ennen toiminimea', function () {
    var tyypit = rakennaSkeema(KOTI_EN, META)['@graph'].map(function (n) { return n['@type']; });
    expect(tyypit).not.toContain('ProfessionalService');
    expect(tyypit).not.toContain('LocalBusiness');
    expect(tyypit).toContain('Person');
  });
});

describe('skeemaTagiksi', function () {
  it('tuottaa jasentyvan lohkon', function () {
    var tagi = skeemaTagiksi(rakennaSkeema(KOTI_EN, META));
    var json = tagi.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    expect(function () { JSON.parse(json); }).not.toThrow();
  });

  // An unescaped </script> inside a JSON string closes the tag early and
  // spills the rest of the graph into the page as text.
  it('pakenee kulmasulun niin ettei tagi katkea kesken', function () {
    var tagi = skeemaTagiksi({ '@context': 'https://schema.org', x: '</script><b>' });
    expect(tagi.indexOf('</script><b>')).toBe(-1);
    expect(tagi.match(/<\/script>/g)).toHaveLength(1);
  });
});
