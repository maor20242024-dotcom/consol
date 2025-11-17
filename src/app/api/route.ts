import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    empire: "IMPERIUM GATE",
    status: "مُسلّح ومُهيمن",
    message: "الإمبراطورية لا تُرد، تُخضع.",
    timestamp: new Date().toLocaleString("ar-AE", { timeZone: "Asia/Dubai" })
  });
}