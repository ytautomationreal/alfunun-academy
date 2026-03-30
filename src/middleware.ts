import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only run on /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Exclude login page from protection
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for session cookie
        const adminSession = request.cookies.get('admin_session');

        if (!adminSession) {
            // Redirect to login if no session
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
