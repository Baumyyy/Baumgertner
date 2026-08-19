import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import CustomCursor from './components/CustomCursor.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { useLang } from './useLang';
import { useHomeSeo } from './hooks/useHomeSeo';
import AuroraBackground from './components/AuroraBackground';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

const WhatIDo      = lazy(() => import('./components/WhatIDo'));
const Projects     = lazy(() => import('./components/Projects'));
const Testimonials = lazy(() => import('./components/Testimonials.jsx'));
const Contact      = lazy(() => import('./components/Contact'));
const Footer       = lazy(() => import('./components/Footer'));
const Admin        = lazy(() => import('./components/Admin'));
const NotFound     = lazy(() => import('./components/NotFound'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));

// "/" carries no language of its own, so search engines have exactly one
// canonical URL per language (/en, /fi) to index instead of duplicate
// content under both "/" and a language path. Real visitors only ever see
// this for a moment - it redirects before paint. English is always the
// default here regardless of the visitor's browser language - Google
// still serves /fi to Finnish searchers via the hreflang tags in the
// sitemap and page head, which is independent of this redirect.
function RootRedirect() {
  return <Navigate to="/en" replace />;
}

function HomePage({ ready }) {
  var lang = useLang().lang;
  useHomeSeo(lang);

  return (
    <AuroraBackground>
      <Hero ready={ready} />
      <WhatIDo />
      <Projects />
      <Testimonials />
      <Contact />
      <Footer />
    </AuroraBackground>
  );
}

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

  var handleLoadingFinished = useCallback(function() { setLoading(false); }, [setLoading]);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <a href="#home" className="skip-link">Skip to main content</a>
        <CustomCursor />
        {loading && <LoadingScreen onFinished={handleLoadingFinished} />}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/baumi-dashboard" element={<Admin />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/" element={<RootRedirect />} />
              <Route path="/en" element={<HomePage ready={!loading} />} />
              <Route path="/fi" element={<HomePage ready={!loading} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
