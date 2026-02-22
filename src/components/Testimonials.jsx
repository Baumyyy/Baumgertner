import React, { useState, useEffect } from 'react';
import './Testimonials.css';
import { api } from '../api';
import { useLang } from '../LanguageContext';

var Testimonials = function() {
  var testimonialsState = useState([]);
  var testimonials = testimonialsState[0];
  var setTestimonials = testimonialsState[1];
  var activeState = useState(0);
  var active = activeState[0];
  var setActive = activeState[1];
  var showFormState = useState(false);
  var showForm = showFormState[0];
  var setShowForm = showFormState[1];
  var formState = useState({ name: '', role: '', company: '', message: '', rating: 5 });
  var form = formState[0];
  var setForm = formState[1];
  var submittedState = useState(false);
  var submitted = submittedState[0];
  var setSubmitted = submittedState[1];
  var sendingState = useState(false);
  var sending = sendingState[0];
  var setSending = sendingState[1];
  var { t } = useLang();

  useEffect(function() {
    api.getTestimonials().then(function(data) {
      console.log('Testimonials loaded:', data);
      if (Array.isArray(data)) setTestimonials(data);
    }).catch(function(err) { console.log('Testimonials error:', err); });
  }, []);

  useEffect(function() {
    if (testimonials.length === 0) return;
    var interval = setInterval(function() {
      setActive(function(prev) { return (prev + 1) % testimonials.length; });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [testimonials]);

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setSending(true);
    fetch('/api/testimonials/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    }).then(function(r) { return r.json(); }).then(function() {
      setSending(false);
      setSubmitted(true);
      setForm({ name: '', role: '', company: '', message: '', rating: 5 });
      setTimeout(function() { setSubmitted(false); setShowForm(false); }, 3000);
    }).catch(function() { setSending(false); });
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
          <span
            key={val}
            className={'rating-star' + (val <= form.rating ? ' rating-active' : '')}
            onClick={function() { setForm(Object.assign({}, form, { rating: val })); }}
          >★</span>
        );
      })(i);
    }
    return stars;
  };

  return (
    <section id="testimonials" className="testimonials">
      <div className="testimonials-content">
        <div className="testimonials-header">
          <div className="section-tag">
            <span className="tag-number">03</span>
            <span className="tag-line"></span>
            <span className="tag-label">{t.testimonials_tag || 'Testimonials'}</span>
          </div>
          <h2 className="testimonials-title">
            {t.testimonials_title1 || 'What People'} <span className="title-accent">{t.testimonials_title2 || 'Say'}</span>
          </h2>
          <p className="testimonials-subtitle">{t.testimonials_subtitle || 'Feedback from people I have worked with'}</p>
        </div>

        {testimonials.length > 0 && (
          <div className="testimonials-slider">
            <div className="testimonial-cards-wrapper">
              {testimonials.map(function(item, index) {
                var isActive = index === active;
                var isPrev = index === (active - 1 + testimonials.length) % testimonials.length;
                var isNext = index === (active + 1) % testimonials.length;

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
                          <img src={item.avatar} alt={item.name} />
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
                  <span
                    key={item.id}
                    className={'testimonial-dot' + (index === active ? ' dot-active' : '')}
                    onClick={function() { setActive(index); }}
                  ></span>
                );
              })}
            </div>
          </div>
        )}

        {testimonials.length === 0 && (
          <p style={{color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '2rem'}}>No testimonials yet</p>
        )}

        <div className="testimonial-cta">
          <button className="testimonial-submit-btn" onClick={function() { setShowForm(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>{t.testimonials_leave || 'Leave a Testimonial'}</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="testimonial-modal-overlay" onClick={function(e) { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="testimonial-modal">
            <div className="modal-header">
              <h3 className="modal-title">{submitted ? (t.testimonials_thanks || 'Thank You!') : (t.testimonials_leave || 'Leave a Testimonial')}</h3>
              <span className="modal-close" onClick={function() { setShowForm(false); }}>✕</span>
            </div>

            {submitted ? (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <p>{t.testimonials_review || 'Your testimonial will be reviewed and published soon!'}</p>
              </div>
            ) : (
              <form className="testimonial-form" onSubmit={handleSubmit}>
                <div className="tform-field">
                  <label>{t.testimonials_form_name || 'Name'} *</label>
                  <input type="text" value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }} required />
                </div>
                <div className="tform-row">
                  <div className="tform-field">
                    <label>{t.testimonials_form_role || 'Role'}</label>
                    <input type="text" value={form.role} placeholder="e.g. CEO, Developer" onChange={function(e) { setForm(Object.assign({}, form, { role: e.target.value })); }} />
                  </div>
                  <div className="tform-field">
                    <label>{t.testimonials_form_company || 'Company'}</label>
                    <input type="text" value={form.company} onChange={function(e) { setForm(Object.assign({}, form, { company: e.target.value })); }} />
                  </div>
                </div>
                <div className="tform-field">
                  <label>{t.testimonials_form_message || 'Your Feedback'} *</label>
                  <textarea rows="4" value={form.message} onChange={function(e) { setForm(Object.assign({}, form, { message: e.target.value })); }} required></textarea>
                </div>
                <div className="tform-field">
                  <label>{t.testimonials_form_rating || 'Rating'}</label>
                  <div className="rating-select">{renderRatingSelect()}</div>
                </div>
                <button type="submit" className="tform-submit" disabled={sending}>
                  {sending ? (t.testimonials_sending || 'Sending...') : (t.testimonials_submit || 'Submit Testimonial')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;