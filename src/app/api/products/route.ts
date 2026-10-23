import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET /api/products?q=&categoryId=&brandId=&motorTypeId=&stok=&tipe=&terlaris=&page=&pageSize=
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() || "";
    const categoryId = url.searchParams.get("categoryId") || "";
    const brandId = url.searchParams.get("brandId") || "";
    const motorTypeId = url.searchParams.get("motorTypeId") || "";
    const stok = url.searchParams.get("stok") || ""; // READY/MENIPIS/KOSONG
    const tipe = url.searchParams.get("tipe") || ""; // ORI/OEM/KW1
    const terlaris = url.searchParams.get("terlaris") === "true";
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize") || "24")));

    const where: Prisma.ProductWhereInput = {};
    if (q) {
      // Sinonim manual: kampas = kanvas
      const synonym = q.toLowerCase().includes("kampas")
        ? q.replace(/kampas/i, "kanvas")
        : q.toLowerCase().includes("kanvas")
        ? q.replace(/kanvas/i, "kampas")
        : null;
      // Note: SQLite contains uses LIKE which is case-insensitive for ASCII by default.
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { deskripsi: { contains: q } },
        ...(synonym ? [{ name: { contains: synonym } }] : []),
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (stok) where.stokStatus = stok;
    if (tipe) where.tipe = tipe;
    if (terlaris) where.isTerlaris = true;
    if (motorTypeId) {
      where.compatibilities = { some: { motorTypeId } };
    }

    const [total, items] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        orderBy: [{ isTerlaris: "desc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          brand: true,
          compatibilities: { include: { motorType: true } },
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

// POST /api/products  -> Create
// PATCH /api/products?id=xxx -> Update
// DELETE /api/products?id=xxx -> Delete
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      categoryId,
      brandId,
      tipe,
      hargaJual,
      jasaPasang,
      stokStatus,
      deskripsi,
      isTerlaris,
      motorTypeIds = [],
      sku,
    } = body;

    if (!name || !categoryId || !brandId || !tipe || !hargaJual) {
      return NextResponse.json(
        { ok: false, message: "Field wajib: name, categoryId, brandId, tipe, hargaJual" },
        { status: 400 }
      );
    }

    // Generate SKU & slug if not provided
    const category = await db.category.findUnique({ where: { id: categoryId } });
    const brand = await db.brand.findUnique({ where: { id: brandId } });
    if (!category || !brand) {
      return NextResponse.json({ ok: false, message: "Kategori atau brand tidak ditemukan" }, { status: 400 });
    }

    let finalSku = sku as string;
    if (!finalSku) {
      const catCode = category.name.split(" ")[0].toUpperCase().slice(0, 4);
      const brandCode = brand.name.split(" ")[0].toUpperCase().slice(0, 3);
      const count = await db.product.count({
        where: { sku: { contains: `${catCode}-${brandCode}` } },
      });
      finalSku = `${catCode}-${brandCode}-${String(count + 1).padStart(3, "0")}`;
    }

    const slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) +
      "-" + Date.now().toString(36);

    const created = await db.product.create({
      data: {
        sku: finalSku,
        slug,
        name,
        categoryId,
        brandId,
        tipe,
        hargaJual: Number(hargaJual),
        jasaPasang: jasaPasang ? Number(jasaPasang) : null,
        stokStatus: stokStatus || "READY",
        deskripsi: deskripsi || null,
        isTerlaris: !!isTerlaris,
        barcodeValue: finalSku,
        fotoUrl: body.fotoUrl || null,
        compatibilities: motorTypeIds.length
          ? { create: motorTypeIds.map((id: string) => ({ motorTypeId: id })) }
          : undefined,
      },
      include: { category: true, brand: true, compatibilities: { include: { motorType: true } } },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, message: "id wajib" }, { status: 400 });

    const body = await req.json();
    const { motorTypeIds, ...rest } = body;

    // Update scalar fields
    const data: Prisma.ProductUpdateInput = {};
    if (rest.name !== undefined) data.name = rest.name;
    if (rest.tipe !== undefined) data.tipe = rest.tipe;
    if (rest.hargaJual !== undefined) data.hargaJual = Number(rest.hargaJual);
    if (rest.jasaPasang !== undefined) data.jasaPasang = rest.jasaPasang ? Number(rest.jasaPasang) : null;
    if (rest.stokStatus !== undefined) data.stokStatus = rest.stokStatus;
    if (rest.deskripsi !== undefined) data.deskripsi = rest.deskripsi;
    if (rest.isTerlaris !== undefined) data.isTerlaris = !!rest.isTerlaris;
    if (rest.fotoUrl !== undefined) data.fotoUrl = rest.fotoUrl;
    if (rest.categoryId !== undefined) {
      data.category = { connect: { id: rest.categoryId } };
    }
    if (rest.brandId !== undefined) {
      data.brand = { connect: { id: rest.brandId } };
    }

    // Replace compatibilities if provided
    if (Array.isArray(motorTypeIds)) {
      await db.productCompatibility.deleteMany({ where: { productId: id } });
      if (motorTypeIds.length > 0) {
        data.compatibilities = {
          create: motorTypeIds.map((mid: string) => ({ motorTypeId: mid })),
        };
      }
    }

    const updated = await db.product.update({
      where: { id },
      data,
      include: { category: true, brand: true, compatibilities: { include: { motorType: true } } },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, message: "id wajib" }, { status: 400 });
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
