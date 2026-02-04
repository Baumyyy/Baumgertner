import React from 'react';
import './AuroraBackground.css';

const AuroraBackground = ({ children }) => {
  return (
    <div className="aurora-container">
      <div className="aurora">
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
      </div>
      {children}
    </div>
  );
};

export default AuroraBackground;