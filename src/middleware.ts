import { stackServerApp } from "@/lib/stack";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // 🚏 FAST BYPASS for ALL API Routes
    // Never let intlMiddleware touch /api/ paths
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // 1. Check for ANY valid session (Stack Auth OR Local Imperium Session)
    const stackUser = await stackServerApp.getUser();
    const localSession = req.cookies.get('imperium_session');

    const isAuthenticated = !!stackUser || !!localSession;

    // 🔍 Debug Logs
    console.log(`[ZETA SHIELD] Req: ${pathname} | Auth: ${isAuthenticated ? 'YES' : 'NO'}`);

    const localeMatch = pathname.match(/^\/(en|ar)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

    // 2. Root redirect
    if (pathname === '/' || pathname === '/en' || pathname === '/ar') {
        const dest = isAuthenticated ? `/${locale}/dashboard` : `/${locale}/login`;
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // 3. Public Pages Check
    const publicPages = ['/login', '/landing'];
    const isPublicPage = publicPages.some(p => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + '/'));

    if (!isAuthenticated && !isPublicPage) {
        return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    if (isAuthenticated && pathWithoutLocale === '/login') {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/((?!_next|_vercel|monitoring|.*\\..*).*)']
};
