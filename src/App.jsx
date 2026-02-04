import React from 'react';
import AuroraBackground from './components/AuroraBackground';
import './App.css';

function App() {
  return (
    <AuroraBackground>
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        color: 'white', 
        padding: '100px 50px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>Anthony Baumgertner</h1>
        <p style={{ fontSize: '1.5rem' }}>Software Engineer & Project Manager</p>
      </div>
    </AuroraBackground>
  );
}

export default App;