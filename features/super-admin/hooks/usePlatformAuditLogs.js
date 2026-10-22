'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPlatformAuditLogs } from '../services';

export default function usePlatformAuditLogs(filters, page) {
  const [result, setResult] = useState({ items: [], total: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '25' });
      Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
      setResult(await getPlatformAuditLogs(params));
    } catch (cause) { setError(cause.message || 'Unable to load audit events'); }
    finally { setLoading(false); }
  }, [filters, page]);
  useEffect(() => { load(); }, [load]);
  return { ...result, loading, error, refresh: load };
}
