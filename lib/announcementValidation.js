export function parseAnnouncementFields(body, creating = false, current = {}) {
  const title = body.title === undefined ? current.title : String(body.title || '').trim();
  const text = body.body === undefined ? current.body : String(body.body || '').trim();
  if ((!title && creating) || (title !== undefined && (!title || title.length > 191))) throw new Error('Title is required and must be at most 191 characters');
  if ((!text && creating) || (text !== undefined && (!text || text.length > 10000))) throw new Error('Announcement text is required and must be at most 10000 characters');
  const isActive = body.isActive === undefined ? (creating ? true : current.isActive) : body.isActive;
  if (typeof isActive !== 'boolean') throw new Error('isActive must be true or false');
  const startsAt = body.startsAt === undefined ? (creating ? new Date() : current.startsAt) : new Date(body.startsAt);
  const expiresAt = body.expiresAt === undefined ? (creating ? null : current.expiresAt) : (body.expiresAt ? new Date(body.expiresAt) : null);
  if (Number.isNaN(startsAt.getTime()) || (expiresAt && Number.isNaN(expiresAt.getTime()))) throw new Error('Enter valid announcement dates');
  if (expiresAt && expiresAt <= startsAt) throw new Error('Expiry must be later than the start date');
  return {
    ...(body.title !== undefined || creating ? { title } : {}),
    ...(body.body !== undefined || creating ? { body: text } : {}),
    ...(body.isActive !== undefined || creating ? { isActive } : {}),
    ...(body.startsAt !== undefined || creating ? { startsAt } : {}),
    ...(body.expiresAt !== undefined || creating ? { expiresAt } : {}),
  };
}
