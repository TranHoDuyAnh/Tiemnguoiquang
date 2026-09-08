import { createClient } from "@/lib/supabase/server";
import type { MenuCategory, MenuItem, MenuItemWithCategory } from "@/lib/types";
import { BUSINESS_SLUG } from "./business";

export async function getMenuCategories(
  businessId?: string,
  includeInactive = false
): Promise<MenuCategory[]> {
  const supabase = createClient();

  let query = supabase.from("menu_categories").select("*");

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

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  query = query.order("sort_order", { ascending: true }).order("name", {
    ascending: true,
  });

  const { data, error } = await query;
  if (error || !data) return [];
  return data as MenuCategory[];
}

export async function getMenuItems(
  businessId?: string,
  options?: {
    categoryId?: string;
    onlyAvailable?: boolean;
    onlyFeatured?: boolean;
    limit?: number;
  }
): Promise<MenuItemWithCategory[]> {
  const supabase = createClient();

  let query = supabase
    .from("menu_items")
    .select("*, category:menu_categories(*)");

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

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.onlyAvailable) {
    query = query.eq("is_available", true);
  }

  if (options?.onlyFeatured) {
    query = query.eq("is_featured", true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("sort_order", { ascending: true }).order("name", {
    ascending: true,
  });

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as any[]).map((item) => ({
    ...item,
    category: item.category?.id ? (item.category as MenuCategory) : null,
  })) as MenuItemWithCategory[];
}

export async function getFeaturedMenuItems(
  businessId?: string,
  limit = 6
): Promise<MenuItemWithCategory[]> {
  return getMenuItems(businessId, { onlyFeatured: true, onlyAvailable: true, limit });
}

export async function getMenuItemById(
  id: string
): Promise<MenuItemWithCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*, category:menu_categories(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  const item = data as any;
  return {
    ...item,
    category: item.category?.id ? (item.category as MenuCategory) : null,
  } as MenuItemWithCategory;
}

export async function createCategory(
  input: Omit<MenuCategory, "id" | "created_at" | "updated_at">
): Promise<MenuCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .insert(input)
    .select()
    .single();
  if (error || !data) return null;
  return data as MenuCategory;
}

export async function updateCategory(
  id: string,
  input: Partial<Omit<MenuCategory, "id" | "created_at" | "updated_at">>
): Promise<MenuCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return data as MenuCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", id);
  return !error;
}

export async function createMenuItem(
  input: Omit<MenuItem, "id" | "created_at" | "updated_at">
): Promise<MenuItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .insert(input)
    .select()
    .single();
  if (error || !data) return null;
  return data as MenuItem;
}

export async function updateMenuItem(
  id: string,
  input: Partial<Omit<MenuItem, "id" | "created_at" | "updated_at">>
): Promise<MenuItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return data as MenuItem;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  return !error;
}
