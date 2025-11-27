
import { NextRequest, NextResponse } from 'next/server';
import { UserRole, SubscriptionStatus } from '@prisma/client';
import * as jose from 'jose';

const protectedRoutes: { path: string, roles: UserRole[] }[] = [
    { path: '/inventory', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/product-discovery', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/pos', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/reports', roles: [UserRole.ADMIN] },
    { path: '/stats', roles: [UserRole.ADMIN] },
    { path: '/customers', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/suppliers', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/repairs', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { path: '/expenses', roles: [UserRole.ADMIN] },
    { path: '/settings', roles: [UserRole.ADMIN] },
    { path: '/billing', roles: [UserRole.ADMIN, UserRole.CASHIER] },
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

      const isTrialExpired = subscriptionStatus === SubscriptionStatus.TRIAL && trialEndsAt && new Date() > trialEndsAt;
      const isSubscriptionInactive = subscriptionStatus === SubscriptionStatus.INACTIVE || subscriptionStatus === SubscriptionStatus.CANCELED;

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
