import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUserId } from '@/lib/integration-auth'

const scope = [
  'instagram_basic',
  'instagram_manage_comments',
  'instagram_manage_insights',
  'instagram_content_publish',
  'instagram_manage_messages',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
].join(',')

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  let userId = searchParams.get('userId')

  if (!userId) {
    userId = await getSupabaseUserId(req)
  }

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required to connect Instagram.' }, { status: 401 })
  }

  const metaAppId = process.env.META_APP_ID
  const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI
  const metaVersion = process.env.META_API_VERSION || 'v19.0'

  if (!metaAppId || !redirectUri) {
    console.error('Meta App ID or redirect URI missing')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const dialogUrl = `https://www.facebook.com/${metaVersion}/dialog/oauth?client_id=${metaAppId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(userId)}`

  return NextResponse.json({ redirectUrl: dialogUrl })
}
