import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // 1. Find user in our LOCAL Prisma database
        // We use "any" casting here temporarily to bypass TS cache lag for newly added fields
        const user = await prisma.user.findUnique({
            where: { email },
        }) as any;

        if (!user || !user.password) {
            console.warn(`[ZETA AUTH] Login failed for ${email}: User not found or no password.`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: "Account disabled by Super Admin" }, { status: 403 });
        }

        // 2. Compare local password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn(`[ZETA AUTH] Login failed for ${email}: Incorrect password.`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. SECURE SESSION: Set a local cookie for the dashboard
        const cookieStore = cookies();
        cookieStore.set("imperium_session", user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        console.log(`[ZETA AUTH] SUCCESS: ${email} logged in. Role: ${user.role}`);

        return NextResponse.json({
            success: true,
            role: user.role
        });

    } catch (error) {
        console.error("[ZETA AUTH ERROR]", error);
        return NextResponse.json({ error: "Internal sensor failure" }, { status: 500 });
    }
}
