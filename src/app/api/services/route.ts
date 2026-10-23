import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/services — list all active service items (public)
export async function GET() {
  try {
    const services = await db.serviceItem.findMany({
      where: { isActive: true },
      orderBy: { priceFrom: "asc" },
    });
    return NextResponse.json({ ok: true, data: services });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
