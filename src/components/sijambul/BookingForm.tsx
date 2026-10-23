"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Bike,
  Phone,
  User,
  Wrench,
} from "lucide-react";
import { STORE_CONFIG, waLink, rupiah } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration: number;
  priceFrom: number;
  icon: string | null;
}

interface Props {
  services: ServiceItem[];
}

const AVAILABLE_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];

const MOTOR_BRANDS = ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Lainnya"];

interface FormState {
  namaPelanggan: string;
  noWhatsapp: string;
  motorBrand: string;
  motorModel: string;
  platNomor: string;
  layanan: string;
  keluhan: string;
  tanggal: string;
  jam: string;
}

const EMPTY: FormState = {
  namaPelanggan: "",
  noWhatsapp: "",
  motorBrand: "",
  motorModel: "",
  platNomor: "",
  layanan: "",
  keluhan: "",
  tanggal: "",
  jam: "",
};

export function BookingForm({ services }: Props) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: string; namaPelanggan: string; tanggal: string; jam: string; layanan: string } | null>(null);

  // Default tanggal = besok
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.namaPelanggan || form.namaPelanggan.trim().length < 2) {
      toast({ title: "Validasi gagal", description: "Nama minimal 2 karakter", variant: "destructive" });
      return;
    }
    if (!/^(\+?62|0)8[0-9]{6,12}$/.test(form.noWhatsapp.replace(/[\s-]/g, ""))) {
      toast({ title: "Nomor WA tidak valid", description: "Format: 08xxx atau 628xxx", variant: "destructive" });
      return;
    }
    if (!form.motorBrand || !form.motorModel || !form.layanan || !form.tanggal || !form.jam) {
      toast({ title: "Lengkapi form", description: "Semua field wajib diisi", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.message || "Gagal membuat booking");
      }

      const booking = json.data;
      setSuccess({
        id: booking.id,
        namaPelanggan: booking.namaPelanggan,
        tanggal: new Date(booking.tanggal).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        jam: booking.jam,
        layanan: booking.layanan,
      });

      toast({
        title: "Booking berhasil!",
        description: "Admin akan konfirmasi via WhatsApp dalam 1-2 jam.",
      });
      setForm(EMPTY);
    } catch (e) {
      toast({
        title: "Gagal booking",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    const waMessage = waLink(
      `Halo ${STORE_CONFIG.name}, saya baru saja booking bengkel:\n\n` +
        `*Nama:* ${success.namaPelanggan}\n` +
        `*Layanan:* ${success.layanan}\n` +
        `*Jadwal:* ${success.tanggal}, pukul ${success.jam} WIB\n` +
        `*ID Booking:* ${success.id}\n\n` +
        `Saya mau konfirmasi booking ini.`
    );

    return (
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-6">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-center text-2xl font-black text-emerald-900">
              Booking Berhasil!
            </h1>
            <p className="mt-2 text-center text-sm text-emerald-800">
              Booking service motor Anda sudah kami terima. Admin akan konfirmasi via WhatsApp dalam 1-2 jam.
            </p>

            <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4">
              <div className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Detail Booking
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Nama</dt>
                  <dd className="font-semibold">{success.namaPelanggan}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Layanan</dt>
                  <dd className="font-semibold">{success.layanan}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Tanggal</dt>
                  <dd className="font-semibold">{success.tanggal}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Jam</dt>
                  <dd className="font-semibold">{success.jam} WIB</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-emerald-100 pt-2">
                  <dt className="text-muted-foreground">ID Booking</dt>
                  <dd className="font-mono text-xs">{success.id}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <a href={waMessage} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" /> Konfirmasi via WA
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSuccess(null)}
              >
                Booking Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <Badge className="mb-2 gap-1">
          <Wrench className="h-3 w-3" /> Bengkel Sijambul Merah
        </Badge>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Booking Service Motor
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih layanan, tanggal & jam yang sesuai. Gratis konfirmasi via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_300px]">
        {/* Form */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Data Pelanggan */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-4 w-4" /> Data Pelanggan
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Nama Lengkap *</label>
                    <Input
                      value={form.namaPelanggan}
                      onChange={(e) => setField("namaPelanggan", e.target.value)}
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">No. WhatsApp *</label>
                    <Input
                      value={form.noWhatsapp}
                      onChange={(e) => setField("noWhatsapp", e.target.value)}
                      placeholder="08123456789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Data Motor */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Bike className="h-4 w-4" /> Data Motor
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Brand *</label>
                    <Select
                      value={form.motorBrand || "_none"}
                      onValueChange={(v) => setField("motorBrand", v === "_none" ? "" : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih brand" /></SelectTrigger>
                      <SelectContent>
                        {MOTOR_BRANDS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Model *</label>
                    <Input
                      value={form.motorModel}
                      onChange={(e) => setField("motorModel", e.target.value)}
                      placeholder="Vario 125"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Plat Nomor</label>
                    <Input
                      value={form.platNomor}
                      onChange={(e) => setField("platNomor", e.target.value.toUpperCase())}
                      placeholder="B 1234 ABC"
                    />
                  </div>
                </div>
              </div>

              {/* Layanan */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Wrench className="h-4 w-4" /> Layanan *
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {services.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition ${
                        form.layanan === s.slug
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="layanan"
                        className="sr-only"
                        checked={form.layanan === s.slug}
                        onChange={() => setField("layanan", s.slug)}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{s.name}</span>
                        <span className="text-xs font-bold text-primary">
                          mulai {rupiah(s.priceFrom)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> ±{s.duration} menit
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Keluhan */}
              <div>
                <label className="mb-1 block text-xs font-semibold">Keluhan / Catatan</label>
                <Textarea
                  rows={3}
                  value={form.keluhan}
                  onChange={(e) => setField("keluhan", e.target.value)}
                  placeholder="Misal: rem depan bunyi, tarikan berat, lampu mati..."
                />
              </div>

              {/* Jadwal */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Pilih Jadwal
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Tanggal *</label>
                    <Input
                      type="date"
                      value={form.tanggal}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => setField("tanggal", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold">Jam *</label>
                    <Select
                      value={form.jam || "_none"}
                      onValueChange={(v) => setField("jam", v === "_none" ? "" : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih jam" /></SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot} WIB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Slot tersedia 08.00–19.00 WIB (istirahat 12.00–13.00). Maks 3 motor per slot.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
                size="lg"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memproses…</>
                ) : (
                  <><CalendarDays className="h-4 w-4" /> Booking Sekarang</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar info */}
        <aside className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold">📋 Cara Booking</h3>
              <ol className="space-y-1.5 text-xs text-muted-foreground">
                <li>1. Isi data pelanggan & motor</li>
                <li>2. Pilih layanan bengkel</li>
                <li>3. Pilih tanggal & jam</li>
                <li>4. Klik "Booking Sekarang"</li>
                <li>5. Admin konfirmasi via WA</li>
                <li>6. Datang sesuai jadwal</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold">⏰ Jam Operasional</h3>
              <ul className="space-y-1 text-xs">
                {STORE_CONFIG.jamBuka.map((j) => (
                  <li key={j.hari} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{j.hari}</span>
                    <span className="font-semibold">{j.jam}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <h3 className="mb-1 flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                <Phone className="h-4 w-4" /> Butuh Bantuan?
              </h3>
              <p className="text-xs text-emerald-700">
                Hubungi kami via WhatsApp untuk pertanyaan seputar booking.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <a
                  href={waLink(`Halo ${STORE_CONFIG.name}, saya mau tanya tentang booking bengkel.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Tanya WA
                </a>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
