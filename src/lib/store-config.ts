// Konfigurasi toko "Sijambul Merah"
// Semua nilai dapat diubah sesuai kebutuhan toko nyata

export const STORE_CONFIG = {
  name: "Sijambul Merah",
  tagline: "Toko Sparepart Motor Terpercaya",
  description:
    "Sparepart motor ORI & OEM untuk Honda, Yamaha, Suzuki. Cek stok realtime, tanya via WhatsApp, pasang di tempat.",
  // WhatsApp number in international format, no + or 00
  // 085725273851 (Indonesia) -> 6285725273851
  whatsapp: "6285725273851",
  // Email & address for kontak page
  email: "halo@sijambulmerah.id",
  address: "Lihat lokasi di Google Maps (klik tombol Buka Maps)",
  mapsUrl: "https://maps.app.goo.gl/JKpL2vg7kvDbtdDm6",
  // Operating hours
  jamBuka: [
    { hari: "Senin – Jumat", jam: "08.00 – 20.00 WIB" },
    { hari: "Sabtu", jam: "08.00 – 18.00 WIB" },
    { hari: "Minggu / Libur", jam: "Tutup" },
  ],
  // Social
  instagram: "@sijambulmerah",
  tiktok: "@sijambulmerah",
  // Tipe sparepart untuk filter badge
  tipeLabels: {
    ORI: "ORI (Original)",
    OEM: "OEM",
    KW1: "KW1",
  } as Record<string, string>,
  stokLabels: {
    READY: { label: "Ready", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    MENIPIS: { label: "Menipis", color: "bg-amber-100 text-amber-700 border-amber-200" },
    KOSONG: { label: "Kosong", color: "bg-rose-100 text-rose-700 border-rose-200" },
  } as Record<string, { label: string; color: string }>,
} as const;

export function waLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${STORE_CONFIG.whatsapp}?text=${text}`;
}

export function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
