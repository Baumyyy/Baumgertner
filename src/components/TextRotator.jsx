import React, { useState, useEffect } from 'react';
import './TextRotator.css';

const TextRotator = () => {
  const roles = [
    'Student Software Engineer',
    'Project Manager',
    'Beginner Frontend Developer',
    
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % roles.length);
        setIsAnimating(false);
      }, 350); // Blur kestää 350ms
      
    }, 3000); // Vaihda 3 sekunnin välein

    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <div className="text-rotator">
      <h1 className={`rotator-text ${isAnimating ? 'blur-out' : 'blur-in'}`}>
        {roles[currentIndex]}
      </h1>
    </div>
  );
};

export default TextRotator;