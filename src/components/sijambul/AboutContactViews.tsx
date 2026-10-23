"use client";

import Image from "next/image";
import { Bike, Heart, MapPin, MessageCircle, Phone, ShieldCheck, Star, Wrench, Zap } from "lucide-react";
import { STORE_CONFIG, waLink } from "@/lib/store-config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AboutView() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-primary/5 ring-1 ring-primary/20 shadow-lg">
          <Image
            src="/logo-sijambul-square.png"
            alt="Logo Sijambul Merah"
            width={72}
            height={72}
            className="h-[72px] w-[72px] object-cover"
            priority
          />
        </div>
        <h1 className="text-3xl font-black">
          Sijambul <span className="text-primary">Merah</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{STORE_CONFIG.tagline}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-2 text-lg font-bold">Tentang Kami</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {STORE_CONFIG.name} adalah toko sparepart motor kecil yang melayani pemilik Honda, Yamaha,
            dan Suzuki di area Bekasi sejak 2018. Kami fokus pada sparepart ORI (Original) dan OEM
            berkualitas dengan harga jujur. Stok yang ditampilkan di website ini selalu di-update
            setiap hari oleh admin toko, jadi kamu bisa tahu produk mana yang ready sebelum datang.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Website ini adalah katalog online — bukan toko checkout. Transaksi akhir tetap via
            WhatsApp atau datang langsung ke toko. Kami percaya cara ini lebih personal: kamu bisa
            negosiasi, tanya instalasi, dan pastikan motor kamu benar-benar cocok sebelum bayar.
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: ShieldCheck, label: "Garansi Resmi", desc: "ORI & OEM terjamin" },
          { icon: Wrench, label: "Jasa Pasang", desc: "Bengkel di tempat" },
          { icon: Zap, label: "Stok Realtime", desc: "Update harian" },
          { icon: Heart, label: "Harga Jujur", desc: "No mark-up" },
        ].map((f) => (
          <Card key={f.label} className="text-center">
            <CardContent className="flex flex-col items-center gap-2 p-4">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="text-sm font-bold">{f.label}</div>
              <div className="text-[11px] text-muted-foreground">{f.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-3 text-lg font-bold">Cara Belanja</h2>
          <ol className="space-y-3 text-sm">
            {[
              ["Pilih motor kamu", "Klik tombol 'Pilih motor' di atas. Pilihanmu disimpan otomatis."],
              ["Cari sparepart", "Cari berdasarkan nama (mis. 'kampas rem') atau pilih kategori."],
              ["Cek detail & SKU", "Lihat harga, jasa pasang, status stok, dan tabel kompatibilitas motor."],
              ["Tanya via WhatsApp", "Klik tombol WA — SKU & info produk otomatis terisi di pesan."],
              ["Ambil / pasang", "Datang ke toko atau jadwalkan pasang. Selesai!"],
            ].map(([title, desc], i) => (
              <li key={i} className="flex gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Star className="h-6 w-6 text-amber-500" />
          <div className="text-sm">
            <span className="font-bold">Rating pelanggan:</span> 4.8/5 dari 200+ ulasan
          </div>
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <a
              href={waLink(`Halo ${STORE_CONFIG.name}, saya mau tanya sparepart.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" /> Mulai chat WhatsApp
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ContactView() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6">
      <h1 className="mb-1 text-3xl font-black">Kontak & Lokasi</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Hubungi kami via WhatsApp untuk respons tercepat di jam buka.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">WhatsApp</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                +{STORE_CONFIG.whatsapp}
              </div>
              <Button
                asChild
                size="sm"
                className="mt-3 gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <a
                  href={waLink(`Halo ${STORE_CONFIG.name}, saya mau tanya sparepart.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-3.5 w-3.5" /> Chat sekarang
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Alamat Toko</div>
              <p className="mt-1 text-xs text-muted-foreground">{STORE_CONFIG.address}</p>
              <a
                href={STORE_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Buka di Google Maps →
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 text-sm font-bold">Jam Buka</div>
            <ul className="space-y-2 text-sm">
              {STORE_CONFIG.jamBuka.map((j) => (
                <li key={j.hari} className="flex justify-between gap-2 border-b border-border/60 pb-2 last:border-0">
                  <span className="text-muted-foreground">{j.hari}</span>
                  <span className="font-semibold">{j.jam}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 text-sm font-bold">Sosial Media</div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Instagram</span>
                <span className="font-semibold">{STORE_CONFIG.instagram}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">TikTok</span>
                <span className="font-semibold">{STORE_CONFIG.tiktok}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-semibold">{STORE_CONFIG.email}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
