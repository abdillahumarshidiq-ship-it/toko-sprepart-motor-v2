import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLayout } from "@/components/sijambul/layouts";
import { AdminView } from "@/components/sijambul/AdminView";
import { db } from "@/lib/db";
import type { ProductRow, BrandRow, CategoryRow, MotorRow } from "@/components/sijambul/types";

export const dynamic = "force-dynamic";

async function getData() {
  const [products, categories, brands, motors] = await Promise.all([
    db.product.findMany({
      orderBy: [{ isTerlaris: "desc" }, { name: "asc" }],
      include: { category: true, brand: true, compatibilities: { include: { motorType: true } } },
    }),
    db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
    db.motorType.findMany({ orderBy: [{ brand: "asc" }, { model: "asc" }] }),
  ]);

  // Serialize for client
  return {
    products: JSON.parse(JSON.stringify(products)) as ProductRow[],
    categories: JSON.parse(JSON.stringify(categories)) as CategoryRow[],
    brands: JSON.parse(JSON.stringify(brands)) as BrandRow[],
    motors: JSON.parse(JSON.stringify(motors)) as MotorRow[],
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  const data = await getData();

  return (
    <AdminLayout>
      <AdminView
        products={data.products}
        categories={data.categories}
        brands={data.brands}
        motors={data.motors}
        userEmail={session.user?.email || "admin"}
      />
    </AdminLayout>
  );
}
