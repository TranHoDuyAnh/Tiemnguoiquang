import { createClient } from "@/lib/supabase/server";
import type { Business, BusinessSettings } from "@/lib/types";

export const BUSINESS_SLUG =
  process.env.NEXT_PUBLIC_BUSINESS_SLUG || "tiem-nguoi-quang";

export async function getBusinessBySlug(
  slug: string = BUSINESS_SLUG
): Promise<Business | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Business;
}

export async function getBusinessById(
  id: string
): Promise<Business | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Business;
}

export async function getBusinessSettings(
  businessId: string
): Promise<BusinessSettings | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (error || !data) return null;
  return data as BusinessSettings;
}

export async function getUserBusinesses(): Promise<Business[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      `*, business_members!inner ( role )`
    )
    .eq("business_members.user_id", (await supabase.auth.getUser()).data.user?.id || "");

  if (error || !data) return [];
  return data.map((d) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    logo_url: d.logo_url,
    cover_image_url: d.cover_image_url,
    about_image_url: (d as any).about_image_url ?? null,
    phone: d.phone,
    email: d.email,
    address: d.address,
    city: d.city,
    country: d.country,
    latitude: d.latitude,
    longitude: d.longitude,
    website_url: d.website_url,
    is_active: d.is_active,
    created_at: d.created_at,
    updated_at: d.updated_at,
  })) as Business[];
}
