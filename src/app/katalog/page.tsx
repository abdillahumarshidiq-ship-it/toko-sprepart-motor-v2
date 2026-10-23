import type { Metadata } from "next";
import { PublicLayout } from "@/components/sijambul/layouts";
import { CatalogView } from "@/components/sijambul/CatalogView";

export const metadata: Metadata = {
  title: "Katalog Sparepart",
  description:
    "Browse semua sparepart motor Honda, Yamaha, Suzuki. Filter by motor, kategori, brand, status stok.",
};

export default function KatalogPage() {
  return (
    <PublicLayout>
      <CatalogView />
    </PublicLayout>
  );
}
