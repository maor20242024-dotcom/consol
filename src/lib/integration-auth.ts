import { NextRequest } from 'next/server'
import { createAdminClient } from './supabase'

const ACCESS_TOKEN_HEADER = 'authorization'
const ACCESS_TOKEN_COOKIE = 'sb-access-token'

export function resolveAccessToken(req: NextRequest): string | null {
  const header = req.headers.get(ACCESS_TOKEN_HEADER)
  if (header?.toLowerCase().startsWith('bearer ')) {
    return header.slice(7)
  }

  const cookieToken = req.cookies.get(ACCESS_TOKEN_COOKIE)
  if (cookieToken?.value) {
    return cookieToken.value
  }

  return null
}

export async function getSupabaseUserId(req: NextRequest): Promise<string | null> {
  const token = resolveAccessToken(req)
  if (!token) {
    return null
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    console.warn('Unable to resolve Supabase user from request:', error?.message)
    return null
  }

  return data.user.id
}
