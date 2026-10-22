'use client';

import { useCallback, useEffect, useState } from 'react';
import { getReportData } from '../services';

export default function useReport(kind) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', warehouseId: 'all', search: '', type: 'all', paymentMethod: 'all' });
  const load = useCallback(async (activeFilters = filters) => {
    setLoading(true); setError('');
    try { const data = await getReportData(kind, activeFilters); setRecords(data.records); }
    catch (cause) { setError(cause.message || 'Unable to load report data'); setRecords([]); }
    finally { setLoading(false); }
  }, [kind, filters]);
  useEffect(() => { load(); }, [kind]);
  return { records, loading, error, filters, setFilters, load };
}
