import { NextResponse } from 'next/server';
import { verifyTokenEdge } from '@/lib/edgeAuth';

const ADMIN_ONLY_ROUTES = ['/administrative-tools', '/user-management/create-role'];
const ADMIN_ROLES = ['ADMIN', 'OWNER'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/features' ||
    pathname === '/modules' ||
    pathname === '/about' ||
    pathname === '/unauthorized' ||
    pathname.startsWith('/api/') || // APIs ko route ke andar authorize() protect karta hai
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Token verify hota hai (signature check), sirf cookie ka naam nahi
  const token = request.cookies.get('token')?.value;
  const payload = token ? await verifyTokenEdge(token) : null;

  if (!payload) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('token');
    return res;
  }

  const isSuperAdmin = payload.isSuperAdmin === true && payload.companyId == null;
  const inSuperAdminArea = pathname === '/super-admin' || pathname.startsWith('/super-admin/');
  if (inSuperAdminArea && !isSuperAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (!inSuperAdminArea && isSuperAdmin) {
    return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
  }

  // Role ab signed token se aata hai, editable cookie se nahi
  const role = String(payload.role || '').toUpperCase().trim();
  const isAdminRoute = ADMIN_ONLY_ROUTES.some((p) => pathname.startsWith(p));
  if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const proxy = middleware;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
