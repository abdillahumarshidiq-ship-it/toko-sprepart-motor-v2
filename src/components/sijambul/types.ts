"use client";

/**
 * Tipe & util bersama untuk komponen Sijambul Merah
 */
export interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tipe: "ORI" | "OEM" | "KW1";
  hargaJual: number;
  jasaPasang: number | null;
  stokStatus: "READY" | "MENIPIS" | "KOSONG";
  fotoUrl: string | null;
  barcodeValue: string;
  deskripsi: string | null;
  isTerlaris: boolean;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; slug: string };
  compatibilities: Array<{
    id: string;
    motorType: {
      id: string;
      brand: string;
      model: string;
      yearFrom: number | null;
      yearTo: number | null;
    };
  }>;
}

export interface MotorRow {
  id: string;
  brand: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
  slug: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  _count?: { products: number };
}

export interface BrandRow {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}
