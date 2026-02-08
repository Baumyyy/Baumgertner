import React, { useState } from 'react';
import './Contact.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [titleRef, titleVisible] = useScrollAnimation({ threshold: 0.3 });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tähän tulee myöhemmin lomakkeen lähetyslogiikka
    console.log('Form submitted:', formData);
    alert('Message sent! (Demo mode)');
    // Tyhjennä lomake
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <h2 
          ref={titleRef}
          className={`contact-title fade-in ${titleVisible ? 'visible' : ''}`}
        >
          Get In Touch
        </h2>
        <p className="contact-subtitle">
          Have a project in mind? Let's work together!
        </p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Tell me about your project..."
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>

        <div className="contact-info">
          <div className="info-item">
            <i className="fas fa-envelope"></i>
            <span>baumgertnerr@outlook.com</span>
          </div>
          <div className="info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>Turku, Finland</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;