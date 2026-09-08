import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import MessagesClient from "./messages-client";
import { getContactMessages, countMessages } from "@/lib/data/messages";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const [messages, unreadCount] = await Promise.all([
    getContactMessages(business.id),
    countMessages(business.id, { status: "unread" }),
  ]);

  return (
    <MessagesClient messages={messages} businessId={business.id} unreadCount={unreadCount} />
  );
}
