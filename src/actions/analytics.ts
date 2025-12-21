"use server";

import { prisma } from "@/lib/db";
import { subDays, format, startOfDay } from "date-fns";

/**
 * 📊 Extracts the absolute truth from Zeta's database.
 * No fake data. No illusions.
 */
export async function getAnalyticsData() {
    try {
        const sevenDaysAgo = subDays(new Date(), 7);

        const [
            leadsCount,
            campaignsStats,
            leadTrends,
            leadsBySource
        ] = await Promise.all([
            // Total leads in system
            prisma.lead.count(),

            // Aggregate totals from campaigns
            prisma.campaign.aggregate({
                _sum: {
                    impressions: true,
                    clicks: true,
                    conversions: true,
                    spend: true
                }
            }),

            // Lead Trends (Last 7 days)
            prisma.lead.findMany({
                where: {
                    createdAt: {
                        gte: sevenDaysAgo
                    }
                },
                select: {
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }),

            // Leads by Source distribution
            prisma.lead.groupBy({
                by: ['source'],
                _count: {
                    id: true
                }
            })
        ]);

        // Process Trends: Group by day for the chart
        const trendsMap = new Map();
        // Initialize last 7 days with zeros
        for (let i = 0; i <= 7; i++) {
            const dateStr = format(subDays(new Date(), 7 - i), 'MMM d');
            trendsMap.set(dateStr, { day: dateStr, impressions: 0, clicks: 0, conversions: 0, spend: 0, leads: 0 });
        }

        leadTrends.forEach(lead => {
            const dateStr = format(lead.createdAt, 'MMM d');
            if (trendsMap.has(dateStr)) {
                const dayData = trendsMap.get(dateStr);
                dayData.leads += 1;
            }
        });

        // We also need to fetch Impressions/Clicks/Spend per day from Insights if they exist
        const dailyInsights = await prisma.insight.findMany({
            where: {
                date: {
                    gte: sevenDaysAgo
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        dailyInsights.forEach(insight => {
            const dateStr = format(insight.date, 'MMM d');
            if (trendsMap.has(dateStr)) {
                const dayData = trendsMap.get(dateStr);
                dayData.impressions += insight.impressions;
                dayData.clicks += insight.clicks;
                dayData.conversions += insight.leads; // converting leads count from insight
                dayData.spend += Number(insight.spend);
            }
        });

        const chartData = Array.from(trendsMap.values());

        // Calculate Totals and Metrics
        const totals = {
            totalLeads: leadsCount,
            totalImpressions: Number(campaignsStats._sum.impressions || 0),
            totalClicks: Number(campaignsStats._sum.clicks || 0),
            totalConversions: Number(campaignsStats._sum.conversions || 0),
            totalSpend: Number(campaignsStats._sum.spend || 0)
        };

        const metrics = [
            {
                label: "Click-Through Rate",
                value: totals.totalImpressions > 0 ? `${((totals.totalClicks / totals.totalImpressions) * 100).toFixed(2)}%` : "0%",
                benchmark: "Industry: 3.5%"
            },
            {
                label: "Conversion Rate",
                value: totals.totalClicks > 0 ? `${((totals.totalConversions / totals.totalClicks) * 100).toFixed(2)}%` : "0%",
                benchmark: "Industry: 2.5%"
            },
            {
                label: "Cost Per Click",
                value: totals.totalClicks > 0 ? `$${(totals.totalSpend / totals.totalClicks).toFixed(2)}` : "$0.00",
                benchmark: "Industry: $0.80"
            },
            {
                label: "Cost Per Acquisition",
                value: totals.totalConversions > 0 ? `$${(totals.totalSpend / totals.totalConversions).toFixed(2)}` : "$0.00",
                benchmark: "Industry: $25.00"
            }
        ];

        return {
            success: true,
            stats: totals,
            chartData,
            sources: leadsBySource.map(s => ({
                source: s.source,
                count: s._count.id
            })),
            metrics
        };

    } catch (error) {
        console.error("Failed to fetch analytics data:", error);
        return { success: false, error: "Failed to fetch analytics data" };
    }
}
