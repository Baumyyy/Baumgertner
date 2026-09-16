import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Lightbox.css';
import { pauseScrolling, resumeScrolling } from '../smoothScroll';

var SWIPE_THRESHOLD = 48;

// One shot, at the size the window can give it.
//
// The carousel shows the work at a third of a screen, which is enough to
// tell one project from another and not enough to look at any of them.
// This is the looking. It is a separate thing rather than a bigger
// carousel because it has a different job: no timer, no neighbours in
// the margins, nothing to do but the picture.
//
// Rendered only while it is open. There is no transition to preserve
// across the closed state, so there is nothing to keep in the tree.
var Lightbox = function({ shots, index, label, onClose, onStep }) {
  var count = shots.length;
  var closeRef = useRef(null);
  var dragRef = useRef({ startX: 0, dragging: false });

  var step = useCallback(function(delta) {
    if (count < 2) return;
    onStep(((index + delta) % count + count) % count);
  }, [count, index, onStep]);

  // Escape closes, arrows step. Bound to the document rather than to the
  // panel so it works before anything inside has been focused.
  useEffect(function() {
    var onKey = function(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    };
    document.addEventListener('keydown', onKey);
    return function() { document.removeEventListener('keydown', onKey); };
  }, [onClose, step]);

  // The same lock the contact panel uses, for the same reason: this
  // covers the window, and a covered page that still scrolls has moved by
  // the time the cover comes off.
  useEffect(function() {
    var body = document.body;
    var bar = window.innerWidth - document.documentElement.clientWidth;
    body.style.setProperty('--lock-pad', bar + 'px');
    body.classList.add('scroll-locked');
    pauseScrolling();
    return function() {
      body.classList.remove('scroll-locked');
      resumeScrolling();
    };
  }, []);

  // Focus lands on the close control, so the first thing tab reaches is
  // a way out rather than the page underneath.
  useEffect(function() {
    if (closeRef.current) closeRef.current.focus();
  }, []);

  var onPointerDown = function(e) {
    if (count < 2) return;
    dragRef.current = { startX: e.clientX, dragging: true };
  };

  var onPointerUp = function(e) {
    if (!dragRef.current.dragging) return;
    var dx = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(dx) > SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
  };

  // Into the body rather than where it is written. The panel it is
  // opened from is a collapsible grid row with its overflow hidden, and
  // one transformed ancestor anywhere above it would turn this fixed
  // element into one positioned against that ancestor instead of the
  // window. A portal cannot be caught out that way.
  return createPortal(
    <div
      className="lb-root"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* A button rather than a div: clicking away from the picture is
          the most obvious way out, and it should be reachable by the
          keyboard too. */}
      <button
        type="button"
        className="lb-scrim"
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />

      <div className="lb-frame">
        <img
          className="lb-shot"
          src={shots[index]}
          alt={label + ' — ' + (index + 1) + '/' + count}
          draggable="false"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>

      <div className="lb-bar">
        {count > 1 && (
          <button type="button" className="lb-step" onClick={function() { step(-1); }} aria-label="Previous">
            <span className="lb-arrow lb-arrow-left" aria-hidden="true"></span>
          </button>
        )}

        <p className="lb-count">
          <span className="lb-count-now">{String(index + 1).padStart(2, '0')}</span>
          <span className="lb-count-sep" aria-hidden="true">/</span>
          <span className="lb-count-all">{String(count).padStart(2, '0')}</span>
        </p>

        {count > 1 && (
          <button type="button" className="lb-step" onClick={function() { step(1); }} aria-label="Next">
            <span className="lb-arrow lb-arrow-right" aria-hidden="true"></span>
          </button>
        )}
      </div>

      <button type="button" className="lb-close" onClick={onClose} ref={closeRef} aria-label="Close">
        <span className="lb-close-mark" aria-hidden="true"></span>
      </button>
    </div>,
    document.body
  );
};

export default Lightbox;
