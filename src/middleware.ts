import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Chukua JWT token kutoka kwenye Cookies
  const token = request.cookies.get('nwsi_access')?.value;

  // 2. Orodha ya kurasa zinazohitaji ulinzi (Protected Routes)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/scanner');

  // 3. Orodha ya kurasa za Auth (Kama tayari amelogin, asirudishe login/register)
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // SCENARIO A: Anajaribu kuingia Dashboard lakini HAKUNA Token
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname); // Inahifadhi alipokuwa anataka kwenda
    return NextResponse.redirect(loginUrl);
  }

  // SCENARIO B: Tayari AMELOGIN (ana token) halafu anajaribu kwenda /login au /register
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config ya kuifanya Middleware ikimbie kwenye kurasa husika pekee
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/scanner/:path*',
    '/login',
    '/register',
  ],
};