import { createClient } from "@/lib/supabase/server";
import type { BusinessHour } from "@/lib/types";
import { BUSINESS_SLUG } from "./business";

const DEFAULT_OPEN = "10:00:00";
const DEFAULT_CLOSE = "22:00:00";

export function getDefaultBusinessHours(): BusinessHour[] {
  return Array.from({ length: 7 }, (_, i) => ({
    id: "",
    business_id: "",
    day_of_week: i,
    is_open: true,
    open_time: DEFAULT_OPEN,
    close_time: DEFAULT_CLOSE,
    created_at: new Date().toISOString(),
  }));
}

export async function getBusinessHours(
  businessId?: string
): Promise<BusinessHour[]> {
  const supabase = createClient();

  let query = supabase.from("business_hours").select("*");

  if (businessId) {
    query = query.eq("business_id", businessId);
  } else {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", BUSINESS_SLUG)
      .single();
    if (biz) query = query.eq("business_id", biz.id);
  }

  query = query.order("day_of_week", { ascending: true });

  const { data, error } = await query;
  if (error || !data) return getDefaultBusinessHours();
  if (data.length === 0) return getDefaultBusinessHours();
  return data as BusinessHour[];
}

export async function updateBusinessHours(
  businessId: string,
  hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
  }>
): Promise<boolean> {
  const supabase = createClient();
  const existing = await supabase
    .from("business_hours")
    .select("id, day_of_week")
    .eq("business_id", businessId);

  if (existing.error) return false;

  const ops = hours.map((h) => {
    const found = existing.data?.find((e) => e.day_of_week === h.day_of_week);
    if (found) {
      return supabase
        .from("business_hours")
        .update({
          is_open: h.is_open,
          open_time: h.open_time,
          close_time: h.close_time,
        })
        .eq("id", found.id);
    } else {
      return supabase.from("business_hours").insert({
        business_id: businessId,
        day_of_week: h.day_of_week,
        is_open: h.is_open,
        open_time: h.open_time,
        close_time: h.close_time,
      });
    }
  });

  const results = await Promise.all(ops);
  return results.every((r) => !r.error);
}
