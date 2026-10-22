'use client';

import { useCallback, useEffect, useState } from 'react';

export function useTradingListData(loader) {
  const [data, setData] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const result = await loader(); setData(Array.isArray(result) ? result : result?.items || []); setError(''); }
    catch (err) { setError(err.message || 'Unable to load transaction records.'); }
    finally { setLoading(false); }
  }, [loader]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, setData, loading, error, refresh };
}
