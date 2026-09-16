import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute yang membutuhkan Login (Member & Admin)
const protectedRoutes = ['/spaces', '/booking', '/reservasi', '/history', '/profile', '/dashboard'];

// Rute khusus Admin Space Owner
const adminRoutes = ['/admin'];

// Rute publik khusus tamu (Login / Register) -> Jika sudah login, redirect ke dashboard
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mengambil token dan user_type dari cookie (jika ada) atau header Authorization
  const token = request.cookies.get('token')?.value;
  const userType = request.cookies.get('user_type')?.value;

  // Pengecekan 1: Mengakses rute yang butuh autentikasi tanpa token
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if ((isProtectedRoute || isAdminRoute) && !token) {
    // Jika mencoba akses rute terproteksi tanpa token -> Redirect ke /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pengecekan 2: Mengakses rute Admin tapi role BUKAN admin_space
  if (isAdminRoute && userType && userType !== 'admin_space') {
    // Member biasa mencoba masuk ke /admin -> Redirect ke dashboard member
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Pengecekan 3: Mengakses rute Member tapi role BUKAN member (misal Admin masuk ke /booking)
  if (isProtectedRoute && userType === 'admin_space' && !pathname.startsWith('/spaces')) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Pengecekan 4: Mengakses /login atau /register padahal SUDAH login
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && token) {
    if (userType === 'admin_space') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi matcher rute yang diproses oleh Middleware Next.js
export const config = {
  matcher: [
    '/spaces/:path*',
    '/booking/:path*',
    '/reservasi/:path*',
    '/history/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register/:path*',
  ],
};
