import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { useZoomed } from '../hooks/useZoomed';

afterEach(() => {
  cleanup();
  delete window.visualViewport;
});

function Koe() {
  return <span data-testid="t">{useZoomed() ? 'zoomattu' : 'ei'}</span>;
}

/** A fake visualViewport whose scale can be changed from a test. */
function asenna(scale) {
  const kuulijat = new Set();
  const vv = {
    scale,
    addEventListener: (_, cb) => kuulijat.add(cb),
    removeEventListener: (_, cb) => kuulijat.delete(cb),
  };
  Object.defineProperty(window, 'visualViewport', {
    value: vv, configurable: true, writable: true,
  });
  return (uusi) => act(() => { vv.scale = uusi; kuulijat.forEach((cb) => cb()); });
}

/**
 * Pinch zoom is invisible to media queries and to window resize - the
 * layout viewport does not move - so this hook is the only thing that
 * knows, and two things stand down on its word: the services carousel
 * stops advancing itself, and the four stacked backdrop filters at the
 * bottom of the page unmount.
 *
 * Both of those are silent when they break. A carousel that keeps
 * advancing under a magnified reader just feels bad, and a blur stack
 * that never stands down costs nothing visible until a phone runs out of
 * memory, so the behaviour is pinned here rather than left to be noticed.
 */
describe('useZoomed', () => {
  it('reports no zoom when the browser has no visualViewport', () => {
    const { getByTestId } = render(<Koe />);
    expect(getByTestId('t').textContent).toBe('ei');
  });

  it('treats scale 1 as not zoomed', () => {
    asenna(1);
    const { getByTestId } = render(<Koe />);
    expect(getByTestId('t').textContent).toBe('ei');
  });

  // The scale is a float and settles a hair off exactly one, which
  // without a margin would read as permanently zoomed - and would leave
  // the carousel frozen for everyone.
  it('ignores float noise just above 1', () => {
    asenna(1.02);
    const { getByTestId } = render(<Koe />);
    expect(getByTestId('t').textContent).toBe('ei');
  });

  it('reports zoom once the reader has actually pinched in', () => {
    asenna(2);
    const { getByTestId } = render(<Koe />);
    expect(getByTestId('t').textContent).toBe('zoomattu');
  });

  it('follows the scale back down when the pinch is released', () => {
    const aseta = asenna(1);
    const { getByTestId } = render(<Koe />);
    expect(getByTestId('t').textContent).toBe('ei');
    aseta(3);
    expect(getByTestId('t').textContent).toBe('zoomattu');
    aseta(1);
    expect(getByTestId('t').textContent).toBe('ei');
  });
});
