'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '../services';

export default function useSuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getDashboard().then((result) => { if (active) setData(result); })
      .catch((cause) => { if (active) setError(cause.message || 'Unable to load dashboard'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { data, error, loading };
}
