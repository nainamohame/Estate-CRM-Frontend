/**
 * Thin fetch wrapper. No axios — this is ~60 lines and gives us exactly what
 * we need: JSON in/out, a typed ApiError carrying a machine-readable `code`,
 * and one place to react to 401s.
 */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let onUnauthorizedHandler = null;
/** Called once from AuthProvider so a 401 anywhere clears the session cache. */
export function setUnauthorizedHandler(fn) {
  onUnauthorizedHandler = fn;
}

// Empty by default: a same-origin deploy (Express serving the built app
// itself) or local dev (Vite's proxy) both want the plain relative `/api`
// path. Set VITE_API_URL only when the frontend is deployed separately from
// the API, to the API's own origin, e.g. "https://estate-crm-api.onrender.com".
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

function toQueryString(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value instanceof Date ? value.toISOString() : String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function request(path, { method = 'GET', body, params } = {}) {
  const res = await fetch(`${API_BASE}/api${path}${toQueryString(params)}`, {
    method,
    // 'include' rather than 'same-origin': when the API is a separate
    // deployment (API_BASE set), the session cookie must still be sent and
    // accepted cross-site. This is a superset of 'same-origin' behaviour, so
    // it's also correct for a same-origin deploy — one setting for both.
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth')) {
      onUnauthorizedHandler?.();
    }
    throw new ApiError(
      res.status,
      json?.error?.code ?? 'UNKNOWN',
      json?.error?.message ?? 'Something went wrong. Please try again.',
      json?.error?.details
    );
  }

  return json;
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body: body ?? {} }),
  patch: (path, body) => request(path, { method: 'PATCH', body: body ?? {} }),
  del: (path) => request(path, { method: 'DELETE' }),
};
