"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Motorcycle,
  Phone,
  X,
  XCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  namaPelanggan: string;
  noWhatsapp: string;
  motorBrand: string;
  motorModel: string;
  platNomor: string | null;
  layanan: string;
  keluhan: string | null;
  tanggal: string; // ISO
  jam: string;
  status: "PENDING" | "CONFIRMED" | "DONE" | "CANCELLED";
  catatanAdmin: string | null;
  createdAt: string;
}

interface Props {
  bookings: Booking[];
  userEmail: string;
}

const STATUS_CONFIG = {
  PENDING: { label: "Menunggu", color: "bg-amber-100 text-amber-700 border-amber-200" },
  CONFIRMED: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  DONE: { label: "Selesai", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Dibatalkan", color: "bg-rose-100 text-rose-700 border-rose-200" },
} as const;

export function AdminBookings({ bookings: initial, userEmail }: Props) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>(initial);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  const filtered = useMemo(() => {
    return filterStatus
      ? bookings.filter((b) => b.status === filterStatus)
      : bookings;
  }, [bookings, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      done: bookings.filter((b) => b.status === "DONE").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };
  }, [bookings]);

  const updateStatus = async (id: string, status: Booking["status"], catatanAdmin?: string) => {
    setUpdating(true);
    try {
      const body: any = { status };
      if (catatanAdmin !== undefined) body.catatanAdmin = catatanAdmin;
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast({
        title: "Status diupdate",
        description: `Booking → ${STATUS_CONFIG[status].label}`,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status, catatanAdmin: catatanAdmin !== undefined ? catatanAdmin || null : b.catatanAdmin }
            : b
        )
      );
      setDetailOpen(null);
    } catch (e) {
      toast({
        title: "Gagal update",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isPast = (iso: string, jam: string) => {
    const bookingDate = new Date(iso);
    bookingDate.setHours(parseInt(jam.split(":")[0]), 0, 0, 0);
    return bookingDate < new Date();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/admin" className="hover:text-primary">← Dashboard</Link>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Booking Bengkel</h1>
          <p className="text-sm text-muted-foreground">
            Login sebagai <span className="font-semibold text-foreground">{userEmail}</span>. Kelola jadwal booking service.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/booking" target="_blank">Lihat Halaman Booking</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.total} color="bg-primary/10 text-primary" icon={CalendarDays} />
        <StatCard label="Menunggu" value={stats.pending} color="bg-amber-100 text-amber-700" icon={Clock} />
        <StatCard label="Dikonfirmasi" value={stats.confirmed} color="bg-blue-100 text-blue-700" icon={CheckCircle2} />
        <StatCard label="Selesai" value={stats.done} color="bg-emerald-100 text-emerald-700" icon={CheckCircle2} />
        <StatCard label="Batal" value={stats.cancelled} color="bg-rose-100 text-rose-700" icon={XCircle} />
      </div>

      {/* Filter */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-3 p-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filter:</span>
          <Select value={filterStatus || "_all"} onValueChange={(v) => setFilterStatus(v === "_all" ? "" : v)}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Semua status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
              <SelectItem value="DONE">Selesai</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <CalendarDays className="mx-auto mb-2 h-10 w-10 opacity-30" />
              Belum ada booking {filterStatus ? `dengan status "${STATUS_CONFIG[filterStatus as keyof typeof STATUS_CONFIG]?.label}"` : ""}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Motor</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => {
                    const past = isPast(b.tanggal, b.jam);
                    return (
                      <TableRow
                        key={b.id}
                        className={past && b.status === "PENDING" ? "bg-rose-50/50" : ""}
                      >
                        <TableCell>
                          <div className="font-medium">{b.namaPelanggan}</div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Phone className="h-3 w-3" /> {b.noWhatsapp}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{b.motorBrand} {b.motorModel}</div>
                          {b.platNomor && (
                            <div className="font-mono text-[10px] text-muted-foreground">{b.platNomor}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{b.layanan}</TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold">{formatDate(b.tanggal)}</div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" /> {b.jam} WIB
                          </div>
                          {past && b.status === "PENDING" && (
                            <Badge variant="outline" className="mt-1 border-rose-200 bg-rose-50 text-[9px] text-rose-700">
                              Lewat jadwal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_CONFIG[b.status].color}>
                            {STATUS_CONFIG[b.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailOpen(b)}
                            >
                              Detail
                            </Button>
                            {b.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => updateStatus(b.id, "CONFIRMED")}
                                disabled={updating}
                              >
                                Konfirmasi
                              </Button>
                            )}
                            {b.status === "CONFIRMED" && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => updateStatus(b.id, "DONE")}
                                disabled={updating}
                              >
                                Selesai
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailOpen} onOpenChange={(o) => !o && setDetailOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detailOpen && (
            <BookingDetail
              booking={detailOpen}
              updating={updating}
              onStatusChange={updateStatus}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-2 p-3">
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xl font-black">{value}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookingDetail({
  booking,
  updating,
  onStatusChange,
}: {
  booking: Booking;
  updating: boolean;
  onStatusChange: (id: string, status: Booking["status"], catatan?: string) => void;
}) {
  const [catatan, setCatatan] = useState(booking.catatanAdmin || "");

  const waMessage = waLink(
    `Halo ${booking.namaPelanggan}, ini dari ${STORE_CONFIG.name}.\n\n` +
      `Booking service motor Anda:\n` +
      `*Layanan:* ${booking.layanan}\n` +
      `*Motor:* ${booking.motorBrand} ${booking.motorModel}${booking.platNomor ? ` (${booking.platNomor})` : ""}\n` +
      `*Jadwal:* ${new Date(booking.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}, ${booking.jam} WIB\n\n` +
      `Kami konfirmasi booking Anda. Mohon datang 5 menit sebelum jadwal. Terima kasih.`
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-2">
          <span>Detail Booking</span>
          <Badge variant="outline" className={STATUS_CONFIG[booking.status].color}>
            {STATUS_CONFIG[booking.status].label}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Info pelanggan */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Nama</div>
            <div className="font-semibold">{booking.namaPelanggan}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">WhatsApp</div>
            <div className="font-mono text-xs">{booking.noWhatsapp}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Motor</div>
            <div className="font-semibold">{booking.motorBrand} {booking.motorModel}</div>
          </div>
          {booking.platNomor && (
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Plat</div>
              <div className="font-mono text-sm font-bold">{booking.platNomor}</div>
            </div>
          )}
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Layanan</div>
            <div className="font-semibold">{booking.layanan}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Jadwal</div>
            <div className="font-semibold">
              {new Date(booking.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              <span className="flex items-center gap-1 text-xs font-normal">
                <Clock className="h-3 w-3" /> {booking.jam} WIB
              </span>
            </div>
          </div>
        </div>

        {/* Keluhan */}
        {booking.keluhan && (
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Keluhan Pelanggan
            </div>
            <div className="rounded-lg border border-border bg-amber-50 p-3 text-sm">
              {booking.keluhan}
            </div>
          </div>
        )}

        {/* Catatan admin */}
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Catatan Admin (internal)
          </label>
          <Textarea
            rows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Misal: butuh sparepart X, mekanik Y, dll."
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <a href={waMessage} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> Hubungi via WA
            </a>
          </Button>

          {booking.status === "PENDING" && (
            <Button
              onClick={() => onStatusChange(booking.id, "CONFIRMED", catatan)}
              disabled={updating}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4" /> Konfirmasi
            </Button>
          )}
          {booking.status === "CONFIRMED" && (
            <Button
              onClick={() => onStatusChange(booking.id, "DONE", catatan)}
              disabled={updating}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" /> Tandai Selesai
            </Button>
          )}
          {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
            <Button
              onClick={() => onStatusChange(booking.id, "CANCELLED", catatan)}
              disabled={updating}
              variant="outline"
              className="gap-2 border-rose-300 text-rose-600 hover:bg-rose-50"
            >
              <XCircle className="h-4 w-4" /> Batalkan
            </Button>
          )}
          {(booking.status === "DONE" || booking.status === "CANCELLED") && (
            <Button
              onClick={() => onStatusChange(booking.id, "PENDING", catatan)}
              disabled={updating}
              variant="outline"
              className="gap-2"
            >
              Reopen
            </Button>
          )}
        </div>

        <div className="border-t pt-3 text-[10px] text-muted-foreground">
          Booking dibuat: {new Date(booking.createdAt).toLocaleString("id-ID")}
        </div>
      </div>
    </>
  );
}
