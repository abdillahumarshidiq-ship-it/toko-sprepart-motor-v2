// Seed data untuk Sijambul Merah
// 10 motor wajib (Honda, Yamaha, Suzuki) + 12 kategori + 3 brand + ~30 produk sample

import { db } from "@/lib/db";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const MOTORS = [
  { brand: "Honda", model: "Beat FI", yearFrom: 2014, yearTo: null },
  { brand: "Honda", model: "Vario 125", yearFrom: 2014, yearTo: null },
  { brand: "Honda", model: "Vario 150", yearFrom: 2014, yearTo: null },
  { brand: "Honda", model: "Scoopy FI", yearFrom: 2014, yearTo: null },
  { brand: "Honda", model: "PCX 160", yearFrom: 2021, yearTo: null },
  { brand: "Honda", model: "Supra X 125", yearFrom: 2010, yearTo: null },
  { brand: "Yamaha", model: "NMAX", yearFrom: 2015, yearTo: null },
  { brand: "Yamaha", model: "Aerox", yearFrom: 2017, yearTo: null },
  { brand: "Yamaha", model: "Mio M3", yearFrom: 2014, yearTo: null },
  { brand: "Yamaha", model: "Jupiter Z", yearFrom: 2010, yearTo: null },
  { brand: "Suzuki", model: "Satria FU", yearFrom: 2010, yearTo: null },
];

const CATEGORIES = [
  { name: "Oli", icon: "Droplet" },
  { name: "Ban", icon: "Circle" },
  { name: "Rem", icon: "Disc" },
  { name: "CVT", icon: "Cog" },
  { name: "Aki", icon: "BatteryFull" },
  { name: "Lampu", icon: "Lightbulb" },
  { name: "Rantai Gear", icon: "Link2" },
  { name: "Shock", icon: "Waves" },
  { name: "Busi", icon: "Zap" },
  { name: "Filter", icon: "Filter" },
  { name: "Kabel", icon: "Cable" },
  { name: "Spion", icon: "Eye" },
];

const BRANDS = ["Honda Genuine", "Aspira", "Federal", "Yamaha Genuine", "NGK", "FDR"];

// Sample products: [category, brand, motorShort, name, tipe, harga, jasa, stok, terlaris]
const PRODUCTS_RAW: Array<[string, string, string, string, string, number, number, string, boolean]> = [
  // Oli
  ["Oli", "Aspira", "BEAT", "Oli Mesin Aspira 10W-40 800ml (Beat/Vario)", "ORI", 48000, 15000, "READY", true],
  ["Oli", "Honda Genuine", "VARIO", "Oli Mesin Honda Genuine 10W-30 1L (Vario 150)", "ORI", 62000, 15000, "READY", true],
  ["Oli", "Aspira", "NMAX", "Oli Mesin Aspira 10W-40 1L (NMAX/Aerox)", "ORI", 52000, 15000, "READY", false],
  ["Oli", "Federal", "SUPRA", "Oli Mesin Federal Supreme 20W-50 1L (Supra/Jupiter)", "OEM", 45000, 15000, "MENIPIS", false],
  // Ban
  ["Ban", "FDR", "BEAT", "Ban FDR Nephula 80/90-14 Depan (Beat FI)", "OEM", 165000, 25000, "READY", true],
  ["Ban", "FDR", "VARIO", "Ban FDR Nephula 90/80-14 Belakang (Vario 125)", "OEM", 185000, 25000, "READY", true],
  ["Ban", "FDR", "NMAX", "Ban FDR Nephula 130/70-13 Belakang (NMAX)", "OEM", 215000, 25000, "READY", false],
  ["Ban", "Federal", "PCX", "Ban Federal 100/80-14 Depan (PCX 160)", "OEM", 195000, 25000, "MENIPIS", false],
  // Rem
  ["Rem", "Aspira", "BEAT", "Kampas Rem Depan Aspira (Beat FI 2014-2020)", "ORI", 78000, 20000, "READY", true],
  ["Rem", "Aspira", "VARIO", "Kampas Rem Belakang Aspira (Vario 125/150)", "ORI", 85000, 20000, "READY", true],
  ["Rem", "Honda Genuine", "NMAX", "Kampas Rem Depan Honda Genuine (NMAX Compatible)", "ORI", 95000, 20000, "MENIPIS", false],
  ["Rem", "Aspira", "JUPITER", "Kampas Rem Belakang Aspira (Jupiter Z)", "ORI", 72000, 20000, "READY", false],
  // CVT
  ["CVT", "Aspira", "VARIO", "Roller CVT 15g Aspira (Vario 125/150) - Set 6pcs", "OEM", 95000, 35000, "READY", true],
  ["CVT", "Aspira", "NMAX", "Roller CVT 16g Aspira (NMAX/Aerox) - Set 6pcs", "OEM", 98000, 35000, "READY", false],
  ["CVT", "Honda Genuine", "BEAT", "V-Belt Honda Genuine (Beat FI)", "ORI", 135000, 50000, "READY", false],
  ["CVT", "Aspira", "PCX", "Roller CVT 18g Aspira (PCX 160)", "OEM", 110000, 35000, "KOSONG", false],
  // Aki
  ["Aki", "Honda Genuine", "BEAT", "Aki Kering 12V 5Ah Honda Genuine (Beat FI)", "ORI", 195000, 20000, "READY", true],
  ["Aki", "Federal", "NMAX", "Aki Federal 12V 5Ah (NMAX/Aerox)", "OEM", 175000, 20000, "READY", false],
  ["Aki", "Honda Genuine", "SUPRA", "Aki Basah 12V 7Ah Honda Genuine (Supra X 125)", "ORI", 215000, 20000, "MENIPIS", false],
  // Lampu
  ["Lampu", "Aspira", "BEAT", "Bohlam Depan LED H4 Aspira (Beat/Vario)", "OEM", 89000, 15000, "READY", true],
  ["Lampu", "Aspira", "NMAX", "Bohlam Depan LED H7 Aspira (NMAX/Aerox)", "OEM", 95000, 15000, "READY", false],
  ["Lampu", "Honda Genuine", "SCOOPY", "Bohlam Stop Lamp Honda Genuine (Scoopy FI)", "ORI", 42000, 10000, "READY", false],
  // Rantai Gear
  ["Rantai Gear", "Honda Genuine", "SUPRA", "Set Rantai Gear Honda Genuine (Supra X 125)", "ORI", 285000, 40000, "READY", false],
  ["Rantai Gear", "Federal", "JUPITER", "Set Rantai Gear Federal (Jupiter Z)", "OEM", 245000, 40000, "MENIPIS", false],
  ["Rantai Gear", "Honda Genuine", "SATRIA", "Set Rantai Gear Honda Genuine (Satria FU)", "ORI", 295000, 40000, "READY", false],
  // Shock
  ["Shock", "Honda Genuine", "BEAT", "Shock Belakang Honda Genuine (Beat FI)", "ORI", 425000, 60000, "MENIPIS", false],
  ["Shock", "Aspira", "VARIO", "Shock Belakang Aspira Performance (Vario 125)", "OEM", 385000, 60000, "READY", false],
  // Busi
  ["Busi", "NGK", "BEAT", "Busi NGK Iridium CR8EIX (Beat FI/Vario)", "ORI", 95000, 8000, "READY", true],
  ["Busi", "NGK", "NMAX", "Busi NGK Iridium CR9EIX (NMAX/Aerox)", "ORI", 98000, 8000, "READY", true],
  ["Busi", "NGK", "JUPITER", "Busi NGK Standard BP7ES (Jupiter Z)", "OEM", 28000, 8000, "READY", false],
  // Filter
  ["Filter", "Aspira", "BEAT", "Filter Udara Aspira (Beat FI)", "OEM", 55000, 12000, "READY", false],
  ["Filter", "Honda Genuine", "VARIO", "Filter Udara Honda Genuine (Vario 125)", "ORI", 68000, 12000, "READY", false],
  ["Filter", "Aspira", "NMAX", "Filter Oli Aspira (NMAX/Aerox)", "OEM", 32000, 5000, "READY", true],
  // Kabel
  ["Kabel", "Honda Genuine", "BEAT", "Kabel Gas Honda Genuine (Beat FI)", "ORI", 48000, 10000, "READY", false],
  ["Kabel", "Honda Genuine", "SUPRA", "Kabel Kopling Honda Genuine (Supra X 125)", "ORI", 52000, 10000, "KOSONG", false],
  // Spion
  ["Spion", "Honda Genuine", "BEAT", "Spion Kanan Honda Genuine (Beat FI)", "ORI", 75000, 8000, "READY", false],
  ["Spion", "Honda Genuine", "VARIO", "Spion Kiri Honda Genuine (Vario 150)", "ORI", 78000, 8000, "READY", false],
  ["Spion", "Aspira", "NMAX", "Spion Set Aspira Chrome (NMAX)", "OEM", 145000, 10000, "MENIPIS", false],
  // ===== Tambahan sparepart baru =====
  // Oli Premium Synthetic
  ["Oli", "Honda Genuine", "PCX", "Oli Mesin Honda Genuine Ultra 10W-30 1L (PCX 160)", "ORI", 89000, 15000, "READY", true],
  ["Oli", "Aspira", "JUPITER", "Oli Mesin Aspira Synthetic 5W-40 1L (Jupiter Z)", "OEM", 68000, 15000, "READY", false],
  ["Oli", "Federal", "NMAX", "Oli Federal XTR 10W-40 1L (NMAX/Aerox)", "OEM", 75000, 15000, "READY", true],
  ["Oli", "Honda Genuine", "SATRIA", "Oli Mesin Honda Genuine 10W-40 1L (Satria FU)", "ORI", 58000, 15000, "MENIPIS", false],
  // Ban Premium
  ["Ban", "FDR", "SCOOPY", "Ban FDR Poly 80/80-14 Depan (Scoopy FI)", "OEM", 175000, 25000, "READY", false],
  ["Ban", "Federal", "JUPITER", "Ban Federal 70/90-17 Belakang (Jupiter Z)", "OEM", 195000, 25000, "READY", false],
  ["Ban", "FDR", "SUPRA", "Ban FDR Poly 80/90-17 Depan (Supra X 125)", "OEM", 165000, 25000, "READY", false],
  ["Ban", "Federal", "SATRIA", "Ban Federal 80/90-17 Belakang (Satria FU)", "OEM", 215000, 25000, "MENIPIS", false],
  // Rem Premium
  ["Rem", "Honda Genuine", "SCOOPY", "Kampas Rem Belakang Honda Genuine (Scoopy FI)", "ORI", 88000, 20000, "READY", false],
  ["Rem", "Aspira", "PCX", "Kampas Rem Depan Aspira (PCX 160)", "ORI", 105000, 20000, "READY", false],
  ["Rem", "Aspira", "JUPITER", "Kampas Rem Depan Aspira (Jupiter Z)", "ORI", 75000, 20000, "KOSONG", false],
  ["Rem", "Honda Genuine", "SATRIA", "Kampas Rem Belakang Honda Genuine (Satria FU)", "ORI", 92000, 20000, "READY", false],
  // CVT Performance
  ["CVT", "Aspira", "BEAT", "Slider Aspira Performance (Beat FI) - Set 3pcs", "OEM", 45000, 25000, "READY", false],
  ["CVT", "Honda Genuine", "VARIO", "Clutch Cover Honda Genuine (Vario 125)", "ORI", 285000, 50000, "MENIPIS", false],
  ["CVT", "Aspira", "NMAX", "Pulley Aspira Performance (NMAX/Aerox)", "OEM", 345000, 75000, "READY", false],
  // Aki Premium
  ["Aki", "Federal", "BEAT", "Aki Federal 12V 5Ah (Beat FI/Scoopy)", "OEM", 165000, 20000, "READY", false],
  ["Aki", "Honda Genuine", "VARIO", "Aki Kering 12V 5Ah Honda Genuine (Vario 150)", "ORI", 215000, 20000, "READY", false],
  // Lampu Premium
  ["Lampu", "Aspira", "SCOOPY", "Bohlam Depan LED H4 Aspira (Scoopy FI)", "OEM", 89000, 15000, "READY", false],
  ["Lampu", "Aspira", "JUPITER", "Bohlam Depan LED H7 Aspira (Jupiter Z)", "OEM", 95000, 15000, "READY", false],
  ["Lampu", "Aspira", "SUPRA", "Bohlam Pilot Lamp Aspira (Supra X 125)", "OEM", 35000, 8000, "READY", false],
  // Rantai Gear Premium
  ["Rantai Gear", "Federal", "SUPRA", "Set Rantai Gear Federal (Supra X 125) - Heavy Duty", "OEM", 295000, 40000, "READY", false],
  // Shock Premium
  ["Shock", "Aspira", "NMAX", "Shock Belakang Aspira Performance (NMAX)", "OEM", 425000, 60000, "READY", false],
  ["Shock", "Honda Genuine", "SUPRA", "Shock Belakang Honda Genuine (Supra X 125)", "ORI", 385000, 60000, "MENIPIS", false],
  // Busi Premium
  ["Busi", "NGK", "SATRIA", "Busi NGK Iridium CR9EIX (Satria FU)", "ORI", 98000, 8000, "READY", false],
  ["Busi", "NGK", "PCX", "Busi NGK Iridium CR8EIX (PCX 160)", "ORI", 95000, 8000, "READY", false],
  // Filter Premium
  ["Filter", "Aspira", "VARIO", "Filter Oli Aspira (Vario 125/150)", "OEM", 35000, 5000, "READY", true],
  ["Filter", "Honda Genuine", "NMAX", "Filter Udara Honda Genuine (NMAX Compatible)", "ORI", 78000, 12000, "READY", false],
  // Spion Premium
  ["Spion", "Aspira", "VARIO", "Spion Set Aspira Chrome (Vario 150)", "OEM", 155000, 10000, "READY", false],
  // Kabel Premium
  ["Kabel", "Honda Genuine", "NMAX", "Kabel Starter Honda Genuine (NMAX Compatible)", "ORI", 58000, 10000, "READY", false],
];

// ===== Layanan Bengkel =====
const SERVICES_RAW: Array<{
  name: string;
  description: string;
  duration: number; // menit
  priceFrom: number;
  icon: string;
}> = [
  {
    name: "Service Rutin / Tune Up",
    description: "Pengecekan menyeluruh: mesin, rem, ban, lampu, aki, dan kelengkapan. Cocok untuk service berkala tiap 3-6 bulan.",
    duration: 60,
    priceFrom: 50000,
    icon: "Wrench",
  },
  {
    name: "Ganti Oli Mesin",
    description: "Ganti oli mesin + filter oli. Tersedia oli ORI Honda/Yamaha Genuine, Aspira, Federal.",
    duration: 30,
    priceFrom: 50000,
    icon: "Droplet",
  },
  {
    name: "Ganti Ban",
    description: "Ganti ban depan/belakang dengan balancing. Tersedia FDR, Federal, dan brand premium lain.",
    duration: 45,
    priceFrom: 165000,
    icon: "Circle",
  },
  {
    name: "Service Rem",
    description: "Cek & ganti kampas rem, bleeder angin, kalibrasi tuas. Untuk rem depan dan belakang.",
    duration: 45,
    priceFrom: 78000,
    icon: "Disc",
  },
  {
    name: "Service CVT",
    description: "Bongkar & cek roller, v-belt, slider, pulley. Ganti komponen sesuai kebutuhan (Vario, Beat, NMAX, Aerox, PCX).",
    duration: 90,
    priceFrom: 95000,
    icon: "Cog",
  },
  {
    name: "Service Kelistrikan",
    description: "Cek aki, regulator, sistem charging, lampu, dan kelistrikan motor. Test & diagnose arus.",
    duration: 60,
    priceFrom: 35000,
    icon: "Zap",
  },
  {
    name: "Ganti Aki",
    description: "Ganti aki kering/basah dengan yang baru. Free cek sistem charging.",
    duration: 30,
    priceFrom: 165000,
    icon: "BatteryFull",
  },
  {
    name: "Lainnya / Konsultasi",
    description: "Keluhan spesifik atau konsultasi perbaikan. Mekanik akan cek dan berikan estimasi setelah diagnosa.",
    duration: 30,
    priceFrom: 25000,
    icon: "MessageCircle",
  },
];

export async function seedDatabase() {
  // Idempotent: skip jika semua data sudah ada
  const existingProducts = await db.product.count();
  const existingServices = await db.serviceItem.count();
  if (existingProducts >= 38 && existingServices > 0) {
    return {
      ok: true,
      message: "Sudah ada data, skip seed",
      count: existingProducts,
      services: existingServices,
    };
  }

  // 1. Insert motor types
  const motorMap = new Map<string, string>(); // key: `${brand}-${model}` -> id
  for (const m of MOTORS) {
    const slug = slugify(`${m.brand}-${m.model}`);
    // Skip if already exists (idempotent for re-seed)
    const existing = await db.motorType.findUnique({ where: { slug } });
    if (existing) {
      motorMap.set(`${m.brand}-${m.model}`, existing.id);
      continue;
    }
    const created = await db.motorType.create({
      data: {
        brand: m.brand,
        model: m.model,
        yearFrom: m.yearFrom,
        yearTo: m.yearTo,
        slug,
      },
    });
    motorMap.set(`${m.brand}-${m.model}`, created.id);
  }

  // 2. Insert categories (idempotent)
  const categoryMap = new Map<string, string>(); // name -> id
  for (const c of CATEGORIES) {
    const slug = slugify(c.name);
    const existingCat = await db.category.findUnique({ where: { slug } });
    if (existingCat) {
      categoryMap.set(c.name, existingCat.id);
      continue;
    }
    const created = await db.category.create({
      data: { name: c.name, slug, icon: c.icon },
    });
    categoryMap.set(c.name, created.id);
  }

  // 3. Insert brands (idempotent)
  const brandMap = new Map<string, string>(); // name -> id
  for (const name of BRANDS) {
    const slug = slugify(name);
    const existingBrand = await db.brand.findUnique({ where: { slug } });
    if (existingBrand) {
      brandMap.set(name, existingBrand.id);
      continue;
    }
    const created = await db.brand.create({ data: { name, slug } });
    brandMap.set(name, created.id);
  }

  // 4. Insert products (idempotent — skip if SKU already exists)
  let counter = 1;
  let insertedProducts = 0;
  for (const p of PRODUCTS_RAW) {
    const [categoryName, brandName, motorShort, name, tipe, harga, jasa, stok, terlaris] = p;
    const categoryId = categoryMap.get(categoryName)!;
    const brandId = brandMap.get(brandName)!;

    // SKU: KATEGORI-BRAND-MOTOR-URUT
    const catCode = categoryName.split(" ")[0].toUpperCase().slice(0, 4);
    const brandCode = brandName.split(" ")[0].toUpperCase().slice(0, 3);
    const sku = `${catCode}-${brandCode}-${motorShort}-${String(counter).padStart(3, "0")}`;

    // Skip if already exists
    const existingProd = await db.product.findUnique({ where: { sku } });
    if (existingProd) {
      counter++;
      continue;
    }

    const slug = slugify(name) + "-" + counter;
    const created = await db.product.create({
      data: {
        sku,
        slug,
        name,
        categoryId,
        brandId,
        tipe,
        hargaJual: harga,
        jasaPasang: jasa,
        stokStatus: stok,
        fotoUrl: null, // will use placeholder
        barcodeValue: sku,
        deskripsi: `${name} — Sparepart ${tipe} untuk motor ${motorShort}. Kualitas terjamin, garansi resmi.`,
        isTerlaris: terlaris,
      },
    });
    insertedProducts++;

    // Compatibilities: match motor by motorShort
    const motorCompatMap: Record<string, string[]> = {
      BEAT: ["Honda-Beat FI"],
      VARIO: ["Honda-Vario 125", "Honda-Vario 150"],
      NMAX: ["Yamaha-NMAX", "Yamaha-Aerox"],
      SUPRA: ["Honda-Supra X 125"],
      PCX: ["Honda-PCX 160"],
      JUPITER: ["Yamaha-Jupiter Z"],
      SATRIA: ["Suzuki-Satria FU"],
      SCOOPY: ["Honda-Scoopy FI"],
    };
    const motorKeys = motorCompatMap[motorShort] || [];
    for (const mk of motorKeys) {
      const motorId = motorMap.get(mk);
      if (motorId) {
        await db.productCompatibility.create({
          data: { productId: created.id, motorTypeId: motorId },
        });
      }
    }
    counter++;
  }

  // 5. Insert service items (idempotent — skip if slug exists)
  let insertedServices = 0;
  for (const s of SERVICES_RAW) {
    const slug = slugify(s.name);
    const existingSvc = await db.serviceItem.findUnique({ where: { slug } });
    if (existingSvc) continue;
    await db.serviceItem.create({
      data: {
        name: s.name,
        slug,
        description: s.description,
        duration: s.duration,
        priceFrom: s.priceFrom,
        icon: s.icon,
        isActive: true,
      },
    });
    insertedServices++;
  }

  return {
    ok: true,
    message: `Seed sukses: ${insertedProducts} produk baru, ${insertedServices} layanan baru`,
    count: PRODUCTS_RAW.length,
    productsInserted: insertedProducts,
    servicesInserted: insertedServices,
  };
}
