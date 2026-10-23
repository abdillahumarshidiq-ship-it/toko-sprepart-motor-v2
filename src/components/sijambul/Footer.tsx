"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";
import { STORE_CONFIG, waLink } from "@/lib/store-config";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-primary/5 ring-1 ring-primary/20">
                <Image
                  src="/logo-sijambul-square.png"
                  alt={`Logo ${STORE_CONFIG.name}`}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-cover"
                />
              </div>
              <div className="font-extrabold">
                Sijambul <span className="text-primary">Merah</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{STORE_CONFIG.description}</p>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Navigasi
            </div>
            <ul className="space-y-1 text-sm">
              <li><Link href="/" className="hover:text-primary">Beranda</Link></li>
              <li><Link href="/katalog" className="hover:text-primary">Katalog</Link></li>
              <li><Link href="/booking" className="hover:text-primary">Booking Bengkel</Link></li>
              <li><Link href="/tentang" className="hover:text-primary">Tentang</Link></li>
              <li><Link href="/kontak" className="hover:text-primary">Kontak</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Hubungi Kami
            </div>
            <p className="text-xs text-muted-foreground">{STORE_CONFIG.address}</p>
            <Button
              asChild
              size="sm"
              className="mt-3 gap-2 bg-emerald-600 hover:bg-emerald-700"
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
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:flex-row">
          <div>© {new Date().getFullYear()} {STORE_CONFIG.name}. Semua hak dilindungi.</div>
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> +{STORE_CONFIG.whatsapp}
          </div>
        </div>
      </div>
    </footer>
  );
}
