import React from 'react';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LogoSlider from './components/LogoSlider';
import './App.css';

function App() {
  return (
    <AuroraBackground>
      <Hero />
      <LogoSlider />
    </AuroraBackground>
  );
}

export default App;