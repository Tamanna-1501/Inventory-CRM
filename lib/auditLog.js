const SECRET_KEY = /password|token|secret|api.?key|authorization|credential/i;

function safeDetails(value, depth = 0) {
  if (value == null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.slice(0, 500);
  if (depth >= 4) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 20).map((entry) => safeDetails(entry, depth + 1));
  if (typeof value !== 'object') return String(value).slice(0, 500);

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SECRET_KEY.test(key))
      .slice(0, 30)
      .map(([key, entry]) => [key.slice(0, 100), safeDetails(entry, depth + 1)])
  );
}

// Audit event ko usi transaction me likho jisme business change commit hota hai.
export async function writeAuditLog(db, actor, entry) {
  if (!db?.auditLog || !actor?.id || !entry?.action || !entry?.entity) {
    throw new Error('Valid database client, actor and audit event are required');
  }
  const companyId = entry.companyId === undefined ? actor.companyId ?? null : entry.companyId;
  const parsedCompanyId = companyId == null ? null : Number(companyId);
  if (parsedCompanyId !== null && (!Number.isInteger(parsedCompanyId) || parsedCompanyId <= 0)) {
    throw new Error('Audit company id is invalid');
  }

  return db.auditLog.create({
    data: {
      companyId: parsedCompanyId,
      userId: Number(actor.id),
      actorName: actor.name ? String(actor.name).slice(0, 191) : null,
      actorEmail: actor.email ? String(actor.email).slice(0, 191) : null,
      action: String(entry.action).slice(0, 191),
      entity: String(entry.entity).slice(0, 191),
      entityId: entry.entityId == null ? null : String(entry.entityId).slice(0, 191),
      details: entry.details == null ? undefined : safeDetails(entry.details),
    },
  });
}
