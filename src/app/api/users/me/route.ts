import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const sessionId = cookieStore.get("imperium_session")?.value;

        if (!sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Me API Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
