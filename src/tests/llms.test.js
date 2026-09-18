import { describe, it, expect } from 'vitest';
import { rakennaLlmsTxt } from '../../scripts/llms.js';
import en from '../lang/en.js';
import fi from '../lang/fi.js';

/**
 * The llmstxt.org shape: one H1, an optional blockquote summary, prose,
 * then H2 sections. An agentic-browsing audit reads it and reports when it
 * does not parse - which is how the missing file was spotted in the first
 * place, except then the server was answering with the site's HTML.
 */
describe('llms.txt', function () {
  var teksti = rakennaLlmsTxt();

  it('starts with exactly one H1', function () {
    var h1 = teksti.split('\n').filter(function (r) { return /^# /.test(r); });
    expect(h1).toHaveLength(1);
    expect(teksti.split('\n')[0]).toBe('# Baumgertner');
  });

  it('carries a blockquote summary directly after the title', function () {
    var rivit = teksti.split('\n');
    expect(rivit[1]).toBe('');
    expect(rivit[2].indexOf('>')).toBe(0);
  });

  it('has H2 sections', function () {
    var h2 = teksti.split('\n').filter(function (r) { return /^## /.test(r); });
    expect(h2.length).toBeGreaterThanOrEqual(4);
  });

  it('is not HTML', function () {
    // The exact failure the audit reported: /llms.txt answered 200 with the
    // React shell, because nothing existed at that path and the server fell
    // back to index.html.
    expect(teksti).not.toContain('<!doctype');
    expect(teksti).not.toContain('<html');
  });

  it('lists every service in both languages, read from src/lang', function () {
    for (var i = 1; i <= 6; i++) {
      expect(teksti).toContain(en['services_' + i + '_title']);
      expect(teksti).toContain(fi['services_' + i + '_title']);
    }
  });

  it('points at absolute addresses', function () {
    // A model reading this file has no base URL to resolve against.
    var linkit = teksti.match(/\]\(([^)]+)\)/g) || [];
    expect(linkit.length).toBeGreaterThan(4);
    linkit.forEach(function (linkki) {
      expect(linkki).toContain('https://baumgertner.fi');
    });
  });

  // The file states these as fact, and they are the two the site would most
  // embarrassingly be wrong about.
  it('does not claim to be a company or to publish prices', function () {
    expect(teksti).toContain('not a registered company');
    expect(teksti).toContain('no pricing is published');
  });
});
