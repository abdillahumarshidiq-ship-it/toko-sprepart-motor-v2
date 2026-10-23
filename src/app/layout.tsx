import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { STORE_CONFIG } from "@/lib/store-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  title: {
    default: `${STORE_CONFIG.name} — Toko Sparepart Motor`,
    template: `%s — ${STORE_CONFIG.name}`,
  },
  description: STORE_CONFIG.description,
  keywords: [
    "sparepart motor",
    "sijambul merah",
    "kampas rem",
    "oli motor",
    "ban motor",
    "Honda",
    "Yamaha",
    "Suzuki",
    "Vario",
    "Beat",
    "NMAX",
  ],
  authors: [{ name: STORE_CONFIG.name }],
  openGraph: {
    title: `${STORE_CONFIG.name} — Toko Sparepart Motor`,
    description: STORE_CONFIG.description,
    siteName: STORE_CONFIG.name,
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: STORE_CONFIG.name,
    description: STORE_CONFIG.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
