export async function getDashboard() {
  const summaryResponse = await fetch('/api/dashboard/summary', { cache: 'no-store', credentials: 'include' });
  const dashboardData = await summaryResponse.json();
  if (!summaryResponse.ok) throw new Error(dashboardData.message || dashboardData.error || 'Unable to load dashboard data.');
  return dashboardData;
}

export async function getCompanyAnnouncements() {
  const response = await fetch('/api/announcements', { cache: 'no-store' });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export async function getOnboardingSteps() {
  const response = await fetch('/api/company/onboarding', { cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to load checklist');
  return Array.isArray(data.steps) ? data.steps : [];
}
