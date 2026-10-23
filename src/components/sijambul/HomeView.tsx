"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BatteryFull,
  Bike,
  CalendarDays,
  Circle,
  Clock,
  Cog,
  Disc,
  Droplet,
  MessageCircle,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { STORE_CONFIG, rupiah, waLink } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotorPicker } from "./MotorPicker";
import { ProductCard } from "./ProductCard";
import type { CategoryRow, ProductRow } from "./types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplet: Bike,
  Circle: Bike,
  Disc: Bike,
  Cog: Bike,
  BatteryFull: Bike,
  Lightbulb: Bike,
  Link2: Bike,
  Waves: Bike,
  Zap: Zap,
  Filter: Bike,
  Cable: Bike,
  Eye: Bike,
};

export function HomeView() {
  const router = useRouter();
  const { setFilter, selectedMotor } = useUIStore();
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [terlaris, setTerlaris] = useState<ProductRow[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => res?.ok && setCategories(res.data))
      .catch(() => {});
    fetch("/api/products?terlaris=true&pageSize=8")
      .then((r) => r.json())
      .then((res) => res?.ok && setTerlaris(res.data))
      .catch(() => {});
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("q", q);
    router.push("/katalog");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* HERO */}
      <section className="relative -mx-4 mb-8 overflow-hidden bg-gradient-to-br from-primary via-primary to-rose-900 px-4 py-10 text-primary-foreground sm:rounded-3xl sm:mx-0 sm:px-8 sm:py-14">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-rose-400/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Badge className="mb-3 bg-white/15 text-white hover:bg-white/15">
            <Bike className="mr-1 h-3 w-3" /> Honda · Yamaha · Suzuki
          </Badge>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            Sparepart Motor, <br />
            Cek Stok &amp; Tanya <span className="text-amber-300">via WA</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            {STORE_CONFIG.description}
          </p>

          {/* Big search */}
          <form
            onSubmit={submitSearch}
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari: kampas rem, oli, ban, roller CVT…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-12 rounded-full border-0 bg-white pl-10 pr-4 text-foreground shadow-lg"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 gap-2 rounded-full bg-amber-500 text-black hover:bg-amber-400"
            >
              <Search className="h-4 w-4" /> Cari
            </Button>
          </form>

          {/* Motor picker */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <span className="text-xs text-white/70">Motor kamu:</span>
            <MotorPicker />
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/85">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> ORI &amp; OEM Garansi Resmi
            </span>
            <span className="flex items-center gap-1.5">
              <Wrench className="h-4 w-4" /> Jasa Pasang di Tempat
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Stok Realtime
            </span>
          </div>
        </div>
      </section>

      {/* KATEGORI POPULER */}
      <section className="mb-10">
        <SectionHeader
          title="Kategori Populer"
          subtitle="Pilih kategori untuk lihat semua produk"
          onSeeAllHref="/katalog"
        />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {categories.slice(0, 12).map((c) => {
            const Icon = ICONS[c.icon || ""] || Bike;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setFilter("categoryId", c.id);
                  router.push("/katalog");
                }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 transition hover:border-primary hover:shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center text-xs font-semibold leading-tight">{c.name}</div>
                {c._count && (
                  <div className="text-[10px] text-muted-foreground">{c._count.products} item</div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUK TERLARIS */}
      {terlaris.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            title="🔥 Produk Terlaris"
            subtitle="Paling banyak ditanya via WhatsApp minggu ini"
            onSeeAllHref="/katalog?terlaris=true"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {terlaris.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* MOTOR PILIHAN KAMU (jika ada) */}
      {selectedMotor && (
        <section className="mb-10">
          <SectionHeader
            title={`Sparepart untuk ${selectedMotor.brand} ${selectedMotor.model}`}
            subtitle="Filter otomatis berdasarkan motor yang kamu pilih"
            onSeeAllHref="/katalog"
          />
          <MotorFilteredPreview motorId={selectedMotor.id} />
        </section>
      )}

      {/* LAYANAN BENGKEL + BOOKING */}
      <section className="mb-10">
        <SectionHeader
          title="🔧 Layanan Bengkel & Booking"
          subtitle="Service motor by mekanik berpengalaman. Booking online, gratis konfirmasi."
          onSeeAllHref="/booking"
        />
        <ServicesBookingSection />
      </section>

      {/* INFO TOKO */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Lokasi Toko</div>
              <p className="mt-1 text-xs text-muted-foreground">{STORE_CONFIG.address}</p>
              <a
                href={STORE_CONFIG.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Buka Maps <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Jam Buka</div>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {STORE_CONFIG.jamBuka.map((j) => (
                  <li key={j.hari} className="flex justify-between gap-2">
                    <span>{j.hari}</span>
                    <span className="font-medium text-foreground/80">{j.jam}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold">Tanya Sekarang</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Jawab cepat di jam buka. Sebut SKU produk biar cepat.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-2 gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <a
                  href={waLink(`Halo ${STORE_CONFIG.name}, saya mau tanya sparepart.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  onSeeAllHref,
}: {
  title: string;
  subtitle?: string;
  onSeeAllHref?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {onSeeAllHref && (
        <Button asChild variant="ghost" size="sm" className="gap-1 text-primary">
          <Link href={onSeeAllHref}>
            Lihat semua <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function MotorFilteredPreview({ motorId }: { motorId: string }) {
  const [items, setItems] = useState<ProductRow[]>([]);

  useEffect(() => {
    fetch(`/api/products?motorTypeId=${motorId}&pageSize=4`)
      .then((r) => r.json())
      .then((res) => res?.ok && setItems(res.data))
      .catch(() => {});
  }, [motorId]);

  if (!items.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Belum ada produk terdaftar untuk motor ini. Coba tanya langsung via WhatsApp.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
      <Link
        href="/katalog"
        className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5"
      >
        <ArrowRight className="h-6 w-6" />
        <span className="text-xs font-semibold">Lihat semua</span>
      </Link>
    </div>
  );
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  Droplet,
  Circle,
  Disc,
  Cog,
  Zap,
  BatteryFull,
  MessageCircle,
};

interface ServiceRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  priceFrom: number;
  icon: string | null;
}

function ServicesBookingSection() {
  const [services, setServices] = useState<ServiceRow[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((res) => res?.ok && setServices(res.data))
      .catch(() => {});
  }, []);

  if (!services.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Memuat layanan bengkel…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid layanan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {services.slice(0, 8).map((s) => {
          const Icon = SERVICE_ICONS[s.icon || ""] || Wrench;
          return (
            <Card key={s.id} className="group flex flex-col p-3 transition hover:shadow-md">
              <div className="mb-2 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-sm font-bold leading-tight">{s.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                {s.description}
              </div>
              <div className="mt-auto flex items-center justify-between pt-2 text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> ±{s.duration}m
                </span>
                <span className="font-bold text-primary">{rupiah(s.priceFrom)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* CTA Booking */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-rose-50">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold">📅 Booking Jadwal Service Sekarang</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pilih tanggal & jam yang sesuai. Gratis konfirmasi via WhatsApp dalam 1-2 jam.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/booking">
              <CalendarDays className="h-4 w-4" /> Booking Online
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
