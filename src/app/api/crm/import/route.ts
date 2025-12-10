import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        if (!rawData || rawData.length === 0) {
            return NextResponse.json({ error: "Empty file" }, { status: 400 });
        }

        let importedCount = 0;
        let errorCount = 0;

        // Process leads
        // Expected columns: Name, Phone, Email, Budget, Source, Status
        // Mapping loose keys to schema
        const leadsToCreate = [];

        for (const row of rawData as any[]) {
            const name = row['Name'] || row['name'] || row['Full Name'];

            // Name is required by schema
            if (!name) {
                errorCount++;
                continue;
            }

            const phone = row['Phone'] || row['phone'] || row['Mobile'];
            const email = row['Email'] || row['email'];
            const budget = row['Budget'] || row['budget']?.toString();
            const rawStatus = row['Status'] || row['status'];
            const rawSource = row['Source'] || row['source'];

            // Normalize values if needed, otherwise rely on schema defaults/Types
            leadsToCreate.push({
                name: String(name).trim(),
                phone: phone ? String(phone).trim() : "Unknown",
                email: email ? String(email).trim() : null,
                budget: budget ? String(budget).trim() : null,
                status: rawStatus ? String(rawStatus).toLowerCase() : undefined,
                source: rawSource ? String(rawSource).toUpperCase() : 'IMPORT',
            });
        }

        // Batch create using transaction or createMany
        if (leadsToCreate.length > 0) {
            // Prisma createMany is efficient
            const result = await prisma.lead.createMany({
                data: leadsToCreate,
            });
            importedCount = result.count;
        }

        return NextResponse.json({
            success: true,
            imported: importedCount,
            failed: errorCount,
            totalProcessed: rawData.length,
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json(
            { error: "Failed to process file" },
            { status: 500 }
        );
    }
}
