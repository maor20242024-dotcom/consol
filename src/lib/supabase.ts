import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';

export const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL', env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // unchanged as this is secret

function requireEnv(name: string, value?: string) {
    if (!value) {
        throw new Error(`Missing required Supabase environment variable: ${name}`)
    }
    return value
}

/**
 * Supabase client for client-side operations
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Creates a Supabase admin client for server-side operations
 */
export function createAdminClient() {
    if (!serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY. Server-side operations cannot proceed without it.')
    }

    return createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
            getAll() {
                return []
            },
            setAll() { },
        },
    })
}

