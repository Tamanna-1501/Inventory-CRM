'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCompanyAnnouncements, getDashboard, getOnboardingSteps } from '../services/dashboardService';

export function useDashboard() {
  const [state, setState] = useState({ dashboardData: null, error: '', completedRequestId: null });
  const [requestId, setRequestId] = useState(0);
  const reload = useCallback(() => setRequestId((current) => current + 1), []);

  useEffect(() => {
    let active = true;
    getDashboard()
  .then((dashboardData) => { if (active) setState({ dashboardData, error: '', completedRequestId: requestId }); })
      .catch((error) => { if (active) setState({ dashboardData: null, error: error.message || 'Unable to load the dashboard.', completedRequestId: requestId }); });
    return () => { active = false; };
  }, [requestId]);

  const loading = state.completedRequestId !== requestId;
  return { ...state, loading, error: loading ? '' : state.error, reload };
}

export function useCompanyAnnouncements() {
  const [items, setItems] = useState([]);
  useEffect(() => { let active = true; getCompanyAnnouncements().then((result) => { if (active) setItems(result); }).catch(() => { if (active) setItems([]); }); return () => { active = false; }; }, []);
  return items;
}

export function useOnboardingSteps() {
  const [state, setState] = useState({ steps: [], failed: false });
  useEffect(() => { let active = true; getOnboardingSteps().then((steps) => { if (active) setState({ steps, failed: false }); }).catch(() => { if (active) setState({ steps: [], failed: true }); }); return () => { active = false; }; }, []);
  return state;
}
