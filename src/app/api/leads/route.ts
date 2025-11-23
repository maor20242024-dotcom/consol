import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, budget, source } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone,
          email: email ?? null,
          budget: budget ?? null,
          source: source ?? 'CRM',
          status: 'new',
          score: Math.floor(Math.random() * 30) + 70
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message ?? 'Failed to insert lead' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Lead Creation Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}