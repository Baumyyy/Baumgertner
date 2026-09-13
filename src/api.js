var API_URL = '/api';

var parseResponse = async function(res) {
  var data = await res.json();
  if (!res.ok) {
    throw new Error((data && data.error) || 'Request failed');
  }
  return data;
};

// One call, because the public site now reads everything else from the
// repo: the work list is content in src/content, the profile text is in
// the language files, and the availability line is gone. Sending a
// message is the only thing left that needs the server.
export var api = {
  sendMessage: async function(data) {
    var res = await fetch(API_URL + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return parseResponse(res);
  },
};
