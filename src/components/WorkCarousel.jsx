import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mark } from './BrandMark';
import Lightbox from './Lightbox';
import { useLang } from '../useLang';

var AUTO_MS = 5000;
var DRAG_THRESHOLD = 48;

// Below this a pointer has not moved; it has been pressed. Hands and
// trackpads wobble by a pixel or two.
var DRAG_SLOP = 8;

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
  var { t } = useLang();

  // null when closed, otherwise the index of the shot being looked at.
  var zoomState = useState(null);
  var zoom = zoomState[0];
  var setZoom = zoomState[1];

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
  // The enlarged view goes with it: a row closing under an open picture
  // leaves a picture belonging to nothing.
  useEffect(function() {
    if (!active) {
      setAnimate(false);
      setPos(1);
      setZoom(null);
    }
  }, [active, setPos, setAnimate, setZoom]);

  useEffect(function() {
    if (!active || paused || zoom !== null || count < 2) return;
    var reduce = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var id = setInterval(function() { step(1); }, AUTO_MS);
    return function() { clearInterval(id); };
  }, [active, paused, zoom, count, step]);

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
    dragRef.current = { startX: e.clientX, dragging: true, moved: false };
    setPaused(true);
  };

  // The capture is taken here rather than on pointerdown, and only once
  // the pointer has actually travelled.
  //
  // Capturing on press sends every later pointer event to this track, and
  // the click that follows is then dispatched to the track too - so the
  // button wrapping the shot never saw it and the picture would not open.
  // Waiting for movement means a plain click never captures anything,
  // while a drag still gets the capture it needs to carry on when the
  // pointer leaves the strip.
  var onPointerMove = function(e) {
    var d = dragRef.current;
    if (!d.dragging || d.moved) return;
    if (Math.abs(e.clientX - d.startX) <= DRAG_SLOP) return;
    d.moved = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  var onPointerUp = function(e) {
    if (!dragRef.current.dragging) return;
    var dx = e.clientX - dragRef.current.startX;
    dragRef.current.dragging = false;
    // A drag that travelled is a drag, not a click. The shot is a button
    // now, and without this the click that ends every swipe would open
    // the picture the reader was swiping away from.
    dragRef.current.moved = Math.abs(dx) > DRAG_SLOP;
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

  // Where the active slide sits in the track.
  //
  // pos starts at 1 because position 0 is the clone of the last shot.
  // With a single shot there are no clones, so the only slide is at 0
  // and nothing ever matched pos - the project opened with no active
  // slide at all: no full-opacity image, and nothing to click to enlarge
  // it. A one-shot carousel is not a special case worth a branch of its
  // own; it is this line.
  var aktiivinen = count > 1 ? pos : 0;

  return (
    <div className="wk-stage">
      {/* The neighbours stay on screen at the edges rather than being
          clipped away: the slide is narrower than the stage and the track
          is offset so the active one sits centred, which puts the next and
          previous shots into the margins instead of wasting them. */}
      <div
        className={'wk-track' + (animate ? '' : ' no-anim')}
        style={{ '--i': aktiivinen }}
        onTransitionEnd={onTransitionEnd}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {slides.map(function(src, i) {
          var onkoAktiivinen = i === aktiivinen;
          return (
            <div
              className={'wk-slide' + (onkoAktiivinen ? ' is-active' : '')}
              key={i}
              aria-hidden={!onkoAktiivinen}
            >
              {/* Only the shot in the middle opens. The two in the
                  margins are there to say the set continues; a click on
                  one of those should bring it to the middle, which is
                  what the drag already does. */}
              <button
                type="button"
                className="wk-open"
                onClick={function() {
                  if (!onkoAktiivinen || dragRef.current.moved) return;
                  setZoom(current);
                }}
                tabIndex={onkoAktiivinen ? 0 : -1}
                aria-label={onkoAktiivinen ? t.projects_zoom_hint + ': ' + label : undefined}
              >
                <img
                  src={src}
                  alt={label + ' \u2014 ' + (current + 1) + '/' + count}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </button>
            </div>
          );
        })}
      </div>

      {zoom !== null && (
        <Lightbox
          shots={shots}
          index={zoom}
          label={label}
          onClose={function() { setZoom(null); }}
          onStep={setZoom}
        />
      )}

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
