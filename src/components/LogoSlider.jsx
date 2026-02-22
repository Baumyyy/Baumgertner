import React from 'react';
import './LogoSlider.css';
import { useLang } from '../LanguageContext';

var techs = [
  { name: 'React', icon: 'fab fa-react' },
  { name: 'HTML5', icon: 'fab fa-html5' },
  { name: 'CSS3', icon: 'fab fa-css3-alt' },
  { name: 'Node.js', icon: 'fab fa-node-js' },
  { name: 'JavaScript', icon: 'fab fa-js-square' },
  { name: 'npm', icon: 'fab fa-npm' },
  { name: 'Git', icon: 'fab fa-git-alt' },
  { name: 'GitHub', icon: 'fab fa-github' },
  { name: 'Vite', icon: 'fas fa-bolt' },
  { name: 'PostgreSQL', icon: null, svg: true },
  { name: 'Docker', icon: 'fab fa-docker' },
  { name: 'Express', icon: 'fas fa-server' },
  { name: 'Nginx', icon: 'fas fa-shield-alt' },
  { name: 'Linux', icon: 'fab fa-linux' }
];

var PostgresIcon = function() {
  return (
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg" alt="PostgreSQL" className="slider-svg-icon" />
  );
};

var LogoSlider = function() {
  var { t } = useLang();

  var renderRow = function() {
    return (
      <div className="slider-row">
        {techs.map(function(tech, i) {
          return (
            <div className="slider-item" key={i}>
              {tech.svg ? <PostgresIcon /> : <i className={tech.icon}></i>}
              <span>{tech.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="slider-section">
      <div className="slider-header">
        <div className="slider-line"></div>
        <span className="slider-label">{t.slider_label}</span>
        <div className="slider-line slider-line-right"></div>
      </div>

      <div className="slider-wrapper">
        <div className="slider-fade slider-fade-left"></div>
        <div className="slider-fade slider-fade-right"></div>
        <div className="slider-track">
          {renderRow()}
          {renderRow()}
          {renderRow()}
          {renderRow()}
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;