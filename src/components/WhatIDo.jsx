import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './WhatIDo.css';

const WhatIDo = () => {
  const [titleRef, titleVisible] = useScrollAnimation({ threshold: 0.3 });

  const services = [
  {
    id: 1,
    icon: 'fas fa-code',
    title: 'Frontend Development',
    description: 'Building responsive and interactive user interfaces with React, HTML, CSS, and JavaScript.',
    link: null
  },
  {
    id: 2,
    icon: 'fas fa-project-diagram',
    title: 'Project Management',
    description: 'Leading projects from conception to deployment with agile methodologies and clear communication.',
    link: null
  },
  {
    id: 4,
    icon: 'fas fa-graduation-cap',
    title: 'Continuous Learning',
    description: 'Currently studying software engineering while actively building real-world projects and expanding my skill set.',
    link: null
  },
  {
    id: 3,
    icon: 'fab fa-linkedin',
    title: 'Professional Network',
    description: 'See more on LinkedIn to explore collaboration opportunities and stay updated on my professional journey.',
    link: 'https://linkedin.com/in/anthony-baumgertner'
  },
  
];

  return (
    <section id="what-i-do" className="what-i-do-section">
      <div className="what-i-do-container">
        <h2 
          ref={titleRef}
          className={`section-title fade-in ${titleVisible ? 'visible' : ''}`}
        >
          What I Do
        </h2>
        <p className="section-subtitle">
          Services & Expertise
        </p>

        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ service, index }) => {
  const [cardRef, cardVisible] = useScrollAnimation({ threshold: 0.2 });

  const CardContent = (
    <>
      <div className="service-icon">
        <i className={service.icon}></i>
      </div>
      <h3 className="service-title">{service.title}</h3>
      <p className="service-description">{service.description}</p>
      {service.link && (
        <div className="service-link">
          <i className="fas fa-arrow-right"></i>
          <span>See more</span>
        </div>
      )}
    </>
  );

  return service.link ? (
  <a
    href={service.link}
    target="_blank"
    rel="noopener noreferrer"
    ref={cardRef}
    className={`service-card fade-in-up fade-in-delay-${(index % 4) + 1} ${cardVisible ? 'visible' : ''}`}
  >
    {CardContent}
  </a>
) : (
  <div
    ref={cardRef}
    className={`service-card fade-in-up fade-in-delay-${(index % 4) + 1} ${cardVisible ? 'visible' : ''}`}
  >
    {CardContent}
  </div>
);
};

export default WhatIDo;