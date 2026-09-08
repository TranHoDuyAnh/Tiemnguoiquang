import Link from "next/link";
import { Suspense } from "react";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import { getMenuItems, getMenuCategories } from "@/lib/data/menu";
import { getMenuCategories as getCats } from "@/lib/data/menu";
import MenuListClient from "./menu-list-client";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string };
}) {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const [items, categories] = await Promise.all([
    getMenuItems(business.id, { onlyAvailable: false }),
    getCats(business.id, true),
  ]);

  return (
    <Suspense>
      <MenuListClient
        items={items}
        categories={categories}
        businessId={business.id}
      />
    </Suspense>
  );
}
