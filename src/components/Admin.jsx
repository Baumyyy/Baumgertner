import React, { useState, useEffect } from 'react';
import './Admin.css';

var API_URL = '/api';

var Admin = function() {
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

  var headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  // Check token on load
  useEffect(function() {
    if (token) {
      fetch(API_URL + '/admin/stats', { headers: headers })
        .then(function(r) { return r.ok ? (setLoggedIn(true), r.json()) : Promise.reject(); })
        .then(function(d) { setStats(d); })
        .catch(function() { setToken(''); localStorage.removeItem('admin_token'); });
    }
  }, []);

  // Load data when logged in
  useEffect(function() {
    if (loggedIn) loadAll();
  }, [loggedIn, tab]);

  var loadAll = function() {
    fetch(API_URL + '/admin/stats', { headers: headers }).then(function(r) { return r.json(); }).then(setStats);
    fetch(API_URL + '/projects').then(function(r) { return r.json(); }).then(setProjects);
    fetch(API_URL + '/messages', { headers: headers }).then(function(r) { return r.json(); }).then(setMessages);
    fetch(API_URL + '/profile').then(function(r) { return r.json(); }).then(setProfile);
  };

  var handleLogin = function(e) {
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
  };

  var toggleAvailability = function() {
    fetch(API_URL + '/availability', {
      method: 'PUT', headers: headers,
      body: JSON.stringify({ available: !stats.available })
    }).then(function() { loadAll(); });
  };

  var deleteProject = function(id) {
    if (confirm('Delete this project?')) {
      fetch(API_URL + '/projects/' + id, { method: 'DELETE', headers: headers })
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

    fetch(url, {
      method: method, headers: headers,
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
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (data.url) {
        setEditProject(Object.assign({}, editProject, { image: data.url }));
      }
    });
  };

  var markRead = function(id) {
    fetch(API_URL + '/messages/' + id + '/read', { method: 'PUT', headers: headers })
      .then(function() { loadAll(); });
  };

  var deleteMessage = function(id) {
    fetch(API_URL + '/messages/' + id, { method: 'DELETE', headers: headers })
      .then(function() { loadAll(); });
  };

  var saveProfile = function(e) {
    e.preventDefault();
    fetch(API_URL + '/profile', {
      method: 'PUT', headers: headers,
      body: JSON.stringify(profile)
    }).then(function() { loadAll(); alert('Profile saved!'); });
  };

  // ===== LOGIN SCREEN =====
  if (!loggedIn) {
    return (
      <div className="admin-login">
        <div className="login-card">
          <h1 className="login-title">Admin Panel</h1>
          <p className="login-subtitle">Portfolio Management</p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={loginForm.username}
              onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { username: e.target.value })); }}
            />
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={loginForm.password}
              onChange={function(e) { setLoginForm(Object.assign({}, loginForm, { password: e.target.value })); }}
            />
            <button type="submit" className="login-btn">Login</button>
          </form>
        </div>
      </div>
    );
  }

  // ===== ADMIN PANEL =====
  return (
    <div className="admin">
      <div className="admin-sidebar">
        <h2 className="admin-logo">AB Admin</h2>
        <div className={'admin-tab' + (tab === 'dashboard' ? ' active' : '')} onClick={function() { setTab('dashboard'); }}>Dashboard</div>
        <div className={'admin-tab' + (tab === 'projects' ? ' active' : '')} onClick={function() { setTab('projects'); }}>Projects</div>
        <div className={'admin-tab' + (tab === 'messages' ? ' active' : '')} onClick={function() { setTab('messages'); }}>
          Messages
          {stats.unreadMessages > 0 && <span className="tab-badge">{stats.unreadMessages}</span>}
        </div>
        <div className={'admin-tab' + (tab === 'profile' ? ' active' : '')} onClick={function() { setTab('profile'); }}>Profile</div>
        <div className="admin-tab logout" onClick={handleLogout}>Logout</div>
      </div>

      <div className="admin-main">
        {tab === 'dashboard' && (
          <div className="admin-section">
            <h1 className="admin-title">Dashboard</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-card-value">{stats.totalProjects || 0}</span>
                <span className="stat-card-label">Projects</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-value">{stats.totalMessages || 0}</span>
                <span className="stat-card-label">Messages</span>
              </div>
              <div className="stat-card">
                <span className="stat-card-value">{stats.unreadMessages || 0}</span>
                <span className="stat-card-label">Unread</span>
              </div>
              <div className={'stat-card clickable ' + (stats.available ? 'available' : 'busy')} onClick={toggleAvailability}>
                <span className="stat-card-value">{stats.available ? 'Available' : 'Busy'}</span>
                <span className="stat-card-label">Click to toggle</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="admin-section">
            <div className="section-header">
              <h1 className="admin-title">Projects</h1>
              <button className="add-btn" onClick={function() { setEditProject({ title: '', description: '', tags: '', status: 'Live', link: '', sort_order: 0 }); }}>+ Add Project</button>
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
                  {editProject.image && (
                    <img src={editProject.image} alt="Preview" className="image-preview" />
                  )}
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