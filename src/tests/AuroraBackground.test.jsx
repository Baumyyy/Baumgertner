import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuroraBackground from '../components/AuroraBackground';
import { LanguageProvider } from '../LanguageContext';
import { ContactPanelProvider } from '../ContactPanelProvider';

// Despite the name, this component is not just a backdrop. It owns the
// page scroll container and the sticky call to action, and every section
// renders inside it. Removing it as "the background" would break scrolling
// site-wide, so these assertions pin down the structural contract while
// the decorative canvas is torn out.
//
// It now reads copy and the panel opener from context, so it has to be
// rendered inside both providers - and LanguageProvider reads the route,
// which is why the router is here too.
afterEach(cleanup);

function renderBg() {
  return render(
    <MemoryRouter initialEntries={['/en']}>
      <LanguageProvider>
        <ContactPanelProvider>
          <AuroraBackground><p>section content</p></AuroraBackground>
        </ContactPanelProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
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

  it('offers the sticky call to action instead of a scroll-to-top button', function() {
    var container = renderBg().container;
    expect(container.querySelector('.sticky-cta')).not.toBeNull();
    expect(container.querySelector('.scroll-top-btn')).toBeNull();
  });

  it('keeps the call to action out of reach until the page has scrolled', function() {
    var container = renderBg().container;
    // No scroll has happened, so it must not be clickable yet - the
    // "visible" class is what turns pointer-events back on.
    expect(container.querySelector('.sticky-cta').classList.contains('visible')).toBe(false);
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
