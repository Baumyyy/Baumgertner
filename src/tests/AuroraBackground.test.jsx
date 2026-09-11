import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import AuroraBackground from '../components/AuroraBackground';

// Despite the name, this component is not just a backdrop. It owns the
// page scroll container and the scroll-to-top control, and every section
// renders inside it. Removing it as "the background" would break scrolling
// site-wide, so these assertions pin down the structural contract while
// the decorative canvas is torn out.
afterEach(cleanup);

function renderBg() {
  return render(<AuroraBackground><p>section content</p></AuroraBackground>);
}

describe('AuroraBackground', function() {
  it('still provides the page scroll container', function() {
    var container = renderBg().container;
    expect(container.querySelector('.aurora-container')).not.toBeNull();
  });

  it('renders its children inside the scroll container', function() {
    var container = renderBg().container;
    var child = [...container.querySelectorAll('p')]
      .find(function(el) { return el.textContent === 'section content'; });
    expect(child).toBeTruthy();
    expect(child.closest('.aurora-container')).not.toBeNull();
  });

  it('still offers the scroll-to-top control', function() {
    var container = renderBg().container;
    var btn = container.querySelector('button[aria-label="Scroll to top"]');
    expect(btn).not.toBeNull();
  });

  it('no longer renders a particle canvas', function() {
    var container = renderBg().container;
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('keeps the backdrop out of the accessibility tree', function() {
    var container = renderBg().container;
    var layer = container.querySelector('.bg-layer');
    expect(layer).not.toBeNull();
    expect(layer.getAttribute('aria-hidden')).toBe('true');
  });
});
