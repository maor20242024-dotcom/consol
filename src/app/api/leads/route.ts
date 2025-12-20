import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "@/lib/db";
import { DEFAULT_LEAD_SOURCE, isValidLeadSource } from "@/lib/lead-sources";
// We need to import requireAuth. If it is not found, we might need to verify its path. 
// Based on file list, src/lib/api-auth.ts exists.
import { requireAuth } from "@/lib/api-auth";

export const runtime = "nodejs"; // Force Node.js runtime for Prisma

export async function POST(req: NextRequest) {
  try {
    let authType: 'API_KEY' | 'SESSION' = 'SESSION';
    let authenticatedUserId: string | null = null;
    let authUserRole: string | null = null;

    // 1. CHECK API KEY (Bearer or Header)
    const apiKeyHeader = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");
    const allowedKey = process.env.IMPERIUM_CRM_API_KEY || process.env.CRM_API_KEY;

    let providedKey = apiKeyHeader;
    if (!providedKey && authHeader?.startsWith("Bearer ")) {
      providedKey = authHeader.split(" ")[1];
    }

    if (providedKey && allowedKey && providedKey === allowedKey) {
      authType = 'API_KEY';
    } else {
      // 2. CHECK SESSION (Fallback)
      try {
        const auth = await requireAuth(req);
        authenticatedUserId = auth.userId || null;
        authUserRole = auth.role || 'user';
        authType = 'SESSION';
      } catch (e) {
        // If both fail, return 401
        console.error('[LEADS API] Unauthorized access attempt (No Key, No Session)');
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // ... Parsing body ...
    const body = await req.json();
    const { name, phone, email, budget, source, campaignId } = body;

    // Basic Validation
    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    // 3. FIND DEFAULT PIPELINE & STAGE
    const defaultPipeline = await db.pipeline.findFirst({
      where: { isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          take: 1
        }
      }
    });

    const pipelineId = defaultPipeline?.id;
    const stageId = defaultPipeline?.stages[0]?.id;

    // 4. DETERMINE ASSIGNMENT
    let assignedUserId: string | null | undefined = null;

    if (authType === 'SESSION' && authenticatedUserId) {
      // If created by a logged-in user, assign to them (Self-assign)
      // Or if they provided an `assignedTo` in body (not implemented yet), use that.
      // For now, default to self-assign.
      assignedUserId = authenticatedUserId;
    } else {
      // API KEY (Landing Page) -> Auto-assign to Admin
      assignedUserId = process.env.DEFAULT_ADMIN_USER_ID;

      if (!assignedUserId) {
        // Find first admin
        const adminUser = await db.user.findFirst({ where: { role: 'admin' } });
        assignedUserId = adminUser?.id;
      }

      if (!assignedUserId) {
        // Fallback to any user
        const anyUser = await db.user.findFirst();
        assignedUserId = anyUser?.id;
      }
    }

    if (!assignedUserId) {
      return NextResponse.json({ error: "Internal Configuration Error: No users found" }, { status: 500 });
    }

    // 5. CREATE LEAD (PRISMA)
    const normalizedSource = source && isValidLeadSource(source) ? source : (authType === 'API_KEY' ? 'landing-ad' : DEFAULT_LEAD_SOURCE);

    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        budget: budget ? String(budget) : null,
        source: normalizedSource,
        status: "new",
        pipelineId: pipelineId,
        stageId: stageId,
        assignedTo: assignedUserId,
        campaignId: (campaignId && campaignId !== 'No campaign' && campaignId !== "") ? campaignId : null,
        // createdBy is not in schema, ignoring
      }
    });

    // 6. CREATE NOTIFICATION 
    // Logic: If I assign to myself (Session), I likely don't need a "New Lead" notification unless requested?
    // Actually, user requirement: "When lead from ad arrives -> Notification to Admin".
    // If user adds manually, notification is probably noise.
    if (authType === 'API_KEY') {
      await db.notification.create({
        data: {
          type: "LEAD_ASSIGNMENT",
          title: "New Lead from Landing Page",
          body: `New lead assigned: ${name} (${phone})`,
          userId: assignedUserId,
          leadId: lead.id,
          isRead: false
        }
      });
    }

    console.log(`[LEADS API] Lead created: ${lead.id} assigned to ${assignedUserId} via ${authType}`);

    return NextResponse.json({
      success: true,
      leadId: lead.id
    });

  } catch (error: any) {
    console.error("[LEADS API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 });
}
