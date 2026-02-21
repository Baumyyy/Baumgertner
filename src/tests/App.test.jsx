import { describe, it, expect } from 'vitest';

describe('Language Files', function() {
  it('should have all EN keys', async function() {
    var en = (await import('../lang/en')).default;
    expect(en.nav_home).toBe('Home');
    expect(en.nav_projects).toBe('Projects');
    expect(en.hero_greeting).toBeDefined();
    expect(en.contact_send).toBeDefined();
  });

  it('should have all FI keys', async function() {
    var fi = (await import('../lang/fi')).default;
    expect(fi.nav_home).toBe('Etusivu');
    expect(fi.nav_projects).toBe('Projektit');
    expect(fi.hero_greeting).toBeDefined();
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
  it('should export all functions', async function() {
    var api = (await import('../api')).api;
    expect(typeof api.getProfile).toBe('function');
    expect(typeof api.getProjects).toBe('function');
    expect(typeof api.getAvailability).toBe('function');
    expect(typeof api.sendMessage).toBe('function');
  });
});