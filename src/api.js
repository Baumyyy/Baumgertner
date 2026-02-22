var API_URL = '/api';

export var api = {
  getProfile: async function() {
    var res = await fetch(API_URL + '/profile');
    return res.json();
  },

  getProjects: async function() {
    var res = await fetch(API_URL + '/projects');
    return res.json();
  },

  getAvailability: async function() {
    var res = await fetch(API_URL + '/availability');
    return res.json();
  },

  sendMessage: async function(data) {
    var res = await fetch(API_URL + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getTestimonials: function() {
  return fetch('/api/testimonials').then(function(r) { return r.json(); });
},
};