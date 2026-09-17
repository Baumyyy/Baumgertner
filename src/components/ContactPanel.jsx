import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ContactPanel.css';
import { pauseScrolling, resumeScrolling } from '../smoothScroll';
import { api } from '../api';
import { useLang } from '../useLang';
import { useContactPanel } from '../useContactPanel';
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

// Where the project stands today, and how big it is. Single choice
// each, and both carry a "not sure" option on purpose: the question is
// there to save the first reply a round of asking, not to make anyone
// commit to something before they have decided it.
//
// Same shape as SERVICES: `key` is what the visitor reads in their own
// language, `name` is the fixed English that travels with the message.
var STAGES = [
  { id: 'new', key: 'cp_stage_new', name: 'Nothing yet, from scratch' },
  { id: 'replace', key: 'cp_stage_replace', name: 'Has a site, needs replacing' },
  { id: 'brand', key: 'cp_stage_brand', name: 'Brand sorted, site is not' },
  { id: 'unsure', key: 'cp_stage_unsure', name: 'Not sure yet' },
];

var SCOPES = [
  { id: 'one', key: 'cp_scope_one', name: 'One page' },
  { id: 'few', key: 'cp_scope_few', name: 'A handful of pages' },
  { id: 'many', key: 'cp_scope_many', name: 'Larger site, several sections' },
  { id: 'unsure', key: 'cp_scope_unsure', name: 'Not sure yet' },
];

// Four questions rather than one form.
//
// The form asked for everything at once: six toggles, four fields and a
// consent box on one screen. That is a wall, and a wall is what a person
// deciding whether to get in touch at all is looking at. Asked one at a
// time, three of the four are a single tap and the last one is the only
// place anything has to be typed.
//
// Nothing in the first three is required. Someone who wants to write a
// paragraph and send it can reach the last step in three taps.
var STEPS = 4;

// Three working days from now. The receipt gives a date rather than
// "within a few days", which is the kind of promise every form makes and
// none of them can be held to.
var arkipaivaaEteenpain = function(alku, n) {
  var d = new Date(alku.getTime());
  var jaljella = n;
  while (jaljella > 0) {
    d.setDate(d.getDate() + 1);
    var vk = d.getDay();
    if (vk !== 0 && vk !== 6) jaljella--;
  }
  return d;
};

// The backend stores name, email and message and nothing else, so the
// answers have to travel inside the message itself. A separate field
// would need a schema change, a migration and an admin change to be
// readable - and would be silently dropped until all three landed.
var MESSAGE_LIMIT = 4800;

var ContactPanel = function() {
  var panel = useContactPanel();
  var isOpen = panel.isOpen;
  var close = panel.close;
  var kieli = useLang();
  var t = kieli.t;
  var lang = kieli.lang;

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
  var stepState = useState(0);
  var step = stepState[0];
  var setStep = stepState[1];
  var stageState = useState('');
  var stage = stageState[0];
  var setStage = stageState[1];
  var scopeState = useState('');
  var scope = scopeState[0];
  var setScope = scopeState[1];
  // What the receipt shows. Captured at send, because the answers
  // themselves are cleared the moment the request succeeds.
  var kuittiState = useState(null);
  var kuitti = kuittiState[0];
  var setKuitti = kuittiState[1];
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

  // Back to the first question when the panel closes. Reopening onto
  // step three of an enquiry that was abandoned is not where anyone
  // wants to be picked up.
  useEffect(function() {
    if (!isOpen) {
      setStep(0);
      setSent(false);
      setKuitti(null);
    }
  }, [isOpen, setStep, setSent, setKuitti]);

  // Focus follows the step.
  //
  // Changing step swaps everything between the heading and the buttons,
  // and without this the focus stays on the Next button that is now
  // pointing at a different question. Someone on a screen reader is told
  // nothing happened; someone on a keyboard has to tab backwards to find
  // what did. Moving it to the first control of the new step is what a
  // page navigation would have done.
  //
  // Skipped on the first step, where the panel's own focus handling has
  // just put the cursor where it belongs.
  var stepRef = useRef(null);
  useEffect(function() {
    if (!isOpen || step === 0) return;
    var node = stepRef.current;
    if (!node) return;
    var nakyva = node.querySelector(
      '.cp-services:not([hidden]), .cp-options:not([hidden]), .cp-step-fields:not([hidden])'
    );
    var first = nakyva && nakyva.querySelector(FOCUSABLE);
    if (first && first.focus) first.focus();
  }, [step, isOpen]);

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

  // The document is what scrolls, so the document is what has to be
  // frozen. Hiding its overflow also removes the scrollbar, so the width
  // it occupied is handed back as padding - otherwise the whole page
  // shifts sideways as the panel opens.
  useEffect(function() {
    var body = document.body;
    if (isOpen) {
      var bar = window.innerWidth - document.documentElement.clientWidth;
      body.style.setProperty('--lock-pad', bar + 'px');
      body.classList.add('scroll-locked');
      // Hiding the overflow stops the page being scrollable, but the
      // smooth-scroll loop keeps a position of its own and would go on
      // taking wheel events - so the page would have moved by the time
      // the panel closes. It is stopped rather than fought.
      pauseScrolling();
    } else {
      body.classList.remove('scroll-locked');
      resumeScrolling();
    }
    return function() {
      body.classList.remove('scroll-locked');
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
    if (!id) return;
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

  var seuraava = function() {
    // The two single-choice steps have to be answered before they are
    // left behind. Both carry a "not sure yet" option, so this asks for
    // an answer rather than for a decision - but skipping past them in
    // silence is not the same thing as saying you do not know, and only
    // one of those is useful to read later.
    //
    // The first step is deliberately not in here: it is a multiple
    // choice, its hint says it can be left blank, and choosing nothing
    // from a list of six is a legible answer on its own.
    if (step === 1 && !stage) return fail('pick', '');
    if (step === 2 && !scope) return fail('pick', '');

    setFormError('');
    setStep(function(n) { return Math.min(n + 1, STEPS - 1); });
  };

  var edellinen = function() {
    setFormError('');
    setStep(function(n) { return Math.max(n - 1, 0); });
  };

  var handleSubmit = function(e) {
    e.preventDefault();

    // Enter inside any of the first three steps means "next", not
    // "send". A form submits on Enter from any field in it, and three of
    // the four steps are not the end of anything.
    if (step < STEPS - 1) { seuraava(); return; }

    // Something has to have been said. Every one of the first three
    // questions can be skipped, so an empty message on top of three
    // skipped questions is an enquiry with nothing in it.
    if (!formData.message && !chosen.length && !stage && !scope) {
      return fail('empty', 'cp-message');
    }
    if (!formData.name) return fail('required', 'cp-name');
    if (!formData.email) return fail('required', 'cp-email');
    // The message is no longer required on its own. Three questions have
    // been asked before this field, and an enquiry that answers them and
    // says "that is all for now" is a complete enquiry. What is required
    // is that SOMETHING was said, which the check at the top of this
    // function covers.

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
    var nimeksi = function(lista, id) {
      var osuma = lista.filter(function(x) { return x.id === id; })[0];
      return osuma ? osuma.name : '';
    };

    // Everything the backend has no column for is folded into the
    // message, in the order it is useful to read: what, where from, how
    // big, what it replaces, and then their own words.
    var head = [];
    if (picked.length) head.push('Services: ' + picked.join(', '));
    if (stage) head.push('Stage: ' + nimeksi(STAGES, stage));
    if (scope) head.push('Scope: ' + nimeksi(SCOPES, scope));
    if (formData.siteUrl) head.push('Current site: ' + formData.siteUrl);
    var body = head.length
      ? head.join('\n') + (formData.message ? '\n\n' + formData.message : '')
      : formData.message;

    api.sendMessage({
      name: formData.name,
      email: formData.email,
      message: body,
      website: formData.website,
      turnstileToken: turnstileToken,
    })
      .then(function() {
        var nyt = new Date();
        setKuitti({
          lahetetty: nyt,
          vastausViimeistaan: arkipaivaaEteenpain(nyt, 3),
          // Their own language, not the fixed English that travels
          // with the message: this half is read by the person who just
          // filled it in, the other half by whoever reads the inbox.
          palvelut: SERVICES
            .filter(function(x) { return chosen.indexOf(x.id) !== -1; })
            .map(function(x) { return t[x.key]; }),
          tilanne: stage ? t[STAGES.filter(function(x) { return x.id === stage; })[0].key] : '',
          laajuus: scope ? t[SCOPES.filter(function(x) { return x.id === scope; })[0].key] : '',
          viesti: formData.message,
        });
        setSending(false);
        setSent(true);
        setFormData({ name: '', email: '', siteUrl: '', message: '', website: '' });
        setChosen([]);
        setStage('');
        setScope('');
        setConsent(false);
        setTurnstileToken('');
      })
      .catch(function() {
        setSending(false);
        setFormError('send');
      });
  };

  var canSend = !sending && consent && (!TURNSTILE_ENABLED || !!turnstileToken);

  // The four questions, as data. Each one is a marker, a heading and a
  // body; the shared chrome around them - progress, navigation, errors -
  // is written once below rather than four times.
  var kysymykset = [
    { claim1: t.cp_q1_claim1, claim2: t.cp_q1_claim2, hint: t.cp_q1_hint },
    { claim1: t.cp_q2_claim1, claim2: t.cp_q2_claim2, hint: t.cp_q2_hint },
    { claim1: t.cp_q3_claim1, claim2: t.cp_q3_claim2, hint: t.cp_q3_hint },
    { claim1: t.cp_q4_claim1, claim2: t.cp_q4_claim2, hint: t.cp_q4_hint },
  ];
  var kysymys = kysymykset[step];

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
          <div className="cp-inner" data-lenis-prevent>
            {/* Lenis drives touch scrolling now, and it drives the
                document. Without the attribute above it swallows the
                finger here too and the form cannot be scrolled at all. */}
            <div className="cp-head">
              <p className="cp-tag">{sent ? t.cp_done_tag : t.cp_tag}</p>
              <button type="button" className="cp-close" onClick={close}>
                <span className="sr-only">{t.cp_close}</span>
                <span className="cp-close-mark" aria-hidden="true"></span>
              </button>
            </div>

            {!sent && (
              <div className="cp-progress">
                <p className="cp-progress-count">
                  <span className="cp-progress-now">{String(step + 1).padStart(2, '0')}</span>
                  <span className="cp-progress-of">{t.cp_step_of}</span>
                  <span className="cp-progress-all">{String(STEPS).padStart(2, '0')}</span>
                </p>
                {/* Four segments rather than one filling bar: the reader
                    is counting questions, not covering a distance. */}
                <div className="cp-progress-track" aria-hidden="true">
                  {kysymykset.map(function(_, i) {
                    return <span className={'cp-progress-seg' + (i <= step ? ' is-on' : '')} key={i} />;
                  })}
                </div>
              </div>
            )}

            {/* The question on the left, the answers on the right. On a
                wide screen the two sit side by side; stacked, the order
                in the markup is the order they are read. */}
            <div className="cp-body">
              {/* Keyed by step so React replaces it rather than editing the
                  text in place - a CSS animation only runs on an element
                  that is new to the render tree, and the heading is the
                  same element from one question to the next. Only this
                  half is keyed: keying the form would remount Turnstile
                  on every step, which means a fresh third-party widget
                  load four times per enquiry. */}
              <div className="cp-ask" key={step}>
                <h2 className="cp-claim" id="cp-title">
                  <span className="cp-claim-line">{sent ? t.cp_done_claim1 : kysymys.claim1}</span>
                  <span className="cp-claim-line stop">{sent ? t.cp_done_claim2 : kysymys.claim2}</span>
                </h2>

                <p className="cp-intro">{sent ? t.cp_done_lede : kysymys.hint}</p>
              </div>

            <div className="cp-answer">
            {sent && kuitti ? (
              /* A receipt, not a thank-you card.

                 "Thanks, I will be in touch soon" is what every form on
                 the internet says, and it leaves the person who just
                 typed their details with nothing: no record of what they
                 sent and no idea what soon means. This gives both - the
                 answers back, and a date. */
              <div className="cp-done" role="status">
                <dl className="cp-receipt">
                  <div className="cp-receipt-row">
                    <dt>{t.cp_done_sent}</dt>
                    <dd>
                      {kuitti.lahetetty.toLocaleDateString(lang === 'fi' ? 'fi-FI' : 'en-GB')}
                      <span className="cp-receipt-sep" aria-hidden="true"> · </span>
                      {kuitti.lahetetty.toLocaleTimeString(lang === 'fi' ? 'fi-FI' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </dd>
                  </div>

                  {/* The one line on this panel that is a commitment
                      rather than a courtesy, so it is the one that is
                      marked. */}
                  <div className="cp-receipt-row is-lead">
                    <dt>{t.cp_done_reply}</dt>
                    <dd>{kuitti.vastausViimeistaan.toLocaleDateString(lang === 'fi' ? 'fi-FI' : 'en-GB', { day: 'numeric', month: 'long' })}</dd>
                  </div>
                </dl>

                <p className="cp-receipt-note">{t.cp_done_reply_note}</p>

                <p className="cp-receipt-label">{t.cp_done_what}</p>
                <dl className="cp-receipt cp-receipt-answers">
                  <div className="cp-receipt-row">
                    <dt>{t.cp_done_needs}</dt>
                    <dd className={kuitti.palvelut.length ? '' : 'is-empty'}>
                      {kuitti.palvelut.length ? kuitti.palvelut.join(', ') : t.cp_done_none}
                    </dd>
                  </div>
                  <div className="cp-receipt-row">
                    <dt>{t.cp_done_stage}</dt>
                    <dd className={kuitti.tilanne ? '' : 'is-empty'}>{kuitti.tilanne || t.cp_done_none}</dd>
                  </div>
                  <div className="cp-receipt-row">
                    <dt>{t.cp_done_scope}</dt>
                    <dd className={kuitti.laajuus ? '' : 'is-empty'}>{kuitti.laajuus || t.cp_done_none}</dd>
                  </div>
                  {kuitti.viesti && (
                    <div className="cp-receipt-row">
                      <dt>{t.cp_done_message}</dt>
                      <dd className="cp-receipt-message">{kuitti.viesti}</dd>
                    </div>
                  )}
                </dl>

                <button type="button" className="btn-primary cp-done-close" onClick={close}>
                  {t.cp_done_close}
                </button>
              </div>
            ) : (
              <form
                className="cp-form"
                onSubmit={handleSubmit}
                onKeyDown={function(e) {
                  // Enter means next.
                  //
                  // A form only submits on Enter from a text field, so
                  // in the two steps made of radio buttons the key did
                  // nothing at all - which in a sequence of questions
                  // reads as the form being stuck. Buttons keep their
                  // own behaviour (Enter on a toggle toggles it), and
                  // the textarea keeps its newlines.
                  if (e.key !== 'Enter') return;
                  if (step >= STEPS - 1) return;
                  var tag = e.target.tagName;
                  if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
                  e.preventDefault();
                  seuraava();
                }}
                noValidate
                ref={stepRef}
              >
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

                {/* ===== 01 - WHAT =====
                    Toggle buttons rather than checkboxes: aria-pressed
                    says the same thing to a screen reader, and these are
                    a filter on the enquiry rather than fields of it. */}
                <fieldset className="cp-services" hidden={step !== 0}>
                  <legend className="sr-only">{t.cp_services_label}</legend>
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

                {/* ===== 02 - WHERE FROM =====
                    One answer. Radios rather than toggles, because these
                    are mutually exclusive and the control should say so
                    before anyone tries a second one. */}
                <fieldset className="cp-options" hidden={step !== 1}>
                  <legend className="sr-only">{kysymys.claim1 + ' ' + kysymys.claim2}</legend>
                  {STAGES.map(function(o) {
                    return (
                      <label className={'cp-option' + (stage === o.id ? ' is-on' : '')} key={o.id}>
                        <input
                          type="radio"
                          name="stage"
                          className="cp-option-input"
                          value={o.id}
                          checked={stage === o.id}
                          onChange={function() { setStage(o.id); }}
                        />
                        <span className="cp-option-mark" aria-hidden="true"></span>
                        <span className="cp-option-text">{t[o.key]}</span>
                      </label>
                    );
                  })}
                </fieldset>

                {/* ===== 03 - HOW BIG ===== */}
                <fieldset className="cp-options" hidden={step !== 2}>
                  <legend className="sr-only">{kysymys.claim1 + ' ' + kysymys.claim2}</legend>
                  {SCOPES.map(function(o) {
                    return (
                      <label className={'cp-option' + (scope === o.id ? ' is-on' : '')} key={o.id}>
                        <input
                          type="radio"
                          name="scope"
                          className="cp-option-input"
                          value={o.id}
                          checked={scope === o.id}
                          onChange={function() { setScope(o.id); }}
                        />
                        <span className="cp-option-mark" aria-hidden="true"></span>
                        <span className="cp-option-text">{t[o.key]}</span>
                      </label>
                    );
                  })}
                </fieldset>

                {/* ===== 04 - WHO ===== */}
                <div className="cp-step-fields" hidden={step !== 3}>
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
                  </label>
                  <textarea
                    id="cp-message"
                    className="cp-input cp-textarea"
                    name="message"
                    aria-invalid={invalidField === 'cp-message'}
                    rows="3"
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
                    <Link to={'/' + lang + '/privacy'} onClick={close}>{t.privacy_link_inline}</Link>
                    {t.cp_consent_post}
                  </span>
                </label>

                {formError === 'required' && <p className="cp-error" role="alert">{t.contact_error_required}</p>}
                {formError === 'email' && <p className="cp-error" role="alert">{t.contact_error_email}</p>}
                {formError === 'consent' && <p className="cp-error" role="alert">{t.cp_error_consent}</p>}
                {formError === 'empty' && <p className="cp-error" role="alert">{t.cp_error_empty}</p>}
                {formError === 'send' && <p className="cp-error" role="alert">{t.contact_error_send}</p>}

                <Turnstile
                  onVerify={setTurnstileToken}
                  onExpire={function() { setTurnstileToken(''); }}
                />
                </div>

                {/* Outside the last step's block, because this one can be
                    raised from step two or three as well. */}
                {formError === 'pick' && <p className="cp-error" role="alert">{t.cp_error_pick}</p>}

                {/* Back on the left, forward on the right, in that order
                    in the markup too - so tabbing through them runs the
                    same way round as reading them. Back is missing on the
                    first step rather than disabled: there is nothing
                    behind it to go to. */}
                <div className="cp-nav">
                  {step > 0 && (
                    <button type="button" className="cp-nav-back" onClick={edellinen}>
                      {t.cp_back}
                    </button>
                  )}

                  {step < STEPS - 1 ? (
                    <button type="button" className="btn-primary cp-submit" onClick={seuraava}>
                      {t.cp_next}
                    </button>
                  ) : (
                    <button type="submit" className="btn-primary cp-submit" disabled={!canSend}>
                      <span aria-live="polite">{sending ? t.contact_sending : t.contact_send}</span>
                    </button>
                  )}
                </div>
              </form>
            )}
            </div>

            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ContactPanel;
