import type { Metadata } from "next";
import { PublicLayout } from "@/components/sijambul/layouts";
import { BookingForm } from "@/components/sijambul/BookingForm";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Booking Bengkel",
  description:
    "Booking jadwal service motor di Sijambul Merah. Tune up, ganti oli, ganti ban, service rem, CVT, kelistrikan.",
};

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const services = await db.serviceItem.findMany({
    where: { isActive: true },
    orderBy: { priceFrom: "asc" },
  });

  const serialized = JSON.parse(JSON.stringify(services));

  return (
    <PublicLayout>
      <BookingForm services={serialized} />
    </PublicLayout>
  );
}
