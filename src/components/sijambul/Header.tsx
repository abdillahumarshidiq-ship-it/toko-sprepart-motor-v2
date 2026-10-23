"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bike, CalendarDays, LogOut, Menu, Phone, Search, Shield, Store } from "lucide-react";
import { STORE_CONFIG, waLink } from "@/lib/store-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = pathname?.startsWith("/admin");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4">
        {/* Logo */}
        <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 shrink-0">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-primary/5 ring-1 ring-primary/20 shadow-sm">
            <Image
              src="/logo-sijambul-square.png"
              alt={`Logo ${STORE_CONFIG.name}`}
              width={36}
              height={36}
              className="h-9 w-9 object-cover"
              priority
            />
          </div>
          <div className="text-left leading-tight">
            <div className="text-base font-extrabold tracking-tight text-foreground">
              Sijambul <span className="text-primary">Merah</span>
            </div>
            <div className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
              Sparepart Motor
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        {!isAdmin && (
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            <Button asChild variant={isActive("/") ? "secondary" : "ghost"} size="sm">
              <Link href="/">Beranda</Link>
            </Button>
            <Button asChild variant={isActive("/katalog") ? "secondary" : "ghost"} size="sm">
              <Link href="/katalog">Katalog</Link>
            </Button>
            <Button asChild variant={isActive("/booking") ? "secondary" : "ghost"} size="sm">
              <Link href="/booking" className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Booking
              </Link>
            </Button>
            <Button asChild variant={isActive("/tentang") ? "secondary" : "ghost"} size="sm">
              <Link href="/tentang">Tentang</Link>
            </Button>
            <Button asChild variant={isActive("/kontak") ? "secondary" : "ghost"} size="sm">
              <Link href="/kontak">Kontak</Link>
            </Button>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* WA button - dominant */}
          {!isAdmin && (
            <Button asChild size="sm" className="hidden gap-2 sm:flex">
              <a
                href={waLink(`Halo ${STORE_CONFIG.name}, saya mau tanya sparepart motor.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-4 w-4" />
                Tanya WhatsApp
              </a>
            </Button>
          )}

          {isAdmin && session ? (
            <>
              <div className="hidden items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:flex">
                <Shield className="h-3 w-3" /> Mode Admin
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })} className="gap-1">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Store className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/"><Search className="mr-2 h-4 w-4" /> Beranda</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/katalog"><Search className="mr-2 h-4 w-4" /> Katalog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/booking"><CalendarDays className="mr-2 h-4 w-4" /> Booking Bengkel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Masuk Admin</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {!isAdmin && (
        <nav className="flex items-center justify-around border-t border-border/60 bg-background/95 py-1 md:hidden">
          <MobileNavBtn active={isActive("/")} href="/" icon={<Bike className="h-4 w-4" />} label="Beranda" />
          <MobileNavBtn active={isActive("/katalog")} href="/katalog" icon={<Search className="h-4 w-4" />} label="Katalog" />
          <MobileNavBtn active={isActive("/booking")} href="/booking" icon={<CalendarDays className="h-4 w-4" />} label="Booking" />
          <MobileNavBtn active={isActive("/kontak")} href="/kontak" icon={<Phone className="h-4 w-4" />} label="Kontak" />
        </nav>
      )}
    </header>
  );
}

function MobileNavBtn({
  active,
  href,
  icon,
  label,
}: {
  active: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition ${
        active ? "bg-primary/10 text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
