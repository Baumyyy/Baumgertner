import React, { useState, useEffect } from 'react';
import './Admin.css';

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
  var authState = useState(null);
  var authStatus = authState[0];
  var setAuthStatus = authState[1];
  var tokenState = useState(localStorage.getItem('admin_token') || '');
  var token = tokenState[0];
  var setToken = tokenState[1];
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
  var loginFormState = useState({ username: '', password: '' });
  var loginForm = loginFormState[0];
  var setLoginForm = loginFormState[1];
  var editProjectState = useState(null);
  var editProject = editProjectState[0];
  var setEditProject = editProjectState[1];
  var showBackupLogin = useState(false);
  var showBackup = showBackupLogin[0];
  var setShowBackup = showBackupLogin[1];
  var testimonialsState = useState([]);
  var adminTestimonials = testimonialsState[0];
  var setAdminTestimonials = testimonialsState[1];
  var editTestimonialState = useState(null);
  var editTestimonial = editTestimonialState[0];
  var setEditTestimonial = editTestimonialState[1];
  var sidebarState = useState(false);
  var sidebarOpen = sidebarState[0];
  var setSidebarOpen = sidebarState[1];

  useEffect(function() {
    fetch(API_URL + '/auth/me', { credentials: 'include' })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.authenticated) {
          setAuthStatus(data.user);
          setLoggedIn(true);
        } else if (token) {
          fetch(API_URL + '/admin/stats', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(function(r) {
              if (r.ok) {
                setLoggedIn(true);
                return r.json();
              }
              throw new Error('Invalid token');
            })
            .then(function(d) { setStats(d); })
            .catch(function() { setToken(''); localStorage.removeItem('admin_token'); });
        }
      });
  }, []);

  var getHeaders = function() {
    var h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  };

  var fetchAuth = function(url, options) {
    var opts = Object.assign({ credentials: 'include', headers: getHeaders() }, options || {});
    return fetch(url, opts);
  };

  useEffect(function() {
    if (loggedIn) loadAll();
  }, [loggedIn, tab]);

  var loadAll = function() {
    fetchAuth(API_URL + '/admin/stats').then(function(r) { return r.json(); }).then(setStats);
    fetchAuth(API_URL + '/admin/analytics').then(function(r) { return r.json(); }).then(setAnalytics);
    fetchAuth(API_URL + '/admin/pageviews').then(function(r) { return r.json(); }).then(setPageviews);
    fetch(API_URL + '/projects').then(function(r) { return r.json(); }).then(setProjects);
    fetchAuth(API_URL + '/messages').then(function(r) { return r.json(); }).then(setMessages);
    fetch(API_URL + '/profile').then(function(r) { return r.json(); }).then(setProfile);
    fetchAuth(API_URL + '/admin/testimonials').then(function(r) { return r.json(); }).then(setAdminTestimonials);
  };

  var handleBackupLogin = function(e) {
    e.preventDefault();
    fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm)
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('admin_token', data.token);
        setLoggedIn(true);
      } else {
        alert('Wrong credentials');
      }
    });
  };

  var handleLogout = function() {
    setToken('');
    localStorage.removeItem('admin_token');
    setLoggedIn(false);
    setAuthStatus(null);
    window.location.href = '/api/auth/logout';
  };

  var toggleAvailability = function() {
    fetchAuth(API_URL + '/availability', {
      method: 'PUT',
      body: JSON.stringify({ available: !stats.available })
    }).then(function() { loadAll(); });
  };

  var deleteProject = function(id) {
    if (confirm('Delete this project?')) {
      fetchAuth(API_URL + '/projects/' + id, { method: 'DELETE' })
        .then(function() { loadAll(); });
    }
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
    }).then(function() {
      setEditProject(null);
      loadAll();
    });
  };

  var uploadImage = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var formData = new FormData();
    formData.append('image', file);
    fetch(API_URL + '/upload', {
      method: 'POST',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
      credentials: 'include',
      body: formData
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.url) {
        setEditProject(Object.assign({}, editProject, { image: data.url }));
      }
    });
  };

  var markRead = function(id) {
    fetchAuth(API_URL + '/messages/' + id + '/read', { method: 'PUT' })
      .then(function() { loadAll(); });
  };

  var deleteMessage = function(id) {
    fetchAuth(API_URL + '/messages/' + id, { method: 'DELETE' })
      .then(function() { loadAll(); });
  };

  var saveProfile = function(e) {
    e.preventDefault();
    fetchAuth(API_URL + '/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }).then(function() { loadAll(); alert('Profile saved!'); });
  };

  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Portfolio Management</p>

          <a href="/api/auth/github" className="github-login-btn">
            <i className="fab fa-github"></i>
            <span>Sign in with GitHub</span>
          </a>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="backup-toggle" onClick={function() { setShowBackup(!showBackup); }}>
            {showBackup ? 'Hide' : 'Use'} password login
          </div>

          {showBackup && (
            <form onSubmit={handleBackupLogin}>
              <input type="text" placeholder="Username" className="login-input" value={loginForm.username} onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { username: e.target.value })); }} />
              <input type="password" placeholder="Password" className="login-input" value={loginForm.password} onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { password: e.target.value })); }} />
              <button type="submit" className="login-btn">Login</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className={'sidebar-overlay' + (sidebarOpen ? ' overlay-visible' : '')} onClick={function() { setSidebarOpen(false); }}></div>

      <div className="mobile-menu-btn" onClick={function() { setSidebarOpen(!sidebarOpen); }}>
        {sidebarOpen ? '✕' : '☰'}
      </div>

      <div className={'admin-sidebar' + (sidebarOpen ? ' sidebar-open' : '')}>
        <div className="admin-user">
          {authStatus && authStatus.avatar && <img src={authStatus.avatar} alt="" className="admin-avatar" />}
          <h2 className="admin-logo">AB Admin</h2>
        </div>
        <div className={'admin-tab' + (tab === 'dashboard' ? ' active' : '')} onClick={function() { setTab('dashboard'); setSidebarOpen(false); }}>Dashboard</div>
        <div className={'admin-tab' + (tab === 'projects' ? ' active' : '')} onClick={function() { setTab('projects'); setSidebarOpen(false); }}>Projects</div>
        <div className={'admin-tab' + (tab === 'testimonials' ? ' active' : '')} onClick={function() { setTab('testimonials'); setSidebarOpen(false); }}>
          Testimonials
          {stats.pendingTestimonials > 0 && <span className="tab-badge">{stats.pendingTestimonials}</span>}
        </div>
        <div className={'admin-tab' + (tab === 'messages' ? ' active' : '')} onClick={function() { setTab('messages'); setSidebarOpen(false); }}>
          Messages
          {stats.unreadMessages > 0 && <span className="tab-badge">{stats.unreadMessages}</span>}
        </div>
        <div className={'admin-tab' + (tab === 'profile' ? ' active' : '')} onClick={function() { setTab('profile'); setSidebarOpen(false); }}>Profile</div>
        <div className="admin-tab logout" onClick={handleLogout}>Logout</div>
      </div>

      <div className="admin-main">
        {tab === 'dashboard' && (
          <div className="admin-section">
            <div className="dash-header">
              <div>
                <h1 className="admin-title">Dashboard</h1>
                {authStatus && <p className="welcome-text">Welcome back, {authStatus.username} 👋</p>}
              </div>
              <div className={'dash-status-pill' + (stats.available ? '' : ' pill-busy')} onClick={toggleAvailability}>
                <span className={'dash-status-dot' + (stats.available ? '' : ' dot-busy')}></span>
                <span>{stats.available ? 'Available for work' : 'Currently busy'}</span>
              </div>
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
                <input className="edit-input" placeholder="Title" value={editProject.title || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { title: e.target.value })); }} />
                <textarea className="edit-input edit-textarea" placeholder="Description" value={editProject.description || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { description: e.target.value })); }} />
                <input className="edit-input" placeholder="Tags (comma separated)" value={editProject.tags || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { tags: e.target.value })); }} />
                <select className="edit-input" value={editProject.status || 'Live'} onChange={function(e) { setEditProject(Object.assign({}, editProject, { status: e.target.value })); }}>
                  <option value="Live">Live</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <input className="edit-input" placeholder="Link (optional)" value={editProject.link || ''} onChange={function(e) { setEditProject(Object.assign({}, editProject, { link: e.target.value })); }} />
                <label className="edit-label">Cover Image</label>
                <div className="image-upload-row">
                  {editProject.image && <img src={editProject.image} alt="Preview" className="image-preview" />}
                  <input type="file" accept="image/*" onChange={uploadImage} className="file-input" />
                </div>
                <input className="edit-input" type="number" placeholder="Sort order" value={editProject.sort_order || 0} onChange={function(e) { setEditProject(Object.assign({}, editProject, { sort_order: parseInt(e.target.value) })); }} />
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
                    <div className="item-actions">
                      <button className="edit-btn" onClick={function() { setEditProject(Object.assign({}, p, { tags: Array.isArray(p.tags) ? p.tags.join(',') : '' })); }}>Edit</button>
                      <button className="delete-btn" onClick={function() { deleteProject(p.id); }}>Delete</button>
                    </div>
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
                  .then(function() { setEditTestimonial(null); loadAll(); });
              }}>
                <input className="edit-input" placeholder="Name" value={editTestimonial.name || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { name: e.target.value })); }} />
                <input className="edit-input" placeholder="Role" value={editTestimonial.role || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { role: e.target.value })); }} />
                <input className="edit-input" placeholder="Company" value={editTestimonial.company || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { company: e.target.value })); }} />
                <textarea className="edit-input edit-textarea" placeholder="Message" value={editTestimonial.message || ''} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { message: e.target.value })); }} />
                <label className="edit-label">Avatar</label>
                <div className="image-upload-row">
                  {editTestimonial.avatar && <img src={editTestimonial.avatar} alt="Avatar" className="avatar-preview" />}
                  <input type="file" accept="image/*" onChange={function(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    var formData = new FormData();
                    formData.append('image', file);
                    fetch(API_URL + '/upload', {
                      method: 'POST',
                      headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                      credentials: 'include',
                      body: formData
                    }).then(function(r) { return r.json(); }).then(function(data) {
                      if (data.url) setEditTestimonial(Object.assign({}, editTestimonial, { avatar: data.url }));
                    });
                  }} className="file-input" />
                </div>
                <select className="edit-input" value={editTestimonial.rating || 5} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { rating: parseInt(e.target.value) })); }}>
                  <option value="5">★★★★★</option>
                  <option value="4">★★★★</option>
                  <option value="3">★★★</option>
                </select>
                <label className="edit-label">
                  <input type="checkbox" checked={editTestimonial.visible !== false} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { visible: e.target.checked })); }} /> Visible
                </label>
                <input className="edit-input" type="number" placeholder="Sort order" value={editTestimonial.sort_order || 0} onChange={function(e) { setEditTestimonial(Object.assign({}, editTestimonial, { sort_order: parseInt(e.target.value) })); }} />
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
                    <div className="item-actions">
                      <button className="edit-btn" onClick={function() { setEditTestimonial(Object.assign({}, t)); }}>Edit</button>
                      <button className="delete-btn" onClick={function() {
                        if (confirm('Delete this testimonial?')) {
                          fetchAuth(API_URL + '/testimonials/' + t.id, { method: 'DELETE' }).then(function() { loadAll(); });
                        }
                      }}>Delete</button>
                    </div>
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
                      {!m.read && <button className="read-btn" onClick={function() { markRead(m.id); }}>Mark Read</button>}
                      <button className="delete-btn" onClick={function() { deleteMessage(m.id); }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="admin-section">
            <h1 className="admin-title">Profile</h1>
            <form className="edit-form" onSubmit={saveProfile}>
              <label className="edit-label">Profile Photo</label>
              <div className="image-upload-row">
                {profile.avatar && <img src={profile.avatar} alt="Avatar" className="avatar-preview" />}
                <input type="file" accept="image/*" onChange={function(e) {
                  var file = e.target.files[0];
                  if (!file) return;
                  var formData = new FormData();
                  formData.append('image', file);
                  fetch(API_URL + '/upload', {
                    method: 'POST',
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {},
                    credentials: 'include',
                    body: formData
                  }).then(function(r) { return r.json(); }).then(function(data) {
                    if (data.url) setProfile(Object.assign({}, profile, { avatar: data.url }));
                  });
                }} className="file-input" />
              </div>
              <label className="edit-label">Name</label>
              <input className="edit-input" value={profile.name || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { name: e.target.value })); }} />
              <label className="edit-label">Role</label>
              <input className="edit-input" value={profile.role || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { role: e.target.value })); }} />
              <label className="edit-label">Bio</label>
              <textarea className="edit-input edit-textarea" value={profile.bio || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { bio: e.target.value })); }} />
              <label className="edit-label">Email</label>
              <input className="edit-input" value={profile.email || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { email: e.target.value })); }} />
              <label className="edit-label">Location</label>
              <input className="edit-input" value={profile.location || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { location: e.target.value })); }} />
              <label className="edit-label">Timezone</label>
              <input className="edit-input" value={profile.timezone || ''} onChange={function(e) { setProfile(Object.assign({}, profile, { timezone: e.target.value })); }} />
              <button type="submit" className="save-btn">Save Profile</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
