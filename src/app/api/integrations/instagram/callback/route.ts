import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// Helper to exchange code for token would go here or in a lib.
// For now, assuming standard flow.

export async function GET(req: NextRequest) {
  try {
    // Warning: Callbacks usually come from external service, so standard requireAuth might fail if it expects session cookies from same domain strictly.
    // But usually there's a state param containing user info or a session cookie is present.
    // Keep it simple for now: We assume the user is logged in the browser that initiates the OAuth flow.
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({ error: "Instagram Auth Failed: " + error }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // TODO: Exchange Code for Token using Meta Client logic
    // For refactor purposes, we persist the result to Prisma.

    // Mocking successful token exchange result
    const mockProfile = {
      id: "123456789",
      username: "demo_user",
      access_token: "mock_access_token_via_prisma"
    };

    // Upsert Account
    const account = await prisma.instagramAccount.upsert({
      where: { instagramUserId: mockProfile.id },
      update: {
        accessToken: mockProfile.access_token,
        lastSyncedAt: new Date(),
        status: 'active'
      },
      create: {
        userId: user.id,
        instagramUserId: mockProfile.id,
        instagramUsername: mockProfile.username,
        accessToken: mockProfile.access_token,
        status: 'active',
        businessAccountId: "mock_biz_id",
      }
    });

    // Redirect to settings or close window
    return NextResponse.redirect(new URL('/en/settings?instagram_connected=true', req.url));

  } catch (error) {
    console.error("Error in Instagram Callback:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
