
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// GET: Fetch all pipelines and their stages
export async function GET(req: Request) {
    try {
        const pipelines = await prisma.pipeline.findMany({
            include: {
                stages: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        return NextResponse.json(pipelines);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 });
    }
}

// POST: Update Stages Order or Create New Stage
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, pipelineId, stages, stageName, stageId } = body;

        if (action === 'REORDER') {
            // Transactional update for safety
            await prisma.$transaction(
                stages.map((stage: any, index: number) =>
                    prisma.stage.update({
                        where: { id: stage.id },
                        data: { order: index }
                    })
                )
            );
            return NextResponse.json({ success: true, message: 'Stages reordered' });
        }

        if (action === 'CREATE_STAGE') {
            // Find max order
            const lastStage = await prisma.stage.findFirst({
                where: { pipelineId },
                orderBy: { order: 'desc' }
            });
            const newOrder = lastStage ? lastStage.order + 1 : 0;

            const newStage = await prisma.stage.create({
                data: {
                    name: stageName,
                    pipelineId,
                    order: newOrder,
                    color: '#3b82f6' // Default Blue
                }
            });
            return NextResponse.json({ success: true, stage: newStage });
        }

        if (action === 'UPDATE_STAGE') {
            const updatedStage = await prisma.stage.update({
                where: { id: stageId },
                data: { name: stageName } // Can add color later
            });
            return NextResponse.json({ success: true, stage: updatedStage });
        }

        if (action === 'DELETE_STAGE') {
            // Check if stage has leads
            const count = await prisma.lead.count({ where: { stageId } });
            if (count > 0) {
                return NextResponse.json({ error: 'Cannot delete stage with active leads.' }, { status: 400 });
            }
            await prisma.stage.delete({ where: { id: stageId } });
            return NextResponse.json({ success: true, message: 'Stage deleted' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Pipeline Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
