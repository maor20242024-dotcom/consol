import { NextRequest, NextResponse } from "next/server";
import { ZadarmaClient } from "@/lib/zadarma";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    let auth;
    try {
      auth = await requireAuth(req);
    } catch (authError) {
      console.error('[VOICE API] Authentication failed:', authError);
      return NextResponse.json({ 
        success: false,
        error: "Unauthorized access - Authentication required"
      }, { status: 401 });
    }

    const { phone, name, campaign = "عرض إمبراطوري خاص", budget, leadId } = await req.json();

    // Validate inputs
    if (!phone || !name) {
      return NextResponse.json({
        success: false,
        error: "رقم الهاتف والاسم مطلوبان"
      }, { status: 400 });
    }

    // 🔒 SECURITY: Verify user owns the lead if leadId is provided
    if (leadId) {
      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          assignedTo: auth.userId // Only user's own leads
        }
      });

      if (!lead) {
        return NextResponse.json({
          success: false,
          error: "Lead not found or access denied"
        }, { status: 404 });
      }
    }

    // Create call record in database (INITIATED status)
    const callRecord = await prisma.call.create({
      data: {
        phoneNumber: phone,
        direction: "OUTBOUND",
        status: "INITIATED",
        leadId: leadId || null,
        // Note: userId and campaign fields need to be added to Call model in schema
        // For now, we'll create the call without these fields
        startedAt: new Date(),
      }
    });

    try {
      // Make call using Zadarma API
      const zadarmaResponse = await ZadarmaClient.makeCall(
        "+971800IMPERIUM", // Your Zadarma number (from)
        phone,             // Destination number (to)
        // Optional: specify SIP extension if needed
      );

      // Update call record with Zadarma call ID
      if (zadarmaResponse?.call_id) {
        await prisma.call.update({
          where: { id: callRecord.id },
          data: {
            zadarmaCallId: zadarmaResponse.call_id,
            status: "RINGING",
          }
        });
      }

      console.log("[VOICE API] Call initiated successfully:", {
        callId: callRecord.id,
        zadarmaCallId: zadarmaResponse?.call_id,
        to: phone,
        name,
        userId: auth.userId,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        callId: callRecord.id,
        zadarmaCallId: zadarmaResponse?.call_id,
        status: "ringing",
        message: `جاري الاتصال بـ ${name} على ${phone}...`,
        liveTranscript: true,
        emperor: true,
        timestamp: new Date().toISOString()
      });

    } catch (zadarmaError: any) {
      console.error("[VOICE API] Zadarma API ERROR]", zadarmaError);

      // Update call record to FAILED
      await prisma.call.update({
        where: { id: callRecord.id },
        data: {
          status: "FAILED",
          endedAt: new Date(),
        }
      });

      return NextResponse.json({
        success: false,
        error: "فشل الاتصال عبر Zadarma. يرجى المحاولة لاحقاً.",
        details: zadarmaError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[VOICE API] Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve call history
 */
export async function GET(req: NextRequest) {
  try {
    // 🔒 SECURITY: Require authentication
    const auth = await requireAuth(req);
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    // Note: userId field needs to be added to Call model in schema
    // For now, we'll get all calls (this will be fixed after schema update)
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where: whereClause,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.call.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      calls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[VOICE API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch call history'
    }, { status: 500 });
  }
}
