import type { Metadata } from "next";
import { PublicLayout } from "@/components/sijambul/layouts";
import { AboutView } from "@/components/sijambul/AboutContactViews";
import { STORE_CONFIG } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: `Profil toko ${STORE_CONFIG.name} — ${STORE_CONFIG.tagline}. Cara belanja sparepart motor online.`,
};

export default function TentangPage() {
  return (
    <PublicLayout>
      <AboutView />
    </PublicLayout>
  );
}
