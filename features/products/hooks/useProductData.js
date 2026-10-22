'use client';

import { useCallback, useEffect, useState } from 'react';

export function useProductData(loader) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const result = await loader(); setData(Array.isArray(result) ? result : result?.items || []); setError(''); }
    catch (e) { setError(e.message || 'Unable to load data.'); }
    finally { setLoading(false); }
  // Loader module scope ma stable hai, isliye refresh function stable rahega.
  }, [loader]);
  useEffect(() => { refresh(); }, [refresh]);
  return { data, setData, loading, error, refresh };
}
