"use client";

import { Header } from "@/components/sijambul/Header";
import { Footer } from "@/components/sijambul/Footer";

/**
 * Layout default untuk halaman publik (Header + Footer).
 */
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

/**
 * Layout untuk halaman admin (Header admin, tanpa Footer).
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
