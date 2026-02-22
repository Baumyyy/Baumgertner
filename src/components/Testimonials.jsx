import React, { useState, useEffect } from 'react';
import './Testimonials.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { api } from '../api';
import { useLang } from '../LanguageContext';

var Testimonials = function() {
  var testimonialsState = useState([]);
  var testimonials = testimonialsState[0];
  var setTestimonials = testimonialsState[1];
  var activeState = useState(0);
  var active = activeState[0];
  var setActive = activeState[1];
  var sectionRef = useScrollAnimation();
  var { t } = useLang();

  useEffect(function() {
    api.getTestimonials().then(function(data) {
      if (Array.isArray(data)) setTestimonials(data);
    }).catch(function() {});
  }, []);

  useEffect(function() {
    if (testimonials.length === 0) return;
    var interval = setInterval(function() {
      setActive(function(prev) { return (prev + 1) % testimonials.length; });
    }, 5000);
    return function() { clearInterval(interval); };
  }, [testimonials]);

  var renderStars = function(rating) {
    var stars = [];
    for (var i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={'testimonial-star' + (i < rating ? ' star-filled' : '')}>★</span>
      );
    }
    return stars;
  };

  return (
    <section id="testimonials" className="testimonials" ref={sectionRef}>
      <div className="testimonials-content">
        <div className="testimonials-header fade-in stagger-1">
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

        <div className="testimonials-slider fade-in stagger-2">
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
      </div>
    </section>
  );
};

export default Testimonials;