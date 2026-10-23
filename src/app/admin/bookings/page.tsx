import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLayout } from "@/components/sijambul/layouts";
import { AdminBookings } from "@/components/sijambul/AdminBookings";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/admin/bookings");
  }

  const bookings = await db.booking.findMany({
    orderBy: [{ tanggal: "asc" }, { jam: "asc" }],
    take: 200,
  });

  const serialized = JSON.parse(
    JSON.stringify(bookings, (key, value) =>
      value instanceof Date ? value.toISOString() : value
    )
  );

  return (
    <AdminLayout>
      <AdminBookings bookings={serialized} userEmail={session.user?.email || "admin"} />
    </AdminLayout>
  );
}
