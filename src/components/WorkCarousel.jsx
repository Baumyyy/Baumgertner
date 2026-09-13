import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mark } from './BrandMark';

var AUTO_MS = 5000;
var DRAG_THRESHOLD = 48;

// The shots for one project, looping in both directions.
//
// A clone of the last shot sits before the first and a clone of the first
// sits after the last, so moving past either end is an ordinary animated
// step onto a clone. Once that animation finishes the track jumps to the
// real slide with the transition switched off, which is invisible because
// the two are identical. Without the clones, wrapping means sliding the
// whole strip back across every shot at once.
//
// Only runs while its panel is open: a timer in a closed row would be
// animating something nobody can see.
var WorkCarousel = function({ shots, active, label }) {
  var count = shots.length;

  // DOM positions: 0 is the clone of the last, 1..count the real shots,
  // count+1 the clone of the first.
  var posState = useState(1);
  var pos = posState[0];
  var setPos = posState[1];
  var animateState = useState(true);
  var animate = animateState[0];
  var setAnimate = animateState[1];
  var pausedState = useState(false);
  var paused = pausedState[0];
  var setPaused = pausedState[1];
  var dragRef = useRef({ startX: 0, dragging: false });

  var step = useCallback(function(delta) {
    if (count < 2) return;
    setAnimate(true);
    setPos(function(p) { return p + delta; });
  }, [count, setPos, setAnimate]);

  // Reset when the panel closes, so reopening starts from the first shot.
  useEffect(function() {
    if (!active) {
      setAnimate(false);
      setPos(1);
    }
  }, [active, setPos, setAnimate]);

  useEffect(function() {
    if (!active || paused || count < 2) return;
    var reduce = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var id = setInterval(function() { step(1); }, AUTO_MS);
    return function() { clearInterval(id); };
  }, [active, paused, count, step]);

  // The silent part of the loop: land on a clone, then swap to its real
  // twin with animation off. Same pixels, so nothing is visible.
  var onTransitionEnd = function() {
    if (pos === count + 1) {
      setAnimate(false);
      setPos(1);
    } else if (pos === 0) {
      setAnimate(false);
      setPos(count);
    }
  };

  var onPointerDown = function(e) {
    if (count < 2) return;
    dragRef.current = { startX: e.clientX, dragging: true };
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  var onPointerUp = function(e) {
    if (!dragRef.current.dragging) return;
    var dx = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    if (Math.abs(dx) > DRAG_THRESHOLD) step(dx < 0 ? 1 : -1);
    setPaused(false);
  };

  if (count === 0) {
    return (
      <div className="wk-stage wk-stage-empty">
        <Mark className="wk-stage-mark" decorative />
      </div>
    );
  }

  var slides = count > 1
    ? [shots[count - 1]].concat(shots, [shots[0]])
    : shots.slice();

  // Which real shot is showing, for the dots.
  var current = ((pos - 1) % count + count) % count;

  return (
    <div className="wk-stage">
      {/* The neighbours stay on screen at the edges rather than being
          clipped away: the slide is narrower than the stage and the track
          is offset so the active one sits centred, which puts the next and
          previous shots into the margins instead of wasting them. */}
      <div
        className={'wk-track' + (animate ? '' : ' no-anim')}
        style={{ '--i': pos }}
        onTransitionEnd={onTransitionEnd}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {slides.map(function(src, i) {
          return (
            <div
              className={'wk-slide' + (i === pos ? ' is-active' : '')}
              key={i}
              aria-hidden={i !== pos}
            >
              <img
                src={src}
                alt={label + ' — ' + (current + 1) + '/' + count}
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="wk-dots">
          {shots.map(function(src, i) {
            return (
              <button
                type="button"
                key={src}
                className={'wk-dot' + (i === current ? ' is-on' : '')}
                onClick={function() { setAnimate(true); setPos(i + 1); }}
                aria-label={label + ' — ' + (i + 1) + '/' + count}
                aria-current={i === current}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkCarousel;
