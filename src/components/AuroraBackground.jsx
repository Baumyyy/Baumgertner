import React, { useEffect, useState } from 'react';
import './AuroraBackground.css';

const AuroraBackground = ({ children }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const container = document.querySelector('.aurora-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="aurora-container">
      <div 
        className="aurora" 
        style={{ 
          transform: `translateY(${scrollY * 0.5}px)` 
        }}
      >
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
        <div className="aurora__item"></div>
      </div>
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default AuroraBackground;