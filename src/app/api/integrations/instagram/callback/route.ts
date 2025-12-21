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

    // OAuth flow requires valid Meta App configuration and client-side exchange.
    // This endpoint currently disabled to prevent mock data usage.
    return NextResponse.json({ error: "OAuth flow implementation pending. Please use System Sync via Admin Console." }, { status: 501 });

    // Redirect to settings or close window
    return NextResponse.redirect(new URL('/en/settings?instagram_connected=true', req.url));

  } catch (error) {
    console.error("Error in Instagram Callback:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
