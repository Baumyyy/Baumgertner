var API_URL = '/api';

var parseResponse = async function(res) {
  var data = await res.json();
  if (!res.ok) {
    throw new Error((data && data.error) || 'Request failed');
  }
  return data;
};

export var api = {
  getProfile: async function() {
    var res = await fetch(API_URL + '/profile');
    return parseResponse(res);
  },

  getProjects: async function() {
    var res = await fetch(API_URL + '/projects');
    return parseResponse(res);
  },

  getAvailability: async function() {
    var res = await fetch(API_URL + '/availability');
    return parseResponse(res);
  },

  sendMessage: async function(data) {
    var res = await fetch(API_URL + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  getTestimonials: function() {
    return fetch('/api/testimonials').then(parseResponse);
  },

  submitTestimonial: async function(data) {
    var res = await fetch(API_URL + '/testimonials/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },

  uploadPublicImage: async function(file) {
    var formData = new FormData();
    formData.append('image', file);
    var res = await fetch(API_URL + '/upload-public', { method: 'POST', body: formData });
    return parseResponse(res);
  },
};
