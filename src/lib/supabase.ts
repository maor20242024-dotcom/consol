import { createBrowserClient, createServerClient } from '@supabase/ssr'

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Supabase client for client-side operations
 * - Respects Row Level Security (RLS) policies
 * - Persists session in localStorage (browser only)
 * - Auto-refreshes expired tokens
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/**
 * Supabase admin client for server-side operations
 * ⚠️ WARNING: This client bypasses RLS policies using SERVICE_ROLE_KEY
 * - ONLY use on the server side (API routes, server components)
 * - NEVER expose this to the client
 * - Use only when administrative access is explicitly required
 * - Audit all operations performed with this client
 */
export const supabaseAdmin = serviceRoleKey
    ? createServerClient(supabaseUrl, serviceRoleKey, {
        cookies: {
            getAll() {
                return [];
            },
            setAll() {},
        },
    })
    : (() => {
        console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will use standard client with RLS.');
        return supabase;
    })()

