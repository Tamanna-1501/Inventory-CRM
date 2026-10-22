async function read(url) {
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Unable to load company preferences');
  return data;
}

export async function loadPreferences(isAdmin) {
  const [brandingResult, settingsResult] = await Promise.allSettled([
    read('/api/company/branding'),
    isAdmin ? read('/api/settings') : Promise.resolve({}),
  ]);
  return {
    ...(brandingResult.status === 'fulfilled' ? brandingResult.value : {}),
    ...(settingsResult.status === 'fulfilled' ? settingsResult.value : {}),
  };
}
