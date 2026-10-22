async function readResponse(response, fallback) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || fallback);
  return data;
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
  return response.ok ? response.json() : null;
}

export async function signIn(credentials) {
  const response = await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(credentials),
  });
  return readResponse(response, 'Login failed');
}

export async function registerCompany(details) {
  const response = await fetch('/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(details),
  });
  return readResponse(response, 'Registration failed');
}

export async function signOut() {
  const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  if (!response.ok) throw new Error('Unable to sign out');
  return response;
}

export async function stopImpersonation() {
  const response = await fetch('/api/impersonation/stop', { method: 'POST', credentials: 'include' });
  return readResponse(response, 'Unable to end impersonation');
}
