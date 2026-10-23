# 🏍️ Sijambul Merah — Katalog Sparepart Motor

Website katalog online toko sparepart motor **Sijambul Merah**. Bukan toko
checkout — transaksi akhir via WhatsApp atau datang ke toko. Dibangun sesuai
blueprint "Toko Sparepart Motor — Versi Katalog Saja" (1 toko kecil, <1000 SKU).

> **Tagline:** Sparepart motor ORI & OEM untuk Honda, Yamaha, Suzuki. Cek stok
> realtime, tanya via WhatsApp, pasang di tempat.

---

## ✨ Fitur Utama

### Halaman Publik
- **Beranda (`/`)** — Hero search besar, motor picker (11 motor Honda/Yamaha/Suzuki),
  12 kategori populer, produk terlaris, info toko (lokasi, jam buka, WhatsApp)
- **Katalog (`/katalog`)** — Filter gabungan motor + kategori + brand + tipe (ORI/OEM/KW1)
  + status stok, search dengan sinonim (kampas=kanvas), pagination 12/halaman
- **Detail Produk (`/produk/[slug]`)** — Foto, SKU/barcode Code128 visual, harga +
  jasa pasang + total estimasi, tombol WA otomatis (SKU terisi), tabel kompatibilitas
  motor, produk terkait, trust badges
- **Tentang (`/tentang`)** — Profil toko, cara belanja 5 langkah
- **Kontak (`/kontak`)** — Alamat, jam buka, WhatsApp, sosial media

### Admin Panel (`/admin`)
- **Login terautentikasi** (NextAuth credentials — bukan toggle tanpa password)
- **Dashboard statistik** — Total SKU, Ready, Menipis, Kosong
- **CRUD produk lengkap** — Form dengan SKU auto-generate, kompatibilitas multi-motor,
  flag terlaris, foto URL
- **Quick-stok toggle** — 1 klik ubah Ready/Menipis/Kosong
- **Cetak barcode Code128** — Preview visual barcode 58mm untuk etalase
- **Search & filter** produk admin

### Fitur Teknis
- **SEO**: Slug per produk, `sitemap.xml` otomatis, `robots.txt`, metadata per produk
- **Mobile-first responsive** dengan bottom nav mobile
- **Tema merah** sesuai brand "Sijambul Merah"
- **WhatsApp integration** — `wa.me` link dengan template otomatis
- **Sinonim search** — "kampas" = "kanvas"
- **Persist motor selection** — Pilihan motor disimpan di localStorage

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite (development) |
| Auth | NextAuth.js v4 (credentials provider) |
| State | Zustand (UI state) + URL params (filter) |
| Icons | lucide-react |
| Validation | Zod + react-hook-form |

### Struktur Database (Prisma)

```
MotorType      11 motor Honda/Yamaha/Suzuki
Category       12 kategori (Oli, Ban, Rem, CVT, Aki, ...)
Brand          6 brand (Honda Genuine, Aspira, FDR, Federal, NGK, ...)
Product        38 produk sample dengan SKU, harga, stok, foto
ProductCompatibility  relasi many-to-many Product ↔ MotorType
AdminUser      akun admin untuk login
```

Format SKU: `KATEGORI-BRAND-MOTOR-URUT` (mis. `REM-ASP-BEAT-001`)

---

## 📁 Struktur Repo

```
sijambul-merah/
├── prisma/
│   └── schema.prisma          # Skema database
├── public/
│   ├── logo-sijambul-square.png  # Logo toko
│   └── produk/                   # 38 foto produk (PNG 1024×1024)
├── src/
│   ├── app/
│   │   ├── api/               # API routes (products, motors, categories, brands, auth, seed)
│   │   ├── katalog/page.tsx   # Halaman katalog
│   │   ├── produk/[slug]/     # Detail produk per slug
│   │   ├── tentang/page.tsx
│   │   ├── kontak/page.tsx
│   │   ├── admin/             # Admin panel (terproteksi)
│   │   ├── sitemap.ts         # Sitemap.xml dinamis
│   │   └── robots.ts          # robots.txt
│   ├── components/
│   │   ├── sijambul/          # Komponen domain (HomeView, CatalogView, dst.)
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── store-config.ts    # Konfigurasi toko (WA, alamat, jam buka)
│   │   ├── seed.ts            # Data awal
│   │   └── auth.ts            # NextAuth config
│   └── hooks/                 # React hooks (use-mobile, use-toast)
├── scripts/                   # Script utilitas (generate foto, update DB)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+ atau Bun 1.1+
- SQLite (sudah bundled)

### Instalasi

```bash
# 1. Clone repo
git clone https://github.com/<username>/sijambul-merah.git
cd sijambul-merah

# 2. Install dependencies
bun install
# atau: npm install

# 3. Salin env template dan sesuaikan
cp .env.example .env
# Edit .env, ganti ADMIN_PASSWORD & NEXTAUTH_SECRET

# 4. Push schema database & generate Prisma client
bun run db:push

# 5. Seed data awal (11 motor, 12 kategori, 6 brand, 38 produk)
# Otomatis dijalankan saat pertama kali buka website, atau manual:
curl http://localhost:3000/api/seed

# 6. Jalankan dev server
bun run dev
```

Buka `http://localhost:3000` di browser.

### Login Admin

Default credentials (ubah di `.env`):
- Email: `admin@sijambulmerah.id`
- Password: `ganti-password-kuat-disini`

Buka `http://localhost:3000/admin` → login dengan credentials di atas.

---

## 📸 Screenshot

| Halaman | Deskripsi |
|---|---|
| Beranda | Hero search + motor picker + 12 kategori + 8 produk terlaris |
| Katalog | Grid 12 produk dengan filter sidebar (desktop) / sheet (mobile) |
| Detail Produk | Foto + barcode Code128 + harga + jasa pasang + tombol WA + tabel kompatibilitas |
| Admin Dashboard | Statistik + tabel produk dengan quick-stok toggle + CRUD modal |
| Login Admin | Halaman login terautentikasi |

---

## ⚙️ Konfigurasi Toko

Edit `src/lib/store-config.ts` untuk mengganti:

```typescript
export const STORE_CONFIG = {
  name: "Sijambul Merah",
  whatsapp: "6285725273851",           // Nomor WA (format internasional tanpa +)
  email: "halo@sijambulmerah.id",
  address: "Lihat lokasi di Google Maps",
  mapsUrl: "https://maps.app.goo.gl/JKpL2vg7kvDbtdDm6",
  jamBuka: [
    { hari: "Senin – Jumat", jam: "08.00 – 20.00 WIB" },
    // ...
  ],
  instagram: "@sijambulmerah",
  tiktok: "@sijambulmerah",
};
```

---

## 🌱 Script Utilitas

```bash
# Generate ulang foto produk dengan AI (butuh z-ai-web-dev-sdk)
bun run scripts/generate-images-ts.ts

# Update fotoUrl di database berdasarkan file di /public/produk
bun run scripts/update-product-fotos.ts
```

---

## 📦 Deployment

### Opsi 1: Deploy ke Vercel (Recommended)

Website ini siap deploy ke Vercel. Karena Vercel serverless tidak support SQLite persistent, **wajib migrasi ke PostgreSQL dulu**.

#### Langkah 1: Migrasi ke PostgreSQL Supabase (gratis)

```bash
# Jalankan script interaktif (akan guide setup Supabase)
bash scripts/migrate-to-supabase.sh
```

Atau manual:
1. Buat akun gratis di [supabase.com](https://supabase.com)
2. Buat project baru (region: Singapore)
3. Dapatkan connection string dari Settings > Database
4. Update `.env`: `DATABASE_URL="postgresql://..."`
5. Update `prisma/schema.prisma`: `provider = "postgresql"`
6. Jalankan:
   ```bash
   bun run db:push
   curl http://localhost:3000/api/seed  # seed data awal
   ```

#### Langkah 2: Deploy ke Vercel

```bash
# Install Vercel CLI
bun add -g vercel

# Login (akan buka browser)
vercel login

# Jalankan script deploy (guide setup env vars otomatis)
bash scripts/deploy-vercel.sh
```

Atau manual via dashboard:
1. Push repo ke GitHub
2. Import di [vercel.com/new](https://vercel.com/new)
3. Set Environment Variables:
   - `DATABASE_URL` — connection string Supabase
   - `ADMIN_EMAIL` — `admin@sijambulmerah.id`
   - `ADMIN_PASSWORD` — ganti dengan password kuat
   - `NEXTAUTH_SECRET` — generate dengan `openssl rand -base64 32`
   - `NEXTAUTH_URL` — URL produksi (mis. `https://sijambulmerah.vercel.app`)
4. Deploy
5. Setelah deploy, trigger seed: `curl https://URL-PRODUKSI/api/seed`

### Opsi 2: Deploy Manual (VPS/Docker)

```bash
# Build production
bun run build

# Jalankan production server
bun run start

# Atau pakai Docker (buat Dockerfile sendiri)
# Pastikan DATABASE_URL persistent (pakai volume mount)
```

### Konfigurasi Produksi

Setelah deploy, ganti default credentials:

```bash
# Generate NEXTAUTH_SECRET baru
openssl rand -base64 32

# Set env vars di Vercel dashboard:
# - ADMIN_EMAIL: email admin Anda
# - ADMIN_PASSWORD: password kuat (min 12 char)
# - NEXTAUTH_SECRET: string random dari command di atas
# - NEXTAUTH_URL: https://domain-anda.com
```

---

## 🔒 Catatan Keamanan

- **Login admin** wajib dengan credentials (NextAuth) — bukan toggle
- **Ganti default password** di `.env` sebelum produksi
- **Backup database mingguan** — SQLite: copy file `db/custom.db`
- **Foto produk** sebaiknya diganti dengan foto asli (yang di-generate AI hanya placeholder)
- **Audit log** perubahan stok belum diimplementasi (Fase 2)

---

## 🗺️ Roadmap Fase 2

- [ ] POS kasir full (checkout, payment gateway)
- [ ] Lacak order & ongkir
- [ ] Laporan laba rugi
- [ ] Hutang supplier
- [ ] Multi-cabang / multi-gudang
- [ ] Login pembeli & reseller
- [ ] Sync marketplace (Tokopedia/Shopee)
- [ ] Audit log perubahan stok

---

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan komersial maupun edukasi.

## 👥 Kontribusi

Toko: **Sijambul Merah** — Sparepart Motor
Email: halo@sijambulmerah.id
WhatsApp: +62 857-2527-3851
