import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Admin.css';
import { usePageMeta } from '../hooks/usePageMeta';
import { GithubIcon } from './Icons';
import { Wordmark } from './BrandMark';
import TrafficChart from './TrafficChart';
import './TrafficChart.css';

var API_URL = '/api';

// What to show of a message in a three-line preview.
//
// The contact form folds the quiz answers into the top of the message
// body as their own lines, with a blank line before whatever the person
// actually wrote. At 100 characters from the start, the preview was all
// "Services: ... Stage: ..." and none of their words - the one part
// worth reading at a glance. So the preview starts after the blank line
// when there is one, and falls back to the whole thing when the message
// is only answers.
var PREVIEW_MAX = 120;
function esikatselu(viesti) {
  if (!viesti) return '';
  var raja = viesti.indexOf('\n\n');
  var omat = raja >= 0 ? viesti.slice(raja + 2).trim() : viesti;
  var nayta = omat || viesti;
  return nayta.length > PREVIEW_MAX ? nayta.slice(0, PREVIEW_MAX) + '…' : nayta;
}

var Admin = function() {
  usePageMeta('Admin | Anthony Baumgertner', 'Admin dashboard.');

  var authState = useState(null);
  var authStatus = authState[0];
  var setAuthStatus = authState[1];
  var loggedInState = useState(false);
  var loggedIn = loggedInState[0];
  var setLoggedIn = loggedInState[1];
  var tabState = useState('dashboard');
  var tab = tabState[0];
  var setTab = tabState[1];
  var statsState = useState({});
  var stats = statsState[0];
  var setStats = statsState[1];
  var pageviewsState = useState({ today: 0, week: 0, month: 0, total: 0, perDay: [], topPages: [] });
  var pageviews = pageviewsState[0];
  var setPageviews = pageviewsState[1];
  var messagesState = useState([]);
  var messages = messagesState[0];
  var setMessages = messagesState[1];
  var toastState = useState(null);
  var toast = toastState[0];
  var setToast = toastState[1];
  var toastTimeoutRef = useRef(null);
  var securityState = useState({ last24hCount: 0, topIps: [], recent: [] });
  var security = securityState[0];
  var setSecurity = securityState[1];

  useEffect(function() {
    fetch(API_URL + '/auth/me', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.authenticated) {
          setAuthStatus(data.user);
          setLoggedIn(true);
        }
      })
      .catch(function() {});
  }, [setAuthStatus, setLoggedIn]);

  var fetchAuth = useCallback(function(url, options) {
    var opts = Object.assign({ credentials: 'include', headers: { 'Content-Type': 'application/json' } }, options || {});
    return fetch(url, opts);
  }, []);

  // Auto-dismisses after 4s; a new toast replaces whatever's showing rather
  // than queuing, since there's only ever one notification area.
  var showToast = useCallback(function(type, message) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type: type, message: message });
    toastTimeoutRef.current = setTimeout(function() { setToast(null); }, 4000);
  }, [setToast]);

  useEffect(function() {
    return function() {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  var alertIfFailed = function(r) {
    if (!r.ok) {
      showToast('error', 'Something went wrong. Please try again.');
      return true;
    }
    return false;
  };

  var parseOk = function(r) {
    return r.ok ? r.json() : Promise.reject(new Error('Request failed'));
  };

  var loadStats = useCallback(function() {
    fetchAuth(API_URL + '/admin/stats').then(parseOk).then(setStats).catch(function() { showToast('error', 'Failed to load stats.'); });
  }, [fetchAuth, setStats, showToast]);

  var loadPageviews = useCallback(function() {
    fetchAuth(API_URL + '/admin/pageviews').then(parseOk).then(setPageviews).catch(function() { showToast('error', 'Failed to load pageviews.'); });
  }, [fetchAuth, setPageviews, showToast]);

  var loadMessages = useCallback(function() {
    fetchAuth(API_URL + '/messages').then(parseOk).then(setMessages).catch(function() { showToast('error', 'Failed to load messages.'); });
  }, [fetchAuth, setMessages, showToast]);

  var loadSecurity = useCallback(function() {
    fetchAuth(API_URL + '/admin/security').then(parseOk).then(setSecurity).catch(function() { showToast('error', 'Failed to load security data.'); });
  }, [fetchAuth, setSecurity, showToast]);

  // Switching tabs only needs that tab's own data - loading all 8 endpoints
  // on every click let a handful of tab clicks burn through the rate limit.
  useEffect(function() {
    if (!loggedIn) return;
    if (tab === 'dashboard') { loadStats(); loadPageviews(); loadSecurity(); }
    else if (tab === 'messages') loadMessages();
    else if (tab === 'security') loadSecurity();
  }, [loggedIn, tab, loadStats, loadPageviews, loadMessages, loadSecurity]);

  var handleLogout = function() {
    fetch(API_URL + '/auth/logout', { method: 'POST', credentials: 'include' }).finally(function() {
      setLoggedIn(false);
      setAuthStatus(null);
    });
  };

  var markRead = function(id) {
    fetchAuth(API_URL + '/messages/' + id + '/read', { method: 'PUT' })
      .then(function(r) { if (alertIfFailed(r)) return; loadStats(); loadMessages(); });
  };

  var deleteMessage = function(id) {
    fetchAuth(API_URL + '/messages/' + id, { method: 'DELETE' })
      .then(function(r) { if (alertIfFailed(r)) return; loadStats(); loadMessages(); });
  };

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Portfolio Management</p>

          <a href="/api/auth/github" className="github-login-btn">
            <GithubIcon />
            <span>Sign in with GitHub</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      {/* A bar rather than a column. Three tabs did not need 240px of
          the left edge, and the content is wide-format - charts, tables
          and message rows all read better with the full width. */}
      <header className="admin-bar">
        <div className="admin-bar-inner">
          {/* The mark, not the GitHub handle. This is the one panel
              behind the login and it may as well look like the site it
              belongs to. Which account is signed in is still named in the
              greeting below. */}
          <Wordmark className="admin-logo" decorative />

          <nav className="admin-tabs">
            <button className={'admin-tab' + (tab === 'dashboard' ? ' active' : '')} onClick={function() { setTab('dashboard'); }}>Dashboard</button>
            <button className={'admin-tab' + (tab === 'messages' ? ' active' : '')} onClick={function() { setTab('messages'); }}>
              Messages
              {stats.unreadMessages > 0 && <span className="tab-badge">{stats.unreadMessages}</span>}
            </button>
            <button className={'admin-tab' + (tab === 'security' ? ' active' : '')} onClick={function() { setTab('security'); }}>Security</button>
          </nav>

          <button className="admin-tab logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-main">
        {tab === 'dashboard' && (
          <div className="admin-section">
            <div className="dash-header">
              <div>
                <h1 className="admin-title">Dashboard</h1>
                {authStatus && <p className="welcome-text">Welcome back, {authStatus.username} 👋</p>}
              </div>
            </div>

            <div className="dash-kpi-grid">
              <div className="dash-kpi">
                <div className="kpi-icon kpi-views">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{pageviews.today || 0}</span>
                  <span className="kpi-label">Views Today</span>
                </div>
                <div className="kpi-trend kpi-trend-up">
                  <span>This week: {pageviews.week || 0}</span>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="kpi-icon kpi-projects">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{pageviews.month || 0}</span>
                  <span className="kpi-label">Views, 30 days</span>
                </div>
                <div className="kpi-trend">
                  <span>{pageviews.today || 0} today</span>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="kpi-icon kpi-messages">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{stats.totalMessages || 0}</span>
                  <span className="kpi-label">Total Messages</span>
                </div>
                <div className="kpi-trend">
                  <span className={stats.unreadMessages > 0 ? 'kpi-alert' : ''}>{stats.unreadMessages || 0} unread</span>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="kpi-icon kpi-testimonials">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{security.last24hCount || 0}</span>
                  <span className="kpi-label">Rate limits, 24h</span>
                </div>
                {/* Zero is the good reading here, and a bare 0 does not
                    say so - it reads like a number that failed to load. */}
                <div className="kpi-trend">
                  <span className={security.last24hCount > 0 ? 'kpi-alert' : ''}>{security.last24hCount > 0 ? 'check security' : 'none blocked'}</span>
                </div>
              </div>
            </div>

            <div className="dash-charts-row">
              <div className="dash-chart-card dash-chart-wide">
                <div className="dash-chart-header">
                  <h3 className="dash-chart-title">Visitor Traffic</h3>
                  <span className="dash-chart-period">Last 30 days</span>
                </div>
                <TrafficChart data={pageviews.perDay} />
              </div>

            </div>

            <div className="dash-bottom-grid">
              <div className="dash-card">
                <h3 className="dash-card-title">Top Pages</h3>
                {pageviews.topPages && pageviews.topPages.length > 0 ? (
                  <div className="dash-page-list">
                    {pageviews.topPages.map(function(p, i) {
                      var maxCount = pageviews.topPages[0] ? parseInt(pageviews.topPages[0].count) : 1;
                      var percent = (parseInt(p.count) / maxCount) * 100;
                      return (
                        <div className="dash-page-item" key={i}>
                          <div className="dash-page-info">
                            <span className="dash-page-name">{p.page}</span>
                            <span className="dash-page-count">{p.count} views</span>
                          </div>
                          <div className="dash-page-bar-bg">
                            <div className="dash-page-bar-fill" style={{width: percent + '%'}}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="chart-empty">No page data yet</p>
                )}
              </div>

            </div>

            {messages.length > 0 && (
              <div className="dash-recent">
                <h3 className="dash-card-title">Recent Messages</h3>
                <div className="items-list">
                  {messages.slice(0, 3).map(function(m) {
                    return (
                      <div className={'message-card' + (m.read ? '' : ' unread')} key={m.id}>
                        <div className="message-header">
                          <span className="message-from">{m.name}</span>
                          <span className="message-email">{m.email}</span>
                          <span className="message-date">{new Date(m.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="message-body">{esikatselu(m.message)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div className="admin-section">
            <h1 className="admin-title">Messages</h1>
            <div className="items-list">
              {messages.length === 0 && <p className="empty-text">No messages yet</p>}
              {messages.map(function(m) {
                return (
                  <div className={'message-card' + (m.read ? '' : ' unread')} key={m.id}>
                    <div className="message-header">
                      <span className="message-from">{m.name}</span>
                      <span className="message-email">{m.email}</span>
                      <span className="message-date">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="message-body">{m.message}</p>
                    <div className="message-actions">
                      <a className="reply-btn" href={'mailto:' + m.email + '?subject=Re: Your message&body=Hi ' + encodeURIComponent(m.name) + ','}>Reply</a>
                      {!m.read && <button className="read-btn" onClick={function() { markRead(m.id); }}>Mark Read</button>}
                      <button className="delete-btn" onClick={function() { deleteMessage(m.id); }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="admin-section">
            <h1 className="admin-title">Security</h1>
            <p className="welcome-text">Rate-limited requests in the last 24 hours: <strong>{security.last24hCount}</strong></p>

            <h2 className="admin-subtitle">Top IPs (24h)</h2>
            {security.topIps.length === 0 ? (
              <p className="welcome-text">No blocked requests in the last 24 hours.</p>
            ) : (
              <div className="items-list">
                {security.topIps.map(function(row, i) {
                  return (
                    <div className="item-row" key={i}>
                      <div className="item-info">
                        <span className="item-title">{row.ip}</span>
                      </div>
                      <span className="tab-badge">{row.count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <h2 className="admin-subtitle">Recent events</h2>
            {security.recent.length === 0 ? (
              <p className="welcome-text">Nothing logged yet.</p>
            ) : (
              <div className="items-list">
                {security.recent.map(function(row, i) {
                  return (
                    <div className="item-row" key={i}>
                      <div className="item-info">
                        <span className="item-title">{row.ip}</span>
                        <span className="item-status">{row.route}</span>
                      </div>
                      <span className="message-date">{new Date(row.created_at).toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className={'admin-toast toast-' + toast.type} role="status">
          <span>{toast.message}</span>
          <button type="button" className="admin-toast-close" onClick={function() { setToast(null); }} aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  );
};

export default Admin;
