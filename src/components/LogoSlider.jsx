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
  { name: 'Vite', icon: 'fas fa-bolt' }
];

var LogoSlider = function() {
  var { t } = useLang();

  var renderRow = function() {
    return (
      <div className="slider-row">
        {techs.map(function(tech, i) {
          return (
            <div className="slider-item" key={i}>
              <i className={tech.icon}></i>
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