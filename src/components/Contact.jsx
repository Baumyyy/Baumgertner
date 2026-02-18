import React, { useState } from 'react';
import './Contact.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { api } from '../api';

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
  var sectionRef = useScrollAnimation();

  var handleChange = function(e) {
    var newData = {};
    newData[e.target.name] = e.target.value;
    setFormData(Object.assign({}, formData, newData));
  };

  var handleSubmit = function(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

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
            <span className="tag-number">03</span>
            <span className="tag-line"></span>
            <span className="tag-label">Contact</span>
          </div>

          <h2 className="contact-title">
            Lets build<br />
            something <span className="title-accent">great</span>
          </h2>

          <p className="contact-desc">
            Got a project or idea? Im always open to discussing new opportunities and collaborations.
          </p>

          <div className="info-cards">
            <div className="info-card">
              <div className="info-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 4L12 13L2 4"/>
                </svg>
              </div>
              <div className="info-card-content">
                <span className="info-card-label">Email</span>
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
                <span className="info-card-label">Location</span>
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
                <span className="info-card-label">Timezone</span>
                <span className="info-card-value">EET (UTC +2)</span>
              </div>
            </div>
          </div>

          <div className="contact-socials">
            <div className="contact-social-link" onClick={function() { window.open('https://github.com/baumyyy', '_blank'); }} style={{cursor: 'pointer'}}>
              <i className="fab fa-github"></i>
              <span>GitHub</span>
            </div>
            <div className="contact-social-link" onClick={function() { window.open('https://linkedin.com/in/anthony-baumgertner', '_blank'); }} style={{cursor: 'pointer'}}>
              <i className="fab fa-linkedin"></i>
              <span>LinkedIn</span>
            </div>
            <div className="contact-social-link" onClick={function() { window.open('https://instagram.com/baumgertnerr', '_blank'); }} style={{cursor: 'pointer'}}>
              <i className="fab fa-instagram"></i>
              <span>Instagram</span>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper fade-in stagger-2">
          <div className="form-card">
            <div className="form-card-header">
              <div className={'form-card-dot' + (sent ? ' dot-success' : '')}></div>
              <span className="form-card-title">{sent ? 'Message Sent!' : 'New Message'}</span>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className={'form-field' + (focused === 'name' ? ' focused' : '') + (formData.name ? ' has-value' : '')}>
                <label className="field-label">Name</label>
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
                <label className="field-label">Email</label>
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
                <label className="field-label">Message</label>
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

              <button type="submit" className={'form-send' + (sent ? ' send-success' : '')} disabled={sending}>
                <span className="send-text">{sending ? 'Sending...' : sent ? 'Sent!' : 'Send Message'}</span>
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