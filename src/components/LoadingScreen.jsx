import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';
import { Wordmark, WordmarkKnockout } from './BrandMark';

// Held for two things that genuinely cause a visible flash: the fonts,
// because the claim reflows when Orbitron arrives, and the hero image,
// because the valley pops in behind it. The bar that used to be here
// counted random numbers on a timer - it measured nothing and cost every
// visitor about a second and a half, on a site whose own argument is
// that people leave before the first paint.
//
// No progress bar. The mark draws itself in from the left while the page
// loads, so the thing being watched and the thing being waited for are
// one object.
//
// Bounded at both ends. The floor is one pass of the fill, so the mark is
// never caught half-drawn when the page turns out to be ready
// immediately - which on a warm cache it always is. The ceiling means a
// slow connection can never hold anyone here.
var MIN_MS = 820;
var MAX_MS = 2500;

// Matches the <picture> in the hero, so the file waited for is the file
// that will actually be painted.
var heroSource = function() {
  var narrow = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  return narrow ? '/hero/valley-tall.webp' : '/hero/valley-wide.webp';
};

var LoadingScreen = function({ onFinished }) {
  var readyState = useState(false);
  var ready = readyState[0];
  var setReady = readyState[1];
  var openingState = useState(false);
  var opening = openingState[0];
  var setOpening = openingState[1];

  useEffect(function() {
    var done = false;
    var timers = [];

    var finish = function() {
      if (done) return;
      done = true;
      // Three beats: the mark completes, it holds for a moment as a
      // finished thing, then the letters become windows and the viewer
      // goes through them.
      setReady(true);
      timers.push(setTimeout(function() { setOpening(true); }, 260));
      timers.push(setTimeout(function() { onFinished(); }, 1120));
    };

    // Straight out, with none of the choreography: finish() schedules a
    // hold and an opening worth a second, which is exactly what someone
    // asking for less motion did not ask for.
    var reduceMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      timers.push(setTimeout(function() { onFinished(); }, 0));
      return function() { timers.forEach(clearTimeout); };
    }

    var started = Date.now();
    var whenReady = function() {
      var waited = Date.now() - started;
      timers.push(setTimeout(finish, Math.max(0, MIN_MS - waited)));
    };

    var fonts = document.fonts ? document.fonts.ready : Promise.resolve();

    var image = new Promise(function(resolve) {
      var img = new Image();
      // Resolve either way: a missing or failed image is a reason to get
      // on with it, not a reason to sit on a black screen.
      img.onload = resolve;
      img.onerror = resolve;
      img.src = heroSource();
    });

    Promise.all([fonts, image]).then(whenReady).catch(whenReady);
    timers.push(setTimeout(finish, MAX_MS));

    return function() { timers.forEach(clearTimeout); };
  }, [onFinished, setReady, setOpening]);

  var cls = 'loading-screen'
    + (ready ? ' is-ready' : '')
    + (opening ? ' is-opening' : '');

  return (
    <div className={cls}>
      {/* Plain black behind the knockout, so the letters read as letters
          while the page is still loading rather than as holes onto a page
          that is not there yet. It is what goes first, and going is what
          turns the mark into an opening. */}
      <span className="loading-backdrop" aria-hidden="true"></span>

      <div className="loading-inner">
        <span className="sr-only">Baumgertner</span>

        {/* The knockout and the drawn mark share a box and a viewBox, so
            the holes sit exactly on the letters. They scale together, and
            the drawn one fades - the letters do not move aside, they open. */}
        <div className="loading-mark" aria-hidden="true">
          <WordmarkKnockout className="loading-veil" />
          <Wordmark className="loading-wordmark loading-wordmark-dim" decorative />
          <Wordmark className="loading-wordmark loading-wordmark-lit" decorative />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
