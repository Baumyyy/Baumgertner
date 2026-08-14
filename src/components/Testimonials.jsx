import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import './Testimonials.css';
import { api } from '../api';
import { useLang } from '../useLang';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

var Testimonials = function() {
  var sectionRef = useScrollAnimation();
  var testimonialsState = useState([]);
  var testimonials = testimonialsState[0];
  var setTestimonials = testimonialsState[1];
  var activeState = useState(0);
  var active = activeState[0];
  var setActive = activeState[1];
  var showFormState = useState(false);
  var showForm = showFormState[0];
  var setShowForm = showFormState[1];
  var formState = useState({ name: '', role: '', company: '', message: '', rating: 5, avatar: '', website: '' });
  var form = formState[0];
  var setForm = formState[1];
  var submittedState = useState(false);
  var submitted = submittedState[0];
  var setSubmitted = submittedState[1];
  var sendingState = useState(false);
  var sending = sendingState[0];
  var setSending = sendingState[1];
  var uploadingState = useState(false);
  var uploading = uploadingState[0];
  var setUploading = uploadingState[1];
  var formErrorState = useState('');
  var formError = formErrorState[0];
  var setFormError = formErrorState[1];
  var agreedState = useState(false);
  var agreed = agreedState[0];
  var setAgreed = agreedState[1];
  var { t } = useLang();

  // Swipe
  var touchStart = useRef(null);
  var touchEnd = useRef(null);

  // Modal focus management
  var modalRef = useRef(null);
  var closeBtnRef = useRef(null);
  var triggerBtnRef = useRef(null);
  var wasOpenRef = useRef(false);

  var handleTouchStart = function(e) {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  };

  var handleTouchMove = function(e) {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  var handleTouchEnd = function() {
    if (!touchStart.current || !touchEnd.current) return;
    var distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        setActive(function(prev) { return (prev + 1) % testimonials.length; });
      } else {
        setActive(function(prev) { return (prev - 1 + testimonials.length) % testimonials.length; });
      }
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  useEffect(function() {
    var container = document.querySelector('.aurora-container');
    if (!container) return;
    if (showForm) container.classList.add('scroll-locked');
    return function() { container.classList.remove('scroll-locked'); };
  }, [showForm]);

  useEffect(function() {
    if (!showForm) return;
    var handleKeyDown = function(e) {
      if (e.key === 'Escape') { setShowForm(false); return; }
      if (e.key === 'Tab' && modalRef.current) {
        var focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return function() { document.removeEventListener('keydown', handleKeyDown); };
  }, [showForm, setShowForm]);

  useEffect(function() {
    if (showForm) {
      wasOpenRef.current = true;
      if (closeBtnRef.current) closeBtnRef.current.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      if (triggerBtnRef.current) triggerBtnRef.current.focus();
    }
  }, [showForm]);

  useEffect(function() {
    api.getTestimonials().then(function(data) {
      if (Array.isArray(data)) setTestimonials(data);
    }).catch(function() {});
  }, [setTestimonials]);

  useEffect(function() {
    if (testimonials.length === 0) return;
    var interval = setInterval(function() {
      setActive(function(prev) { return (prev + 1) % testimonials.length; });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [testimonials, setActive]);

  var handlePhotoUpload = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setFormError('');
    api.uploadPublicImage(file).then(function(data) {
      setUploading(false);
      if (data.url) setForm(Object.assign({}, form, { avatar: data.url }));
    }).catch(function() {
      setUploading(false);
      setFormError('upload');
    });
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!form.name || !form.message || !agreed) return;
    setSending(true);
    setFormError('');
    api.submitTestimonial(Object.assign({}, form, { consent: agreed })).then(function() {
      setSending(false);
      setSubmitted(true);
      setForm({ name: '', role: '', company: '', message: '', rating: 5, avatar: '', website: '' });
      setAgreed(false);
      setTimeout(function() { setSubmitted(false); setShowForm(false); }, 3000);
    }).catch(function() {
      setSending(false);
      setFormError('send');
    });
  };

  var renderStars = function(rating) {
    var stars = [];
    for (var i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={'testimonial-star' + (i < rating ? ' star-filled' : '')}>★</span>
      );
    }
    return stars;
  };

  var renderRatingSelect = function() {
    var stars = [];
    for (var i = 1; i <= 5; i++) {
      (function(val) {
        stars.push(
          <button
            key={val}
            type="button"
            className={'rating-star' + (val <= form.rating ? ' rating-active' : '')}
            aria-label={val + ' / 5'}
            aria-pressed={val === form.rating}
            onClick={function() { setForm(Object.assign({}, form, { rating: val })); }}
          >★</button>
        );
      })(i);
    }
    return stars;
  };

  return (
    <section id="testimonials" className="testimonials" ref={sectionRef}>
      <div className="testimonials-content">
        <div className="testimonials-header fade-in stagger-1">
          <div className="section-tag">
            <span className="tag-number">04</span>
            <span className="tag-line"></span>
            <span className="tag-label">{t.testimonials_tag}</span>
          </div>
          <h2 className="testimonials-title">
            {t.testimonials_title1} <span className="title-accent">{t.testimonials_title2}</span>
          </h2>
          <p className="testimonials-subtitle">{t.testimonials_subtitle}</p>
        </div>

        {testimonials.length > 0 && (
          <div
            className="testimonials-slider fade-in stagger-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="testimonial-cards-wrapper">
              {testimonials.map(function(item, index) {
                var isActive = index === active;
                var prevIndex = (active - 1 + testimonials.length) % testimonials.length;
                var nextIndex = (active + 1) % testimonials.length;
                var isNext = testimonials.length > 1 && index === nextIndex;
                var isPrev = testimonials.length > 1 && index === prevIndex && prevIndex !== nextIndex;

                return (
                  <div
                    key={item.id}
                    className={'testimonial-card' + (isActive ? ' card-active' : '') + (isPrev ? ' card-prev' : '') + (isNext ? ' card-next' : '')}
                    onClick={function() { setActive(index); }}
                  >
                    <div className="testimonial-quote">"</div>
                    <p className="testimonial-message">{item.message}</p>
                    <div className="testimonial-stars">{renderStars(item.rating)}</div>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} loading="lazy" />
                        ) : (
                          <span className="avatar-initials">{item.name.split(' ').map(function(n) { return n[0]; }).join('')}</span>
                        )}
                      </div>
                      <div className="testimonial-author-info">
                        <span className="testimonial-name">{item.name}</span>
                        <span className="testimonial-role">{item.role}{item.company ? ' · ' + item.company : ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="testimonial-dots">
              {testimonials.map(function(item, index) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={'testimonial-dot' + (index === active ? ' dot-active' : '')}
                    onClick={function() { setActive(index); }}
                    aria-label={'Show testimonial ' + (index + 1) + ' of ' + testimonials.length}
                    aria-current={index === active}
                  ></button>
                );
              })}
            </div>
          </div>
        )}

        {testimonials.length === 0 && (
          <p className="testimonials-empty fade-in stagger-2">{t.testimonials_empty}</p>
        )}

        <div className="testimonial-cta fade-in stagger-3">
          <button className="testimonial-submit-btn" ref={triggerBtnRef} onClick={function() { setShowForm(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>{t.testimonials_leave}</span>
          </button>
        </div>
      </div>

      {showForm && createPortal(
        <div className="testimonial-modal-overlay" onClick={function(e) { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="testimonial-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="testimonial-modal-title">
            <div className="modal-header">
              <h3 className="modal-title" id="testimonial-modal-title">{submitted ? t.testimonials_thanks : t.testimonials_leave}</h3>
              <button type="button" className="modal-close" ref={closeBtnRef} onClick={function() { setShowForm(false); }} aria-label="Close">✕</button>
            </div>

            {submitted ? (
              <div className="modal-success" role="status">
                <div className="success-icon">✓</div>
                <p>{t.testimonials_review}</p>
              </div>
            ) : (
              <form className="testimonial-form" onSubmit={handleSubmit}>
                <div className="honeypot-field" aria-hidden="true">
                  <label htmlFor="testimonial-website">Website</label>
                  <input
                    id="testimonial-website"
                    type="text"
                    tabIndex="-1"
                    autoComplete="off"
                    value={form.website}
                    onChange={function(e) { setForm(Object.assign({}, form, { website: e.target.value })); }}
                  />
                </div>
                <div className="tform-field">
                  <label htmlFor="testimonial-name">{t.testimonials_form_name} *</label>
                  <input id="testimonial-name" type="text" value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }} required />
                </div>
                <div className="tform-row">
                  <div className="tform-field">
                    <label htmlFor="testimonial-role">{t.testimonials_form_role}</label>
                    <input id="testimonial-role" type="text" value={form.role} placeholder={t.testimonials_role_placeholder} onChange={function(e) { setForm(Object.assign({}, form, { role: e.target.value })); }} />
                  </div>
                  <div className="tform-field">
                    <label htmlFor="testimonial-company">{t.testimonials_form_company}</label>
                    <input id="testimonial-company" type="text" value={form.company} onChange={function(e) { setForm(Object.assign({}, form, { company: e.target.value })); }} />
                  </div>
                </div>
                <div className="tform-field">
                  <label htmlFor="testimonial-photo">{t.testimonials_form_photo}</label>
                  <div className="tform-photo-row">
                    {form.avatar && <img src={form.avatar} alt="Profile photo preview" className="tform-photo-preview" />}
                    <input id="testimonial-photo" type="file" accept="image/*" className="file-input" onChange={handlePhotoUpload} />
                    {uploading && <span className="tform-uploading">{t.testimonials_uploading}</span>}
                  </div>
                </div>
                <div className="tform-field">
                  <label htmlFor="testimonial-message">{t.testimonials_form_message} *</label>
                  <textarea id="testimonial-message" rows="4" value={form.message} onChange={function(e) { setForm(Object.assign({}, form, { message: e.target.value })); }} required></textarea>
                </div>
                <div className="tform-field">
                  <label id="testimonial-rating-label">{t.testimonials_form_rating}</label>
                  <div className="rating-select" role="group" aria-labelledby="testimonial-rating-label">{renderRatingSelect()}</div>
                </div>
                <label className="tform-consent-row" htmlFor="testimonial-agree">
                  <input
                    id="testimonial-agree"
                    type="checkbox"
                    checked={agreed}
                    onChange={function(e) { setAgreed(e.target.checked); }}
                    required
                  />
                  <span className="tform-privacy-notice">
                    {t.testimonial_notice_pre} <Link to="/terms">{t.terms_link_inline}</Link> {t.testimonial_notice_mid} <Link to="/privacy">{t.privacy_link_inline}</Link>{t.testimonial_notice_post}
                  </span>
                </label>
                {formError === 'send' && <p className="tform-error-msg" role="alert">{t.testimonials_error_send}</p>}
                {formError === 'upload' && <p className="tform-error-msg" role="alert">{t.testimonials_error_upload}</p>}
                <button type="submit" className="tform-submit" disabled={sending || uploading || !agreed}>
                  {sending ? t.testimonials_sending : t.testimonials_submit}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Testimonials;