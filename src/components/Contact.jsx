import React, { useState } from 'react';
import './Contact.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { api } from '../api';
import { useLang } from '../LanguageContext';

var Contact = function() {
  var focusedState = useState('');
  var focused = focusedState[0];
  var setFocused = focusedState[1];
  var formDataState = useState({ name: '', email: '', message: '' });
  var formData = formDataState[0];
  var setFormData = formDataState[1];
  var sendingState = useState(false);
  var sending = sendingState[0];
  var setSending = sendingState[1];
  var sentState = useState(false);
  var sent = sentState[0];
  var setSent = sentState[1];
  var formErrorState = useState('');
  var formError = formErrorState[0];
  var setFormError = formErrorState[1];
  var sectionRef = useScrollAnimation();
  var { t } = useLang();

  var handleChange = function(e) {
    var newData = {};
    newData[e.target.name] = e.target.value;
    setFormData(Object.assign({}, formData, newData));
    if (formError) setFormError('');
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('required');
      return;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('email');
      return;
    }
    setFormError('');

    setSending(true);
    api.sendMessage(formData).then(function() {
      setSending(false);
      setSent(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(function() { setSent(false); }, 4000);
    }).catch(function() {
      setSending(false);
      alert('Failed to send message. Please try again.');
    });
  };

  return (
    <section id="contact" className="contact" ref={sectionRef}>
      <div className="contact-bg-accent"></div>

      <div className="contact-content">
        <div className="contact-info fade-in stagger-1">
          <div className="section-tag">
            <span className="tag-number">05</span>
            <span className="tag-line"></span>
            <span className="tag-label">{t.contact_tag}</span>
          </div>

          <h2 className="contact-title">
            {t.contact_title1}<br />
            {t.contact_title2} <span className="title-accent">{t.contact_title3}</span>
          </h2>

          <p className="contact-desc">{t.contact_desc}</p>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 4L12 13L2 4"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">{t.contact_email}</span>
                <span className="info-card-value">baumgertnerr@outlook.com</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">{t.contact_location}</span>
                <span className="info-card-value">Turku, Finland</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">{t.contact_timezone}</span>
                <span className="info-card-value">EET (UTC +2)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper fade-in stagger-2">
          <div className="form-card">
            <div className="form-card-header">
              <div className={'form-card-dot' + (sent ? ' dot-success' : '')}></div>
              <span className="form-card-title">{sent ? t.contact_message_sent : t.contact_new_message}</span>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className={'form-field' + (focused === 'name' ? ' focused' : '') + (formData.name ? ' has-value' : '')}>
                <label className="field-label">{t.contact_name}</label>
                <input
                  type="text"
                  name="name"
                  className="field-input"
                  onFocus={function() { setFocused('name'); }}
                  onBlur={function() { setFocused(''); }}
                  onChange={handleChange}
                  value={formData.name}
                />
                <div className="field-line"></div>
              </div>

              <div className={'form-field' + (focused === 'email' ? ' focused' : '') + (formData.email ? ' has-value' : '')}>
                <label className="field-label">{t.contact_email_field}</label>
                <input
                  type="email"
                  name="email"
                  className="field-input"
                  onFocus={function() { setFocused('email'); }}
                  onBlur={function() { setFocused(''); }}
                  onChange={handleChange}
                  value={formData.email}
                />
                <div className="field-line"></div>
              </div>

              <div className={'form-field' + (focused === 'message' ? ' focused' : '') + (formData.message ? ' has-value' : '')}>
                <label className="field-label">{t.contact_message}</label>
                <textarea
                  name="message"
                  className="field-input field-textarea"
                  rows="4"
                  onFocus={function() { setFocused('message'); }}
                  onBlur={function() { setFocused(''); }}
                  onChange={handleChange}
                  value={formData.message}
                ></textarea>
                <div className="field-line"></div>
              </div>

              {formError === 'required' && <p className="field-error-msg">{t.contact_error_required}</p>}
              {formError === 'email' && <p className="field-error-msg">{t.contact_error_email}</p>}

              <button type="submit" className={'form-send' + (sent ? ' send-success' : '')} disabled={sending}>
                <span className="send-text">{sending ? t.contact_sending : sent ? t.contact_sent : t.contact_send}</span>
                <span className="send-icon">
                  {sent ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                    </svg>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;