export async function getNotifications() {
  const response = await fetch('/api/notifications', { cache: 'no-store', credentials: 'include' });
  if (!response.ok) return null;
  return response.json();
}

export async function markNotificationsRead() {
  const response = await fetch('/api/notifications', { method: 'PATCH', credentials: 'include' });
  if (!response.ok) throw new Error('Unable to mark notifications as read');
}

export async function getUnreadMail() {
  const response = await fetch('/api/messages?folder=inbox', { cache: 'no-store', credentials: 'include' });
  if (!response.ok) return 0;
  const data = await response.json();
  return data.unread || 0;
}
