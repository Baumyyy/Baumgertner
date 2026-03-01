import { useState, useEffect, lazy, Suspense } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

const WhatIDo      = lazy(() => import('./components/WhatIDo'));
const LogoSlider   = lazy(() => import('./components/LogoSlider'));
const Projects     = lazy(() => import('./components/Projects'));
const Testimonials = lazy(() => import('./components/Testimonials.jsx'));
const Contact      = lazy(() => import('./components/Contact'));
const Footer       = lazy(() => import('./components/Footer'));
const Admin        = lazy(() => import('./components/Admin'));
const NotFound     = lazy(() => import('./components/NotFound'));

function App() {
  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  useEffect(function() {
    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: window.location.pathname })
    }).catch(function() {});
  }, []);

  return (
    <LanguageProvider>
      <a href="#home" className="skip-link">Skip to main content</a>
      <CustomCursor />
      {loading && <LoadingScreen onFinished={function() { setLoading(false); }} />}
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/baumi-dashboard" element={<Admin />} />
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
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
