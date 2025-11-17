import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
    const response = intlMiddleware(req);

    const protectedPaths = ['/dashboard', '/voice', '/crm', '/admin'];
    const pathname = req.nextUrl.pathname;
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');

    const isProtected = protectedPaths.some(path => pathWithoutLocale.startsWith(path));

    if (isProtected) {
        const res = NextResponse.next();
        const supabase = createMiddlewareClient({ req, res });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            const locale = pathname.match(/^\/([a-z]{2})/)?.[1] || 'ar';
            return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/(ar|en)/:path*']
};
