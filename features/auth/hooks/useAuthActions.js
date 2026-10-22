'use client';

import { useState } from 'react';
import { registerCompany, signIn, signOut, stopImpersonation } from '../services/authService';

export function useAuthActions() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true); setError('');
    try { return await action(); }
    catch (cause) { const message = cause?.message || 'Something went wrong'; setError(message); throw cause; }
    finally { setBusy(false); }
  }

  return {
    busy, error, setError,
    login: (form) => run(() => signIn(form)),
    register: (form) => run(() => registerCompany(form)),
    logout: () => run(signOut),
    stopImpersonation: () => run(stopImpersonation),
  };
}
