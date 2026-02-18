import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LogoSlider from './components/LogoSlider';
import Projects from './components/Projects';
import Contact from './components/Contact';
import WhatIDo from './components/WhatIDo';
import Footer from './components/Footer';
import Admin from './components/Admin.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={
          <AuroraBackground>
            <Hero />
            <WhatIDo />
            <LogoSlider />
            <Projects />
            <Contact />
            <Footer />
          </AuroraBackground>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;