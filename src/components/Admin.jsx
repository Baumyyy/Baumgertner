import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Admin.css';
import { usePageMeta } from '../hooks/usePageMeta';
import { GithubIcon } from './Icons';

var API_URL = '/api';

var MiniChart = function(props) {
  var data = props.data || [];
  if (data.length === 0) return null;

  var max = Math.max.apply(null, data.map(function(d) { return parseInt(d.count); }));
  if (max === 0) max = 1;

  return (
    <div className="mini-chart">
      <div className="mini-chart-bars">
        {data.map(function(d, i) {
          var height = (parseInt(d.count) / max) * 100;
          var dateStr = new Date(d.date).toLocaleDateString('en', { day: 'numeric', month: 'short' });
          return (
            <div className="mini-chart-bar-wrapper" key={i} title={dateStr + ': ' + d.count}>
              <div className="mini-chart-bar" style={{ height: height + '%' }}></div>
              <span className="mini-chart-date">{dateStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
  var analyticsState = useState({ messagesPerDay: [], testimonialsByStatus: [] });
  var analytics = analyticsState[0];
  var setAnalytics = analyticsState[1];
  var pageviewsState = useState({ today: 0, week: 0, month: 0, total: 0, perDay: [], topPages: [] });
  var pageviews = pageviewsState[0];
  var setPageviews = pageviewsState[1];
  var projectsState = useState([]);
  var projects = projectsState[0];
  var setProjects = projectsState[1];
  var messagesState = useState([]);
  var messages = messagesState[0];
  var setMessages = messagesState[1];
  var profileState = useState({});
  var profile = profileState[0];
  var setProfile = profileState[1];
  var editProjectState = useState(null);
  var editProject = editProjectState[0];
  var setEditProject = editProjectState[1];
  var testimonialsState = useState([]);
  var adminTestimonials = testimonialsState[0];
  var setAdminTestimonials = testimonialsState[1];
  var editTestimonialState = useState(null);
  var editTestimonial = editTestimonialState[0];
  var setEditTestimonial = editTestimonialState[1];
  var sidebarState = useState(false);
  var sidebarOpen = sidebarState[0];
  var setSidebarOpen = sidebarState[1];
  var toastState = useState(null);
  var toast = toastState[0];
  var setToast = toastState[1];
  var toastTimeoutRef = useRef(null);
  var confirmDeleteProjectState = useState(null);
  var confirmDeleteProjectId = confirmDeleteProjectState[0];
  var setConfirmDeleteProjectId = confirmDeleteProjectState[1];
  var confirmDeleteTestimonialState = useState(null);
  var confirmDeleteTestimonialId = confirmDeleteTestimonialState[0];
  var setConfirmDeleteTestimonialId = confirmDeleteTestimonialState[1];
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

  var loadAnalytics = useCallback(function() {
    fetchAuth(API_URL + '/admin/analytics').then(parseOk).then(setAnalytics).catch(function() { showToast('error', 'Failed to load analytics.'); });
  }, [fetchAuth, setAnalytics, showToast]);

  var loadPageviews = useCallback(function() {
    fetchAuth(API_URL + '/admin/pageviews').then(parseOk).then(setPageviews).catch(function() { showToast('error', 'Failed to load pageviews.'); });
  }, [fetchAuth, setPageviews, showToast]);

  var loadProjects = useCallback(function() {
    fetch(API_URL + '/projects').then(parseOk).then(setProjects).catch(function() { showToast('error', 'Failed to load projects.'); });
  }, [setProjects, showToast]);

  var loadMessages = useCallback(function() {
    fetchAuth(API_URL + '/messages').then(parseOk).then(setMessages).catch(function() { showToast('error', 'Failed to load messages.'); });
  }, [fetchAuth, setMessages, showToast]);

  var loadProfile = useCallback(function() {
    fetch(API_URL + '/profile').then(parseOk).then(setProfile).catch(function() { showToast('error', 'Failed to load profile.'); });
  }, [setProfile, showToast]);

  var loadTestimonials = useCallback(function() {
    fetchAuth(API_URL + '/admin/testimonials').then(parseOk).then(setAdminTestimonials).catch(function() { showToast('error', 'Failed to load testimonials.'); });
  }, [fetchAuth, setAdminTestimonials, showToast]);

  var loadSecurity = useCallback(function() {
    fetchAuth(API_URL + '/admin/security').then(parseOk).then(setSecurity).catch(function() { showToast('error', 'Failed to load security data.'); });
  }, [fetchAuth, setSecurity, showToast]);

  // Switching tabs only needs that tab's own data - loading all 8 endpoints
  // on every click let a handful of tab clicks burn through the rate limit.
  useEffect(function() {
    if (!loggedIn) return;
    if (tab === 'dashboard') { loadStats(); loadAnalytics(); loadPageviews(); }
    else if (tab === 'projects') loadProjects();
    else if (tab === 'testimonials') loadTestimonials();
    else if (tab === 'messages') loadMessages();
    else if (tab === 'security') loadSecurity();
    else if (tab === 'profile') loadProfile();
  }, [loggedIn, tab, loadStats, loadAnalytics, loadPageviews, loadProjects, loadTestimonials, loadMessages, loadSecurity, loadProfile]);

  var handleLogout = function() {
    fetch(API_URL + '/auth/logout', { method: 'POST', credentials: 'include' }).finally(function() {
      setLoggedIn(false);
      setAuthStatus(null);
    });
  };

  var toggleAvailability = function() {
    fetchAuth(API_URL + '/availability', {
      method: 'PUT',
      body: JSON.stringify({ available: !stats.available })
    }).then(function(r) { if (alertIfFailed(r)) return; loadStats(); });
  };

  var deleteProject = function(id) {
    setConfirmDeleteProjectId(id);
  };

  var executeDeleteProject = function(id) {
    fetchAuth(API_URL + '/projects/' + id, { method: 'DELETE' })
      .then(function(r) { if (alertIfFailed(r)) return; setConfirmDeleteProjectId(null); loadStats(); loadProjects(); });
  };

  var saveProject = function(e) {
    e.preventDefault();
    var method = editProject.id ? 'PUT' : 'POST';
    var url = editProject.id ? API_URL + '/projects/' + editProject.id : API_URL + '/projects';
    var tagsArray = typeof editProject.tags === 'string'
      ? '{' + editProject.tags + '}'
      : editProject.tags;

    fetchAuth(url, {
      method: method,
      body: JSON.stringify(Object.assign({}, editProject, { tags: tagsArray }))
    }).then(function(r) {
      if (alertIfFailed(r)) return;
      setEditProject(null);
      loadStats();
      loadProjects();
      showToast('success', 'Project saved.');
    });
  };

  var uploadAdminImage = function(file) {
    var formData = new FormData();
    formData.append('image', file);
    return fetch(API_URL + '/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(function(r) {
      if (!r.ok) throw new Error('Upload failed');
      return r.json();
    }).then(function(data) { return data.url; });
  };

  var uploadImage = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    uploadAdminImage(file).then(function(url) {
      setEditProject(Object.assign({}, editProject, { image: url, image_position: '50% 50%', image_zoom: 100 }));
    }).catch(function() { showToast('error', 'Upload failed. Please try again.'); });
  };

  var parseImagePosition = function(pos) {
    var parts = (pos || '50% 50%').split(' ');
    var x = parseInt(parts[0], 10);
    var y = parseInt(parts[1], 10);
    return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
  };

  var markRead = function(id) {
    fetchAuth(API_URL + '/messages/' + id + '/read', { method: 'PUT' })
      .then(function(r) { if (alertIfFailed(r)) return; loadStats(); loadMessages(); });
  };

  var deleteMessage = function(id) {
    fetchAuth(API_URL + '/messages/' + id, { method: 'DELETE' })
      .then(function(r) { if (alertIfFailed(r)) return; loadStats(); loadMessages(); });
  };

  var saveProfile = function(e) {
    e.preventDefault();
    fetchAuth(API_URL + '/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }).then(function(r) {
      if (alertIfFailed(r)) return;
      loadStats();
      loadProfile();
      showToast('success', 'Profile saved.');
    });
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
      <div className={'sidebar-overlay' + (sidebarOpen ? ' overlay-visible' : '')} onClick={function() { setSidebarOpen(false); }}></div>

      <button className="mobile-menu-btn" onClick={function() { setSidebarOpen(!sidebarOpen); }} aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      <div className={'admin-sidebar' + (sidebarOpen ? ' sidebar-open' : '')}>
        <div className="admin-user">
          {authStatus && authStatus.username && (
            <span className="admin-username">
              <span className="admin-user-dot"></span>
              {authStatus.username}
            </span>
          )}
        </div>
        <button className={'admin-tab' + (tab === 'dashboard' ? ' active' : '')} onClick={function() { setTab('dashboard'); setSidebarOpen(false); }}>Dashboard</button>
        <button className={'admin-tab' + (tab === 'projects' ? ' active' : '')} onClick={function() { setTab('projects'); setSidebarOpen(false); }}>Projects</button>
        <button className={'admin-tab' + (tab === 'testimonials' ? ' active' : '')} onClick={function() { setTab('testimonials'); setSidebarOpen(false); }}>
          Testimonials
          {stats.pendingTestimonials > 0 && <span className="tab-badge">{stats.pendingTestimonials}</span>}
        </button>
        <button className={'admin-tab' + (tab === 'messages' ? ' active' : '')} onClick={function() { setTab('messages'); setSidebarOpen(false); }}>
          Messages
          {stats.unreadMessages > 0 && <span className="tab-badge">{stats.unreadMessages}</span>}
        </button>
        <button className={'admin-tab' + (tab === 'security' ? ' active' : '')} onClick={function() { setTab('security'); setSidebarOpen(false); }}>Security</button>
        <button className={'admin-tab' + (tab === 'profile' ? ' active' : '')} onClick={function() { setTab('profile'); setSidebarOpen(false); }}>Profile</button>
        <button className="admin-tab logout" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-main">
        {tab === 'dashboard' && (
          <div className="admin-section">
            <div className="dash-header">
              <div>
                <h1 className="admin-title">Dashboard</h1>
                {authStatus && <p className="welcome-text">Welcome back, {authStatus.username} 👋</p>}
              </div>
              <button className={'dash-status-pill' + (stats.available ? '' : ' pill-busy')} onClick={toggleAvailability}>
                <span className={'dash-status-dot' + (stats.available ? '' : ' dot-busy')}></span>
                <span>{stats.available ? 'Available for work' : 'Currently busy'}</span>
              </button>
            </div>

            <div className="dash-kpi-grid">
              <div className="dash-kpi">
                <div className="kpi-icon kpi-views">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{pageviews.today}</span>
                  <span className="kpi-label">Views Today</span>
                </div>
                <div className="kpi-trend kpi-trend-up">
                  <span>This week: {pageviews.week}</span>
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
                <div className="kpi-icon kpi-projects">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{stats.totalProjects || 0}</span>
                  <span className="kpi-label">Projects</span>
                </div>
                <div className="kpi-trend">
                  <span>{pageviews.total} total views</span>
                </div>
              </div>

              <div className="dash-kpi">
                <div className="kpi-icon kpi-testimonials">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
                <div className="kpi-data">
                  <span className="kpi-value">{stats.totalTestimonials || 0}</span>
                  <span className="kpi-label">Testimonials</span>
                </div>
                <div className="kpi-trend">
                  <span className={stats.pendingTestimonials > 0 ? 'kpi-alert' : ''}>{stats.pendingTestimonials || 0} pending</span>
                </div>
              </div>
            </div>

            <div className="dash-charts-row">
              <div className="dash-chart-card dash-chart-wide">
                <div className="dash-chart-header">
                  <h3 className="dash-chart-title">Visitor Traffic</h3>
                  <span className="dash-chart-period">Last 30 days</span>
                </div>
                <div className="dash-chart-stats-row">
                  <div className="dash-chart-stat">
                    <span className="dcs-value">{pageviews.month}</span>
                    <span className="dcs-label">This month</span>
                  </div>
                  <div className="dash-chart-stat">
                    <span className="dcs-value">{pageviews.week}</span>
                    <span className="dcs-label">This week</span>
                  </div>
                  <div className="dash-chart-stat">
                    <span className="dcs-value">{pageviews.today}</span>
                    <span className="dcs-label">Today</span>
                  </div>
                </div>
                {pageviews.perDay && pageviews.perDay.length > 0 ? (
                  <MiniChart data={pageviews.perDay} />
                ) : (
                  <p className="chart-empty">No visitor data yet</p>
                )}
              </div>

              <div className="dash-chart-card">
                <div className="dash-chart-header">
                  <h3 className="dash-chart-title">Messages</h3>
                  <span className="dash-chart-period">Last 30 days</span>
                </div>
                {analytics.messagesPerDay && analytics.messagesPerDay.length > 0 ? (
                  <MiniChart data={analytics.messagesPerDay} />
                ) : (
                  <p className="chart-empty">No message data yet</p>
                )}
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

              <div className="dash-card">
                <h3 className="dash-card-title">Quick Overview</h3>
                <div className="dash-overview-list">
                  <div className="dash-overview-item">
                    <div className="doi-left">
                      <span className="doi-dot doi-green"></span>
                      <span className="doi-label">Total Views</span>
                    </div>
                    <span className="doi-value">{pageviews.total}</span>
                  </div>
                  <div className="dash-overview-item">
                    <div className="doi-left">
                      <span className="doi-dot doi-green"></span>
                      <span className="doi-label">Projects Live</span>
                    </div>
                    <span className="doi-value">{stats.totalProjects || 0}</span>
                  </div>
                  <div className="dash-overview-item">
                    <div className="doi-left">
                      <span className="doi-dot doi-yellow"></span>
                      <span className="doi-label">Pending Reviews</span>
                    </div>
                    <span className="doi-value doi-val-yellow">{stats.pendingTestimonials || 0}</span>
                  </div>
                  <div className="dash-overview-item">
                    <div className="doi-left">
                      <span className="doi-dot doi-blue"></span>
                      <span className="doi-label">Unread Messages</span>
                    </div>
                    <span className="doi-value doi-val-blue">{stats.unreadMessages || 0}</span>
                  </div>
                  <div className="dash-overview-item">
                    <div className="doi-left">
                      <span className="doi-dot doi-green"></span>
                      <span className="doi-label">Testimonials</span>
                    </div>
                    <span className="doi-value">{stats.totalTestimonials || 0}</span>
                  </div>
                </div>
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
                        <p className="message-body">{m.message.substring(0, 100)}{m.message.length > 100 ? '...' : ''}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'projects' && (
          <div className="admin-section">
            <div className="section-header">
              <h1 className="admin-title">Projects</h1>
              <button className="add-btn" onClick={function() { setEditProject({ title: '', description: '', tags: '', status: 'Live', link: '', image: '', sort_order: 0 }); }}>+ Add Project</button>
            </div>

            {editProject && (
              <form className="edit-form" onSubmit={saveProject}>
                <label className="edit-label" htmlFor="project-title">Title</label>
                <input id="project-title" className="edit-input" placeholder="e.g. Portfolio Website" value={editProject.title || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { title: e.target.value })); }} />
                <label className="edit-label" htmlFor="project-description">Description</label>
                <textarea id="project-description" className="edit-input edit-textarea" placeholder="What is this project about?" value={editProject.description || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { description: e.target.value })); }} />
                <label className="edit-label" htmlFor="project-tags">Tags (comma separated)</label>
                <input id="project-tags" className="edit-input" placeholder="React, Node.js, CSS3" value={editProject.tags || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { tags: e.target.value })); }} />
                <label className="edit-label" htmlFor="project-status">Status</label>
                <select id="project-status" className="edit-input" value={editProject.status || 'Live'} onChange={function(e) { setEditProject(Object.assign({}, editProject, { status: e.target.value })); }}>
                  <option value="Live">Live</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <label className="edit-label" htmlFor="project-link">Link (optional)</label>
                <input id="project-link" className="edit-input" placeholder="https://..." value={editProject.link || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { link: e.target.value })); }} />
                <label className="edit-label" htmlFor="project-image">Cover Image</label>
                <div className="image-upload-row">
                  {editProject.image && <img src={editProject.image} alt="Preview" className="image-preview" />}
                  <input id="project-image" type="file" accept="image/*" onChange={uploadImage} className="file-input" />
                </div>
                {editProject.image && (
                  <div className="image-position-picker">
                    <div
                      className="image-position-preview"
                      style={{
                        backgroundImage: 'url(' + editProject.image + ')',
                        backgroundColor: '#000',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: (editProject.image_zoom || 100) + '%',
                        backgroundPosition: editProject.image_position || '50% 50%'
                      }}
                    >
                      <div className="image-position-grid">
                        <span className="grid-line-v"></span>
                        <span className="grid-line-h"></span>
                      </div>
                    </div>
                    <div className="image-position-sliders">
                      <label className="edit-label">Horizontal position</label>
                      <input
                        type="range" min="0" max="100"
                        value={parseImagePosition(editProject.image_position).x}
                        onChange={function(e) {
                          var y = parseImagePosition(editProject.image_position).y;
                          setEditProject(Object.assign({}, editProject, { image_position: e.target.value + '% ' + y + '%' }));
                        }}
                      />
                      <label className="edit-label">Vertical position</label>
                      <input
                        type="range" min="0" max="100"
                        value={parseImagePosition(editProject.image_position).y}
                        onChange={function(e) {
                          var x = parseImagePosition(editProject.image_position).x;
                          setEditProject(Object.assign({}, editProject, { image_position: x + '% ' + e.target.value + '%' }));
                        }}
                      />
                      <label className="edit-label">Zoom</label>
                      <input
                        type="range" min="50" max="250" step="5"
                        value={editProject.image_zoom || 100}
                        onChange={function(e) {
                          setEditProject(Object.assign({}, editProject, { image_zoom: parseInt(e.target.value, 10) }));
                        }}
                      />
                    </div>
                  </div>
                )}
                <label className="edit-label" htmlFor="project-sort-order">Sort order</label>
                <input id="project-sort-order" className="edit-input" type="number" value={editProject.sort_order || 0} onChange={function(e) { setEditProject(Object.assign({}, editProject, { sort_order: parseInt(e.target.value) })); }} />
                <div className="edit-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={function() { setEditProject(null); }}>Cancel</button>
                </div>
              </form>
            )}

            <div className="items-list">
              {projects.map(function(p) {
                return (
                  <div className="item-row" key={p.id}>
                    <div className="item-info">
                      <span className="item-title">{p.title}</span>
                      <span className={'item-status ' + (p.status === 'Live' ? 'status-live' : 'status-soon')}>{p.status}</span>
                    </div>
                    {confirmDeleteProjectId === p.id ? (
                      <div className="confirm-inline">
                        <span className="confirm-text">Delete?</span>
                        <button className="confirm-yes" onClick={function() { executeDeleteProject(p.id); }}>Yes</button>
                        <button className="confirm-no" onClick={function() { setConfirmDeleteProjectId(null); }}>No</button>
                      </div>
                    ) : (
                      <div className="item-actions">
                        <button className="edit-btn" onClick={function() { setEditProject(Object.assign({}, p, { tags: Array.isArray(p.tags) ? p.tags.join(',') : '' })); }}>Edit</button>
                        <button className="delete-btn" onClick={function() { deleteProject(p.id); }}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'testimonials' && (
          <div className="admin-section">
            <div className="section-header">
              <h1 className="admin-title">Testimonials</h1>
              <button className="add-btn" onClick={function() { setEditTestimonial({ name: '', role: '', company: '', message: '', avatar: '', rating: 5, visible: true, sort_order: 0 }); }}>+ Add</button>
            </div>

            {editTestimonial && (
              <form className="edit-form" onSubmit={function(e) {
                e.preventDefault();
                var method = editTestimonial.id ? 'PUT' : 'POST';
                var url = editTestimonial.id ? API_URL + '/testimonials/' + editTestimonial.id : API_URL + '/testimonials';
                fetchAuth(url, { method: method, body: JSON.stringify(editTestimonial) })
                  .then(function(r) { if (alertIfFailed(r)) return; setEditTestimonial(null); loadStats(); loadTestimonials(); showToast('success', 'Testimonial saved.'); });
              }}>
                <label className="edit-label" htmlFor="admin-testimonial-name">Name</label>
                <input id="admin-testimonial-name" className="edit-input" placeholder="Jane Doe" value={editTestimonial.name || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { name: e.target.value })); }} />
                <label className="edit-label" htmlFor="admin-testimonial-role">Role</label>
                <input id="admin-testimonial-role" className="edit-input" placeholder="e.g. CEO" value={editTestimonial.role || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { role: e.target.value })); }} />
                <label className="edit-label" htmlFor="admin-testimonial-company">Company</label>
                <input id="admin-testimonial-company" className="edit-input" placeholder="Acme Inc." value={editTestimonial.company || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { company: e.target.value })); }} />
                <label className="edit-label" htmlFor="admin-testimonial-message">Message</label>
                <textarea id="admin-testimonial-message" className="edit-input edit-textarea" placeholder="What they said..." value={editTestimonial.message || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { message: e.target.value })); }} />
                <label className="edit-label" htmlFor="admin-testimonial-avatar">Avatar</label>
                <div className="image-upload-row">
                  {editTestimonial.avatar && <img src={editTestimonial.avatar} alt="Avatar" className="avatar-preview" />}
                  <input id="admin-testimonial-avatar" type="file" accept="image/*" onChange={function(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    uploadAdminImage(file).then(function(url) {
                      setEditTestimonial(Object.assign({}, editTestimonial, { avatar: url }));
                    }).catch(function() { showToast('error', 'Upload failed. Please try again.'); });
                  }} className="file-input" />
                </div>
                <label className="edit-label" htmlFor="admin-testimonial-rating">Rating</label>
                <select id="admin-testimonial-rating" className="edit-input" value={editTestimonial.rating || 5} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { rating: parseInt(e.target.value) })); }}>
                  <option value="5">★★★★★</option>
                  <option value="4">★★★★</option>
                  <option value="3">★★★</option>
                  <option value="2">★★</option>
                  <option value="1">★</option>
                </select>
                <label className="edit-label">
                  <input type="checkbox" checked={editTestimonial.visible !== false} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { visible: e.target.checked })); }} /> Visible
                </label>
                <label className="edit-label" htmlFor="admin-testimonial-sort-order">Sort order</label>
                <input id="admin-testimonial-sort-order" className="edit-input" type="number" value={editTestimonial.sort_order || 0} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { sort_order: parseInt(e.target.value) })); }} />
                <div className="edit-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={function() { setEditTestimonial(null); }}>Cancel</button>
                </div>
              </form>
            )}

            <div className="items-list">
              {adminTestimonials.map(function(t) {
                return (
                  <div className="item-row" key={t.id}>
                    <div className="item-info">
                      <span className="item-title">{t.name} - {t.company || 'No company'}</span>
                      <span className={'item-status ' + (t.visible ? 'status-live' : 'status-soon')}>{t.visible ? 'Visible' : 'Hidden'}</span>
                    </div>
                    {confirmDeleteTestimonialId === t.id ? (
                      <div className="confirm-inline">
                        <span className="confirm-text">Delete?</span>
                        <button className="confirm-yes" onClick={function() { fetchAuth(API_URL + '/testimonials/' + t.id, { method: 'DELETE' }).then(function(r) { if (alertIfFailed(r)) return; setConfirmDeleteTestimonialId(null); loadStats(); loadTestimonials(); }); }}>Yes</button>
                        <button className="confirm-no" onClick={function() { setConfirmDeleteTestimonialId(null); }}>No</button>
                      </div>
                    ) : (
                      <div className="item-actions">
                        <button className="edit-btn" onClick={function() { setEditTestimonial(Object.assign({}, t)); }}>Edit</button>
                        <button className="delete-btn" onClick={function() { setConfirmDeleteTestimonialId(t.id); }}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

        {tab === 'profile' && (
          <div className="admin-section">
            <h1 className="admin-title">Profile</h1>
            <form className="edit-form" onSubmit={saveProfile}>
              <label className="edit-label" htmlFor="profile-avatar">Profile Photo</label>
              <div className="image-upload-row">
                {profile.avatar && <img src={profile.avatar} alt="Avatar" className="avatar-preview" />}
                <input id="profile-avatar" type="file" accept="image/*" onChange={function(e) {
                  var file = e.target.files[0];
                  if (!file) return;
                  uploadAdminImage(file).then(function(url) {
                    setProfile(Object.assign({}, profile, { avatar: url }));
                  }).catch(function() { showToast('error', 'Upload failed. Please try again.'); });
                }} className="file-input" />
              </div>
              <label className="edit-label" htmlFor="profile-name">Name</label>
              <input id="profile-name" className="edit-input" value={profile.name || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { name: e.target.value })); }} />
              <label className="edit-label" htmlFor="profile-role">Role</label>
              <input id="profile-role" className="edit-input" value={profile.role || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { role: e.target.value })); }} />
              <label className="edit-label" htmlFor="profile-bio">Bio</label>
              <textarea id="profile-bio" className="edit-input edit-textarea" value={profile.bio || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { bio: e.target.value })); }} />
              <label className="edit-label" htmlFor="profile-email">Email</label>
              <input id="profile-email" className="edit-input" value={profile.email || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { email: e.target.value })); }} />
              <label className="edit-label" htmlFor="profile-location">Location</label>
              <input id="profile-location" className="edit-input" value={profile.location || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { location: e.target.value })); }} />
              <label className="edit-label" htmlFor="profile-timezone">Timezone</label>
              <input id="profile-timezone" className="edit-input" value={profile.timezone || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { timezone: e.target.value })); }} />
              <button type="submit" className="save-btn">Save Profile</button>
            </form>
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
