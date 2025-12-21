import { prisma } from "@/lib/db";

/**
 * 🛰️ Zeta Data Context Generator
 * Provides the AI with read-only situational awareness of the CRM.
 */

// 1. General System Context (Lightweight)
export async function getZetaCommandContext() {
    try {
        const [totalLeads, totalUsers, activeCampaigns, leadStatuses] = await Promise.all([
            prisma.lead.count(),
            prisma.user.count(),
            prisma.campaign.count({ where: { status: 'active' } }),
            prisma.lead.groupBy({
                by: ['status'],
                _count: { _all: true }
            })
        ]);

        const recentLeads = await prisma.lead.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { name: true, status: true, source: true, budget: true }
        });

        const statusSummary = leadStatuses.map(s => `${s.status}: ${s._count._all}`).join(', ');

        return `
--- SYSTEM OVERVIEW (GENERAL) ---
Stats: ${totalLeads} Leads | ${totalUsers} Agents | ${activeCampaigns} Active Campaigns
Lead Distribution: ${statusSummary}
Recent 5 Leads: ${recentLeads.map(l => `${l.name} (${l.status})`).join(', ')}
--- END OVERVIEW ---
`;
    } catch (error) {
        return "System Context: Unavailable.";
    }
}

// 2. Deep Lead Context (For "Analysis Brain")
export async function getDetailedLeadContext(leadId: string) {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                campaign: true,
                stage: true, // Include Stage to get Name
                pipeline: true, // Include Pipeline info
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                notifications: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                instagramMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                whatsappMessages: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            }
        });

        if (!lead) return "Lead Context: Lead not found.";

        // --- META-ANALYSIS ENGINE (Pre-Computed Intelligence) ---

        // 1. Calculate Interaction Gap
        const lastActivity = lead.activities[0]?.createdAt || lead.createdAt;
        const lastInstaParams = lead.instagramMessages[0]?.createdAt.getTime() || 0;
        const lastWhatsappParams = lead.whatsappMessages[0]?.createdAt.getTime() || 0;
        const lastComm = Math.max(lastInstaParams, lastWhatsappParams);

        const now = new Date().getTime();
        const daysSinceLastAction = Math.floor((now - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        const daysSinceLastComm = lastComm > 0 ? Math.floor((now - lastComm) / (1000 * 60 * 60 * 24)) : daysSinceLastAction;

        // 2. Risk Flags
        const isNeglected = daysSinceLastComm > 3; // 3 Days silence alert
        const isCriticalNeglect = daysSinceLastComm > 7; // 7 Days critical alert

        // 3. Incomplete Note Detection
        const lastNote = lead.activities.find(a => a.type === 'NOTE' || a.type === 'COMMENT');
        const hasIncompleteNote = lastNote &&
            !lastNote.content.toLowerCase().includes('done') &&
            !lastNote.content.toLowerCase().includes('next') &&
            !lastNote.isCompleted;

        // 4. Fetch Available Next Stages
        const availableStages = lead.pipelineId ? await prisma.stage.findMany({
            where: { pipelineId: lead.pipelineId },
            orderBy: { order: 'asc' },
            select: { name: true }
        }) : [];

        // --- END ANALYSIS ---

        // Merge messages for timeline
        const timeline = [
            ...lead.instagramMessages.map(m => ({ type: 'INSTAGRAM', date: m.createdAt, content: m.message, direction: m.direction })),
            ...lead.whatsappMessages.map(m => ({ type: 'WHATSAPP', date: m.createdAt, content: m.message, direction: m.direction }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

        // Separate tasks from activities
        const pendingTasks = lead.activities.filter(a => !a.isCompleted);
        const recentHistory = lead.activities.slice(0, 5);

        return `
--- DEEP LEAD INTELLIGENCE (ID: ${lead.id}) ---

[META-ANALYSIS FLAGS - FOR AI EYES ONLY]
- Days Since Last Interaction: ${daysSinceLastComm}
- Days Since Last Activity: ${daysSinceLastAction}
- NEGLECT RISK: ${isCriticalNeglect ? 'CRITICAL' : isNeglected ? 'HIGH' : 'NORMAL'}
- Incomplete Note Detected: ${hasIncompleteNote ? 'YES (Flag this to employee)' : 'NO'}
- Proactive Trigger: ${isNeglected ? 'REQUIRED (Scold employee for delay)' : 'MONITOR'}

PROFILE:
Name: ${lead.name}
Phone: ${lead.phone}
Email: ${lead.email}
Status: ${lead.status.toUpperCase()}
Source: ${lead.source || 'N/A'}
Budget: ${lead.budget || 'Not specified'}
Priority: ${lead.priority}
Current Pipeline Stage: ${lead.stage?.name || 'Unknown'} (Pipeline: ${lead.pipeline?.name || 'Default'})
Available Stages Sequence: ${availableStages.map(s => s.name).join(' -> ')}
Created: ${lead.createdAt.toISOString()}

marketing_context:
${lead.campaign ? `Campaign: ${lead.campaign.name} (${lead.campaign.platform}) - Objective: ${lead.campaign.objective}` : "No active campaign data."}

communication_log (Latest 10 Interactions):
${timeline.length > 0 ? timeline.map(t => `- [${t.type}/${t.direction}] ${t.date.toISOString().split('T')[0]}: "${t.content}"`).join('\n') : "No recent messages."}

pending_actions:
${pendingTasks.length > 0 ? pendingTasks.map(t => `- [${t.type}] ${t.content} (Due: ${t.scheduledFor ? t.scheduledFor.toISOString() : 'ASAP'})`).join('\n') : "No pending actions recorded."}

recent_activity_history:
${recentHistory.map(a => `- [${a.type}] ${a.content} (${a.isCompleted ? 'Done' : 'Pending'})`).join('\n')}

--- END LEAD CONTEXT ---
`;
    } catch (error) {
        console.error("Error fetching lead context:", error);
        return "Lead Context: Error retrieving detailed data.";
    }
}

// 3. Admin System Health (For "Admin Intelligence")
export async function getSystemHealthContext() {
    try {
        const [totalLeads, leadsToday, leadsNow, leadCountsByUser, users] = await Promise.all([
            prisma.lead.count(),
            prisma.lead.count({ where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
            prisma.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
            prisma.lead.groupBy({
                by: ['assignedTo'],
                _count: { _all: true }
            }),
            prisma.user.findMany({ select: { id: true, name: true, role: true } })
        ]);

        const agentStats = users.map(u => {
            const count = leadCountsByUser.find(c => c.assignedTo === u.id)?._count._all || 0;
            return `- ${u.name} (${u.role}): ${count} Active Leads`;
        }).join('\n');

        return `
--- ADMIN SYSTEM HEALTH REPORT ---
Total Database Leads: ${totalLeads}
Velocity: ${leadsToday} New Today | ${leadsNow} New This Week

AGENT PERFORMANCE ALLOCATION:
${agentStats}

FUNNEL HEALTH CHECK:
(AI should infer funnel health based on leads status distribution if queried)
--- END HEALTH REPORT ---
`;
    } catch (error) {
        return "System Health: Unavailable.";
    }
}
