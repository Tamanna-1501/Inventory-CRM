import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { verifyToken } from './auth';
import { hasPermission, isAdminRole } from './permissions';

export { hasPermission, isAdminRole };

const BLOCKED_STATUS = ['inactive', 'disabled', 'blocked', 'suspended'];

export async function getUserFromRequest() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      include: { role: true, company: true },
    });
    if (!user) return null;
    if (BLOCKED_STATUS.includes(String(user.status || '').toLowerCase())) return null;
    // Company status DB se check hota hai; token ke companyId par bharosa nahi.
    if (user.isSuperAdmin) return user;
    if (!user.companyId || !user.company || user.company.status !== 'active') return null;
    if (decoded.impersonatorId !== undefined) {
      const impersonatorId = Number(decoded.impersonatorId);
      if (!Number.isInteger(impersonatorId) || impersonatorId <= 0) return null;
      const impersonator = await prisma.user.findFirst({
        where: { id: impersonatorId, isSuperAdmin: true, companyId: null, status: { notIn: BLOCKED_STATUS } },
        select: { id: true, name: true, email: true },
      });
      if (!impersonator) return null;
      return { ...user, isImpersonating: true, impersonatorId, impersonator };
    }
    return user;
  } catch (err) {
    console.error('getUserFromRequest error:', err);
    return null;
  }
}

// Mail/notification routes isi naam se use karte hain
export const getCurrentUser = getUserFromRequest;

export function isAdmin(user) {
  return Boolean(user?.isSuperAdmin || isAdminRole(user?.role?.name));
}

export function hasRole(user, allowedRoles = []) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const roleName = String(user.role?.name || '').toLowerCase().trim();
  return allowedRoles.map((r) => String(r).toLowerCase().trim()).includes(roleName);
}

const fail = (message, status) => ({ error: NextResponse.json({ message }, { status }) });
const failCompanyOnly = () => fail('Company access required', 403);

function isCompanyUser(user) {
  return Boolean(user && !user.isSuperAdmin && user.companyId);
}

// Sirf login hona chahiye
export async function authorizeLogin() {
  const user = await getUserFromRequest();
  if (!user) return fail('Unauthorized', 401);
  return isCompanyUser(user) ? { user } : failCompanyOnly();
}

// Ek module + action: authorize('customer', 'add')
export async function authorize(key, action = 'view') {
  const user = await getUserFromRequest();
  if (!user) return fail('Unauthorized', 401);
  if (!isCompanyUser(user)) return failCompanyOnly();
  if (!hasPermission(user, key, action)) {
    return fail('Access denied: you do not have permission', 403);
  }
  return { user };
}

// Inme se koi ek bhi mile to allow: authorizeAny(['sales', 'Sales Report'])
export async function authorizeAny(keys, action = 'view') {
  const user = await getUserFromRequest();
  if (!user) return fail('Unauthorized', 401);
  if (!isCompanyUser(user)) return failCompanyOnly();
  if (!keys.some((k) => hasPermission(user, k, action))) {
    return fail('Access denied: you do not have permission', 403);
  }
  return { user };
}

export async function authorizeAdmin() {
  const user = await getUserFromRequest();
  if (!user) return fail('Unauthorized', 401);
  if (!isCompanyUser(user)) return failCompanyOnly();
  if (!isAdmin(user)) return fail('Access denied: only Admin can do this', 403);
  return { user };
}

// Super Admin ke endpoints company ke role-permission checks se alag rehte hain.
export async function authorizeSuperAdmin() {
  const user = await getUserFromRequest();
  if (!user) return fail('Unauthorized', 401);
  if (!user.isSuperAdmin || user.companyId !== null) return fail('Super Admin access required', 403);
  return { user };
}
