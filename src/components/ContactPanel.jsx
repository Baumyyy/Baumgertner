import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ContactPanel.css';
import { pauseScrolling, resumeScrolling } from '../smoothScroll';
import { api } from '../api';
import { useLang } from '../useLang';
import { useContactPanel } from '../useContactPanel';
import { email as EMAIL } from '../content/about';
import Turnstile from './Turnstile';

var TURNSTILE_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// What the client can ask for. These are not the services section's six
// - that one describes what the work covers, this one is what a client
// actually comes asking for, so it is a shorter list with its own
// wording. `key` is the translated label they see; `name` is the fixed
// English name that travels with the message, so the admin list reads
// the same whichever language the enquiry came in.
var SERVICES = [
  { id: 'website', key: 'cp_svc_website', name: 'Website' },
  { id: 'logo', key: 'cp_svc_logo', name: 'Logo' },
  { id: 'branding', key: 'cp_svc_branding', name: 'Branding' },
  { id: 'performance', key: 'cp_svc_performance', name: 'Performance' },
  { id: 'seo', key: 'cp_svc_seo', name: 'SEO' },
  { id: 'launch', key: 'cp_svc_launch', name: 'Launch' },
];

// The backend stores name, email and message and nothing else, so the
// choices have to travel inside the message itself. A separate field
// would need a schema change, a migration and an admin change to be
// readable - and would be silently dropped until all three landed.
var MESSAGE_LIMIT = 4800;

var ContactPanel = function() {
  var panel = useContactPanel();
  var isOpen = panel.isOpen;
  var close = panel.close;
  var { t } = useLang();

  var panelRef = useRef(null);

  // The panel element stays in the tree so it can animate, but its
  // contents are only built once it has been opened. Without this the
  // Turnstile widget would load a third-party script on every page view
  // for a form most visitors never open.
  //
  // The render condition below is `isOpen || hasMounted`, not hasMounted
  // alone: hasMounted is set from an effect, which runs after the render
  // that opened the panel, so on the very first open the form did not
  // exist yet when the focus effect went looking for a field to focus.
  var mountedState = useState(false);
  var hasMounted = mountedState[0];
  var setHasMounted = mountedState[1];

  // siteUrl is the visitor's own address, kept well away from `website`:
  // that one is the honeypot, and the API treats anything in it as a bot.
  var formDataState = useState({ name: '', email: '', siteUrl: '', message: '', website: '' });
  var formData = formDataState[0];
  var setFormData = formDataState[1];
  var servicesState = useState([]);
  var chosen = servicesState[0];
  var setChosen = servicesState[1];
  var consentState = useState(false);
  var consent = consentState[0];
  var setConsent = consentState[1];
  var sendingState = useState(false);
  var sending = sendingState[0];
  var setSending = sendingState[1];
  var sentState = useState(false);
  var sent = sentState[0];
  var setSent = sentState[1];
  var errorState = useState('');
  var formError = errorState[0];
  var setFormError = errorState[1];
  var tokenState = useState('');
  var turnstileToken = tokenState[0];
  var setTurnstileToken = tokenState[1];
  var invalidState = useState('');
  var invalidField = invalidState[0];
  var setInvalidField = invalidState[1];

  useEffect(function() {
    if (isOpen) setHasMounted(true);
  }, [isOpen, setHasMounted]);

  // Escape closes, Tab cycles inside. A dialog that lets focus wander
  // back onto the page behind it is a dialog only for people using a
  // mouse.
  useEffect(function() {
    if (!isOpen) return;
    var node = panelRef.current;
    var restoreTo = document.activeElement;

    var firstField = node && node.querySelector(FOCUSABLE);
    if (firstField) firstField.focus();

    var onKeyDown = function(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !node) return;
      var items = node.querySelectorAll(FOCUSABLE);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return function() {
      document.removeEventListener('keydown', onKeyDown);
      if (restoreTo && restoreTo.focus) restoreTo.focus();
    };
  }, [isOpen, close]);

  // The page scrolls inside .aurora-container, not on <body>, so that is
  // what has to be frozen. Hiding its overflow also removes its
  // scrollbar, so the width it occupied is handed back as padding -
  // otherwise the whole page shifts sideways as the panel opens.
  useEffect(function() {
    var container = document.querySelector('.aurora-container');
    if (!container) return;
    if (isOpen) {
      var bar = container.offsetWidth - container.clientWidth;
      container.style.setProperty('--lock-pad', bar + 'px');
      container.classList.add('scroll-locked');
      // Hiding the overflow stops the container being scrollable, but the
      // smooth-scroll loop keeps a position of its own and would go on
      // taking wheel events - so the page would have moved by the time
      // the panel closes. It is stopped rather than fought.
      pauseScrolling();
    } else {
      container.classList.remove('scroll-locked');
      resumeScrolling();
    }
    return function() {
      container.classList.remove('scroll-locked');
      resumeScrolling();
    };
  }, [isOpen]);

  var handleChange = function(e) {
    var next = {};
    next[e.target.name] = e.target.value;
    setFormData(Object.assign({}, formData, next));
    if (formError) setFormError('');
    if (invalidField === e.target.id) setInvalidField('');
  };

  // An error printed at the foot of a form is an error a keyboard user
  // has to go looking for. Naming the field and putting the cursor in it
  // is the difference between being told and being shown.
  var fail = function(kind, id) {
    setFormError(kind);
    setInvalidField(id);
    var el = document.getElementById(id);
    if (el) el.focus();
  };

  var toggleService = function(id) {
    setChosen(function(prev) {
      return prev.indexOf(id) === -1
        ? prev.concat([id])
        : prev.filter(function(x) { return x !== id; });
    });
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!formData.name) return fail('required', 'cp-name');
    if (!formData.email) return fail('required', 'cp-email');
    if (!formData.message) return fail('required', 'cp-message');

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return fail('email', 'cp-email');
    if (!consent) return fail('consent', 'cp-consent');
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setFormError('send');
      return;
    }
    setFormError('');
    setInvalidField('');
    setSending(true);

    var picked = SERVICES
      .filter(function(s) { return chosen.indexOf(s.id) !== -1; })
      .map(function(s) { return s.name; });
    // Everything the backend has no column for is folded into the
    // message, in the order it is useful to read.
    var head = [];
    if (picked.length) head.push('Services: ' + picked.join(', '));
    if (formData.siteUrl) head.push('Current site: ' + formData.siteUrl);
    var body = head.length
      ? head.join('\n') + '\n\n' + formData.message
      : formData.message;

    api.sendMessage({
      name: formData.name,
      email: formData.email,
      message: body,
      website: formData.website,
      turnstileToken: turnstileToken,
    })
      .then(function() {
        setSending(false);
        setSent(true);
        setFormData({ name: '', email: '', siteUrl: '', message: '', website: '' });
        setChosen([]);
        setConsent(false);
        setTurnstileToken('');
      })
      .catch(function() {
        setSending(false);
        setFormError('send');
      });
  };

  var canSend = !sending && consent && (!TURNSTILE_ENABLED || !!turnstileToken);

  return (
    <div className={'cp-root' + (isOpen ? ' is-open' : '')}>
      {/* Clicking away is how most people close a panel like this. It is
          a button rather than a div so it is not a click target that
          only a pointer can reach. */}
      <button
        type="button"
        className="cp-scrim"
        tabIndex={-1}
        aria-hidden="true"
        onClick={close}
      ></button>

      <aside
        className="cp-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-title"
      >
        {(isOpen || hasMounted) && (
          <div className="cp-inner">
            <div className="cp-head">
              <p className="cp-tag">{t.cp_tag}</p>
              <button type="button" className="cp-close" onClick={close}>
                <span className="sr-only">{t.cp_close}</span>
                <span className="cp-close-mark" aria-hidden="true"></span>
              </button>
            </div>

            <h2 className="cp-claim" id="cp-title">
              <span className="cp-claim-line">{t.cp_claim1}</span>
              <span className="cp-claim-line stop">{t.cp_claim2}</span>
            </h2>

            <p className="cp-intro">{t.cp_intro}</p>

            {sent ? (
              <div className="cp-sent" role="status">
                <p className="cp-sent-title">{t.cp_sent_title}</p>
                <p className="cp-sent-body">{t.cp_sent_body}</p>
                <button type="button" className="btn-secondary" onClick={close}>
                  {t.cp_close}
                </button>
              </div>
            ) : (
              <form className="cp-form" onSubmit={handleSubmit} noValidate>
                {/* Bots fill every field they find. People never see
                    this one, so anything in it is a bot. */}
                <div className="cp-honeypot" aria-hidden="true">
                  <label htmlFor="cp-website">Website</label>
                  <input
                    id="cp-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                {/* Toggle buttons rather than checkboxes: aria-pressed
                    says the same thing to a screen reader, and these are
                    a filter on the enquiry rather than fields of it. */}
                <fieldset className="cp-services">
                  <legend className="cp-label">{t.cp_services_label}</legend>
                  <p className="cp-hint">{t.cp_services_hint}</p>
                  <div className="cp-chips">
                    {SERVICES.map(function(service) {
                      var on = chosen.indexOf(service.id) !== -1;
                      return (
                        <button
                          type="button"
                          key={service.id}
                          className={'cp-chip' + (on ? ' is-on' : '')}
                          aria-pressed={on}
                          onClick={function() { toggleService(service.id); }}
                        >
                          {t[service.key]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <p className="cp-required-note">{t.cp_required_note}</p>

                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-name">
                    {t.contact_name}
                    <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="cp-name"
                    className="cp-input"
                    type="text"
                    name="name"
                    required
                    aria-invalid={invalidField === 'cp-name'}
                    maxLength={100}
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-email">
                    {t.contact_email_field}
                    <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="cp-email"
                    className="cp-input"
                    type="email"
                    name="email"
                    required
                    aria-invalid={invalidField === 'cp-email'}
                    maxLength={254}
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Optional, and the one field that changes the quality of
                    the first reply: seeing the site being replaced beats
                    asking about it. */}
                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-site">{t.cp_site_label}</label>
                  <input
                    id="cp-site"
                    className="cp-input"
                    type="url"
                    name="siteUrl"
                    inputMode="url"
                    maxLength={300}
                    autoComplete="url"
                    placeholder="https://"
                    value={formData.siteUrl}
                    onChange={handleChange}
                  />
                  <p className="cp-hint">{t.cp_site_hint}</p>
                </div>

                <div className="cp-field">
                  <label className="cp-label" htmlFor="cp-message">
                    {t.contact_message}
                    <span className="cp-req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="cp-message"
                    className="cp-input cp-textarea"
                    name="message"
                    required
                    aria-invalid={invalidField === 'cp-message'}
                    rows="5"
                    maxLength={MESSAGE_LIMIT}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* The native box is kept - it is what carries the
                    checked state to assistive technology and to the
                    keyboard - and only its painting is replaced. */}
                <label className="cp-consent">
                  <input
                    id="cp-consent"
                    type="checkbox"
                    className="cp-consent-input"
                    required
                    aria-invalid={invalidField === 'cp-consent'}
                    checked={consent}
                    onChange={function(e) {
                      setConsent(e.target.checked);
                      if (formError === 'consent') setFormError('');
                      if (invalidField === 'cp-consent') setInvalidField('');
                    }}
                  />
                  <span className="cp-consent-box" aria-hidden="true"></span>
                  <span className="cp-consent-text">
                    {t.cp_consent_pre}{' '}
                    <Link to="/privacy" onClick={close}>{t.privacy_link_inline}</Link>
                    {t.cp_consent_post}
                  </span>
                </label>

                {formError === 'required' && <p className="cp-error" role="alert">{t.contact_error_required}</p>}
                {formError === 'email' && <p className="cp-error" role="alert">{t.contact_error_email}</p>}
                {formError === 'consent' && <p className="cp-error" role="alert">{t.cp_error_consent}</p>}
                {formError === 'send' && <p className="cp-error" role="alert">{t.contact_error_send}</p>}

                <Turnstile
                  onVerify={setTurnstileToken}
                  onExpire={function() { setTurnstileToken(''); }}
                />

                <button
                  type="submit"
                  className="btn-primary cp-submit"
                  disabled={!canSend}
                >
                  <span aria-live="polite">{sending ? t.contact_sending : t.contact_send}</span>
                </button>
              </form>
            )}

            <div className="cp-direct">
              <p className="cp-direct-label">{t.cp_direct}</p>
              <a className="cp-direct-link" href={'mailto:' + EMAIL}>{EMAIL}</a>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ContactPanel;
