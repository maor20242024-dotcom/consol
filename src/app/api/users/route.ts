import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminAuth } from "@/lib/api-auth";

// GET: List all users (Employees)
export async function GET(req: NextRequest) {
  try {
    // Only superadmins can list all users
    await requireSuperAdminAuth(req);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('User Fetch Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  try {
    // Only superadmins can create users
    await requireSuperAdminAuth(req);

    const { id, name, email, role } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || undefined,
        role: role || undefined
      },
      create: {
        id: id || undefined,
        name,
        email,
        role: role || 'user'
      }
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('User Upsert Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}