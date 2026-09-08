import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import { getBusinessHours } from "@/lib/data/hours";
import { HoursClient } from "./hours-client";

export const dynamic = "force-dynamic";

export default async function AdminHoursPage() {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const hours = await getBusinessHours(business.id);

  return <HoursClient initialHours={hours} businessId={business.id} />;
}
