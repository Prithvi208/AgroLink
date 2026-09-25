const API_BASE = 'http://localhost:5000/api';

function safeStringify(body) {
  try {
    const str = JSON.stringify(body);
    if (typeof str !== 'string') throw new Error('JSON.stringify returned non-string');
    return str;
  } catch (e) {
    console.error('[API] Failed to stringify body:', body, e);
    throw new Error('Request body serialization failed');
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('agrolink_token');
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchOptions = { ...options, headers };
  if (fetchOptions.body !== undefined && typeof fetchOptions.body !== 'string') {
    console.error('[API] Body must be string, got:', typeof fetchOptions.body, fetchOptions.body);
    fetchOptions.body = safeStringify(fetchOptions.body);
  }

  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('[API] Invalid JSON response from', path, ':', text.slice(0, 200));
    throw new Error('Invalid server response');
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: body !== undefined ? safeStringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body !== undefined ? safeStringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
