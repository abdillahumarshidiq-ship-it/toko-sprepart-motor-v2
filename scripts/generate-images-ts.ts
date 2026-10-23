/**
 * Sequential image generation with proper in-process timeout.
 * Uses SDK directly, kills hanging requests via Promise.race.
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE_DIR = "/home/z/my-project/public/produk";
fs.mkdirSync(BASE_DIR, { recursive: true });

interface Task {
  sku: string;
  slug: string;
  prompt: string;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout ${ms}ms: ${label}`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function generateOne(zai: any, task: Task, attempt: number): Promise<boolean> {
  const outPath = path.join(BASE_DIR, `${task.slug}.png`);

  // Skip if exists
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
    console.log(`  ✓ SKIP (already exists, ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
    return true;
  }

  console.log(`  Attempt ${attempt}: ${task.prompt.slice(0, 80)}...`);

  try {
    const response = await withTimeout(
      zai.images.generations.create({
        prompt: task.prompt,
        size: "1024x1024",
      }),
      60000,
      `image-gen ${task.sku}`
    );

    if (!response?.data?.[0]?.base64) {
      throw new Error("No base64 in response");
    }

    const buffer = Buffer.from(response.data[0].base64, "base64");
    if (buffer.length < 5000) {
      throw new Error(`Buffer too small: ${buffer.length} bytes`);
    }

    fs.writeFileSync(outPath, buffer);
    console.log(`  ✓ Saved (${(buffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`  ✗ Attempt ${attempt} failed: ${msg}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Initializing ZAI SDK...");
  const zai = await ZAI.create();

  // Build task list using python helper (already proven to work)
  execSync(
    `curl -s "http://localhost:3000/api/products?pageSize=200" -o /tmp/products-raw.json && ` +
    `python3 /home/z/my-project/scripts/build-prompts.py /tmp/products-raw.json > /tmp/products.txt`,
    { stdio: "inherit" }
  );

  const lines = fs.readFileSync("/tmp/products.txt", "utf-8").trim().split("\n");
  const tasks: Task[] = lines.map((line) => {
    const [sku, slug, ...rest] = line.split("|");
    return { sku, slug, prompt: rest.join("|") };
  });

  console.log(`📋 ${tasks.length} products to process`);

  let successCount = 0;
  let failCount = 0;
  const failed: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    console.log(`\n[${i + 1}/${tasks.length}] ${t.sku}`);

    let ok = false;
    for (let attempt = 1; attempt <= 4; attempt++) {
      ok = await generateOne(zai, t, attempt);
      if (ok) break;

      // On rate limit, wait longer
      const waitMs = attempt === 1 ? 15000 : attempt * 10000;
      console.log(`  ⏳ Waiting ${waitMs}ms before retry...`);
      await new Promise((r) => setTimeout(r, waitMs));
    }

    if (ok) {
      successCount++;
    } else {
      failCount++;
      failed.push(t.sku);
    }

    // Always delay between products to avoid rate limit
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log(`\n=== DONE ===`);
  console.log(`✓ Success: ${successCount}/${tasks.length}`);
  console.log(`✗ Failed: ${failCount}`);
  if (failed.length) {
    console.log(`Failed SKUs:`);
    failed.forEach((s) => console.log(`  - ${s}`));
  }

  // Total files
  const files = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith(".png"));
  console.log(`\nTotal PNG files in ${BASE_DIR}: ${files.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
