import { BUSINESS_SLUG, getBusinessBySlug, getBusinessSettings } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import BusinessClient from "./business-client";

export const dynamic = "force-dynamic";

export default async function AdminBusinessPage() {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const settings = await getBusinessSettings(business.id);

  return <BusinessClient business={business} settings={settings ?? undefined} />;
}
