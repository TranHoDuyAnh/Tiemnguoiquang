import { Suspense } from "react";
import { headers } from "next/headers";
import AdminShell, { AdminShellSkeleton } from "@/components/admin/shell";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import {
  getCurrentProfile,
  getCurrentUser,
  getBusinessMembership,
} from "@/lib/data/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isLoginRoute() {
  try {
    const h = headers();
    const path =
      h.get("x-next-pathname") ?? h.get("x-invoke-path") ?? h.get("referer") ?? "";
    return (
      path.includes("/admin/login") ||
      (typeof window !== "undefined" && false)
    );
  } catch {
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  // Case 1 – login page: middleware already handled redirects for auth routing.
  // We MUST NOT return null here for login because login page also lives under
  // /admin/layout.tsx (same layout wrapping). So just pass the children through.
  if (!user || !business || !membership) {
    return <>{children}</>;
  }

  const profile = await getCurrentProfile();

  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell
        businessName={business.name}
        profileName={profile?.full_name}
        userEmail={user.email}
      >
        {children}
      </AdminShell>
    </Suspense>
  );
}
