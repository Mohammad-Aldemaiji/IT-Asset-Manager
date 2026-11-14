/** All HTTP details live here. Pages work with data, not fetch response objects. */
export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) { super(message); this.status = status; this.errors = errors; }
}
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch('/api/assets' + path, {
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the backend is running and try again.');
  }
  if (response.status === 204) return null;
  let body;
  try { body = await response.json(); }
  catch { throw new ApiError('The server returned an unreadable response.', response.status); }
  if (!response.ok) throw new ApiError(body.message || 'The request failed.', response.status, body.errors || {});
  return body;
}
const body = values => {
  const { id: _id, ...fields } = values;
  return JSON.stringify({ ...fields, warrantyExpiry: fields.warrantyExpiry || null });
};
export const assetsApi = {
  list: params => request('?' + new URLSearchParams(params)),
  get: id => request('/' + encodeURIComponent(id)),
  stats: () => request('/stats'),
  create: values => request('', { method: 'POST', body: body(values) }),
  update: (id, values) => request('/' + encodeURIComponent(id), { method: 'PUT', body: body(values) }),
  delete: id => request('/' + encodeURIComponent(id), { method: 'DELETE' }),
};
