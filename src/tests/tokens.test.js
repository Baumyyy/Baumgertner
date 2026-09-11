import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// The contrast table in the design spec is a contract. This file turns it
// into something the test runner enforces, so a later tweak to a colour
// can't quietly drop text below the legibility floor.
var here = dirname(fileURLToPath(import.meta.url));
var css = readFileSync(resolve(here, '../styles/tokens.css'), 'utf8');

function token(name) {
  var m = css.match(new RegExp('--' + name + '\\s*:\\s*([^;]+);'));
  if (!m) throw new Error('token --' + name + ' not found in tokens.css');
  return m[1].trim();
}

function lin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  var n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

function contrast(a, b) {
  var l1 = luminance(a);
  var l2 = luminance(b);
  var hi = l1 > l2 ? l1 : l2;
  var lo = l1 > l2 ? l2 : l1;
  return (hi + 0.05) / (lo + 0.05);
}

describe('design tokens', function() {
  it('defines the full palette', function() {
    var names = [
      'canvas', 'surface-1', 'surface-2', 'line', 'line-strong',
      'text-primary', 'text-secondary', 'text-muted', 'text-faint',
      'signal', 'signal-text', 'signal-on'
    ];
    names.forEach(function(name) {
      expect(function() { token(name); }, '--' + name).not.toThrow();
    });
  });

  it('body-capable text colours meet WCAG AA on the canvas', function() {
    var canvas = token('canvas');
    ['text-primary', 'text-secondary', 'text-muted'].forEach(function(name) {
      expect(contrast(token(name), canvas), '--' + name).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('signal-text has real headroom as text, unlike signal', function() {
    var canvas = token('canvas');
    expect(contrast(token('signal'), canvas)).toBeGreaterThanOrEqual(3);
    expect(contrast(token('signal-text'), canvas)).toBeGreaterThanOrEqual(6);
  });

  it('text on a signal fill meets AA', function() {
    expect(contrast(token('signal-on'), token('signal'))).toBeGreaterThanOrEqual(4.5);
  });

  it('text-faint is restricted to large text and UI only', function() {
    var r = contrast(token('text-faint'), token('canvas'));
    expect(r).toBeGreaterThanOrEqual(3);
    expect(r).toBeLessThan(4.5);
  });

  it('glow never exceeds the 8% ceiling', function() {
    var alphas = [];
    var re = /--glow[a-z-]*:\s*[^;]*?([0-9.]+)\s*\)/g;
    var m;
    while ((m = re.exec(css)) !== null) alphas.push(parseFloat(m[1]));
    expect(alphas.length).toBeGreaterThan(0);
    alphas.forEach(function(a) { expect(a).toBeLessThanOrEqual(0.08); });
  });
});
