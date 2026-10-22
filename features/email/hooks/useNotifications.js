'use client';

import { useCallback, useEffect, useState } from 'react';
import { getNotifications, getUnreadMail, markNotificationsRead } from '../services/notificationService';

export function useNotifications() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const refresh = useCallback(async () => {
    try {
      const data = await getNotifications();
      if (data) { setItems(data.items || []); setUnread(data.unreadCount || 0); }
    } catch (error) { console.error('Notifications load error:', error); }
  }, []);
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 30000); return () => clearInterval(timer); }, [refresh]);
  const markAllRead = useCallback(async () => { await markNotificationsRead(); await refresh(); }, [refresh]);
  return { items, unread, refresh, markAllRead };
}

export function useUnreadMail() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let active = true;
    const refresh = async () => { try { const count = await getUnreadMail(); if (active) setUnread(count); } catch (error) { console.error('Mail unread load error:', error); } };
    void refresh(); const timer = setInterval(() => void refresh(), 30000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return unread;
}
