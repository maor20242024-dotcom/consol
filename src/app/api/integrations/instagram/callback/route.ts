import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { encrypt } from '@/lib/encryption'

const metaVersion = process.env.META_API_VERSION || 'v19.0'
const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI
const appId = process.env.META_APP_ID
const appSecret = process.env.META_APP_SECRET

type InstagramConnectedAccount = {
  igUserId: string
  fbPageId: string
  name: string
  username: string
  profilePictureUrl: string | null
}

function redirectWithMessage(req: NextRequest, message: string, isError = true) {
  const tab = 'integrations'
  const query = isError ? `error=${encodeURIComponent(message)}` : `success=${encodeURIComponent(message)}`
  return NextResponse.redirect(new URL(`/settings?tab=${tab}&${query}`, req.url))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    const description = searchParams.get('error_description') || 'Meta reported an issue during authentication.'
    console.error('Meta OAuth error:', oauthError, description)
    return redirectWithMessage(req, `Meta OAuth Error: ${description}`)
  }

  if (!code || !state) {
    return redirectWithMessage(req, 'Missing OAuth credentials from Meta.')
  }

  if (!appId || !appSecret || !redirectUri) {
    console.error('Meta configuration missing in environment')
    return redirectWithMessage(req, 'Server configuration incomplete for Meta integration.')
  }

  try {
    const shortTokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      code,
      redirect_uri: redirectUri,
    })
    const shortTokenUrl = `https://graph.facebook.com/${metaVersion}/oauth/access_token?${shortTokenParams}`
    const shortTokenResponse = await fetch(shortTokenUrl)
    const shortTokenData = await shortTokenResponse.json()

    if (shortTokenData.error) {
      console.error('Short token exchange failed', shortTokenData.error)
      return redirectWithMessage(req, 'Failed to authenticate with Meta.')
    }

    const longTokenParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortTokenData.access_token,
    })
    const longTokenUrl = `https://graph.facebook.com/${metaVersion}/oauth/access_token?${longTokenParams}`
    const longTokenResponse = await fetch(longTokenUrl)
    const longTokenData = await longTokenResponse.json()

    if (longTokenData.error) {
      console.error('Long token exchange failed', longTokenData.error)
      return redirectWithMessage(req, 'Failed to retrieve long-lived Meta token.')
    }

    const accessToken = longTokenData.access_token
    const pagesResponse = await fetch(
      `https://graph.facebook.com/${metaVersion}/me/accounts?access_token=${accessToken}`,
    )
    const pagesData = await pagesResponse.json()

    if (pagesData.error) {
      console.error('Unable to list Facebook Pages', pagesData.error)
      return redirectWithMessage(req, 'Unable to retrieve Facebook Pages linked to your account.')
    }

    let connectedAccount: InstagramConnectedAccount | null = null

    for (const page of pagesData.data ?? []) {
      const pageDetailsResponse = await fetch(
        `https://graph.facebook.com/${metaVersion}/${page.id}?fields=instagram_business_account&access_token=${accessToken}`,
      )
      const pageDetails = await pageDetailsResponse.json()

      const igAccountId = pageDetails?.instagram_business_account?.id
      if (!igAccountId) {
        continue
      }

      const igDetailsResponse = await fetch(
        `https://graph.facebook.com/${metaVersion}/${igAccountId}?fields=id,username,name,profile_picture_url&access_token=${accessToken}`,
      )
      const igDetails = await igDetailsResponse.json()

      if (igDetails?.id) {
        connectedAccount = {
          igUserId: igDetails.id,
          fbPageId: page.id,
          name: igDetails.name,
          username: igDetails.username,
          profilePictureUrl: igDetails.profile_picture_url,
        }
        break
      }
    }

    if (!connectedAccount) {
      return redirectWithMessage(req, 'No Instagram Business Account found linked to your Facebook Pages.')
    }

    const admin = createAdminClient()
    await admin.from('instagram_accounts').upsert(
      {
        ig_user_id: connectedAccount.igUserId,
        fb_page_id: connectedAccount.fbPageId,
        name: connectedAccount.name,
        username: connectedAccount.username,
        profile_picture_url: connectedAccount.profilePictureUrl,
        access_token: encrypt(accessToken),
        user_id: state,
        status: 'connected',
        expires_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'ig_user_id' },
    )

    return redirectWithMessage(req, 'Instagram account connected successfully!', false)
  } catch (error) {
    console.error('Error processing Instagram OAuth callback', error)
    return redirectWithMessage(req, 'Internal error while connecting Instagram account.')
  }
}
