export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole = "owner" | "admin" | "staff";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type MessageStatus = "unread" | "read" | "replied";

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  about_image_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: MenuCategory | null;
}

export interface BusinessHour {
  id: string;
  business_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  booking_date: string;
  booking_time: string;
  guests: number;
  note: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  id: string;
  business_id: string;
  primary_color: string | null;
  secondary_color: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_maps_url: string | null;
  allow_booking: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category: MenuCategory | null;
}

export interface CreateBookingInput {
  business_id: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  booking_date: string;
  booking_time: string;
  guests: number;
  note?: string | null;
}

export interface CreateContactMessageInput {
  business_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export const DAY_OF_WEEK_NAMES = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
] as const;
