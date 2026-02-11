import React from 'react';
import './LogoSlider.css';

const technologies = [
  { icon: 'fab fa-react', name: 'React' },
  { icon: 'fab fa-html5', name: 'HTML5' },
  { icon: 'fab fa-css3-alt', name: 'CSS3' },
  { icon: 'fab fa-node-js', name: 'Node.js' },
  { icon: 'fab fa-js-square', name: 'JavaScript' },
  { icon: 'fab fa-npm', name: 'npm' },
  { icon: 'fab fa-git-alt', name: 'Git' },
  { icon: 'fab fa-github', name: 'GitHub' },
];

const LogoSlider = () => {
  return (
    <div className="slider-section">
      <div className="slider-header">
        <span className="slider-line"></span>
        <span className="slider-label">Tech Stack</span>
        <span className="slider-line slider-line-right"></span>
      </div>

      <div className="slider-wrapper">
        <div className="slider-fade slider-fade-left"></div>
        <div className="slider-fade slider-fade-right"></div>

        <div className="slider-track">
          <div className="slider-row">
            {technologies.map(function(tech, i) {
              return (
                <div className="slider-item" key={'a' + i}>
                  <i className={tech.icon}></i>
                  <span>{tech.name}</span>
                </div>
              );
            })}
          </div>
          <div className="slider-row">
            {technologies.map(function(tech, i) {
              return (
                <div className="slider-item" key={'b' + i}>
                  <i className={tech.icon}></i>
                  <span>{tech.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;