import { useEffect, useRef } from 'react';

var TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
var scriptPromise = null;

// Loads the Turnstile script once and shares the same promise across every
// widget instance on the page, so mounting both the Contact and
// Testimonials forms in the same session doesn't inject the script twice.
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = function() { resolve(window.turnstile); };
    script.onerror = function() { scriptPromise = null; reject(new Error('Failed to load Turnstile')); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Renders a Cloudflare Turnstile widget. Renders nothing when no site key
// is configured, so local dev works without provisioning Cloudflare keys -
// the backend fails open the same way when TURNSTILE_SECRET is unset.
var Turnstile = function(props) {
  var onVerify = props.onVerify;
  var onExpire = props.onExpire;
  var siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  var containerRef = useRef(null);
  var widgetIdRef = useRef(null);

  useEffect(function() {
    if (!siteKey) return;
    var cancelled = false;

    loadTurnstile().then(function(turnstile) {
      if (cancelled || !containerRef.current || !turnstile) return;
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onExpire
      });
    }).catch(function(err) { console.error(err.message); });

    return function() {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onVerify/onExpire are stable setState callbacks from the parent
  }, [siteKey]);

  if (!siteKey) return null;
  return <div className="turnstile-widget" ref={containerRef}></div>;
};

export default Turnstile;
