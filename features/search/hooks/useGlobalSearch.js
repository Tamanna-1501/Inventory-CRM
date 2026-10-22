'use client';

import { useCallback, useRef, useState } from 'react';
import { searchCompanyRecords } from '@/features/search/services/searchService';

export function useGlobalSearch() {
  const requestRef = useRef(null);
  const [state, setState] = useState({ loading: false, results: [], errors: [], searched: false });

  const search = useCallback(async (query, allowedTypes) => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState({ loading: true, results: [], errors: [], searched: false });
    try {
      const result = await searchCompanyRecords(query, allowedTypes, controller.signal);
      if (!controller.signal.aborted) setState({ ...result, loading: false, searched: true });
    } catch (error) {
      if (!controller.signal.aborted) setState({ loading: false, results: [], errors: [error.message], searched: true });
    }
  }, []);

  const cancel = useCallback(() => requestRef.current?.abort(), []);
  return { ...state, search, cancel };
}
