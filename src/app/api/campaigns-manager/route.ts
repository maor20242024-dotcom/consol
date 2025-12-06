import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/api-auth';

/**
 * Campaign Manager API
 * Full campaign management with AI suggestions support
 */

interface CampaignData {
  name: string;
  description: string;
  objective: string;
  audience: string;
  budget: number;
  startDate: string;
  endDate: string;
  placements: string[];
  creative: {
    title: string;
    description: string;
    imageUrl: string;
    callToAction: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    
    const prisma = new PrismaClient();
    try {
      const campaigns = await prisma.adCampaign.findMany({
        where: {
          userId: auth.id || auth.userId || 'anonymous'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          creatives: true
        }
      });
      
      // Convert Decimal to number and format response
      const parsedCampaigns = campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: '', // AdCampaign model doesn't have description field
        objective: campaign.objective || '',
        audience: '',
        budget: Number(campaign.dailyBudget || 0),
        startDate: campaign.startDate?.toISOString() || null,
        endDate: campaign.endDate?.toISOString() || null,
        status: campaign.status,
        placements: [],
        creative: {},
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      }));

      return NextResponse.json({
        success: true,
        campaigns: parsedCampaigns,
        total: parsedCampaigns.length
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('GET /api/campaigns-manager error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body: CampaignData = await req.json();
    
    const prisma = new PrismaClient();
    try {
      const campaign = await prisma.adCampaign.create({
        data: {
          userId: auth.id || auth.userId || 'anonymous',
          name: body.name,
          objective: body.objective,
          platform: 'facebook',
          status: 'draft',
          dailyBudget: body.budget,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null
        }
      });
      
      return NextResponse.json({
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          description: body.description || '',
          objective: campaign.objective || '',
          audience: '',
          budget: Number(campaign.dailyBudget || 0),
          status: campaign.status,
          placements: [],
          creative: {},
          ads: 0
        },
        message: 'Campaign created successfully'
      });

    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('POST /api/campaigns-manager error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);
    const campaignId = url.pathname.split('/').pop();
    const body: Partial<CampaignData> & { status?: string } = await req.json();
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    const prisma = new PrismaClient();
    try {
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (body.name !== undefined) updateData.name = body.name;
      if (body.budget !== undefined) updateData.dailyBudget = body.budget;
      if (body.status !== undefined) updateData.status = body.status;
      
      if (body.startDate !== undefined) {
        updateData.startDate = body.startDate ? new Date(body.startDate) : null;
      }
      if (body.endDate !== undefined) {
        updateData.endDate = body.endDate ? new Date(body.endDate) : null;
      }
      
      await prisma.adCampaign.update({
        where: {
          id: campaignId,
          userId: auth.id || auth.userId || 'anonymous'
        },
        data: updateData
      });
      
      return NextResponse.json({
        success: true,
        message: 'Campaign updated successfully'
      });

    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('PUT /api/campaigns-manager error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const url = new URL(req.url);
    const campaignId = url.pathname.split('/').pop();
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    const prisma = new PrismaClient();
    try {
      await prisma.adCampaign.delete({
        where: {
          id: campaignId,
          userId: auth.userId
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Campaign deleted successfully'
      });

    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('DELETE /api/campaigns-manager error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
