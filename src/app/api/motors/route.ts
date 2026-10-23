import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/motors - list semua motor types, group by brand
export async function GET() {
  try {
    const motors = await db.motorType.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    });
    return NextResponse.json({ ok: true, data: motors });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
