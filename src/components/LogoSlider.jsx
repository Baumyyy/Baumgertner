import React from 'react';
import './LogoSlider.css';

const LogoSlider = () => {
  const logos = [
    { name: 'Git', icon: 'fab fa-git-alt' },
    { name: 'GitHub', icon: 'fab fa-github' },
    { name: 'React', icon: 'fab fa-react' },
    { name: 'JavaScript', icon: 'fab fa-js' },
    { name: 'HTML5', icon: 'fab fa-html5' },
    { name: 'CSS3', icon: 'fab fa-css3-alt' },
    { name: 'Node.js', icon: 'fab fa-node-js' },
  ];

  return (
    <div className="logo-slider-container">
        <h2 className="slider-title">My Stack:</h2>
         <div className="logo-slider">
        <div className="logo-track">
          {/* Ensimmäinen setti */}
          {logos.map((logo, index) => (
            <div key={`logo-1-${index}`} className="logo-item">
              <i className={logo.icon}></i>
              <span>{logo.name}</span>
            </div>
          ))}
          {/* Toinen setti (duplikaatti saumattomaan looppiin) */}
          {logos.map((logo, index) => (
            <div key={`logo-2-${index}`} className="logo-item">
              <i className={logo.icon}></i>
              <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;