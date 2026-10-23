#!/usr/bin/env bash
# Deploy Sijambul Merah ke Vercel
#
# Prasyarat:
# 1. Akun Vercel (gratis di https://vercel.com/signup)
# 2. Akun Supabase atau Neon untuk PostgreSQL (gratis)
# 3. Vercel CLI: `bun add -g vercel`
#
# Cara pakai:
#   bash scripts/deploy-vercel.sh
#
# Script ini akan:
# - Cek apakah vercel CLI sudah login
# - Guide setup environment variables
# - Deploy ke Vercel
# - Tampilkan URL production

set -e

PROJECT_DIR="/home/z/my-project"
cd "$PROJECT_DIR"

echo "=========================================="
echo "🚀 Deploy Sijambul Merah ke Vercel"
echo "=========================================="
echo ""

# 1. Cek vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI belum terinstall."
  echo "   Install dengan: bun add -g vercel"
  echo ""
  echo "   Atau dengan npm: npm install -g vercel"
  exit 1
fi

echo "✓ Vercel CLI: $(vercel --version 2>&1 | head -1)"
echo ""

# 2. Cek login
echo "📋 Cek status login Vercel..."
if ! vercel whoami &> /dev/null; then
  echo "❌ Belum login ke Vercel."
  echo ""
  echo "   Silakan login dulu:"
  echo "   vercel login"
  echo ""
  echo "   Anda akan diarahkan ke browser untuk authentication."
  echo "   Setelah login berhasil, jalankan script ini lagi."
  exit 1
fi

echo "✓ Login sebagai: $(vercel whoami 2>&1 | tail -1)"
echo ""

# 3. Cek environment variables
echo "📋 Cek environment variables..."
ENV_FILE="$PROJECT_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ File .env tidak ditemukan."
  echo "   Salin dari .env.example dan isi nilai:"
  echo "   cp .env.example .env"
  exit 1
fi

# Extract values from .env
DB_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
ADMIN_EMAIL=$(grep "^ADMIN_EMAIL=" "$ENV_FILE" | cut -d'=' -f2-)
ADMIN_PASSWORD=$(grep "^ADMIN_PASSWORD=" "$ENV_FILE" | cut -d'=' -f2-)
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" "$ENV_FILE" | cut -d'=' -f2-)
NEXTAUTH_URL=$(grep "^NEXTAUTH_URL=" "$ENV_FILE" | cut -d'=' -f2-)

echo "✓ DATABASE_URL: ${DB_URL:0:40}..."
echo "✓ ADMIN_EMAIL: $ADMIN_EMAIL"
echo "✓ NEXTAUTH_URL: $NEXTAUTH_URL"
echo ""

# 4. Warning jika masih pakai SQLite lokal
if echo "$DB_URL" | grep -q "^file:"; then
  echo "⚠️  PERINGATAN: Database masih SQLite lokal!"
  echo ""
  echo "   Vercel serverless tidak support persistent filesystem."
  echo "   Data akan HILANG setiap cold start."
  echo ""
  echo "   Untuk production, WAJIB migrasi ke PostgreSQL:"
  echo "   1. Buat akun gratis di https://supabase.com"
  echo "   2. Buat project baru, dapatkan connection string"
  echo "   3. Update DATABASE_URL di .env:"
  echo "      DATABASE_URL=postgresql://user:pass@host:5432/dbname"
  echo "   4. Update prisma/schema.prisma:"
  echo "      datasource db { provider = \"postgresql\" ... }"
  echo "   5. Jalankan: bun run db:push"
  echo "   6. Jalankan script ini lagi"
  echo ""
  echo "   Lanjut deploy dengan SQLite? (data tidak persistent)"
  read -p "   [y/N]: " CONTINUE
  if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    echo "Deployment dibatalkan."
    exit 0
  fi
  echo ""
fi

# 5. Link project ke Vercel
echo "📋 Link project ke Vercel..."
if [ ! -f "$PROJECT_DIR/.vercel/project.json" ]; then
  echo "   Project belum linked. Menjalankan 'vercel link'..."
  vercel link
  echo ""
fi
echo "✓ Project sudah linked"
echo ""

# 6. Set environment variables di Vercel
echo "📋 Set environment variables di Vercel..."
echo "   (Ini akan prompt konfirmasi untuk setiap variable)"
echo ""

read -p "Set environment variables sekarang? [Y/n]: " SET_ENV
if [ "$SET_ENV" != "n" ] && [ "$SET_ENV" != "N" ]; then
  echo "y" | vercel env add DATABASE_URL production <<< "$DB_URL" 2>&1 | tail -1
  echo "y" | vercel env add ADMIN_EMAIL production <<< "$ADMIN_EMAIL" 2>&1 | tail -1
  echo "y" | vercel env add ADMIN_PASSWORD production <<< "$ADMIN_PASSWORD" 2>&1 | tail -1
  echo "y" | vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET" 2>&1 | tail -1
  echo "✓ Environment variables set"
  echo ""
fi

# 7. Deploy
echo "🚀 Deploy ke Vercel (production)..."
echo ""
vercel --prod --yes
echo ""

# 8. Dapatkan URL
DEPLOY_URL=$(cat "$PROJECT_DIR/.vercel/README.txt" 2>/dev/null | grep -oE "https://[a-z0-9-]+\.vercel\.app" | head -1)
if [ -z "$DEPLOY_URL" ]; then
  # Coba dari project.json
  PROJECT_ID=$(cat "$PROJECT_DIR/.vercel/project.json" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('projectId',''))" 2>/dev/null)
  if [ -n "$PROJECT_ID" ]; then
    echo "📋 Project ID: $PROJECT_ID"
    echo "   Cek URL di: https://vercel.com/dashboard"
  fi
fi

echo ""
echo "=========================================="
echo "✅ Deployment Selesai!"
echo "=========================================="
echo ""
if [ -n "$DEPLOY_URL" ]; then
  echo "🌐 URL Production: $DEPLOY_URL"
fi
echo ""
echo "Langkah selanjutnya:"
echo "1. Update NEXTAUTH_URL di Vercel env vars ke URL production"
echo "2. Trigger seed: curl \$DEPLOY_URL/api/seed"
echo "3. Test login admin di \$DEPLOY_URL/admin"
echo "4. (Opsional) Hubungkan custom domain di Vercel dashboard"
echo ""
