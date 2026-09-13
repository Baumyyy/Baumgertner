import { describe, it, expect } from 'vitest';

describe('Language Files', function() {
  it('should have all EN keys', async function() {
    var en = (await import('../lang/en')).default;
    expect(en.nav_projects).toBe('Projects');
    expect(en.nav_contact).toBe('Contact');
    expect(en.hero_claim1).toBeDefined();
    expect(en.hero_lede).toBeDefined();
    expect(en.contact_send).toBeDefined();
  });

  it('should have all FI keys', async function() {
    var fi = (await import('../lang/fi')).default;
    expect(fi.nav_projects).toBe('Projektit');
    expect(fi.nav_contact).toBe('Yhteystiedot');
    expect(fi.hero_claim1).toBeDefined();
    expect(fi.hero_lede).toBeDefined();
    expect(fi.contact_send).toBeDefined();
  });

  it('should have same keys in both languages', async function() {
    var en = (await import('../lang/en')).default;
    var fi = (await import('../lang/fi')).default;
    var enKeys = Object.keys(en).sort();
    var fiKeys = Object.keys(fi).sort();
    expect(enKeys).toEqual(fiKeys);
  });
});

describe('API module', function() {
  it('still exposes the one call the site actually makes', async function() {
    var api = (await import('../api')).api;
    expect(typeof api.sendMessage).toBe('function');
  });

  // getAvailability went with the footer's status line. The assertion is
  // here rather than deleted so that putting the call back without the
  // thing that displays it fails loudly.
  it('no longer carries the availability call', async function() {
    var api = (await import('../api')).api;
    expect(api.getAvailability).toBeUndefined();
  });
});