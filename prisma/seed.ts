import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 1. Create Default Pipeline
  const defaultPipeline = await prisma.pipeline.upsert({
    where: { id: 'default-pipeline' },
    update: {},
    create: {
      id: 'default-pipeline',
      name: 'Sales Pipeline',
      isDefault: true,
      stages: {
        create: [
          { name: 'New Lead', order: 1, color: '#3b82f6' }, // Blue
          { name: 'Contacted', order: 2, color: '#eab308' }, // Yellow
          { name: 'Qualified', order: 3, color: '#f97316' }, // Orange
          { name: 'Proposal', order: 4, color: '#a855f7' }, // Purple
          { name: 'Negotiation', order: 5, color: '#ec4899' }, // Pink
          { name: 'Won', order: 6, color: '#22c55e' }, // Green
          { name: 'Lost', order: 7, color: '#ef4444' }, // Red
        ],
      },
    },
    include: {
      stages: true,
    },
  })

  console.log(`Created/Updated pipeline: ${defaultPipeline.name} with ${defaultPipeline.stages.length} stages.`)

  // 2. Update existing leads to be in the first stage of the default pipeline (Optional)
  const firstStage = defaultPipeline.stages.find((s: any) => s.order === 1)
  if (firstStage) {
    const updateResult = await prisma.lead.updateMany({
      where: {
        pipelineId: null,
      },
      data: {
        pipelineId: defaultPipeline.id,
        stageId: firstStage.id,
      },
    })
    console.log(`Updated ${updateResult.count} existing leads to default pipeline.`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
