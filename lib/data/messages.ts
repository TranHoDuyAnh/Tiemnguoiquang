import { createClient } from "@/lib/supabase/server";
import type {
  ContactMessage,
  CreateContactMessageInput,
  MessageStatus,
} from "@/lib/types";
import { BUSINESS_SLUG } from "./business";

export async function getContactMessages(
  businessId: string,
  options?: {
    status?: MessageStatus;
    search?: string;
    limit?: number;
  }
): Promise<ContactMessage[]> {
  const supabase = createClient();
  let query = supabase
    .from("contact_messages")
    .select("*")
    .eq("business_id", businessId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%,subject.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error || !data) return [];
  return data as ContactMessage[];
}

export async function createContactMessage(
  input: CreateContactMessageInput
): Promise<ContactMessage | null> {
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
    .from("contact_messages")
    .insert({
      business_id: businessId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      subject: input.subject || null,
      message: input.message,
      status: "unread",
    })
    .select()
    .single();

  if (error || !data) return null;
  return data as ContactMessage;
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus
): Promise<ContactMessage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error || !data) return null;
  return data as ContactMessage;
}

export async function getMessageById(
  id: string
): Promise<ContactMessage | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as ContactMessage;
}

export async function countMessages(
  businessId: string,
  options?: { status?: MessageStatus }
): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}
