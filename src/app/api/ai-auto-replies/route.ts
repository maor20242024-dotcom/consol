import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

/**
 * AI Auto-Reply Rules API
 * GET: List all rules
 * POST: Create new rule
 * PUT: Update existing rule
 * PATCH: Toggle rule status
 * DELETE: Delete rule
 */

interface AutoReplyRule {
  id?: string;
  name: string;
  keyword: string;
  response: string;
  useAI: boolean;
  isActive: boolean;
  platform: 'all' | 'instagram' | 'whatsapp';
  timeRestriction: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    
    // ✅ Using Prisma Client Typed instead of raw SQL
    const rules = await prisma.aIAutoReplyRule.findMany({
      where: {
        userId: auth.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const formattedRules = rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      keyword: rule.keyword,
      response: rule.response,
      useAI: rule.useAI,
      isActive: rule.isActive,
      platform: rule.platform as 'all' | 'instagram' | 'whatsapp',
      timeRestriction: {
        enabled: rule.timeRestrictionEnabled,
        startTime: rule.startTime || '09:00',
        endTime: rule.endTime || '18:00',
        timezone: rule.timezone || 'UTC'
      },
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    }));
    
    return NextResponse.json({
      success: true,
      rules: formattedRules,
      total: formattedRules.length
    });
  } catch (error: any) {
    console.error('GET /api/ai-auto-replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: AutoReplyRule = await req.json();
    
    // ✅ Using Prisma Client Typed instead of raw SQL
    const rule = await prisma.aIAutoReplyRule.create({
      data: {
        userId: auth.userId || 'unknown',
        name: body.name,
        keyword: body.keyword,
        response: body.response,
        useAI: body.useAI,
        isActive: body.isActive ?? true,
        platform: body.platform,
        timeRestrictionEnabled: body.timeRestriction.enabled,
        startTime: body.timeRestriction.enabled ? body.timeRestriction.startTime : null,
        endTime: body.timeRestriction.enabled ? body.timeRestriction.endTime : null,
        timezone: body.timeRestriction.enabled ? body.timeRestriction.timezone : null,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Rule created successfully',
      ruleId: rule.id
    });
  } catch (error: any) {
    console.error('POST /api/ai-auto-replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: AutoReplyRule & { id: string } = await req.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Rule ID is required' },
        { status: 400 }
      );
    }
    
    // Check ownership
    const existingRule = await prisma.aIAutoReplyRule.findUnique({
      where: { id: body.id }
    });

    if (!existingRule || existingRule.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Rule not found or unauthorized' },
        { status: 403 }
      );
    }
    
    // ✅ Using Prisma Client Typed instead of raw SQL
    await prisma.aIAutoReplyRule.update({
      where: { id: body.id },
      data: {
        name: body.name,
        keyword: body.keyword,
        response: body.response,
        useAI: body.useAI,
        platform: body.platform,
        timeRestrictionEnabled: body.timeRestriction.enabled,
        startTime: body.timeRestriction.enabled ? body.timeRestriction.startTime : null,
        endTime: body.timeRestriction.enabled ? body.timeRestriction.endTime : null,
        timezone: body.timeRestriction.enabled ? body.timeRestriction.timezone : null,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Rule updated successfully'
    });
  } catch (error: any) {
    console.error('PUT /api/ai-auto-replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);
    const ruleId = url.searchParams.get('id');
    const body = await req.json();
    
    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'Rule ID is required' },
        { status: 400 }
      );
    }
    
    // Check ownership
    const existingRule = await prisma.aIAutoReplyRule.findUnique({
      where: { id: ruleId }
    });

    if (!existingRule || existingRule.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Rule not found or unauthorized' },
        { status: 403 }
      );
    }
    
    // ✅ Using Prisma Client Typed instead of raw SQL
    await prisma.aIAutoReplyRule.update({
      where: { id: ruleId },
      data: {
        isActive: body.isActive,
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Rule status updated successfully'
    });
  } catch (error: any) {
    console.error('PATCH /api/ai-auto-replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rule status' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);
    const ruleId = url.searchParams.get('id');
    
    if (!ruleId) {
      return NextResponse.json(
        { success: false, error: 'Rule ID is required' },
        { status: 400 }
      );
    }
    
    // Check ownership
    const existingRule = await prisma.aIAutoReplyRule.findUnique({
      where: { id: ruleId }
    });

    if (!existingRule || existingRule.userId !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // ✅ Using Prisma Client Typed instead of raw SQL
    await prisma.aIAutoReplyRule.delete({
      where: { id: ruleId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error: any) {
    console.error('DELETE /api/ai-auto-replies error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
}
