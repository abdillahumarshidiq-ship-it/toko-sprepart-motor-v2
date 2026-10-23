"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon, MessageCircle, Star, Wrench } from "lucide-react";
import { rupiah, STORE_CONFIG, waLink } from "@/lib/store-config";
import type { ProductRow } from "./types";

export function ProductCard({ p }: { p: ProductRow }) {
  const stok = STORE_CONFIG.stokLabels[p.stokStatus];
  const href = `/produk/${p.slug}`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition hover:shadow-md">
      {/* Foto */}
      <Link
        href={href}
        className="relative block aspect-square w-full bg-muted/30"
        aria-label={`Lihat detail ${p.name}`}
      >
        {p.fotoUrl ? (
          <img
            src={p.fotoUrl}
            alt={p.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge variant="secondary" className="bg-background/95 text-[10px] font-semibold">
            {p.tipe}
          </Badge>
          {p.isTerlaris && (
            <Badge className="gap-1 bg-amber-500 text-white text-[10px] hover:bg-amber-500">
              <Star className="h-3 w-3 fill-current" /> Terlaris
            </Badge>
          )}
        </div>
        <div className={`absolute right-2 top-2 border ${stok.color} rounded-full px-2 py-0.5 text-[10px] font-bold`}>
          {stok.label}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span className="font-semibold text-foreground/70">{p.category.name}</span>
          <span>·</span>
          <span>{p.brand.name}</span>
        </div>
        <Link
          href={href}
          className="line-clamp-2 text-left text-sm font-semibold leading-snug hover:text-primary"
        >
          {p.name}
        </Link>
        <div className="font-mono text-[10px] text-muted-foreground">{p.sku}</div>

        <div className="mt-auto space-y-1">
          <div className="text-base font-extrabold text-primary">{rupiah(p.hargaJual)}</div>
          {p.jasaPasang ? (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Wrench className="h-3 w-3" /> Pasang: {rupiah(p.jasaPasang)}
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground">Pasang: hubungi toko</div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 p-3 pt-0">
        <Button
          asChild
          size="sm"
          className="flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700"
        >
          <a
            href={waLink(
              `Halo ${STORE_CONFIG.name}, saya mau tanya produk:\n\n*${p.name}*\nSKU: ${p.sku}\nHarga: ${rupiah(p.hargaJual)}${
                p.jasaPasang ? `\nJasa Pasang: ${rupiah(p.jasaPasang)}` : ""
              }\nStok: ${STORE_CONFIG.stokLabels[p.stokStatus].label}\n\nApakah ready & bisa pasang sekarang?`
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Tanya
          </a>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1">
          <Link href={href}>
            Detail <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
