import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [focused, setFocused] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-bg-accent"></div>

      <div className="contact-content">
        {/* Left side - Info */}
        <div className="contact-info">
          <div className="section-tag">
            <span className="tag-number">04</span>
            <span className="tag-line"></span>
            <span className="tag-label">Contact</span>
          </div>

          <h2 className="contact-title">
            Let's build<br />
            something <span className="title-accent">great</span>
          </h2>

          <p className="contact-desc">
            Got a project or idea? I'm always open to discussing new opportunities and collaborations.
          </p>

          {/* Contact cards */}
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
        </div>

        {/* Right side - Form */}
        <div className="contact-form-wrapper">
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-dot"></div>
              <span className="form-card-title">New Message</span>
            </div>

            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className={`form-field ${focused === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''}`}>
                <label className="field-label">Name</label>
                <input 
                  type="text" 
                  name="name"
                  className="field-input" 
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  onChange={handleChange}
                  value={formData.name}
                />
                <div className="field-line"></div>
              </div>

              <div className={`form-field ${focused === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                <label className="field-label">Email</label>
                <input 
                  type="email"
                  name="email" 
                  className="field-input" 
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  onChange={handleChange}
                  value={formData.email}
                />
                <div className="field-line"></div>
              </div>

              <div className={`form-field ${focused === 'message' ? 'focused' : ''} ${formData.message ? 'has-value' : ''}`}>
                <label className="field-label">Message</label>
                <textarea 
                  name="message"
                  className="field-input field-textarea" 
                  rows="4"
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                  onChange={handleChange}
                  value={formData.message}
                ></textarea>
                <div className="field-line"></div>
              </div>

              <button type="submit" className="form-send">
                <span className="send-text">Send Message</span>
                <span className="send-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                  </svg>
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