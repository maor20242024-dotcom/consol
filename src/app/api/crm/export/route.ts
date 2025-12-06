import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: "desc" },
        });

        // Transform data for export
        const data = leads.map(lead => ({
            "ID": lead.id,
            "Name": lead.name,
            "Phone": lead.phone || "",
            "Email": lead.email || "",
            "Status": lead.status,
            "Source": lead.source,
            "Budget": lead.budget || "",
            "Score": lead.score,
            "Created At": lead.createdAt.toISOString().split('T')[0],
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });

    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Failed to export leads" },
            { status: 500 }
        );
    }
}
