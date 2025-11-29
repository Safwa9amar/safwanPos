
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

type UserRole = "ADMIN" | "CASHIER" | "PHONE_REPAIR";
type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELED";

const protectedRoutes: { path: string, roles: UserRole[] }[] = [
    { path: '/inventory', roles: ['ADMIN', 'CASHIER'] },
    { path: '/product-discovery', roles: ['ADMIN', 'CASHIER'] },
    { path: '/pos', roles: ['ADMIN', 'CASHIER'] },
    { path: '/reports', roles: ['ADMIN'] },
    { path: '/stats', roles: ['ADMIN'] },
    { path: '/customers', roles: ['ADMIN', 'CASHIER'] },
    { path: '/suppliers', roles: ['ADMIN', 'CASHIER'] },
    { path: '/purchases', roles: ['ADMIN', 'CASHIER'] },
    { path: '/repairs', roles: ['PHONE_REPAIR'] },
    { path: '/expenses', roles: ['ADMIN'] },
    { path: '/settings', roles: ['ADMIN'] },
    { path: '/billing', roles: ['ADMIN', 'CASHIER', 'PHONE_REPAIR'] },
    { path: '/income', roles: ['ADMIN'] },
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');

  if (isAuthPage) {
    if (token) {
      try {
        await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET as string));
        // If token is valid, redirect authenticated user away from auth pages
        return NextResponse.redirect(new URL('/home', request.url));
      } catch (error) {
        // Token is invalid, so delete it and allow access to auth page
        const response = NextResponse.next();
        response.cookies.delete('token');
        return response;
      }
    }
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route.path)) || pathname === '/home';
  
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET as string));
      const userRole = payload.role as UserRole;
      
      const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
      if (matchedRoute && !matchedRoute.roles.includes(userRole)) {
        // If user's role is not authorized for the route, redirect to a safe default page
        return NextResponse.redirect(new URL('/home', request.url)); 
      }
      
      // Subscription Check
      const trialEndsAt = payload.trialEndsAt ? new Date(payload.trialEndsAt as string) : null;
      const subscriptionStatus = payload.subscriptionStatus as SubscriptionStatus;

      const isTrialExpired = subscriptionStatus === 'TRIAL' && trialEndsAt && new Date() > trialEndsAt;
      const isSubscriptionInactive = subscriptionStatus === 'INACTIVE' || subscriptionStatus === 'CANCELED';

      if (isTrialExpired || isSubscriptionInactive) {
          if (pathname !== '/billing' && !pathname.startsWith('/api/auth/logout')) {
              return NextResponse.redirect(new URL('/billing', request.url));
          }
      }

    } catch (error) {
      // Invalid token, redirect to login and clear the cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token'); 
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|verify-email).*)',
  ],
};
