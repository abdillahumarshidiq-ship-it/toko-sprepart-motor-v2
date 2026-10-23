"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  CalendarDays,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { rupiah, STORE_CONFIG } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { BrandRow, CategoryRow, MotorRow, ProductRow } from "./types";

interface EditForm {
  id?: string;
  name: string;
  categoryId: string;
  brandId: string;
  tipe: "ORI" | "OEM" | "KW1";
  hargaJual: number | string;
  jasaPasang: number | string;
  stokStatus: "READY" | "MENIPIS" | "KOSONG";
  deskripsi: string;
  isTerlaris: boolean;
  motorTypeIds: string[];
  sku: string;
  fotoUrl: string;
}

interface Props {
  products: ProductRow[];
  categories: CategoryRow[];
  brands: BrandRow[];
  motors: MotorRow[];
  userEmail: string;
}

const EMPTY: EditForm = {
  name: "",
  categoryId: "",
  brandId: "",
  tipe: "ORI",
  hargaJual: "",
  jasaPasang: "",
  stokStatus: "READY",
  deskripsi: "",
  isTerlaris: false,
  motorTypeIds: [],
  sku: "",
  fotoUrl: "",
};

export function AdminView({ products: initialProducts, categories, brands, motors, userEmail }: Props) {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);

  const [q, setQ] = useState("");
  const [filterStok, setFilterStok] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditForm>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const res = await fetch("/api/products?pageSize=200");
    const json = await res.json();
    if (json?.ok) setProducts(json.data);
  };

  const stats = useMemo(() => {
    const total = products.length;
    const ready = products.filter((p) => p.stokStatus === "READY").length;
    const menipis = products.filter((p) => p.stokStatus === "MENIPIS").length;
    const kosong = products.filter((p) => p.stokStatus === "KOSONG").length;
    return { total, ready, menipis, kosong };
  }, [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => (filterStok ? p.stokStatus === filterStok : true))
      .filter((p) =>
        q ? (p.name + p.sku + p.category.name + p.brand.name).toLowerCase().includes(q.toLowerCase()) : true
      );
  }, [products, q, filterStok]);

  const openCreate = () => {
    setForm({ ...EMPTY, categoryId: categories[0]?.id || "", brandId: brands[0]?.id || "" });
    setEditOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setForm({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      brandId: p.brandId,
      tipe: p.tipe,
      hargaJual: p.hargaJual,
      jasaPasang: p.jasaPasang ?? "",
      stokStatus: p.stokStatus,
      deskripsi: p.deskripsi || "",
      isTerlaris: p.isTerlaris,
      motorTypeIds: p.compatibilities.map((c) => c.motorType.id),
      sku: p.sku,
      fotoUrl: p.fotoUrl || "",
    });
    setEditOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.categoryId || !form.brandId || !form.hargaJual) {
      toast({
        title: "Validasi gagal",
        description: "Isi nama, kategori, brand, dan harga jual.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        categoryId: form.categoryId,
        brandId: form.brandId,
        tipe: form.tipe,
        hargaJual: Number(form.hargaJual),
        jasaPasang: form.jasaPasang ? Number(form.jasaPasang) : null,
        stokStatus: form.stokStatus,
        deskripsi: form.deskripsi,
        isTerlaris: form.isTerlaris,
        motorTypeIds: form.motorTypeIds,
        sku: form.sku || undefined,
        fotoUrl: form.fotoUrl || undefined,
      };
      const res = form.id
        ? await fetch(`/api/products?id=${form.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message || "Gagal simpan");
      toast({
        title: form.id ? "Produk diupdate" : "Produk ditambahkan",
        description: json.data?.sku ? `SKU: ${json.data.sku}` : undefined,
      });
      setEditOpen(false);
      reload();
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Gagal simpan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/products?id=${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast({ title: "Produk dihapus" });
      setDeleteId(null);
      reload();
    } catch (e) {
      toast({
        title: "Gagal hapus",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const quickStok = async (p: ProductRow, stok: "READY" | "MENIPIS" | "KOSONG") => {
    try {
      const res = await fetch(`/api/products?id=${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stokStatus: stok }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.message);
      toast({
        title: "Stok diupdate",
        description: `${p.name} → ${STORE_CONFIG.stokLabels[stok].label}`,
      });
      reload();
    } catch (e) {
      toast({
        title: "Gagal update stok",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Login sebagai <span className="font-semibold text-foreground">{userEmail}</span>. Kelola produk, stok, dan kompatibilitas motor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="/admin/bookings">
              <CalendarDays className="h-4 w-4" /> Booking Bengkel
            </a>
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Produk
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={PackageCheck} label="Total SKU" value={stats.total} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle2} label="Ready" value={stats.ready} color="bg-emerald-100 text-emerald-700" />
        <StatCard icon={AlertTriangle} label="Menipis" value={stats.menipis} color="bg-amber-100 text-amber-700" />
        <StatCard icon={XCircle} label="Kosong" value={stats.kosong} color="bg-rose-100 text-rose-700" />
      </div>

      {/* Filter bar */}
      <Card className="mb-4">
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama / SKU / kategori…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStok || "_all"} onValueChange={(v) => setFilterStok(v === "_all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Semua stok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Semua stok</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="MENIPIS">Menipis</SelectItem>
              <SelectItem value="KOSONG">Kosong</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Tidak ada produk.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Produk</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {p.brand.name} · {p.tipe}
                          {p.isTerlaris && <span className="ml-1 text-amber-600">★ Terlaris</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell>{p.category.name}</TableCell>
                      <TableCell className="text-right font-semibold">{rupiah(p.hargaJual)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`${STORE_CONFIG.stokLabels[p.stokStatus].color}`}
                          >
                            {STORE_CONFIG.stokLabels[p.stokStatus].label}
                          </Badge>
                        </div>
                        <div className="mt-1 flex gap-1">
                          {(["READY", "MENIPIS", "KOSONG"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => quickStok(p, s)}
                              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold transition ${
                                p.stokStatus === s
                                  ? STORE_CONFIG.stokLabels[s].color
                                  : "border-border text-muted-foreground hover:bg-muted"
                              }`}
                              title={`Set ${STORE_CONFIG.stokLabels[s].label}`}
                            >
                              {s[0]}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteId(p.id)}
                            aria-label="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nama Produk</Label>
              <Input
                placeholder="mis. Kampas Rem Depan Aspira Beat FI"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Brand</Label>
              <Select value={form.brandId} onValueChange={(v) => setForm({ ...form, brandId: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipe</Label>
              <Select value={form.tipe} onValueChange={(v) => setForm({ ...form, tipe: v as EditForm["tipe"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORI">ORI (Original)</SelectItem>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="KW1">KW1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stok Status</Label>
              <Select value={form.stokStatus} onValueChange={(v) => setForm({ ...form, stokStatus: v as EditForm["stokStatus"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="READY">Ready</SelectItem>
                  <SelectItem value="MENIPIS">Menipis</SelectItem>
                  <SelectItem value="KOSONG">Kosong</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Harga Jual (Rp)</Label>
              <Input
                type="number"
                value={form.hargaJual}
                onChange={(e) => setForm({ ...form, hargaJual: e.target.value })}
              />
            </div>
            <div>
              <Label>Jasa Pasang (Rp, opsional)</Label>
              <Input
                type="number"
                value={form.jasaPasang}
                onChange={(e) => setForm({ ...form, jasaPasang: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>SKU (opsional — auto-generate jika kosong)</Label>
              <Input
                placeholder="Format: KATEGORI-BRAND-MOTOR-URUT, mis. REM-ASP-BEAT-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
              {form.id && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Barcode className="h-3 w-3" /> Barcode = SKU (Code128, print 58mm)
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label>URL Foto (opsional)</Label>
              <Input
                placeholder="/produk/contoh.png atau URL eksternal"
                value={form.fotoUrl}
                onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Deskripsi</Label>
              <Textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Catatan tambahan, garansi, kekhususan, dll."
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Kompatibilitas Motor</Label>
              <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded border border-border p-2 sm:grid-cols-3">
                {motors.map((m) => {
                  const checked = form.motorTypeIds.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs ${
                        checked ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-3 w-3 accent-primary"
                        checked={checked}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            motorTypeIds: e.target.checked
                              ? [...form.motorTypeIds, m.id]
                              : form.motorTypeIds.filter((x) => x !== m.id),
                          });
                        }}
                      />
                      <span className="truncate">
                        {m.brand} {m.model}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.isTerlaris}
                  onChange={(e) => setForm({ ...form, isTerlaris: e.target.checked })}
                />
                Tandai sebagai produk terlaris (tampil di Beranda)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk akan dihapus permanen beserta relasi kompatibilitasnya. Aksi ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-black">{value}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</label>;
}
