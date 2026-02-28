import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

var LoadingScreen = function({ onFinished }) {
  var progressState = useState(0);
  var progress = progressState[0];
  var setProgress = progressState[1];
  var fadingState = useState(false);
  var fading = fadingState[0];
  var setFading = fadingState[1];

  useEffect(function() {
    var interval = setInterval(function() {
      setProgress(function(prev) {
        if (prev >= 100) {
          clearInterval(interval);
          setFading(true);
          setTimeout(function() { onFinished(); }, 600);
          return 100;
        }
        var increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return function() { clearInterval(interval); };
  }, []);

  return (
    <div className={'loading-screen' + (fading ? ' loading-fade' : '')}>
      <div className="loading-content">
        <div className="loading-logo">
          <img src="/logo.png" alt="Baumgertner" className="loading-logo-img" />
        </div>
        <div className="loading-bar-wrapper">
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: Math.round(progress) + '%' }}></div>
          </div>
          <span className="loading-percent">{Math.round(progress)}%</span>
        </div>
        <p className="loading-text">
          {progress < 30 ? 'Initializing...' : progress < 60 ? 'Loading assets...' : progress < 90 ? 'Almost ready...' : 'Welcome!'}
        </p>
      </div>

      <div className="loading-particles">
        <div className="loading-particle lp1"></div>
        <div className="loading-particle lp2"></div>
        <div className="loading-particle lp3"></div>
        <div className="loading-particle lp4"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;