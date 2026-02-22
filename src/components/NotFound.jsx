import React from 'react';
import { useLang } from '../LanguageContext';

var NotFound = function() {
  var { t } = useLang();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050a14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: 'clamp(6rem, 20vw, 12rem)',
        fontFamily: "'Bebas Neue', sans-serif",
        background: 'linear-gradient(135deg, #00ff88, #00bb66)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        margin: 0
      }}>404</h1>
      <p style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '1.1rem',
        maxWidth: '400px'
      }}>{t.notfound_text || 'The page you are looking for does not exist or has been moved.'}</p>
      <a href="/" style={{
        padding: '0.8rem 2rem',
        background: 'rgba(0,255,136,0.15)',
        border: '1px solid rgba(0,255,136,0.3)',
        borderRadius: '8px',
        color: '#00ff88',
        textDecoration: 'none',
        fontFamily: "'Bebas Neue', sans-serif",
        letterSpacing: '0.1em',
        fontSize: '1rem',
        transition: 'all 0.3s ease'
      }}>{t.notfound_home || 'Back to Home'}</a>
    </div>
  );
};

export default NotFound;