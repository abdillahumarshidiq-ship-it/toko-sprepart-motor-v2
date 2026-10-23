"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ImageIcon,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useUIStore } from "@/lib/ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MotorPicker } from "./MotorPicker";
import { ProductCard } from "./ProductCard";
import type { BrandRow, CategoryRow, ProductRow } from "./types";
import { STORE_CONFIG } from "@/lib/store-config";

const PAGE_SIZE = 12;

export function CatalogView() {
  const { filters, setFilter, resetFilters, selectedMotor } = useUIStore();
  const [items, setItems] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [brands, setBrands] = useState<BrandRow[]>([]);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((res) => res?.ok && setCategories(res.data)).catch(()=>{});
    fetch("/api/brands").then((r) => r.json()).then((res) => res?.ok && setBrands(res.data)).catch(()=>{});
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      page: String(filters.page),
      pageSize: String(PAGE_SIZE),
    });
    if (filters.q) params.set("q", filters.q);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.brandId) params.set("brandId", filters.brandId);
    if (filters.stok) params.set("stok", filters.stok);
    if (filters.tipe) params.set("tipe", filters.tipe);
    if (selectedMotor) params.set("motorTypeId", selectedMotor.id);

    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res?.ok) {
          startTransition(() => {
            setItems(res.data);
            setTotal(res.total);
            setTotalPages(res.totalPages);
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [filters, selectedMotor, startTransition]);

  const loading = isPending;

  const activeFilterCount = useMemo(() => {
    return (
      (filters.categoryId ? 1 : 0) +
      (filters.brandId ? 1 : 0) +
      (filters.stok ? 1 : 0) +
      (filters.tipe ? 1 : 0) +
      (selectedMotor ? 1 : 0)
    );
  }, [filters, selectedMotor]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      {/* Page title + breadcrumb */}
      <div className="mb-4">
        <Link
          href="/"
          className="mb-2 inline-block text-xs text-muted-foreground hover:text-primary"
        >
          ← Beranda
        </Link>
        <h1 className="text-2xl font-black tracking-tight">Katalog Sparepart</h1>
        <p className="text-sm text-muted-foreground">
          {total} produk{selectedMotor ? ` untuk ${selectedMotor.brand} ${selectedMotor.model}` : ""}
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari: kampas rem, oli, ban…"
            value={filters.q}
            onChange={(e) => setFilter("q", e.target.value)}
            className="h-11 pl-10"
          />
        </div>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 sm:hidden" aria-label="Filter">
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[85vw] max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Produk</SheetTitle>
            </SheetHeader>
            <FilterPanel
              categories={categories}
              brands={brands}
              filters={filters}
              setFilter={setFilter}
              resetFilters={resetFilters}
              selectedMotor={selectedMotor}
              activeFilterCount={activeFilterCount}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[260px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden sm:block">
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Filter</h3>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-rose-600"
                    onClick={resetFilters}
                  >
                    <X className="h-3 w-3" /> Reset
                  </Button>
                )}
              </div>
              <FilterPanel
                categories={categories}
                brands={brands}
                filters={filters}
                setFilter={setFilter}
                resetFilters={resetFilters}
                selectedMotor={selectedMotor}
                activeFilterCount={activeFilterCount}
                embedded
              />
            </CardContent>
          </Card>
        </aside>

        {/* Products grid */}
        <div>
          {/* Sort / result info */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {selectedMotor && (
              <Badge variant="secondary" className="gap-1">
                Motor: {selectedMotor.brand} {selectedMotor.model}
              </Badge>
            )}
            {filters.tipe && (
              <Badge variant="secondary" className="gap-1">
                Tipe: {filters.tipe}
              </Badge>
            )}
            {filters.stok && (
              <Badge variant="secondary" className="gap-1">
                Stok: {STORE_CONFIG.stokLabels[filters.stok]?.label || filters.stok}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden p-0">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <div className="space-y-2 p-3">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </Card>
              ))}
            </div>
          ) : items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-semibold">Tidak ada produk</div>
                  <div className="text-xs text-muted-foreground">
                    Coba ubah filter atau tanya langsung via WhatsApp.
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset filter
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilter("page", filters.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <div className="text-sm font-semibold">
                    {filters.page} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilter("page", filters.page + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  brands,
  filters,
  setFilter,
  resetFilters,
  selectedMotor,
  embedded,
}: {
  categories: CategoryRow[];
  brands: BrandRow[];
  filters: ReturnType<typeof useUIStore.getState>["filters"];
  setFilter: ReturnType<typeof useUIStore.getState>["setFilter"];
  resetFilters: () => void;
  selectedMotor: ReturnType<typeof useUIStore.getState>["selectedMotor"];
  activeFilterCount: number;
  embedded?: boolean;
}) {
  return (
    <div className={embedded ? "space-y-4" : "mt-4 space-y-4"}>
      {/* Motor */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Motor
        </label>
        <MotorPicker compact />
      </div>

      {/* Tipe */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Tipe Sparepart
        </label>
        <Select
          value={filters.tipe || "_all"}
          onValueChange={(v) => setFilter("tipe", v === "_all" ? "" : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Semua tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Semua tipe</SelectItem>
            <SelectItem value="ORI">ORI (Original)</SelectItem>
            <SelectItem value="OEM">OEM</SelectItem>
            <SelectItem value="KW1">KW1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stok */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Status Stok
        </label>
        <Select
          value={filters.stok || "_all"}
          onValueChange={(v) => setFilter("stok", v === "_all" ? "" : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Semua status</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="MENIPIS">Menipis</SelectItem>
            <SelectItem value="KOSONG">Kosong</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategori */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Kategori
        </label>
        <Select
          value={filters.categoryId || "_all"}
          onValueChange={(v) => setFilter("categoryId", v === "_all" ? "" : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Semua kategori</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} {c._count ? `(${c._count.products})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Brand
        </label>
        <Select
          value={filters.brandId || "_all"}
          onValueChange={(v) => setFilter("brandId", v === "_all" ? "" : v)}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Semua brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Semua brand</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name} {b._count ? `(${b._count.products})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!embedded && (
        <Button
          variant="outline"
          className="w-full gap-1"
          onClick={resetFilters}
        >
          <Filter className="h-4 w-4" /> Reset semua filter
        </Button>
      )}
    </div>
  );
}
