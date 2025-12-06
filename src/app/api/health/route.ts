// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@supabase/supabase-js";

function supabaseOk(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return false;
    try {
        createClient(url, anon);
        return true;
    } catch {
        return false;
    }
}

export async function GET() {
    let dbOk = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbOk = true;
    } catch {
        dbOk = false;
    }

    const sbOk = supabaseOk();

    return NextResponse.json({
        ok: dbOk && sbOk,
        dbOk,
        supabaseOk: sbOk,
        time: new Date().toISOString(),
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    });
}
