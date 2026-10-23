import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Valid jam slots available for booking (08:00 - 19:00, every hour)
export const AVAILABLE_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];

interface BookingInput {
  namaPelanggan: string;
  noWhatsapp: string;
  motorBrand: string;
  motorModel: string;
  platNomor?: string;
  layanan: string;
  keluhan?: string;
  tanggal: string; // ISO date string
  jam: string;
}

function validateInput(body: BookingInput): string | null {
  if (!body.namaPelanggan || body.namaPelanggan.trim().length < 2) {
    return "Nama pelanggan minimal 2 karakter";
  }
  if (!body.noWhatsapp || !/^(\+?62|0)8[0-9]{6,12}$/.test(body.noWhatsapp.replace(/[\s-]/g, ""))) {
    return "Nomor WhatsApp tidak valid (format: 08xxx atau 628xxx)";
  }
  if (!body.motorBrand) return "Brand motor wajib";
  if (!body.motorModel || body.motorModel.trim().length < 1) return "Model motor wajib";
  if (!body.layanan) return "Layanan wajib dipilih";
  if (!body.tanggal) return "Tanggal booking wajib";
  if (!body.jam || !AVAILABLE_SLOTS.includes(body.jam)) {
    return "Jam booking tidak valid. Pilih dari slot yang tersedia.";
  }

  // Tanggal tidak boleh lewat dari hari ini
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(body.tanggal);
  bookingDate.setHours(0, 0, 0, 0);
  if (bookingDate < today) {
    return "Tanggal booking tidak boleh tanggal lewat";
  }

  // Max 30 hari ke depan
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  if (bookingDate > maxDate) {
    return "Tanggal booking maksimal 30 hari ke depan";
  }

  return null;
}

// POST /api/bookings — public, create new booking
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BookingInput;

    // Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return NextResponse.json(
        { ok: false, message: validationError },
        { status: 400 }
      );
    }

    // Check slot availability (max 3 booking per slot)
    const tanggalStart = new Date(body.tanggal);
    tanggalStart.setHours(0, 0, 0, 0);
    const tanggalEnd = new Date(body.tanggal);
    tanggalEnd.setHours(23, 59, 59, 999);

    const existingCount = await db.booking.count({
      where: {
        tanggal: { gte: tanggalStart, lte: tanggalEnd },
        jam: body.jam,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingCount >= 3) {
      return NextResponse.json(
        {
          ok: false,
          message: `Slot ${body.jam} sudah penuh. Silakan pilih jam lain.`,
        },
        { status: 409 }
      );
    }

    // Validate layanan exists
    const service = await db.serviceItem.findUnique({
      where: { slug: body.layanan },
    });
    if (!service) {
      return NextResponse.json(
        { ok: false, message: "Layanan tidak ditemukan" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        namaPelanggan: body.namaPelanggan.trim(),
        noWhatsapp: body.noWhatsapp.replace(/[\s-]/g, ""),
        motorBrand: body.motorBrand,
        motorModel: body.motorModel.trim(),
        platNomor: body.platNomor?.trim().toUpperCase() || null,
        layanan: service.name,
        keluhan: body.keluhan?.trim() || null,
        tanggal: new Date(body.tanggal),
        jam: body.jam,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      ok: true,
      data: booking,
      message: "Booking berhasil dibuat. Admin akan konfirmasi via WhatsApp.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

// GET /api/bookings — admin only, list all bookings with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized — login admin diperlukan" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "";
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "50")));

    const where: Prisma.BookingWhereInput = {};
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        orderBy: [{ tanggal: "asc" }, { jam: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: items,
      total,
      page,
      pageSize,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

// PATCH /api/bookings?id=xxx — admin only, update status / catatanAdmin
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized — login admin diperlukan" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, message: "id wajib" }, { status: 400 });
    }

    const body = await req.json();
    const data: Prisma.BookingUpdateInput = {};
    if (body.status && ["PENDING", "CONFIRMED", "DONE", "CANCELLED"].includes(body.status)) {
      data.status = body.status;
    }
    if (body.catatanAdmin !== undefined) {
      data.catatanAdmin = body.catatanAdmin || null;
    }

    const updated = await db.booking.update({ where: { id }, data });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
