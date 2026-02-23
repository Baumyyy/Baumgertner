import React, { useState } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import NotFound from './components/NotFound';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LogoSlider from './components/LogoSlider';
import Projects from './components/Projects';
import Testimonials from './components/Testimonials.jsx';
import Contact from './components/Contact';
import WhatIDo from './components/WhatIDo';
import Footer from './components/Footer';
import Admin from './components/Admin';
import LoadingScreen from './components/LoadingScreen.jsx';
import './App.css';

function App() {
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  return (
    <LanguageProvider>
      <CustomCursor />
      {loading && <LoadingScreen onFinished={function() { setLoading(false); }} />}
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={
            <AuroraBackground>
              <Hero />
              <WhatIDo />
              <LogoSlider />
              <Projects />
              <Testimonials />
              <Contact />
              <Footer />
            </AuroraBackground>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;