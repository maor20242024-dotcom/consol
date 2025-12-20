import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const user = await requireAuth(req);
    if (!user || !user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    // Verify account ownership
    const account = await prisma.instagramAccount.findUnique({ where: { id } });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (account.userId !== user.id && user.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Disconnect logic: Delete or Mark Inactive?
    // Usually delete the row or clear token. Here we'll delete it to be clean.
    await prisma.instagramAccount.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Account disconnected" });
  } catch (error) {
    console.error("Error disconnecting instagram account:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
