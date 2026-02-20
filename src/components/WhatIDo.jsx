import React, { useState } from 'react';
import './WhatIDo.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useLang } from '../LanguageContext';

var WhatIDo = function() {
  var hoveredCardState = useState(null);
  var hoveredCard = hoveredCardState[0];
  var setHoveredCard = hoveredCardState[1];
  var sectionRef = useScrollAnimation();
  var { t } = useLang();

  var services = [
    {
      number: '01',
      title: t.whatido_s1_title,
      description: t.whatido_s1_desc,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    },
    {
      number: '02',
      title: t.whatido_s2_title,
      description: t.whatido_s2_desc,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    {
      number: '03',
      title: t.whatido_s3_title,
      description: t.whatido_s3_desc,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      )
    }
  ];

  return (
    <section id="whatido" className="whatido" ref={sectionRef}>
      <div className="whatido-content">
        <div className="whatido-header fade-in stagger-1">
          <div className="section-tag">
            <span className="tag-number">02</span>
            <span className="tag-line"></span>
            <span className="tag-label">{t.whatido_tag}</span>
          </div>
          <h2 className="whatido-title">
            {t.whatido_title1} <span className="title-accent">{t.whatido_title2}</span>
          </h2>
          <p className="whatido-subtitle">{t.whatido_subtitle}</p>
        </div>

        <div className="services-grid fade-in stagger-2">
          {services.map(function(service, index) {
            return (
              <div
                key={index}
                className={'service-card' + (hoveredCard === index ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== index ? ' dimmed' : '')}
                onMouseEnter={function() { setHoveredCard(index); }}
                onMouseLeave={function() { setHoveredCard(null); }}
              >
                <div className="card-top">
                  <span className="card-number">{service.number}</span>
                  <div className="card-icon">{service.icon}</div>
                </div>
                <h3 className="card-title">{service.title}</h3>
                <p className="card-desc">{service.description}</p>
                <div className="card-border-glow"></div>
              </div>
            );
          })}

          <div
            className={'service-card journey-card' + (hoveredCard === 'journey' ? ' hovered' : '') + (hoveredCard !== null && hoveredCard !== 'journey' ? ' dimmed' : '')}
            onMouseEnter={function() { setHoveredCard('journey'); }}
            onMouseLeave={function() { setHoveredCard(null); }}
            onClick={function() { window.open('https://linkedin.com/in/anthony-baumgertner', '_blank'); }}
            style={{cursor: 'pointer'}}
          >
            <div className="card-top">
              <span className="card-number">04</span>
              <div className="card-icon card-icon-linkedin">
                <i className="fab fa-linkedin"></i>
              </div>
            </div>
            <h3 className="card-title">{t.whatido_journey}</h3>
            <p className="card-desc">{t.whatido_journey_desc}</p>
            <div className="journey-linkedin-btn">
              <i className="fab fa-linkedin"></i>
              <span>{t.whatido_connect}</span>
            </div>
            <div className="card-border-glow journey-glow-border"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIDo;