import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// index.css shipped as the Vite starter template for a long time, which is
// why Vite's purple was the default link colour on a site that has never
// had a purple in its palette. These assertions keep it from creeping back.
var here = dirname(fileURLToPath(import.meta.url));
var raw = readFileSync(resolve(here, '../index.css'), 'utf8');

// Strip comments before asserting. These rules are about what the
// stylesheet *declares*; prose explaining why a colour or selector was
// removed should not be able to fail the check that removed it.
var css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

describe('base stylesheet', function() {
  it('contains no Vite template leftovers', function() {
    expect(css).not.toMatch(/646cff/i);
    expect(css).not.toMatch(/535bf2/i);
    expect(css).not.toMatch(/-webkit-focus-ring-color/);
  });

  it('declares no raw hex colours - tokens only', function() {
    expect(css.match(/#[0-9a-f]{3,8}\b/gi) || []).toEqual([]);
  });

  it('defines a visible focus ring built on the signal token', function() {
    expect(css).toMatch(/:focus-visible/);
    expect(css).toMatch(/--signal/);
  });

  it('scopes the focus ring to :focus-visible only', function() {
    // A bare :focus rule here previously left a ring stuck on buttons
    // after a mouse click. Match ":focus" only when not followed by
    // "-visible" or "-within".
    expect(css).not.toMatch(/:focus(?!-visible|-within)/);
  });
});
