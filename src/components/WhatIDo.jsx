import React, { useState } from 'react';
import './WhatIDo.css';

const services = [
  {
    number: '01',
    title: 'Frontend Development',
    description: 'Learning to build responsive web applications with React and modern JavaScript. Passionate about creating clean, user-friendly interfaces and improving every day.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    )
  },
  {
    number: '02',
    title: 'Project Management',
    description: 'Solid experience in leading teams, organizing workflows and driving projects from concept to completion. Skilled in agile methodologies, stakeholder communication and keeping cross-functional teams aligned.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    )
  },
  {
    number: '03',
    title: 'Continuous Learning',
    description: 'Currently studying Software Engineering and Project Management at Turku University of Applied Sciences. Deepening my skills through hands-on projects, coursework and real-world experience.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    )
  },

];

const WhatIDo = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

return (
    <section id="whatido" className="whatido">
      <div className="whatido-content">
        <div className="whatido-header">
          <div className="section-tag">
            <span className="tag-number">02</span>
            <span className="tag-line"></span>
            <span className="tag-label">Services</span>
          </div>
          <h2 className="whatido-title">
            What I <span className="title-accent">Do</span>
          </h2>
          <p className="whatido-subtitle">
            A mix of technical skills, leadership and a hunger to keep growing.
          </p>
        </div>

        <div className="services-grid">
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
            <h3 className="card-title">Professional Journey</h3>
            <p className="card-desc">
              Follow my career growth, projects and milestones. Lets connect and grow together in the tech industry.
            </p>
            <div className="journey-linkedin-btn">
              <i className="fab fa-linkedin"></i>
              <span>Connect on LinkedIn</span>
            </div>
            <div className="card-border-glow journey-glow-border"></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhatIDo;