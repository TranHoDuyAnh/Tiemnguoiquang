import { redirect } from "next/navigation";
import Link from "next/link";
import { BUSINESS_SLUG, getBusinessBySlug } from "@/lib/data/business";
import { getCurrentUser, getBusinessMembership } from "@/lib/data/auth";
import {
  countBookings,
  getBookings,
  getTodayBookings,
} from "@/lib/data/bookings";
import { countMessages, getContactMessages } from "@/lib/data/messages";
import { getMenuItems } from "@/lib/data/menu";
import {
  UtensilsCrossed,
  CalendarCheck,
  CalendarClock,
  MessageSquareText,
  Clock,
  ArrowRight,
  Users,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime, formatDateTime, cn } from "@/lib/utils";
import type { BookingStatus, MessageStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const MSG_STATUS_COLORS: Record<MessageStatus, string> = {
  unread: "bg-teal/10 text-teal border-teal/20",
  read: "bg-blue-100 text-blue-800 border-blue-200",
  replied: "bg-green-100 text-green-800 border-green-200",
};

const MSG_STATUS_LABELS: Record<MessageStatus, string> = {
  unread: "Chưa đọc",
  read: "Đã đọc",
  replied: "Đã phản hồi",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const business = user ? await getBusinessBySlug(BUSINESS_SLUG) : null;
  const membership =
    user && business ? await getBusinessMembership(business.id) : null;

  if (!user || !business || !membership) return null;

  const bizId = business.id;

  const [allMenu, todayBookings, pendingCount, messages, unreadMsgCount] =
    await Promise.all([
      getMenuItems(bizId),
      getTodayBookings(bizId),
      countBookings(bizId, { status: "pending" }),
      getContactMessages(bizId, { limit: 5 }),
      countMessages(bizId, { status: "unread" }),
    ]);

  const availableCount = allMenu.filter((m) => m.is_available).length;
  const totalBookings = todayBookings.length;

  const stats = [
    {
      label: "Tổng món",
      value: allMenu.length,
      subLabel: `${availableCount} món đang bán`,
      icon: UtensilsCrossed,
      color: "from-orange-50 to-orange-100/50 text-orange-600",
      link: "/admin/menu",
    },
    {
      label: "Đặt bàn hôm nay",
      value: totalBookings,
      subLabel: `${todayBookings.reduce((s, b) => s + b.guests, 0)} khách`,
      icon: CalendarClock,
      color: "from-blue-50 to-blue-100/50 text-blue-600",
      link: "/admin/bookings",
    },
    {
      label: "Chờ xác nhận",
      value: pendingCount,
      subLabel: pendingCount > 0 ? "Cần xử lý" : "Đã ổn",
      icon: CalendarCheck,
      color: "from-amber-50 to-amber-100/50 text-amber-600",
      link: "/admin/bookings",
    },
    {
      label: "Tin nhắn chưa đọc",
      value: unreadMsgCount,
      subLabel: unreadMsgCount > 0 ? "Mới nhất" : "Không có",
      icon: MessageSquareText,
      color: "from-purple-50 to-purple-100/50 text-purple-600",
      link: "/admin/messages",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Xin chào, {(membership as any)?.role === "owner" ? "Chủ quán" : "Admin"}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(new Date())} · {business.name}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/menu/new">
            <Button size="sm" className="rounded-full">
              + Thêm món
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button variant="outline" size="sm" className="rounded-full">
              Xem đặt bàn
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((s) => (
          <Link href={s.link} key={s.label} className="group">
            <Card className="h-full border-gray-100 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5 duration-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      s.color
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {s.value}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-medium text-gray-700">
                    {s.label}
                  </span>
                  <span className="text-xs text-gray-400">{s.subLabel}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-5 pb-0 space-y-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal" />
              Đặt bàn hôm nay
              <Badge variant="muted" className="text-xs font-medium">
                {totalBookings}
              </Badge>
            </CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 h-8 -mr-2">
                Tất cả
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {todayBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Chưa có đặt bàn hôm nay.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayBookings.slice(0, 6).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 sm:gap-4 py-3 -mx-1 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal/10 to-orange-100/50 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm truncate">
                          {b.customer_name}
                        </span>
                        <Badge
                          className={cn(
                            "text-[10px] px-2 h-4 font-medium border",
                            STATUS_COLORS[b.status]
                          )}
                        >
                          {STATUS_LABELS[b.status]}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(b.booking_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {b.guests} khách
                        </span>
                        <span>{b.phone}</span>
                      </div>
                    </div>
                    {b.status === "confirmed" && (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-5 pb-0 space-y-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-teal" />
              Tin nhắn mới
            </CardTitle>
            <Link href="/admin/messages">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 h-8 -mr-2">
                Xem tất cả
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquareText className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Chưa có tin nhắn nào.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.slice(0, 5).map((m) => (
                  <Link
                    key={m.id}
                    href="/admin/messages"
                    className="block p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {m.name}
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 h-4 font-medium border shrink-0",
                          MSG_STATUS_COLORS[m.status]
                        )}
                      >
                        {MSG_STATUS_LABELS[m.status]}
                      </Badge>
                    </div>
                    {m.subject && (
                      <div className="text-xs font-medium text-gray-700 truncate mb-1">
                        {m.subject}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {m.message}
                    </p>
                    <div className="text-[10px] text-gray-400 mt-1.5">
                      {formatDateTime(m.created_at)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
