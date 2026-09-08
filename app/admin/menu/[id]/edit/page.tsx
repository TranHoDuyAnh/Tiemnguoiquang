import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import { getMenuCategories, getMenuItemById } from "@/lib/data/menu";
import MenuItemForm from "../../menu-item-form";

export const dynamic = "force-dynamic";

export default async function AdminEditMenuPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const item = await getMenuItemById(params.id);
  if (!item) notFound();

  const categories = await getMenuCategories(business.id, true);

  return (
    <Suspense>
      <MenuItemForm
        businessId={business.id}
        categories={categories}
        editingItem={item}
      />
    </Suspense>
  );
}
