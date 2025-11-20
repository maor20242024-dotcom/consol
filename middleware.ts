import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

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
    '/ab-testing'
];

export async function middleware(req: NextRequest) {
    const response = intlMiddleware(req);
    const pathname = req.nextUrl.pathname;

    // Extract locale and path without locale
    const locale = pathname.match(/^\/([a-z]{2})/)?.[1] || 'en';
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

    // Check if current path is protected
    const isProtected = protectedPaths.some(path => pathWithoutLocale.startsWith(path));

    if (isProtected) {
        const res = NextResponse.next();
        const supabase = createMiddlewareClient({ req, res });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ar|en)/:path*']
};
