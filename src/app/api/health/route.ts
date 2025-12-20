// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    let dbOk = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch {
        dbOk = false;
    }

    return NextResponse.json({
        ok: dbOk,
        dbOk,
        authProvider: 'Stack Auth',
        time: new Date().toISOString(),
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    });
}
