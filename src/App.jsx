import React from 'react';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LogoSlider from './components/LogoSlider';
import Contact from './Components/Contact';
import './App.css';

function App() {
  return (
    <AuroraBackground>
      <Hero />
      <LogoSlider />
      <Contact />
    </AuroraBackground>
  );
}

export default App;