/**
 * Update database: set fotoUrl untuk semua produk berdasarkan SKU.
 * FotoUrl = /produk/<sku-slug>.png
 */
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

const BASE_DIR = "/home/z/my-project/public/produk";

function slugify(sku: string): string {
  return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function main() {
  const products = await db.product.findMany({ select: { id: true, sku: true } });
  console.log(`Found ${products.length} products to update`);

  let updated = 0;
  let missing = 0;

  for (const p of products) {
    const slug = slugify(p.sku);
    const filePath = path.join(BASE_DIR, `${slug}.png`);
    const fotoUrl = `/produk/${slug}.png`;

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 5000) {
      await db.product.update({
        where: { id: p.id },
        data: { fotoUrl },
      });
      console.log(`✓ ${p.sku} → ${fotoUrl}`);
      updated++;
    } else {
      console.log(`✗ ${p.sku} — file not found or too small: ${filePath}`);
      missing++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`✓ Updated: ${updated}`);
  console.log(`✗ Missing: ${missing}`);
}

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
