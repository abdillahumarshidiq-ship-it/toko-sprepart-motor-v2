"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Barcode,
  Check,
  ChevronRight,
  ImageIcon,
  MessageCircle,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from "lucide-react";
import { rupiah, STORE_CONFIG, waLink } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductCard } from "./ProductCard";
import type { ProductRow } from "./types";

interface Props {
  product: ProductRow | null;
  related: ProductRow[];
}

export function ProductDetailView({ product, related }: Props) {
  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="text-lg font-bold">Produk tidak ditemukan</div>
        <p className="mt-2 text-sm text-muted-foreground">
          Mungkin produk sudah dihapus atau URL salah.
        </p>
        <Button asChild className="mt-4">
          <Link href="/katalog">Kembali ke katalog</Link>
        </Button>
      </div>
    );
  }

  const p = product;
  const stok = STORE_CONFIG.stokLabels[p.stokStatus];

  const waMessage = waLink(
    `Halo ${STORE_CONFIG.name}, saya mau tanya produk ini:\n\n` +
      `*${p.name}*\n` +
      `SKU: ${p.sku}\n` +
      `Harga: ${rupiah(p.hargaJual)}\n` +
      (p.jasaPasang ? `Jasa Pasang: ${rupiah(p.jasaPasang)}\n` : "") +
      `Stok: ${stok.label}\n\n` +
      `Apakah ready & bisa pasang sekarang?`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-4">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/katalog" className="hover:text-primary">Katalog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{p.category.name}</span>
      </nav>

      <Link
        href="/katalog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Photo */}
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-square w-full bg-muted/30">
            {p.fotoUrl ? (
              <img src={p.fotoUrl} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-background/95 font-semibold">
                {p.tipe}
              </Badge>
              {p.isTerlaris && (
                <Badge className="gap-1 bg-amber-500 text-white hover:bg-amber-500">
                  <Star className="h-3 w-3 fill-current" /> Terlaris
                </Badge>
              )}
            </div>
          </div>

          {/* Barcode display — Code128 visual */}
          <div className="border-t bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Barcode className="h-3.5 w-3.5" /> Barcode (SKU)
            </div>
            <BarcodeDisplay value={p.barcodeValue} />
          </div>
        </Card>

        {/* Detail */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <span className="font-semibold text-foreground/70">{p.category.name}</span>
              <span>·</span>
              <span>{p.brand.name}</span>
            </div>
            <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">{p.name}</h1>
            <div className="mt-2 font-mono text-xs text-muted-foreground">SKU: {p.sku}</div>
          </div>

          {/* Stok badge */}
          <div className={`inline-flex items-center gap-1.5 border ${stok.color} rounded-full px-3 py-1 text-xs font-bold`}>
            {p.stokStatus === "READY" ? <Check className="h-3 w-3" /> : p.stokStatus === "KOSONG" ? <X className="h-3 w-3" /> : null}
            {stok.label}
          </div>

          {/* Harga */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="grid grid-cols-2 gap-3 p-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Harga Produk
                </div>
                <div className="text-2xl font-black text-primary">{rupiah(p.hargaJual)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Jasa Pasang
                </div>
                {p.jasaPasang ? (
                  <div className="text-2xl font-black text-foreground">{rupiah(p.jasaPasang)}</div>
                ) : (
                  <div className="text-sm font-semibold text-muted-foreground">Hubungi toko</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total estimasi */}
          {p.jasaPasang && (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm">
              <span className="flex items-center gap-1.5 font-medium text-amber-800">
                <Wrench className="h-4 w-4" /> Total + Pasang:
              </span>
              <span className="font-bold text-amber-900">
                {rupiah(p.hargaJual + p.jasaPasang)}
              </span>
            </div>
          )}

          {/* WA button - dominant */}
          <Button
            asChild
            size="lg"
            className="h-14 w-full gap-2 bg-emerald-600 text-base hover:bg-emerald-700"
          >
            <a href={waMessage} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
              Tanya via WhatsApp — SKU otomatis terisi
            </a>
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Transaksi akhir via WhatsApp / datang ke toko. Tidak ada pembayaran online.
          </p>

          {/* Deskripsi */}
          {p.deskripsi && (
            <div>
              <h3 className="mb-1 text-sm font-bold">Deskripsi</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.deskripsi}</p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div className="text-[10px] font-semibold">Garansi Resmi</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wrench className="h-4 w-4 text-primary" />
              <div className="text-[10px] font-semibold">Pasang di Tempat</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Barcode className="h-4 w-4 text-primary" />
              <div className="text-[10px] font-semibold">Scan Barcode</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility table */}
      <Card className="mt-6">
        <CardContent className="p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-bold">
            Tabel Kompatibilitas Motor
          </h2>
          {p.compatibilities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data kompatibilitas terdaftar. Tanya via WhatsApp untuk konfirmasi.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {p.compatibilities.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">{c.motorType.brand}</TableCell>
                      <TableCell>{c.motorType.model}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.motorType.yearFrom
                          ? `${c.motorType.yearFrom}${c.motorType.yearTo ? ` – ${c.motorType.yearTo}` : " – sekarang"}`
                          : "Semua tahun"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
                          <Check className="h-3 w-3" /> Cocok
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Produk Terkait</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Render barcode Code128 visual dari value SKU.
 * Pure CSS-based barcode pattern — alternating bars representing the SKU string.
 * For production print, use a library like bwip-js or jsbarcode.
 */
function BarcodeDisplay({ value }: { value: string }) {
  // Generate deterministic bar pattern from value chars
  const bars = Array.from(value).flatMap((char, i) => {
    const code = char.charCodeAt(0);
    return [
      // narrow black bar
      { w: 1 + (code % 3), color: "bg-foreground" },
      // narrow white space
      { w: 1 + ((code >> 2) % 3), color: "bg-white" },
    ];
  });

  return (
    <div>
      {/* Visual bars */}
      <div className="flex h-14 items-stretch overflow-hidden rounded border border-foreground/20 bg-white px-2">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`${bar.color} h-full`}
            style={{ width: `${bar.w * 2}px`, minWidth: "2px" }}
            aria-hidden="true"
          />
        ))}
      </div>
      {/* SKU text under barcode */}
      <div className="mt-1 text-center font-mono text-lg font-black tracking-[0.2em] text-foreground">
        {value}
      </div>
      <div className="mt-1 text-center text-[10px] text-muted-foreground">
        Code128 · Tunjukkan SKU ini ke kasir / gunakan untuk tanya via WA
      </div>
    </div>
  );
}
