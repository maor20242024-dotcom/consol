import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

// This webhook is intended to be called by Google Apps Script or other automation tools
// when a new row is added to a Google Sheet.
// Auth: Simple Bearer token check using a shared secret (e.g., ZADARMA_API_SECRET or a new key)
// For simplicity, we'll check against ZADARMA_API_SECRET as a placeholder for "Internal Secret"
const INTERNAL_SECRET = env.ZADARMA_API_SECRET;

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");

        // Basic security check
        if (INTERNAL_SECRET && authHeader !== `Bearer ${INTERNAL_SECRET}`) {
            // Allow bypassing if no secret is set (dev mode warning) but strictly, should be secured.
            // For this implementation, we will log a warning if no secret, but block if secret exists and doesn't match.
            console.warn("Google Sheets Webhook: Unauthorized attempt.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();

        // Expected keys: name, phone, email, notes, source
        const { name, phone, email, notes, source, budget } = payload;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const newLead = await prisma.lead.create({
            data: {
                name: String(name),
                phone: phone ? String(phone) : null,
                email: email ? String(email) : null,
                source: source ? String(source).toUpperCase() : "GOOGLE_SHEETS",
                budget: budget ? String(budget) : null,
                status: "new", // Default status
                activities: notes ? {
                    create: {
                        type: "NOTE",
                        content: `Imported from Sheets. Notes: ${notes}`,
                    }
                } : undefined
            }
        });

        return NextResponse.json({ success: true, leadId: newLead.id });

    } catch (error) {
        console.error("Google Sheets Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
