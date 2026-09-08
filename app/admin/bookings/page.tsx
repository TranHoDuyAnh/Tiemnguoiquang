import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import BookingsClient from "./bookings-client";
import { getBookings, countBookings } from "@/lib/data/bookings";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const [bookings, pendingCount, confirmedCount] = await Promise.all([
    getBookings(business.id),
    countBookings(business.id, { status: "pending" }),
    countBookings(business.id, { status: "confirmed" }),
  ]);

  return (
    <BookingsClient
      bookings={bookings}
      businessId={business.id}
      stats={{ pending: pendingCount, confirmed: confirmedCount }}
    />
  );
}
