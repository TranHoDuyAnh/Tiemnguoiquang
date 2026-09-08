import { createClient } from "@/lib/supabase/server";
import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
} from "@/lib/types";
import { BUSINESS_SLUG } from "./business";

export async function getBookings(
  businessId: string,
  options?: {
    status?: BookingStatus;
    date?: string;
    search?: string;
    limit?: number;
  }
): Promise<Booking[]> {
  const supabase = createClient();
  let query = supabase.from("bookings").select("*").eq("business_id", businessId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.date) {
    query = query.eq("booking_date", options.date);
  }

  if (options?.search) {
    query = query.or(
      `customer_name.ilike.%${options.search}%,phone.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query
    .order("booking_date", { ascending: false })
    .order("booking_time", { ascending: true });

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Booking[];
}

export async function getTodayBookings(businessId: string): Promise<Booking[]> {
  const today = new Date().toISOString().split("T")[0];
  return getBookings(businessId, { date: today });
}

export async function createBooking(
  input: CreateBookingInput
): Promise<Booking | null> {
  const supabase = createClient();

  let businessId = input.business_id;
  if (!businessId) {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", BUSINESS_SLUG)
      .single();
    if (biz) businessId = biz.id;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      business_id: businessId,
      customer_name: input.customer_name,
      phone: input.phone,
      email: input.email || null,
      booking_date: input.booking_date,
      booking_time: input.booking_time,
      guests: input.guests,
      note: input.note || null,
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as Booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return data as Booking;
}

export async function deleteBooking(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  return !error;
}

export async function countBookings(
  businessId: string,
  options?: { status?: BookingStatus; date?: string }
): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.date) {
    query = query.eq("booking_date", options.date);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}
