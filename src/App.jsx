import React from 'react';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LogoSlider from './components/LogoSlider';
import Projects from './components/Projects';
import Contact from './Components/Contact';
import WhatIDo from './components/WhatIDo.jsx';
import Footer from './components/Footer.jsx';
import './App.css'; 

function App() {
  return (
    <AuroraBackground>
      <Hero />
      <WhatIDo />
      <LogoSlider />
      <Projects />
      <Contact />
      <Footer />
    </AuroraBackground>
  );
}

export default App;