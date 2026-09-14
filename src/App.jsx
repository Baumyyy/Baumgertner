import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './LanguageContext';
import { ContactPanelProvider } from './ContactPanelProvider';
import { useLang } from './useLang';
import { useHomeSeo } from './hooks/useHomeSeo';
import AuroraBackground, { BackdropGlow } from './components/AuroraBackground';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';

const Problem      = lazy(() => import('./components/Problem'));
const Services     = lazy(() => import('./components/Services'));
const Projects     = lazy(() => import('./components/Projects'));
const About        = lazy(() => import('./components/About'));
const Footer       = lazy(() => import('./components/Footer'));
const Admin        = lazy(() => import('./components/Admin'));
const NotFound     = lazy(() => import('./components/NotFound'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const ContactPanel = lazy(() => import('./components/ContactPanel'));

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

      {/* Everything after the hero travels as one sheet, because that is
          what it is on screen: the hero stays where it is and the rest of
          the page arrives over the top of it. One wrapper rather than a
          background on each section - the sheet needs a single unbroken
          surface and a single edge, and five separately painted sections
          would give it neither. */}
      <div className="page-sheet">
        {/* Sticky rather than fixed, which is the whole point: it holds
            still against the viewport like the layer it replaces, but it
            cannot leave the sheet, so it never reaches the hero the sheet
            is covering. */}
        <BackdropGlow className="page-sheet-glow" />

        <Problem />
        <Services />
        <Projects />
        <About />
        <Footer />
      </div>
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
        <ContactPanelProvider>
          <a href="#home" className="skip-link">Skip to main content</a>
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

              {/* Outside the router: the panel opens from every page, and
                  it is position:fixed so it must not sit inside the
                  scroll container. */}
              <ContactPanel />
            </Suspense>
          </ErrorBoundary>
        </ContactPanelProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
