import type { Metadata } from "next";
import { PublicLayout } from "@/components/sijambul/layouts";
import { ContactView } from "@/components/sijambul/AboutContactViews";
import { STORE_CONFIG } from "@/lib/store-config";

export const metadata: Metadata = {
  title: "Kontak & Lokasi",
  description: `Hubungi ${STORE_CONFIG.name} via WhatsApp, lihat alamat & jam buka toko sparepart motor.`,
};

export default function KontakPage() {
  return (
    <PublicLayout>
      <ContactView />
    </PublicLayout>
  );
}
