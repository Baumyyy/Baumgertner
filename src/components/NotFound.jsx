import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../useLang';
import { usePageMeta } from '../hooks/usePageMeta';
import { Wordmark } from './BrandMark';
import './NotFound.css';

// How long a path is allowed to be before it is cut. A 404 is reachable
// by anyone typing anything, and a 2000-character URL would otherwise be
// laid out on the page.
var PATH_MAX = 64;

var NotFound = function() {
  var langCtx = useLang();
  var t = langCtx.t;
  var lang = langCtx.lang;

  usePageMeta(
    'Page Not Found | Anthony Baumgertner',
    'The page you are looking for does not exist or has been moved.'
  );

  // What they actually asked for. React escapes it on the way in, and
  // the browser has already percent-encoded anything exotic, so this is
  // text by the time it gets here - but it is still a string a stranger
  // chose, so it is capped and never parsed.
  var polku = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (polku.length > PATH_MAX) polku = polku.slice(0, PATH_MAX) + '…';

  return (
    <main className="nf">
      {/* There is no navigation on this page, so the mark is the way
          back as well as the thing that says whose site this still is. */}
      <Link className="nf-brand" to={'/' + lang} aria-label="Baumgertner">
        <Wordmark className="nf-brand-mark" decorative />
      </Link>

      <div className="nf-inner">
        {/* The number, once at the size it deserves and once at the size
            it is worth reading. This one is scenery. */}
        <span className="nf-ghost" aria-hidden="true">404</span>

        <p className="nf-tag">
          <span className="tag-label">{t.notfound_tag}</span>
        </p>

        <h1 className="nf-claim">
          <span className="nf-claim-line">{t.notfound_claim1}</span>
          <span className="nf-claim-line stop">{t.notfound_claim2}</span>
        </h1>

        <p className="nf-lede">{t.notfound_lede}</p>

        {/* The same record the contact receipt uses, for the same reason:
            a page that has gone wrong should say what it knows rather
            than apologise in the abstract. */}
        <dl className="nf-record">
          <div className="nf-record-row">
            <dt>{t.notfound_asked}</dt>
            <dd className="nf-path">{polku}</dd>
          </div>
          <div className="nf-record-row">
            <dt>{t.notfound_status}</dt>
            <dd>404</dd>
          </div>
        </dl>

        <Link className="btn-primary nf-home" to={'/' + lang}>
          {t.notfound_home}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
