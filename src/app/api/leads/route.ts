import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, budget } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert([{
        name,
        email,
        phone: phone || null,
        budget: budget || null,
        status: 'new',
        score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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