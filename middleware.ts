import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { requireAuth } from './src/lib/api-auth';

const intlMiddleware = createMiddleware(routing);

// Protected paths that require authentication
const protectedPaths = [
    '/dashboard',
    '/voice',
    '/crm',
    '/admin',
    '/campaigns-manager',
    '/ad-creator',
    '/analytics',
    '/ab-testing',
    '/ai-assistant',
    '/settings',
    '/instagram-inbox' // NEW: Instagram Inbox protection
];

// Paths that require admin role
const adminPaths = [
    '/admin'
];

// API paths that bypass authentication (for webhooks)
const publicApiPaths = [
    '/api/webhooks/instagram',
    '/api/webhooks/whatsapp'
];

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Check if this is a public API path (webhooks)
    const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path));

    if (isPublicApi) {
        // Allow webhook requests without authentication
        const response = intlMiddleware(req);

        // Add security headers for webhooks
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');

        return response;
    }

    const response = intlMiddleware(req);

    // Extract locale using next-intl's locale detection (more robust than regex)
    const localeMatch = pathname.match(/^\/(en|ar)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

    // Check if current path is protected
    const isProtected = protectedPaths.some(path => pathWithoutLocale.startsWith(path));
    const isAdminPath = adminPaths.some(path => pathWithoutLocale.startsWith(path));

    if (isProtected) {
        try {
            // ✅ Using requireAuth with role verification
            const authOptions = isAdminPath ? { requiredRole: 'admin' } : undefined;
            const authUser = await requireAuth(req, authOptions);

            if (!authUser) {
                const redirectUrl = new URL(`/${locale}/login`, req.url);
                redirectUrl.searchParams.set('redirectTo', pathname);
                return NextResponse.redirect(redirectUrl);
            }

            // ✅ Check admin role for admin paths
            if (isAdminPath && authUser.role !== 'admin') {
                return NextResponse.redirect(
                    new URL(`/${locale}/dashboard?error=admin_access_required`, req.url)
                );
            }

            // ✅ Add user info to response headers
            response.headers.set('X-User-Id', authUser.userId || '');
            response.headers.set('X-User-Email', authUser.email || '');
            response.headers.set('X-User-Role', authUser.role || 'user');

        } catch (error: any) {
            console.error('[MIDDLEWARE AUTH ERROR]', error);
            const errorMessage = encodeURIComponent(error.message || 'system_error');
            return NextResponse.redirect(
                new URL(`/${locale}/login?error=${errorMessage}`, req.url)
            );
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ar|en)/:path*']
};
