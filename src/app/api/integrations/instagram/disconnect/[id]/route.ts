import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getSupabaseUserId } from '@/lib/integration-auth'

type AppRouteHandlerFnContext = {
  params: Promise<any>
}

export async function DELETE(
  req: NextRequest,
  context: AppRouteHandlerFnContext,
) {
  const params =
    ((await context.params) as
      | Record<string, string | string[] | undefined>
      | undefined) ?? {}
  const requestedId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined

  if (!requestedId) {
    return NextResponse.json(
      { error: 'Missing Instagram account id' },
      { status: 400 },
    )
  }
  const userId = await getSupabaseUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: existing, error: fetchError } = await admin
    .from('instagram_accounts')
    .select('user_id')
    .eq('id', requestedId)
    .maybeSingle()

  if (fetchError) {
    console.error('Error fetching Instagram account before disconnect', fetchError)
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Instagram account not found' }, { status: 404 })
  }

  if (existing.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await admin
    .from('instagram_accounts')
    .delete()
    .eq('id', requestedId)

  if (deleteError) {
    console.error('Failed to delete Instagram account', deleteError)
    return NextResponse.json({ error: 'Failed to remove Instagram account' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Instagram account disconnected.' })
}
