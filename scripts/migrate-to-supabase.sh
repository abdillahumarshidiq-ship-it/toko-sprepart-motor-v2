#!/usr/bin/env bash
# Migrate database dari SQLite ke PostgreSQL Supabase
#
# Prasyarat:
# 1. Akun Supabase (https://supabase.com - gratis)
# 2. Buat project baru di Supabase
# 3. Dapatkan connection string dari Settings > Database
#
# Cara pakai:
#   bash scripts/migrate-to-supabase.sh
#
# Script ini akan:
# - Update prisma/schema.prisma ke postgresql
# - Update DATABASE_URL di .env
# - Push schema ke PostgreSQL
# - Jalankan seed data

set -e

PROJECT_DIR="/home/z/my-project"
cd "$PROJECT_DIR"

echo "=========================================="
echo "🗄️  Migrate ke PostgreSQL Supabase"
echo "=========================================="
echo ""

echo "📋 Langkah-langkah yang harus dilakukan dulu:"
echo ""
echo "1. Buka https://supabase.com dan signup/login"
echo "2. Klik 'New Project'"
echo "3. Isi: Name=SijambulMerah, Password=buat-password-kuat, Region=Singapore"
echo "4. Tunggu 2-3 menit sampai project ready"
echo "5. Buka Settings > Database"
echo "6. Copy connection string (URI format)"
echo "   Contoh: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
echo ""
read -p "Sudah dapat connection string? [y/N]: " READY
if [ "$READY" != "y" ] && [ "$READY" != "Y" ]; then
  echo "Silakan buat project Supabase dulu, lalu jalankan script ini lagi."
  exit 0
fi
echo ""

# Prompt untuk connection string
read -p "Paste connection string PostgreSQL Supabase: " PG_URL

if [ -z "$PG_URL" ]; then
  echo "❌ Connection string tidak boleh kosong"
  exit 1
fi

if ! echo "$PG_URL" | grep -q "^postgresql://"; then
  echo "❌ Connection string harus dimulai dengan 'postgresql://'"
  exit 1
fi

echo ""
echo "✓ Connection string valid"
echo ""

# Backup .env lama
cp .env .env.backup-sqlite
echo "✓ Backup .env lama ke .env.backup-sqlite"

# Update .env
cat > .env << EOF
DATABASE_URL="$PG_URL"

# Admin credentials
ADMIN_EMAIL=admin@sijambulmerah.id
ADMIN_PASSWORD=admin123

# NextAuth (ganti secret dengan: openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
EOF
echo "✓ Update .env dengan PostgreSQL URL"

# Update prisma/schema.prisma
sed -i 's|provider = "sqlite"|provider = "postgresql"|' prisma/schema.prisma
echo "✓ Update prisma/schema.prisma ke postgresql"

# Push schema ke PostgreSQL
echo ""
echo "📋 Push schema ke PostgreSQL Supabase..."
bun run db:push 2>&1 | tail -10

# Generate Prisma client
echo ""
echo "📋 Generate Prisma client..."
bun run db:generate 2>&1 | tail -3

# Seed data
echo ""
echo "📋 Seed data awal..."
sleep 3
curl -s http://localhost:3000/api/seed | python3 -m json.tool 2>&1 | head -10

echo ""
echo "=========================================="
echo "✅ Migration Selesai!"
echo "=========================================="
echo ""
echo "Database sekarang menggunakan PostgreSQL Supabase."
echo "Data akan persistent dan siap untuk production di Vercel."
echo ""
echo "Langkah selanjutnya:"
echo "1. Restart dev server: bun run dev"
echo "2. Test di http://localhost:3000"
echo "3. Deploy ke Vercel: bash scripts/deploy-vercel.sh"
echo "   (Jangan lupa set DATABASE_URL di Vercel env vars dengan URL yang sama)"
echo ""
