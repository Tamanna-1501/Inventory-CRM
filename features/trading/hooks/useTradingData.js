'use client';

import { useEffect, useState } from 'react';
import { loadTradingData } from '@/features/trading/services/tradingService';

export function useTradingData() {
  const [data, setData] = useState({ customers: [], suppliers: [], billers: [], warehouses: [], products: [], branding: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    loadTradingData().then((result) => { if (active) setData(result); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { ...data, loading, error };
}
