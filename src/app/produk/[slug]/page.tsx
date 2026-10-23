import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/sijambul/layouts";
import { ProductDetailView } from "@/components/sijambul/ProductDetailView";
import { db } from "@/lib/db";
import { STORE_CONFIG, rupiah } from "@/lib/store-config";
import type { ProductRow } from "@/components/sijambul/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static metadata per product for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true, brand: true, compatibilities: { include: { motorType: true } } },
  });

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} — ${rupiah(product.hargaJual)}`;
  const description = `${product.name} (${product.tipe}) untuk motor ${
    product.compatibilities.map((c) => `${c.motorType.brand} ${c.motorType.model}`).join(", ") || "various"
  }. Harga ${rupiah(product.hargaJual)}${product.jasaPasang ? ` + pasang ${rupiah(product.jasaPasang)}` : ""}. Stok: ${STORE_CONFIG.stokLabels[product.stokStatus].label}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/produk/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: product.fotoUrl ? [{ url: product.fotoUrl, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.fotoUrl ? [product.fotoUrl] : undefined,
    },
  };
}

// Pre-generate static params for top products (ISR)
export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: { slug: true },
    take: 50,
  });
  return products.map((p) => ({ slug: p.slug }));
}

export const revalidate = 60; // ISR: revalidate every 60s

export default async function ProdukDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      brand: true,
      compatibilities: { include: { motorType: true } },
    },
  });

  if (!product) notFound();

  // Get related products (same category, different id)
  const relatedRaw = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
    include: {
      category: true,
      brand: true,
      compatibilities: { include: { motorType: true } },
    },
  });

  // JSON stringify untuk client component (serialize dates)
  const productRow: ProductRow = JSON.parse(JSON.stringify(product));
  const related: ProductRow[] = JSON.parse(JSON.stringify(relatedRaw));

  return (
    <PublicLayout>
      <ProductDetailView product={productRow} related={related} />
    </PublicLayout>
  );
}
